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
    const caseDisplay = document.getElementById('caseDisplay');

    if (caseDisplay && caseNumber) {
      caseDisplay.textContent = `Case: ${caseNumber}`;
    }

    // ✅ Bind buttons + render demo content
    bindAppButtons();
    seedDemoContent();
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
    if (isLoggedIn) showAppScreen();
    else showLoginScreen();
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
  // UI: Render helpers
  // ----------------------
  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function renderTasks(tasks, mountId) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = "";

    tasks.forEach(t => {
      const card = el('div', `task-card ${t.status === 'approved' ? 'completed' : ''}`);
      card.setAttribute('data-expanded', 'false');

      const header = el('div', 'task-header');
      const info = el('div', 'task-info');

      const icon = el('div', 'task-icon', `<i class="${t.icon}"></i>`);
      const details = el('div', 'task-details');
      details.appendChild(el('h4', '', t.title));

      const meta = el('div', 'task-meta');
      meta.appendChild(el('span', `status-badge ${t.status}`, t.statusLabel));
      meta.appendChild(el('span', 'due-date', t.due));

      details.appendChild(meta);

      info.appendChild(icon);
      info.appendChild(details);

      const right = el('div', '');
      const expandBtn = el('button', 'expand-btn', `<i class="fas fa-chevron-down"></i>`);
      expandBtn.type = "button";

      const statusIcon = el('div', 'task-status', t.status === 'approved' ? `<i class="fas fa-check-circle"></i>` : '');
      right.appendChild(expandBtn);
      if (t.status === 'approved') right.appendChild(statusIcon);

      header.appendChild(info);
      header.appendChild(right);

      const expansion = el('div', 'task-expansion');
      const expansionContent = el('div', 'expansion-content');
      expansionContent.appendChild(el('h5', '', 'What you need to do'));
      expansionContent.appendChild(el('p', '', t.description));
      const actionBtn = el('button', 'btn-secondary small', `<i class="fas fa-arrow-right"></i> ${t.actionText}`);
      actionBtn.type = "button";
      actionBtn.addEventListener('click', () => alert(`Demo: ${t.actionText}`));
      expansionContent.appendChild(actionBtn);

      const review = el('div', 'review-status', `<i class="fas fa-info-circle"></i> ${t.reviewNote}`);
      expansionContent.appendChild(review);

      expansion.appendChild(expansionContent);

      expandBtn.addEventListener('click', () => {
        const expanded = card.getAttribute('data-expanded') === 'true';
        card.setAttribute('data-expanded', expanded ? 'false' : 'true');
      });

      card.appendChild(header);
      card.appendChild(expansion);
      mount.appendChild(card);
    });
  }

  function renderMessages(messages) {
    const mount = document.getElementById('messagesList');
    if (!mount) return;
    mount.innerHTML = "";

    messages.forEach(m => {
      const card = el('div', `message-card ${m.type}`);
      const icon = el('div', 'message-icon', `<i class="${m.icon}"></i>`);
      const content = el('div', 'message-content');
      const header = el('div', 'message-header');
      header.appendChild(el('h4', '', m.title));
      header.appendChild(el('span', 'message-time', m.time));
      content.appendChild(header);
      content.appendChild(el('p', '', m.body));
      card.appendChild(icon);
      card.appendChild(content);
      mount.appendChild(card);
    });
  }

  function renderEducation(items) {
    const mount = document.getElementById('educationCards');
    if (!mount) return;
    mount.innerHTML = "";

    items.forEach(v => {
      const card = el('div', 'edu-card');
      card.setAttribute('data-edu', v.category);

      const thumb = el('div', 'edu-thumbnail', `<i class="${v.icon}"></i>`);
      const content = el('div', 'edu-content');
      content.appendChild(el('h4', '', v.title));
      content.appendChild(el('p', '', v.body));

      const meta = el('div', 'edu-meta');
      meta.appendChild(el('span', 'video-duration', v.duration));
      meta.appendChild(el('span', 'edu-category', v.label));
      content.appendChild(meta);

      card.appendChild(thumb);
      card.appendChild(content);

      card.addEventListener('click', () => alert(`Demo: Open "${v.title}"`));
      mount.appendChild(card);
    });
  }

  // ----------------------
  // BIND ALL APP BUTTONS ✅
  // ----------------------
  function bindAppButtons() {
    console.log("✅ Binding app buttons...");

    // Top buttons
    const notificationsBtn = document.getElementById("notificationsBtn");
    const educationBtn = document.getElementById("educationBtn");
    const uploadPassportBtn = document.getElementById("uploadPassportBtn");
    const uploadDocBtn = document.getElementById("uploadDocBtn");
    const scanDocBtn = document.getElementById("scanDocBtn");

    if (notificationsBtn) {
      notificationsBtn.onclick = () => {
        console.log("🔔 Notifications clicked");
        // Go to Updates screen
        setBottomNavActive('updates');
        showSection("updatesScreen");
      };
    }

    if (educationBtn) {
      educationBtn.onclick = () => {
        console.log("🎓 Education clicked");
        showSection("educationScreen");
      };
    }

    if (uploadPassportBtn) {
      uploadPassportBtn.onclick = () => alert("Demo: Upload flow not implemented yet.");
    }

    if (uploadDocBtn) {
      uploadDocBtn.onclick = () => alert("Demo: Document upload not implemented yet.");
    }

    if (scanDocBtn) {
      scanDocBtn.onclick = () => alert("Demo: Camera scan not implemented yet.");
    }

    // Bottom nav
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

    // Tasks tabs
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(t => {
      t.addEventListener('click', () => {
        tabButtons.forEach(x => x.classList.remove('active'));
        t.classList.add('active');

        const tab = t.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`tab-${tab}`);
        if (target) target.classList.add('active');
      });
    });

    // Updates filters (simple demo)
    const filterBtns = document.querySelectorAll("#updatesScreen .filter-btn");
    filterBtns.forEach(f => {
      f.addEventListener('click', () => {
        filterBtns.forEach(x => x.classList.remove('active'));
        f.classList.add('active');

        const type = f.getAttribute('data-filter');
        const filtered = type === 'all' ? DEMO.messages : DEMO.messages.filter(m => m.type === type);
        renderMessages(filtered);
      });
    });

    // Education filters (simple demo)
    const eduBtns = document.querySelectorAll("#educationScreen .filter-btn");
    eduBtns.forEach(f => {
      f.addEventListener('click', () => {
        eduBtns.forEach(x => x.classList.remove('active'));
        f.classList.add('active');

        const cat = f.getAttribute('data-edu');
        const filtered = cat === 'all' ? DEMO.education : DEMO.education.filter(v => v.category === cat);
        renderEducation(filtered);
      });
    });

    // Progress stage click (demo)
    const stages = document.querySelectorAll('.stage-item');
    const desc = document.getElementById('stageDescription');
    const close = document.getElementById('closeDescBtn');

    const stageMap = {
      K: { name: "Signed Contract", text: "Your initial agreement with Honest Immigration." },
      D: { name: "Documentation Upload", text: "Upload your required documents securely." },
      C: { name: "Introductory Call", text: "A call to confirm details and next steps." },
      R: { name: "Attorney Review", text: "Your file is reviewed for completeness and strategy." },
      S: { name: "Submission", text: "We submit your petition when everything is ready." },
    };

    stages.forEach(s => {
      s.addEventListener('click', () => {
        const key = s.getAttribute('data-stage');
        const data = stageMap[key];
        if (!data || !desc) return;

        document.getElementById('stageAbbrev').textContent = key;
        document.getElementById('stageFullName').textContent = data.name;
        document.getElementById('stageDescText').textContent = data.text;

        desc.style.display = 'block';
      });
    });

    if (close && desc) {
      close.addEventListener('click', () => {
        desc.style.display = 'none';
      });
    }
  }

  function setBottomNavActive(screen) {
    document.querySelectorAll('.nav-btn').forEach(b => {
      const s = b.getAttribute('data-screen');
      b.classList.toggle('active', s === screen);
    });
  }

  // ----------------------
  // DEMO CONTENT (so screens are NOT empty)
  // ----------------------
  const DEMO = {
    tasksPending: [
      {
        title: "Upload Passport Copy",
        status: "pending",
        statusLabel: "Pending",
        due: "Due in 3 days",
        icon: "fas fa-passport",
        description: "Upload a clear photo of your passport photo page (front).",
        actionText: "Upload Passport",
        reviewNote: "We review within 24–48 hours."
      },
      {
        title: "Confirm Address",
        status: "pending",
        statusLabel: "Pending",
        due: "Due in 7 days",
        icon: "fas fa-house",
        description: "Confirm your current address for mailing notices.",
        actionText: "Confirm Address",
        reviewNote: "We may request proof of address."
      }
    ],
    tasksSubmitted: [
      {
        title: "Birth Certificate Uploaded",
        status: "submitted",
        statusLabel: "Submitted",
        due: "Submitted yesterday",
        icon: "fas fa-file-alt",
        description: "We received your birth certificate. If something is missing, we’ll message you.",
        actionText: "View Status",
        reviewNote: "Currently under review."
      }
    ],
    tasksApproved: [
      {
        title: "Proof of Address Approved",
        status: "approved",
        statusLabel: "Approved",
        due: "Approved",
        icon: "fas fa-check",
        description: "Your proof of address looks good and is accepted into your file.",
        actionText: "View Document",
        reviewNote: "No action needed."
      }
    ],
    messages: [
      {
        type: "request",
        icon: "fas fa-exclamation-triangle",
        title: "Action Required: Upload Passport",
        time: "Today",
        body: "Please upload your passport photo page so we can proceed to the next stage."
      },
      {
        type: "update",
        icon: "fas fa-info-circle",
        title: "We are reviewing your Birth Certificate",
        time: "Yesterday",
        body: "Our team is reviewing your upload. If we need a clearer photo, we’ll let you know."
      },
      {
        type: "confirmation",
        icon: "fas fa-check-circle",
        title: "Address Document Approved",
        time: "2 days ago",
        body: "Your proof of address has been approved and added to your case file."
      }
    ],
    education: [
      {
        category: "tvisa",
        label: "T Visa",
        title: "What is a T Visa?",
        body: "A short overview of eligibility, process, and what to expect.",
        duration: "6 min",
        icon: "fas fa-graduation-cap"
      },
      {
        category: "vawa",
        label: "VAWA",
        title: "VAWA Basics",
        body: "Key concepts and what documents are commonly required.",
        duration: "7 min",
        icon: "fas fa-graduation-cap"
      },
      {
        category: "documents",
        label: "Documents",
        title: "How to Upload Documents",
        body: "Tips to avoid delays: clarity, angles, and required pages.",
        duration: "4 min",
        icon: "fas fa-file-alt"
      }
    ]
  };

  function seedDemoContent() {
    renderTasks(DEMO.tasksPending, 'taskListPending');
    renderTasks(DEMO.tasksSubmitted, 'taskListSubmitted');
    renderTasks(DEMO.tasksApproved, 'taskListApproved');
    renderMessages(DEMO.messages);
    renderEducation(DEMO.education);
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
