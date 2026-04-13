import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  ScanFace,
} from "lucide-react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const labelFromScore = (moodScore) => {
  if (moodScore <= 3) return "Distressed";
  if (moodScore <= 5) return "Low";
  if (moodScore <= 7) return "Steady";
  return "Positive";
};

const scoreFromBlendshapes = (blendshapes = []) => {
  const map = Object.fromEntries(
    blendshapes.map((b) => [b.categoryName, b.score]),
  );

  const smile = ((map.mouthSmileLeft || 0) + (map.mouthSmileRight || 0)) / 2;
  const frown = ((map.mouthFrownLeft || 0) + (map.mouthFrownRight || 0)) / 2;
  const browDown = ((map.browDownLeft || 0) + (map.browDownRight || 0)) / 2;
  const browUp = map.browInnerUp || 0;
  const eyeSquint = ((map.eyeSquintLeft || 0) + (map.eyeSquintRight || 0)) / 2;

  const raw =
    5 + smile * 4 - frown * 3 - browDown * 2 - eyeSquint * 1.5 + browUp;
  const moodScore = clamp(Math.round(raw), 1, 10);

  const label = labelFromScore(moodScore);

  const phraseByLabel = {
    Distressed: "You look under pressure right now",
    Low: "You seem a bit low-energy",
    Steady: "You look fairly balanced",
    Positive: "You look emotionally positive",
  };

  const note =
    label === "Distressed"
      ? "Take 3 slow breaths, then write one short sentence about what you need."
      : label === "Low"
        ? "Try a short check-in: 'I feel __ because __'."
        : label === "Steady"
          ? "Good baseline. Capture one helpful thought in your journal."
          : "Great signal. Add one gratitude line while this mood is active.";

  return {
    label,
    phrase: phraseByLabel[label],
    moodScore,
    note,
  };
};

