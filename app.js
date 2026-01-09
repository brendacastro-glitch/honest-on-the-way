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

    // ✅ IMPORTANT: Bind buttons ONLY after appScreen is visible
    bindAppButtons();
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
  // SHOW SECTION CONTENT (Basic navigation)
  // ----------------------
  function showSection(sectionId) {
    const allSections = document.querySelectorAll('.screen-content');
    allSections.forEach(section => section.classList.remove('active'));

    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
  }

  // ----------------------
  // BIND ALL APP BUTTONS ✅
  // ----------------------
  function bindAppButtons() {
    console.log("✅ Binding app buttons...");

    const notificationsBtn = document.getElementById("notificationsBtn");
    const educationBtn = document.getElementById("educationBtn");

    const homeBtn = document.getElementById("homeBtn");
    const tasksBtn = document.getElementById("tasksBtn");
    const documentsBtn = document.getElementById("documentsBtn");
    const updatesBtn = document.getElementById("updatesBtn");

    if (notificationsBtn) {
      notificationsBtn.onclick = () => {
        console.log("🔔 Notifications clicked");
        alert("Notifications clicked (demo)");
      };
    }

    if (educationBtn) {
      educationBtn.onclick = () => {
        console.log("🎓 Education clicked");
        alert("Education clicked (demo)");
      };
    }

    if (homeBtn) {
      homeBtn.onclick = () => {
        console.log("🏠 Home clicked");
        showSection("homeScreen");
      };
    }

    if (tasksBtn) {
      tasksBtn.onclick = () => {
        console.log("✅ Tasks clicked");
        showSection("tasksScreen");
      };
    }

    if (documentsBtn) {
      documentsBtn.onclick = () => {
        console.log("📄 Documents clicked");
        showSection("documentsScreen");
      };
    }

    if (updatesBtn) {
      updatesBtn.onclick = () => {
        console.log("📣 Updates clicked");
        showSection("messagesScreen");
      };
    }
  }

  // ----------------------
  // SUPABASE CLIENT (singleton ✅)
  // ----------------------
  function getSupabaseClient() {
    if (!window._supabaseClient) {
      window._supabaseClient = window.supabase.createClient(
        window.APP_CONFIG.supabase.url,
        window.APP_CONFIG.supabase.anonKey
      );
    }
    return window._supabaseClient;
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

    const supabase = getSupabaseClient();

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
