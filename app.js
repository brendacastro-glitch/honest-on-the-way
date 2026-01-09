// ======================
// LOGIN/LOGOUT
// ======================
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';

  if (isLoggedIn) {
    showAppScreen();
  } else {
    showLoginScreen();
  }
}

async function handleLogin() {
  const caseNumber = document.getEleme