const scoreFromLandmarks = (landmarks = []) => {
  if (!landmarks.length) {
    return {
      label: "Waiting",
      phrase: "Show your face to camera",
      moodScore: 6,
      note: "",
    };
  }

  const dist = (a, b) => {
    const dx = landmarks[a].x - landmarks[b].x;
    const dy = landmarks[a].y - landmarks[b].y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const faceWidth = Math.max(dist(234, 454), 0.001);
  const smileRatio = dist(61, 291) / faceWidth;
  const mouthOpen = dist(13, 14) / faceWidth;
  const leftEyeOpen = dist(159, 145) / faceWidth;
  const rightEyeOpen = dist(386, 374) / faceWidth;

  const raw =
    5 + smileRatio * 14 + mouthOpen * 4 + (leftEyeOpen + rightEyeOpen) * 8;
  const moodScore = clamp(Math.round(raw), 1, 10);

  const label = labelFromScore(moodScore);

  return {
    label,
    phrase:
      label === "Distressed"
        ? "You look tense right now"
        : label === "Low"
          ? "You look a bit low-energy"
          : label === "Steady"
            ? "You look fairly balanced"
            : "You look emotionally positive",
    moodScore,
    note: "Estimated from facial landmarks.",
  };
};

const drawFaceOutline = (ctx, landmarks, width, height) => {
  ctx.clearRect(0, 0, width, height);
  if (!landmarks?.length) return;

  const xs = landmarks.map((p) => p.x * width);
  const ys = landmarks.map((p) => p.y * height);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  ctx.strokeStyle = "#0d7a63";
  ctx.lineWidth = 2;
  ctx.fillStyle = "rgba(13, 122, 99, 0.16)";

  const pad = 8;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  const x = minX - pad;
  const y = minY - pad;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();
};

const SignDetection = ({
  compact = false,
  onMoodDetected,
  title = "Mood Detector",
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const detectorRef = useRef(null);
  const rollingScoresRef = useRef([]);
  const frameTickRef = useRef(0);
  const lastEmittedScoreRef = useRef(6);
  const noFaceFramesRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [liveMood, setLiveMood] = useState({
    label: "Waiting",
    phrase: "Show your face to camera",
    moodScore: 6,
    note: "",
  });
  const [lockedMood, setLockedMood] = useState({
    label: "Neutral",
    moodScore: 6,
    note: "Mood counter updates automatically from stable face readings.",
  });
  const [history, setHistory] = useState([]);

  const supportText = useMemo(
    () =>
      "Face-based mood detection using free on-device MediaPipe Face Landmarker. This avoids API costs and runs locally in your browser.",
    [],
  );

  useEffect(() => {
    let active = true;

    const setup = async () => {
      setLoadingModel(true);
      setError("");
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const modelPaths = [
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float32/1/face_landmarker.task",
        ];

        let model = null;
        for (const modelAssetPath of modelPaths) {
          try {
            model = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath },
              runningMode: "VIDEO",
              numFaces: 1,
              outputFaceBlendshapes: true,
              minFaceDetectionConfidence: 0.15,
              minFacePresenceConfidence: 0.15,
              minTrackingConfidence: 0.15,
            });
            break;
          } catch {
            // try next model path
          }
        }

        if (!model) {
          throw new Error("Could not load any FaceLandmarker model asset");
        }

        if (!active) return;
        detectorRef.current = model;
        setReady(true);
      } catch (e) {
        setError(
          `Unable to load face mood model: ${e?.message || "unknown error"}`,
        );
      } finally {
        if (active) setLoadingModel(false);
      }
    };

    setup();

    return () => {
      active = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (detectorRef.current) detectorRef.current.close();
    };
  }, []);

  const stopCamera = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
  };

  const processFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;
    if (!video || !canvas || !detector || !running) return;
    if (video.readyState < 2) {
      frameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const result = detector.detectForVideo(video, performance.now());
    const landmarks = result.faceLandmarks?.[0];
    const blendshapes = result.faceBlendshapes?.[0]?.categories || [];

    if (landmarks) {
      noFaceFramesRef.current = 0;
      drawFaceOutline(ctx, landmarks, canvas.width, canvas.height);
      const computed = blendshapes.length
        ? scoreFromBlendshapes(blendshapes)
        : scoreFromLandmarks(landmarks);
      setLiveMood(computed);
      setHistory((prev) => {
        if (prev[0]?.label === computed.label) return prev;
        return [
          { ...computed, at: new Date().toLocaleTimeString() },
          ...prev,
        ].slice(0, 8);
      });

      rollingScoresRef.current.push(computed.moodScore);
      if (rollingScoresRef.current.length > 12) {
        rollingScoresRef.current.shift();
      }

      frameTickRef.current += 1;
      if (
        rollingScoresRef.current.length >= 4 &&
        frameTickRef.current % 4 === 0
      ) {
        const avgScore = Math.round(
          rollingScoresRef.current.reduce((s, v) => s + v, 0) /
            rollingScoresRef.current.length,
        );
        const score = clamp(avgScore, 1, 10);
        const label = labelFromScore(score);
        setLockedMood({
          label,
          moodScore: score,
          note: `${computed.note} (auto-smoothed)`,
        });

        if (
          onMoodDetected &&
          Math.abs(score - lastEmittedScoreRef.current) >= 1
        ) {
          onMoodDetected(score);
          lastEmittedScoreRef.current = score;
        }
      }
    } else {
      noFaceFramesRef.current += 1;

      if (noFaceFramesRef.current >= 30) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rollingScoresRef.current = [];
        frameTickRef.current = 0;
        setLiveMood({
          label: "Waiting",
          phrase: "Show your face to camera",
          moodScore: 6,
          note: "",
        });
      }
    }

    frameRef.current = requestAnimationFrame(processFrame);
  };

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, min: 15 },
        },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
      frameRef.current = requestAnimationFrame(processFrame);
    } catch {
      setError("Camera permission denied or unavailable.");
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className={compact ? "space-y-4" : "space-y-4 max-w-6xl"}>
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground">{supportText}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 border-border/80 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera size={15} /> Face Camera Feed
              </CardTitle>
              <Badge variant={running ? "emerald" : "secondary"}>
                {running ? "Live" : "Stopped"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-xl border border-border bg-muted overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover -scale-x-100"
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full -scale-x-100"
              />
              {!running && (
                <div className="absolute inset-0 grid place-items-center bg-card/70">
                  <div className="text-center">
                    <ScanFace size={28} className="mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Start camera to detect facial mood
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {!running ? (
                <Button
                  variant="brand"
                  onClick={startCamera}
                  disabled={!ready || loadingModel}
                >
                  {!ready || loadingModel ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Play size={14} />
                  )}{" "}
                  Start Face Detection
                </Button>
              ) : (
                <Button variant="outline" onClick={stopCamera}>
                  <Pause size={14} /> Stop
                </Button>
              )}
              <Button variant="ghost" onClick={() => setHistory([])}>
                <RotateCcw size={14} /> Clear Log
              </Button>
            </div>
            {error && <p className="text-xs text-rose-700 mt-2">{error}</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Live Face Mood</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="violet" className="text-xs">
                {liveMood.label}
              </Badge>
              <p className="text-lg font-semibold text-foreground">
                {liveMood.phrase}
              </p>
              <p className="text-xs font-medium text-primary">
                Live estimate: {liveMood.moodScore}/10
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mood Counter (AI)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-display font-bold text-primary">
                {lockedMood.moodScore}/10
              </div>
              <Badge variant="secondary" className="text-xs">
                {lockedMood.label}
              </Badge>
              <p className="text-xs text-muted-foreground">{lockedMood.note}</p>
              <p className="text-[11px] text-muted-foreground">
                Auto-updates when face mood is stable for a short moment.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Detection Log</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No detections yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <div
                      key={`${item.label}-${idx}`}
                      className="rounded-lg border border-border bg-muted px-3 py-2"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {item.phrase}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.label} · {item.at}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignDetection;
