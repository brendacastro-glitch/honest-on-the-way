document.addEventListener("DOMContentLoaded", () => {
  console.log("APP.JS LOADED ✅");

  // ----------------------
  // HELPERS: Screens
  // ----------------------
  function showLoginScreen() {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("appScreen").style.display = "none";
  }

  function showAppScreen() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appScreen").style.display = "flex";

    const caseNumber = localStorage.getItem("honest_immigration_case") || "";
    const caseDisplay = document.querySelector(".user-info p");
    if (caseDisplay && caseNumber) {
      caseDisplay.textContent = `Case: ${caseNumber}`;
    }

    console.log("✅ App screen visible now");
  }

  function checkLoginStatus() {
    const isLoggedIn =
      localStorage.getItem("honest_immigration_logged_in") === "true";

    if (isLoggedIn) showAppScreen();
    else showLoginScreen();
  }

  // ----------------------
  // SHOW SECTION CONTENT
  // ----------------------
  function showSection(sectionId) {
    document.querySelectorAll(".screen-content").forEach((section) => {
      section.classList.remove("active");
    });

    const target = document.getElementById(sectionId);
    if (target) target.classList.add("active");
  }

  // ----------------------
  // GLOBAL CLICK DEBUG ✅
  // ----------------------
  document.addEventListener("click", (e) => {
    console.log("✅ CLICK DETECTED ON:", e.target);
  });

  // ----------------------
  // NAVIGATION + TOP BUTTONS (EVENT DELEGATION ✅)
  // ----------------------
  document.addEventListener("click", (e) => {
    // ✅ Notifications
    if (e.target.closest("#notificationsBtn")) {
      console.log("🔔 Notifications clicked");
      alert("Notifications clicked (demo)");
      return;
    }

    // ✅ Education
    if (e.target.closest("#educationBtn")) {
      console.log("🎓 Education clicked");
      showSection("educationScreen");
      return;
    }

    // ✅ Bottom nav buttons
    const navBtn = e.target.closest(".nav-btn");
    if (navBtn) {
      const screen = navBtn.getAttribute("data-screen");
      console.log("➡️ NAV clicked:", screen);

      document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
      navBtn.classList.add("active");

      if (screen === "home") showSection("homeScreen");
      if (screen === "tasks") showSection("tasksScreen");
      if (screen === "documents") showSection("documentsScreen");
      if (screen === "updates") showSection("updatesScreen");

      return;
    }
  });

  // ----------------------
  // SUPABASE CLIENT ✅
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

    const caseNumber = document.getElementById("caseNumber").value.trim();
    const pin = document.getElementById("pin").value.trim();

    if (!caseNumber || !pin) {
      alert("Please enter your case number and PIN");
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
      alert("Invalid case number or PIN");
      return;
    }

    localStorage.setItem("honest_immigration_logged_in", "true");
    localStorage.setItem("honest_immigration_case", caseNumber);
    localStorage.setItem("honest_immigration_client_id", data.client_id);

    showAppScreen();
  }

  function handleLogout() {
    localStorage.removeItem("honest_immigration_logged_in");
    localStorage.removeItem("honest_immigration_case");
    localStorage.removeItem("honest_immigration_client_id");
    showLoginScreen();
  }

  // ----------------------
  // LOGIN BUTTONS ONLY
  // ----------------------
  document.getElementById("loginBtn")?.addEventListener("click", handleLogin);
  document.getElementById("magicLinkBtn")?.addEventListener("click", () =>
    alert("Magic link flow not implemented yet.")
  );
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);

  // ----------------------
  // INIT
  // ----------------------
  checkLoginStatus();
});
