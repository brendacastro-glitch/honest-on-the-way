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

    renderProgressTracker();
    renderTasks();
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
  // SHOW SECTION CONTENT
  // ----------------------
  function showSection(sectionId) {
    const allSections = document.querySelectorAll('.screen-content');
    allSections.forEach(section => section.classList.remove('active'));

    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
  }

  // ----------------------
  // DEMO DATA
  // ----------------------
  const STAGES = [
    { abbr: "K", name: "Signed Contract", desc: "You signed your agreement with Honest Immigration." },
    { abbr: "DOCS", name: "Documentation Uploaded", desc: "You upload required documents for your petition." },
    { abbr: "IC", name: "Intro Call", desc: "A case manager meets with you for strategy and timeline." },
    { abbr: "AQ", name: "Attorney Questionnaire", desc: "You answer legal questions to support your case." },
    { abbr: "PD", name: "Personal Declaration", desc: "Your declaration is drafted and reviewed." },
    { abbr: "PDR", name: "PD Review", desc: "We review and finalize your declaration together." },
    { abbr: "AR", name: "Attorney Review", desc: "Attorney reviews packet before submission." },
    { abbr: "CR", name: "Case Ready", desc: "Your case packet is complete and ready to file." },
    { abbr: "S", name: "Submitted", desc: "Your case is submitted to USCIS." }
  ];

  const DEMO_TASKS = [
    {
      title: "Upload Passport Copy",
      status: "pending",
      due: "Due in 3 days",
      details: "Upload a clear copy of your passport photo page.",
    },
    {
      title: "Upload Birth Certificate",
      status: "pending",
      due: "Due in 7 days",
      details: "Upload a clear photo or scan of your birth certificate.",
    },
    {
      title: "Attorney Questionnaire",
      status: "submitted",
      due: "Submitted",
      details: "You already submitted this. We are reviewing it.",
    },
  ];

  // ----------------------
  // RENDER PROGRESS TRACKER
  // ----------------------
  function renderProgressTracker() {
    const container = document.getElementById("progressTracker");
    if (!container) return;

    container.innerHTML = "";

    const progressStages = document.createElement("div");
    progressStages.className = "progress-stages";

    const currentIndex = 1; // demo current stage

    STAGES.forEach((stage, idx) => {
      const item = document.createElement("div");
      item.className = "stage-item";

      if (idx < currentIndex) item.classList.add("completed");
      if (idx === currentIndex) item.classList.add("current");

      item.innerHTML = `
        <div class="stage-circle">${stage.abbr[0]}</div>
        <div class="stage-label">${stage.abbr}</div>
      `;

      item.addEventListener("click", () => showStageDescription(stage));
      progressStages.appendChild(item);
    });

    container.appendChild(progressStages);
  }

  function showStageDescription(stage) {
    const box = document.getElementById("stageDescription");
    if (!box) return;

    document.getElementById("stageAbbrev").textContent = stage.abbr;
    document.getElementById("stageFullName").textContent = stage.name;
    document.getElementById("stageDescText").textContent = stage.desc;

    box.style.display = "block";
    box.classList.add("expanding");
  }

  // ----------------------
  // RENDER TASKS
  // ----------------------
  function renderTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;

    list.innerHTML = "";

    DEMO_TASKS.forEach((task, index) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.dataset.expanded = "false";

      card.innerHTML = `
        <div class="task-header">
          <div class="task-info">
            <div class="task-icon"><i class="fas fa-clipboard-check"></i></div>
            <div class="task-details">
              <h4>${task.title}</h4>
              <div class="task-meta">
                <span class="status-badge ${task.status}">${task.status}</span>
                <span class="due-date">${task.due}</span>
              </div>
            </div>
          </div>
          <button class="expand-btn" aria-label="Expand task">
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>

        <div class="task-expansion">
          <div class="expansion-content">
            <h5>Details</h5>
            <p>${task.details}</p>
            <button class="btn-secondary small">
              <i class="fas fa-upload"></i> Upload / View
            </button>
          </div>
        </div>
      `;

      const expandBtn = card.querySelector(".expand-btn");
      expandBtn.addEventListener("click", () => {
        const expanded = card.dataset.expanded === "true";
        card.dataset.expanded = expanded ? "false" : "true";
      });

      list.appendChild(card);
    });
  }

  // ----------------------
  // BIND ALL APP BUTTONS ✅
  // ----------------------
  function bindAppButtons() {
    console.log("✅ Binding app buttons...");

    const notificationsBtn = document.getElementById("notificationsBtn");
    const educationBtn = document.getElementById("educationBtn");
    const uploadNowBtn = document.getElementById("uploadNowBtn");
    const closeDescBtn = document.getElementById("closeDescBtn");

    if (notificationsBtn) {
      notificationsBtn.onclick = () => {
        console.log("🔔 Notifications clicked");
        showSection("updatesScreen");
      };
    }

    if (educationBtn) {
      educationBtn.onclick = () => {
        console.log("🎓 Education clicked");
        showSection("educationScreen");
      };
    }

    if (uploadNowBtn) {
      uploadNowBtn.onclick = () => {
        console.log("📤 Upload Now clicked");
        alert("Upload flow demo — next we connect to Supabase Storage.");
      };
    }

    if (closeDescBtn) {
      closeDescBtn.onclick = () => {
        const box = document.getElementById("stageDescription");
        if (box) box.style.display = "none";
      };
    }

    // Bottom nav buttons
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(btn => {
      btn.onclick = () => {
        const screen = btn.getAttribute("data-screen");
        console.log("➡️ NAV clicked:", screen);

        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (screen === "home") showSection("homeScreen");
        if (screen === "tasks") showSection("tasksScreen");
        if (screen === "documents") showSection("documentsScreen");
        if (screen === "updates") showSection("updatesScreen");
      };
    });
  }

  // ----------------------
  // SUPABASE CLIENT
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
  // LOGOUT
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
