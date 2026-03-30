const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
// In local development, Vite proxies /api to http://localhost:8787 via vite.config.js.
const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.code = body.code;
    err.status = res.status;
    throw err;
  }
  return res.json();
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const signupUser = (name, email, password) =>
  fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  }).then(handleResponse);

export const loginUser = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const logoutUser = (token) =>
  fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: authHeaders(token),
  }).then(handleResponse);

export const getCurrentUser = (token) =>
  fetch(`${BASE_URL}/auth/me`, { headers: authHeaders(token) }).then(
    handleResponse,
  );

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = (token) =>
  fetch(`${BASE_URL}/settings`, { headers: authHeaders(token) }).then(
    handleResponse,
  );

export const saveSettings = (token, settings) =>
  fetch(`${BASE_URL}/settings`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(settings),
  }).then(handleResponse);

export const updateProfile = (token, name, email) =>
  fetch(`${BASE_URL}/auth/update-profile`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name, email }),
  }).then(handleResponse);

export const updatePassword = (token, oldPassword, newPassword) =>
  fetch(`${BASE_URL}/auth/update-password`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ oldPassword, newPassword }),
  }).then(handleResponse);

// ─── Daily Wellness ───────────────────────────────────────────────────────────
export const getDailyWellness = () =>
  fetch(`${BASE_URL}/wellness/daily`).then(handleResponse);

export const getJournalPrompt = () =>
  fetch(`${BASE_URL}/journal/prompt`).then(handleResponse);

// ─── AI Chat ──────────────────────────────────────────────────────────────────
export const sendAIMessage = (token, messages) =>
  fetch(`${BASE_URL}/ai/chat`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ messages }),
  }).then(handleResponse);

// ─── Journal ──────────────────────────────────────────────────────────────────
export const getJournalEntries = (token) =>
  fetch(`${BASE_URL}/journal/entries`, { headers: authHeaders(token) }).then(
    handleResponse,
  );

export const saveJournalEntry = (token, data) =>
  fetch(`${BASE_URL}/journal/entries`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteJournalEntry = (token, id) =>
  fetch(`${BASE_URL}/journal/entries/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }).then(handleResponse);

// ─── Mood Tracking ────────────────────────────────────────────────────────────
export const logMood = (token, data) =>
  fetch(`${BASE_URL}/mood/log`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const getMoodHistory = (token) =>
  fetch(`${BASE_URL}/mood/history`, { headers: authHeaders(token) }).then(
    handleResponse,
  );

// ─── Research ─────────────────────────────────────────────────────────────────
export const getResearchArticles = () =>
  fetch(`${BASE_URL}/research/articles`).then(handleResponse);
