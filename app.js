document.addEventListener('DOMContentLoaded', () => {
  console.log("APP.JS LOADED ✅");

  // ----------------------
  // HELPERS: Screens
  // ----------------------
  function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
  }

  function showAppScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'flex';

    const caseNumber = localStorage.getItem('honest_immigration_case') || '';
    const caseDisplay = document.querySelector('.user-info p');

    if (caseDisplay && caseNumber) {
      caseDisplay.textContent = `Case: ${caseNumber}`;
    }
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
    if (isLoggedIn) {
      showAppScreen();
    } else {
      showLoginScreen();
    }
  }

  // ----------------------
  // LOGIN (Supabase)
  // ----------------------
  async function handleLogin() {
    console.log("CLICK LOGIN ✅");

    const caseNumber = document.getElementById('caseNumber').value.trim();
    const pin = document.getElementById('pin').value.trim();

    if (!caseNumber || !pin) {
      alert('Please enter your case number and PIN');
      return;
    }

    if (!window.APP_CONFIG || !window.APP_CONFIG.supabase) {
      alert("Config not loaded. Check config.js");
      console.error("APP_CONFIG missing", window.APP_CONFIG);
      return;
    }

    const supabase = window.supabase.createClient(
      window.APP_CONFIG.supabase.url,
      window.APP_CONFIG.supabase.anonKey
    );

    const { data, error } = await supabase
      .from('case_logins')
      .select('*')
      .eq('case_ref', caseNumber)
      .eq('pin', pin)
      .single();

    if (error || !data) {
      console.error("Supabase login error:", error);
      alert('Invalid case number or PIN');
      return;
    }

    localStorage.setItem('honest_immigration_logged_in', 'true');
    localStorage.setItem('honest_immigration_case', caseNumber);
    localStorage.setItem('honest_immigration_client_id', data.client_id);

    showAppScreen();
  }

  function handleMagicLink() {
    alert('Magic link flow not implemented yet.');
  }

  // ----------------------
  // LOGOUT ✅
  // ----------------------
  function handleLogout() {
    localStorage.removeItem('honest_immigration_logged_in');
    localStorage.removeItem('honest_immigration_case');
    localStorage.removeItem('honest_immigration_client_id');
    showLoginScreen();
  }

  // ----------------------
  // EVENT LISTENERS
  // ----------------------
  const loginBtn = document.getElementById('loginBtn');
  const magicBtn = document.getElementById('magicLinkBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (magicBtn) magicBtn.addEventListener('click', handleMagicLink);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // ----------------------
  // INIT
  // ----------------------
  checkLoginStatus();
});
