document.addEventListener("DOMContentLoaded", () => {
  console.log("APP.JS LOADED ✅");

  // ----------------------
  // STAGES (Progress)
  // ----------------------
  const STAGES = [
    { code: "K", title: "Contract", message: "Your contract has been signed and your payment has been received. Your case is now officially open." },
    { code: "DOCS", title: "Documentation Retrieval", message: "We’re collecting and reviewing your required documents. Please upload all requested items as soon as possible. If you’re missing a document or have trouble uploading, contact your case manager." },
    { code: "IC", title: "Introductory Call", message: "You will meet your case manager and review the next steps in your case. We’ll explain what to expect and what will happen next." },
    { code: "AQ", title: "Additional Questions", message: "We will ask additional questions to complete your file (entry to the U.S., address history, work history, family information, and other details). Please answer as accurately as possible." },
    { code: "PD", title: "Personal Declaration Call", message: "You will share your testimony with a trained specialist. This helps us prepare your personal declaration with the details your attorney needs." },
    { code: "PDR", title: "Personal Declaration Review", message: "We will review your personal declaration with you. You will confirm it is accurate and then sign it once approved by your attorney." },
    { code: "APP", title: "Application Review", message: "This is a required phone appointment where we review every page of your immigration forms together. We confirm all information is correct, updated, and verified before we submit your case." },
    { code: "REVIEW", title: "Final Review", message: "Our team is completing the final quality check to make sure your case is ready to submit. If anything is missing, we will contact you." },
    { code: "S", title: "Case Sent", message: "Your case has been submitted. We will notify you of updates and next steps as soon as we receive them." },
  ];

  // Change this to update what shows as "current"
  // You can store it in Supabase later; for now keep it here.
  const CURRENT_STAGE_CODE = "DOCS";

  // ----------------------
  // HELPERS: Screens
  // ----------------------
  function showLoginScreen() {
    const login = document.getElementById("loginScreen");
    const app = document.getElementById("appScreen");
    if (login) login.style.display = "flex";
    if (app) app.style.display = "none";
  }

  function showAppScreen() {
    const login = document.getElementById("loginScreen");
    const app = document.getElementById("appScreen");
    if (login) login.style.display = "none";
    if (app) app.style.display = "flex";

    const caseNumber = localStorage.getItem("honest_immigration_case") || "";
    const caseLine = document.getElementById("caseLine");
    if (caseLine && caseNumber) caseLine.textContent = `Case: ${caseNumber}`;

    // Bind + render after app is visible
    bindAppButtons();
    renderProgress();
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("honest_immigration_logged_in") === "true";
    if (isLoggedIn) showAppScreen();
    else showLoginScreen();
  }

  // ----------------------
  // NAV: show a section
  // ----------------------
  function showSection(sectionId) {
    document.querySelectorAll(".screen-content").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add("active");
  }

  // ----------------------
  // MODAL for stage details
  // ----------------------
  function openStageModal(stage) {
    let modal = document.getElementById("stageModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "stageModal";
      modal.className = "modal hidden";
      modal.innerHTML = `
        <div class="modal-overlay" data-close="1"></div>
        <div class="modal-card" role="dialog" aria-modal="true" aria-label="Stage details">
          <button class="modal-close" type="button" aria-label="Close" data-close="1">×</button>
          <div class="modal-badge" id="stageModalCode"></div>
          <h3 class="modal-title" id="stageModalTitle"></h3>
          <p class="modal-text" id="stageModalText"></p>
          <button class="btn-primary btn-wide" type="button" data-close="1">Got it</button>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener("click", (e) => {
        const close = e.target && e.target.getAttribute("data-close");
        if (close) closeStageModal();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeStageModal();
      });
    }

    document.getElementById("stageModalCode").textContent = stage.code;
    document.getElementById("stageModalTitle").textContent = `${stage.title}`;
    document.getElementById("stageModalText").textContent = stage.message;

    modal.classList.remove("hidden");
  }

  function closeStageModal() {
    const modal = document.getElementById("stageModal");
    if (modal) modal.classList.add("hidden");
  }

  // ----------------------
  // RENDER PROGRESS (aligned labels + dots)
  // ----------------------
  function renderProgress() {
    const labels = document.getElementById("progressLabels");
    const dots = document.getElementById("progressDots");
    if (!labels || !dots) return;

    // Make grid alignment perfect by setting a CSS variable
    labels.style.setProperty("--stage-count", STAGES.length);
    dots.style.setProperty("--stage-count", STAGES.length);

    labels.innerHTML = "";
    dots.innerHTML = "";

    const currentIndex = STAGES.findIndex((s) => s.code === CURRENT_STAGE_CODE);

    STAGES.forEach((stage, idx) => {
      // Labels row
      const lab = document.createElement("div");
      lab.className = "progress-label";
      lab.textContent = stage.code;
      labels.appendChild(lab);

      // Dots row (button)
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "progress-dot";
      btn.setAttribute("data-code", stage.code);
      btn.setAttribute("aria-label", `${stage.code} - ${stage.title}`);

      if (idx < currentIndex) btn.classList.add("done");
      if (idx === currentIndex) btn.classList.add("current");

      // This keeps the code perfectly centered in the dot
      btn.innerHTML = `<span class="dot-code">${stage.code}</span>`;
      dots.appendChild(btn);
    });

    // Click handler (event delegation)
    dots.onclick = (e) => {
      const targetBtn = e.target.closest(".progress-dot");
      if (!targetBtn) return;
      const code = targetBtn.getAttribute("data-code");
      const stage = STAGES.find((s) => s.code === code);
      if (stage) openStageModal(stage);
    };
  }

  // ----------------------
  // BIND APP BUTTONS
  // ----------------------
  function bindAppButtons() {
    // Top bar
    const educationBtn = document.getElementById("educationBtn");
    const heroEducationBtn = document.getElementById("heroEducationBtn");
    const eduBackBtn = document.getElementById("eduBackBtn");

    if (educationBtn) educationBtn.onclick = () => showSection("educationScreen");
    if (heroEducationBtn) heroEducationBtn.onclick = () => showSection("educationScreen");
    if (eduBackBtn) eduBackBtn.onclick = () => showSection("homeScreen");

    // Bottom nav
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach((btn) => {
      btn.onclick = () => {
        const screen = btn.getAttribute("data-screen");
        navButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        if (screen === "home") showSection("homeScreen");
        if (screen === "tasks") showSection("tasksScreen");
        if (screen === "documents") showSection("documentsScreen");
        if (screen === "updates") showSection("updatesScreen");
      };
    });

    // Upload now -> send to Documents tab "To Upload"
    const uploadNowBtn = document.getElementById("uploadNowBtn");
    if (uploadNowBtn) {
      uploadNowBtn.onclick = () => {
        // go to documents screen
        showSection("documentsScreen");
        // also highlight bottom nav
        navButtons.forEach((b) => b.classList.remove("active"));
        document.querySelector('.nav-btn[data-screen="documents"]')?.classList.add("active");
      };
    }

    // Accordion in Tasks
    document.querySelectorAll(".accordion-btn").forEach((b) => {
      b.onclick = () => {
        const panelId = b.getAttribute("data-acc");
        const panel = document.getElementById(panelId);
        if (!panel) return;
        panel.classList.toggle("open");
        b.classList.toggle("open");
      };
    });

    // Tabs in Documents
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((t) => {
      t.onclick = () => {
        const target = t.getAttribute("data-tab");
        tabs.forEach((x) => x.classList.remove("active"));
        t.classList.add("active");

        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
        document.getElementById(target)?.classList.add("active");
      };
    });
  }

  // ----------------------
  // SUPABASE CLIENT (singleton)
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

    const caseNumber = document.getElementById("caseNumber")?.value.trim();
    const pin = document.getElementById("pin")?.value.trim();

    if (!caseNumber || !pin) {
      alert("Please enter your case number and PIN.");
      return;
    }

    if (!window.APP_CONFIG?.supabase) {
      alert("Config not loaded. Check config.js");
      console.error("APP_CONFIG missing", window.APP_CONFIG);
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("case_logins")
      .select("*")
      .eq("case_ref", caseNumber)
      .eq("pin", pin)
      .single();

    if (error || !data) {
      console.error("Supabase login error:", error);
      alert("Invalid case number or PIN.");
      return;
    }

    localStorage.setItem("honest_immigration_logged_in", "true");
    localStorage.setItem("honest_immigration_case", caseNumber);
    localStorage.setItem("honest_immigration_client_id", data.client_id);

    showAppScreen();
  }

  function handleMagicLink() {
    alert("Magic link flow not implemented yet.");
  }

  // ----------------------
  // LOGOUT
  // ----------------------
  function handleLogout() {
    localStorage.removeItem("honest_immigration_logged_in");
    localStorage.removeItem("honest_immigration_case");
    localStorage.removeItem("honest_immigration_client_id");
    showLoginScreen();
  }

  // ----------------------
  // EVENT LISTENERS
  // ----------------------
  document.getElementById("loginBtn")?.addEventListener("click", handleLogin);
  document.getElementById("magicLinkBtn")?.addEventListener("click", handleMagicLink);
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);

  // ----------------------
  // INIT
  // ----------------------
  checkLoginStatus();
});
