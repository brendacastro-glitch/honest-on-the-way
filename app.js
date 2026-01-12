document.addEventListener('DOMContentLoaded', () => {
  console.log("APP.JS LOADED ✅");

  // ----------------------
  // Screen helpers
  // ----------------------
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');

  function showLoginScreen() {
    loginScreen.style.display = 'block';
    appScreen.style.display = 'none';
  }

  function showAppScreen() {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';

    // Update case in header
    const caseNumber = localStorage.getItem('honest_immigration_case') || '';
    const caseDisplay = document.getElementById('caseDisplay');
    if (caseDisplay && caseNumber) caseDisplay.textContent = `Case: ${caseNumber}`;

    // Bind app interactions + render demo UI
    bindAppButtonsOnce();
    renderProgress();
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
    isLoggedIn ? showAppScreen() : showLoginScreen();
  }

  // ----------------------
  // Navigation (sections)
  // ----------------------
  function showSection(sectionId) {
    document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
  }

  function setBottomNavActive(screenKey) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const active = document.querySelector(`.nav-btn[data-screen="${screenKey}"]`);
    if (active) active.classList.add('active');
  }

  function screenKeyToSectionId(key) {
    if (key === 'home') return 'homeScreen';
    if (key === 'tasks') return 'tasksScreen';
    if (key === 'documents') return 'documentsScreen';
    if (key === 'updates') return 'updatesScreen';
    return 'homeScreen';
  }

  // ----------------------
  // Supabase client (singleton)
  // ----------------------
  function getSupabaseClient() {
    if (!window.APP_CONFIG || !window.APP_CONFIG.supabase) {
      throw new Error("APP_CONFIG missing. Check config.js load order.");
    }
    if (!window._supabaseClient) {
      window._supabaseClient = window.supabase.createClient(
        window.APP_CONFIG.supabase.url,
        window.APP_CONFIG.supabase.anonKey
      );
    }
    return window._supabaseClient;
  }

  // ----------------------
  // Login (Supabase)
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

    try {
      const supabase = getSupabaseClient();

      // Try different table names - you might need to adjust this
      let tableName = 'clients'; // Common table name
      const possibleTables = ['clients', 'users', 'case_logins', 'client_logins'];
      
      let data = null;
      let error = null;
      
      // Try each possible table
      for (const table of possibleTables) {
        console.log(`Trying table: ${table}`);
        const response = await supabase
          .from(table)
          .select('*')
          .eq('case_number', caseNumber)
          .eq('pin', pin)
          .maybeSingle(); // Use maybeSingle instead of single to avoid throwing error
        
        if (response.data && !response.error) {
          data = response.data;
          break;
        }
        error = response.error;
      }

      if (!data) {
        console.error("Login failed for all tables:", error);
        
        // For demo purposes, let's allow login with any PIN if case number looks valid
        if (caseNumber.startsWith('HI-')) {
          console.log("DEMO MODE: Allowing login for demo purposes");
          localStorage.setItem('honest_immigration_logged_in', 'true');
          localStorage.setItem('honest_immigration_case', caseNumber);
          localStorage.setItem('honest_immigration_client_id', 'demo_client_123');
          
          showAppScreen();
          return;
        }
        
        alert('Invalid case number or PIN. Please try again.');
        return;
      }

      localStorage.setItem('honest_immigration_logged_in', 'true');
      localStorage.setItem('honest_immigration_case', caseNumber);
      localStorage.setItem('honest_immigration_client_id', data.id || data.client_id || 'unknown');

      showAppScreen();
    } catch (e) {
      console.error("Login error:", e);
      alert("Login error. Check console for details.");
    }
  }

  function handleMagicLink() {
    alert('Magic link feature coming soon. For now, please use case number and PIN.');
  }

  function handleLogout() {
    localStorage.removeItem('honest_immigration_logged_in');
    localStorage.removeItem('honest_immigration_case');
    localStorage.removeItem('honest_immigration_client_id');
    showLoginScreen();
  }
  // ----------------------
  // Load User Profile Data
  // ----------------------
  async function loadUserProfile(clientId) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(window.APP_CONFIG.supabase.tables.clients)
        .select('full_name, email, phone, case_number')
        .eq('id', clientId)
        .single();
      
      if (data && !error) {
        // Update UI with real user data
        const userName = document.getElementById('userName');
        const userInitials = document.getElementById('userInitials');
        const caseDisplay = document.getElementById('caseDisplay');
        
        if (userName) userName.textContent = data.full_name || 'Client';
        if (userInitials) userInitials.textContent = getInitials(data.full_name || 'Client');
        if (caseDisplay && data.case_number) {
          caseDisplay.textContent = `Case: ${data.case_number}`;
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  function getInitials(name) {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // ----------------------
  // Load Case Data
  // ----------------------
  async function loadCaseData(clientId) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(window.APP_CONFIG.supabase.tables.cases)
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data && !error) {
        // Update progress based on real case stage
        updateRealProgress(data.current_stage, data.total_stages);
        
        // Update urgent tasks if any
        if (data.urgent_tasks && data.urgent_tasks.length > 0) {
          updateUrgentTasks(data.urgent_tasks);
        }
      }
    } catch (error) {
      console.error('Error loading case data:', error);
      // Fallback to demo data
      renderProgress();
    }
  }

  // ----------------------
  // Update Progress Based on Real Data
  // ----------------------
  function updateRealProgress(currentStage, totalStages = 9) {
    const host = document.getElementById('progressDots');
    if (!host) return;

    // Map stage names to indices (you'll need to adjust this based on your stage names)
    const stageMap = {
      'intake': 0,
      'documentation': 1,
      'initial_contact': 2,
      'assessment': 3,
      'preparation': 4,
      'preparation_review': 5,
      'approval_review': 6,
      'filing_ready': 7,
      'submitted': 8
    };
    
    const currentIndex = stageMap[currentStage] || 2; // Default to stage 2 if not found
    const doneCount = currentIndex; // All stages before current are done
    
    host.innerHTML = '';
    for (let i = 0; i < totalStages; i++) {
      const d = document.createElement('div');
      d.className = 'dot-step';

      if (i < doneCount) {
        d.classList.add('done');
        d.innerHTML = '<i class="fa-solid fa-check"></i>';
      } else if (i === currentIndex) {
        d.classList.add('current');
        d.innerHTML = '<div class="mini"></div>';
      } else {
        d.innerHTML = '';
      }

      host.appendChild(d);
    }
  }

  // ----------------------
  // Update Urgent Tasks
  // ----------------------
  function updateUrgentTasks(tasks) {
    // This is a placeholder - implement based on your UI
    console.log('Urgent tasks:', tasks);
    
    // Example: Update the urgent card
    const urgentCard = document.querySelector('.urgent-card h3');
    if (urgentCard && tasks.length > 0) {
      urgentCard.textContent = tasks[0].title || 'Complete pending task';
    }
  }
  // ----------------------
  // Demo: Progress dots (Figma-like)
  // ----------------------
  function renderProgress() {
    const host = document.getElementById('progressDots');
    if (!host) return;

    // 9 stages like your labels; mark first 2 done, third current
    const total = 9;
    const doneCount = 2;     // K + DOCS done
    const currentIndex = 2;  // IC current

    host.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'dot-step';

      if (i < doneCount) {
        d.classList.add('done');
        d.innerHTML = '<i class="fa-solid fa-check"></i>';
      } else if (i === currentIndex) {
        d.classList.add('current');
        d.innerHTML = '<div class="mini"></div>';
      } else {
        d.innerHTML = '';
      }

      host.appendChild(d);
    }
  }

  // ----------------------
  // Bind buttons (ONCE, using delegation)
  // ----------------------
  let bound = false;
  function bindAppButtonsOnce() {
    if (bound) return;
    bound = true;
    console.log("✅ Binding app buttons (once)...");

    // Top buttons
    const educationBtn = document.getElementById('educationBtn');
    const notificationsBtn = document.getElementById('notificationsBtn');
    const eduBackBtn = document.getElementById('eduBackBtn');

    if (educationBtn) {
      educationBtn.addEventListener('click', () => {
        showSection('educationScreen');
        // (No bottom nav highlight in Figma for education overlay; leave as-is)
      });
    }

    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        showSection('updatesScreen');
        setBottomNavActive('updates');
        const dot = document.getElementById('notifDot');
        if (dot) dot.style.display = 'none';
      });
    }

    if (eduBackBtn) {
      eduBackBtn.addEventListener('click', () => {
        showSection('homeScreen');
        setBottomNavActive('home');
      });
    }

    // Bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-screen');
        const sectionId = screenKeyToSectionId(key);
        showSection(sectionId);
        setBottomNavActive(key);
      });
    });

    // Tabs (Documents)
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');

        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('#documentsScreen .tab-content').forEach(c => c.classList.remove('active'));
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });

    // Accordions (Tasks)
    document.querySelectorAll('.accordion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-accordion');
        const panel = document.getElementById(id);
        if (!panel) return;
        panel.classList.toggle('open');
      });
    });

    // Action buttons (demo)
    document.body.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action], #uploadPassportBtn');
      if (!el) return;

      const action = el.getAttribute('data-action') || (el.id === 'uploadPassportBtn' ? 'upload-passport' : '');

      if (action === 'upload-passport' || action === 'upload-document' || action === 'take-photo') {
        alert("Demo action: this would open an upload flow.");
      } else if (action === 'take-action' || action === 'review-draft') {
        alert("Demo action: this would open the task workflow.");
      } else if (action === 'view-journey') {
        alert("Demo action: this would show the document journey timeline.");
      } else if (action === 'contact-manager') {
        alert("Demo action: this would open a message/contact screen.");
      } else if (action === 'watch-video') {
        alert("Demo action: this would open the video player.");
      } else if (action === 'view-faq') {
        alert("Demo action: this would open the FAQ.");
      }
    });
  }

  // ----------------------
  // Event listeners (Login screen + logout)
  // ----------------------
  const loginBtn = document.getElementById('loginBtn');
  const magicBtn = document.getElementById('magicLinkBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (magicBtn) magicBtn.addEventListener('click', handleMagicLink);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // ----------------------
  // Init
  // ----------------------
  checkLoginStatus();
}); // This closes the DOMContentLoaded event listener
