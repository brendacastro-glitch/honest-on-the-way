document.addEventListener("DOMContentLoaded", () => {
  console.log("APP.JS LOADED ✅");

  // ----------------------
  // Screens
  // ----------------------
  const loginScreen = document.getElementById("loginScreen");
  const appScreen = document.getElementById("appScreen");

  function showLoginScreen() {
    loginScreen.style.display = "flex";
    appScreen.style.display = "none";
  }

  function showAppScreen() {
    loginScreen.style.display = "none";
    appScreen.style.display = "flex";

    // Update UI with stored case data (demo)
    const caseNumber = localStorage.getItem("honest_immigration_case") || "HI-2026-00123";
    const fullName = localStorage.getItem("honest_immigration_name") || "Maria Rodriguez";

    const helloName = document.getElementById("helloName");
    const caseLine = document.getElementById("caseLine");
    const miniAvatar = document.getElementById("miniAvatar");
    const avatarCircle = document.getElementById("avatarCircle");

    if (helloName) helloName.textContent = `Welcome, ${fullName}`;
    if (caseLine) caseLine.textContent = `Case: ${caseNumber}`;

    const initials = fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0].toUpperCase())
      .join("");

    if (miniAvatar) miniAvatar.textContent = initials || "MR";
    if (avatarCircle) avatarCircle.textContent = initials || "MR";

    renderProgress();
    bindAppButtons();
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("honest_immigration_logged_in") === "true";
    if (isLoggedIn) showAppScreen();
    else showLoginScreen();
  }

  // ----------------------
  // Navigation helpers
  // ----------------------
  function showSection(sectionId) {
    document.querySelectorAll(".screen-content").forEach(sec => sec.classList.remove("active"));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add("active");
  }

  function setActiveNav(screenKey) {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`.nav-btn[data-screen="${screenKey}"]`);
    if (btn) btn.classList.add("active");
  }

  // ----------------------
  // Progress (demo)
  // ----------------------
  function renderProgress() {
    const labels = ["K","DOCS","IC","AQ","PD","PDR","APP","REVIEW","FRS","S"];
    const doneCount = 2;     // demo
    const currentIndex = 2;  // demo: IC

    const labelsWrap = document.getElementById("progressLabels");
    const dotsWrap = document.getElementById("progressDots");
    if (!labelsWrap || !dotsWrap) return;

    labelsWrap.innerHTML = labels.map(l => `<span>${l}</span>`).join("");
    dotsWrap.innerHTML = "";

    labels.forEach((l, idx) => {
      const div = document.createElement("div");
      div.className = "dotc";

      if (idx < doneCount) {
        div.classList.add("done");
        div.innerHTML = `<i class="fa-solid fa-check"></i>`;
      } else if (idx === currentIndex) {
        div.classList.add("current");
        div.textContent = "";
      } else {
        div.classList.add("todo");
        div.textContent = "";
      }
      dotsWrap.appendChild(div);
    });
  }

  // ----------------------
  // Buttons / Events
  // ----------------------
  function bindAppButtons() {
    // Top buttons
    const educationBtn = document.getElementById("educationBtn");
    const heroEducationBtn = document.getElementById("heroEducationBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const eduBackBtn = document.getElementById("eduBackBtn");
    const uploadNowBtn = document.getElementById("uploadNowBtn");

    if (educationBtn) educationBtn.onclick = () => {
      setActiveNav("home"); // keep nav stable, education is extra
      showSection("educationScreen");
    };

    if (heroEducationBtn) heroEducationBtn.onclick = () => {
      setActiveNav("home");
      showSection("educationScreen");
    };

    if (eduBackBtn) eduBackBtn.onclick = () => {
      showSection("homeScreen");
      setActiveNav("home");
    };

    if (uploadNowBtn) uploadNowBtn.onclick = () => {
      alert("Upload flow (demo). Next step: open file picker / camera.");
    };

    if (logoutBtn) logoutBtn.onclick = handleLogout;

    // Bottom nav
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(btn => {
      btn.onclick = () => {
        const screen = btn.getAttribute("data-screen");
        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (screen === "home") showSection("homeScreen");
        if (screen === "tasks") showSection("tasksScreen");
        if (screen === "documents") showSection("documentsScreen");
        if (screen === "updates") showSection("updatesScreen");
      };
    });

    // Documents tabs
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => {
      tab.onclick = () => {
        const targetId = tab.getAttribute("data-tab");
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        const panel = document.getElementById(targetId);
        if (panel) panel.classList.add("active");
      };
    });

    // Task accordions
    document.querySelectorAll(".accordion-btn").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-acc");
        const panel = document.getElementById(id);
        if (!panel) return;

        const isOpen = panel.classList.contains("open");
        document.querySelectorAll(".accordion-panel").forEach(p => p.classList.remove("open"));
        if (!isOpen) panel.classList.add("open");
      };
    });
  }

  // ----------------------
  // Supabase (singleton)
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
  // Login
  // ----------------------
  async function handleLogin() {
    console.log("CLICK LOGIN ✅");

    const caseNumber = document.getElementById("caseNumber").value.trim();
    const pin = document.getElementById("pin").value.trim();

    if (!caseNumber || !pin) {
      alert("Please enter your case number and PIN");
      return;
    }

    if (!window.APP_CONFIG || !window.APP_CONFIG.supabase) {
      alert("Config not loaded. Check config.js");
      console.error("APP_CONFIG missing", window.APP_CONFIG);
      return;
    }

    // REAL login (your table case_logins)
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("case_logins")
      .select("*")
      .eq("case_ref", caseNumber)
      .eq("pin", pin)
      .single();

    if (error || !data) {
      console.error("Supabase login error:", error);
      alert("Invalid case number or PIN");
      return;
    }

    // Store session (simple demo)
    localStorage.setItem("honest_immigration_logged_in", "true");
    localStorage.setItem("honest_immigration_case", caseNumber);
    localStorage.setItem("honest_immigration_client_id", data.client_id);

    // optional name if you have it later:
    // localStorage.setItem("honest_immigration_name", data.full_name || "Maria Rodriguez");

    showAppScreen();
  }

  function handleMagicLink() {
    alert("Magic link flow not implemented yet.");
  }

  function handleLogout() {
    localStorage.removeItem("honest_immigration_logged_in");
    localStorage.removeItem("honest_immigration_case");
    localStorage.removeItem("honest_immigration_client_id");
    showLoginScreen();
  }

  // Login listeners
  const loginBtn = document.getElementById("loginBtn");
  const magicBtn = document.getElementById("magicLinkBtn");
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);
  if (magicBtn) magicBtn.addEventListener("click", handleMagicLink);

  // INIT
  checkLoginStatus();
});
