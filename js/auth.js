function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_LOGIN_KEY) === "true";
}

function loginAdmin() {
  const input = document.getElementById("adminPasswordInput");
  const error = document.getElementById("loginError");

  const password = input.value.trim();

  if (password === DEFAULT_SETTINGS.adminPassword) {
    localStorage.setItem(ADMIN_LOGIN_KEY, "true");
    showDashboard();
  } else {
    error.textContent = "كلمة المرور غير صحيحة";
  }
}

function logoutAdmin() {
  localStorage.removeItem(ADMIN_LOGIN_KEY);
  location.reload();
}