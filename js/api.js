// api.js — shared helpers used across all pages

const Auth = {
  TOKEN_KEY: "eb_token",
  PENDING_EMAIL_KEY: "eb_pending_email",

  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },
  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  setPendingEmail(email) {
    sessionStorage.setItem(this.PENDING_EMAIL_KEY, email);
  },
  getPendingEmail() {
    return sessionStorage.getItem(this.PENDING_EMAIL_KEY) || "";
  },
};

async function apiRequest(path, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = Auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
  } catch (err) {
    return { success: false, message: "Could not reach the server. Please check your connection and try again." };
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    return { success: false, message: "Unexpected server response." };
  }

  if (response.status === 401 && auth) {
    Auth.clearToken();
  }

  return data;
}

function showAlert(el, message, type = "error") {
  el.textContent = message;
  el.className = `alert show alert-${type}`;
}

function hideAlert(el) {
  el.className = "alert";
  el.textContent = "";
}

function setLoading(button, isLoading, loadingText = "Please wait...") {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function requireAuthOrRedirect() {
  if (!Auth.isLoggedIn()) {
    window.location.href = "index.html";
  }
}

async function apiUpload(path, file, fieldName = "photo") {
  const token = Auth.getToken();
  const formData = new FormData();
  formData.append(fieldName, file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  } catch (err) {
    return { success: false, message: "Could not reach the server. Please check your connection and try again." };
  }

  try {
    return await response.json();
  } catch (err) {
    return { success: false, message: "Unexpected server response." };
  }
}
