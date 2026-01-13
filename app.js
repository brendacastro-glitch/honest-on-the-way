document.addEventListener('DOMContentLoaded', () => {
  console.log("APP.JS LOADED ✅");

  // ----------------------
  // HELPERS: Screens
  // ----------------------
  function showLoginScreen() {
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('appScreen');
    if (login) login.style.display = 'flex';
    if (app) app.style.display = 'none';
  }

  function showAppScreen() {
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('appScreen');
    if (login) login.style.display = 'none';
    if (app) app.style.display = 'flex';

    const caseNumber = localStorage.getItem('honest_immigration_case') || '';
    const caseLine = document.getElementById('caseLine');
    if (caseLine && caseNumber) caseLine.textContent = `Case: ${caseNumber}`;

    bindAppButtons();
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
    isLoggedIn ? showAppScreen() : showLoginScreen();
  }

  function showSection(sectionId) {
    document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
  }

  function setBottomNavActive(screen) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-screen="${screen}"]`);
    if (activeBtn) activeBtn.classList.add('active');
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
  // LOGIN
  // ----------------------
  async function handleLogin() {
    console.log("CLICK LOGIN ✅");

    const caseNumber = document.getElementById('caseNumber')?.value.trim();
    const pin = document.getElementById('pin')?.value.trim();

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
  // LOGOUT
  // ----------------------
  function handleLogout() {
    localStorage.removeItem('honest_immigration_logged_in');
    localStorage.removeItem('honest_immigration_case');
    localStorage.removeItem('honest_immigration_client_id');
    showLoginScreen();
  }

  // ----------------------
  // PROGRESS MINI (demo render)
  // ----------------------
  function renderMiniProgress() {
    const labels = document.getElementById('progressLabels');
    const dots = document.getElementById('progressDots');
    if (!labels || !dots) return;

    const stages = ["Start", "Docs", "Draft", "Filed", "USCIS", "Decision"];
    const currentIndex = 1; // demo: "Docs"

    labels.innerHTML = stages.map(s => `<span>${s}</span>`).join("");
    dots.innerHTML = stages.map((_, i) => {
      const cls = i < currentIndex ? "pdot done" : (i === currentIndex ? "pdot current" : "pdot");
      return `<div class="${cls}"></div>`;
    }).join("");
  }

  // ----------------------
  // BIND ALL APP BUTTONS ✅
  // ----------------------
  function bindAppButtons() {
    console.log("✅ Binding app buttons...");

    // topbar education
    const educationBtn = document.getElementById('educationBtn');
    if (educationBtn) {
      educationBtn.onclick = () => {
        showSection('educationScreen');
      };
    }

    // hero education
    const heroEducationBtn = document.getElementById('heroEducationBtn');
    if (heroEducationBtn) {
      heroEducationBtn.onclick = () => {
        showSection('educationScreen');
      };
    }

    // education back
    const eduBackBtn = document.getElementById('eduBackBtn');
    if (eduBackBtn) {
      eduBackBtn.onclick = () => {
        showSection('homeScreen');
        setBottomNavActive('home');
      };
    }

    // upload now (home) -> documents tab "To Upload"
    const uploadNowBtn = document.getElementById('uploadNowBtn');
    if (uploadNowBtn) {
      uploadNowBtn.onclick = () => {
        showSection('documentsScreen');
        setBottomNavActive('documents');
        activateTab('docUpload');
      };
    }

    // bottom nav
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.onclick = () => {
        const screen = btn.getAttribute('data-screen');
        if (!screen) return;

        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (screen === "home") showSection("homeScreen");
        if (screen === "tasks") showSection("tasksScreen");
        if (screen === "documents") showSection("documentsScreen");
        if (screen === "updates") showSection("updatesScreen");
      };
    });

    // documents tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.onclick = () => {
        const panelId = tab.getAttribute('data-tab');
        if (panelId) activateTab(panelId);
      };
    });

    // tasks accordions
    document.querySelectorAll('.accordion-btn').forEach(btn => {
      btn.onclick = () => {
        const panelId = btn.getAttribute('data-acc');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        panel.classList.toggle('open');
      };
    });

    // render mini progress once
    renderMiniProgress();
  }

  function activateTab(panelId) {
    // tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.tab[data-tab="${panelId}"]`);
    if (activeTab) activeTab.classList.add('active');

    // panels
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
  }

  // ----------------------
  // EVENT LISTENERS (login)
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
