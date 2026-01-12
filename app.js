document.addEventListener('DOMContentLoaded', () => {
  console.log("APP.JS LOADED ✅");

  // ======================
  // 1. QUICK FIX FOR LOGIN BUTTON - BIND IT IMMEDIATELY
  // ======================
  
  // Bind login button as soon as page loads
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    console.log("Found login button, binding click event");
    loginBtn.addEventListener('click', handleLogin);
  } else {
    console.error("Login button not found!");
  }
  
  // Also bind magic link button
  const magicBtn = document.getElementById('magicLinkBtn');
  if (magicBtn) {
    magicBtn.addEventListener('click', handleMagicLink);
  }
  
  // Allow Enter key in PIN field
  const pinInput = document.getElementById('pin');
  if (pinInput) {
    pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }

  // ======================
  // 2. SCREEN HELPERS
  // ======================
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');

  function showLoginScreen() {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appScreen) appScreen.style.display = 'none';
    
    // Clear form
    const caseInput = document.getElementById('caseNumber');
    const pinInput = document.getElementById('pin');
    if (caseInput) caseInput.value = '';
    if (pinInput) pinInput.value = '';
    
    console.log("Showing login screen");
  }

  function showAppScreen() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (appScreen) appScreen.style.display = 'block';

    const caseNumber = localStorage.getItem('honest_immigration_case') || 'HI-2024-001234';
    const clientId = localStorage.getItem('honest_immigration_client_id');
    
    // Update header
    const caseDisplay = document.getElementById('caseDisplay');
    if (caseDisplay) {
      caseDisplay.textContent = `Case: ${caseNumber}`;
    }

    // Load data
    if (clientId && clientId !== 'demo_client_123') {
      loadUserProfile(clientId);
      loadCaseData(clientId, caseNumber);
    } else {
      setupDemoData();
    }

    bindAppButtonsOnce();
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
    console.log("Login status check:", isLoggedIn);
    isLoggedIn ? showAppScreen() : showLoginScreen();
  }

  // ======================
  // 3. LOGIN FUNCTION - SIMPLIFIED
  // ======================
  async function handleLogin() {
    console.log("LOGIN BUTTON CLICKED!");
    
    const caseNumberInput = document.getElementById('caseNumber');
    const pinInput = document.getElementById('pin');
    
    if (!caseNumberInput || !pinInput) {
      console.error("Login form inputs not found!");
      return;
    }
    
    const caseNumber = caseNumberInput.value.trim();
    const pin = pinInput.value.trim();

    console.log("Trying to login with:", { caseNumber, pin });

    // Validation
    if (!caseNumber) {
      alert('Please enter your case number');
      caseNumberInput.focus();
      return;
    }
    
    if (!pin) {
      alert('Please enter your PIN');
      pinInput.focus();
      return;
    }

    // SIMPLE DEMO LOGIN - Works with ANY HI- case and ANY PIN
    if (caseNumber.toUpperCase().startsWith('HI-')) {
      console.log("DEMO LOGIN SUCCESS");
      
      // Store login info
      localStorage.setItem('honest_immigration_logged_in', 'true');
      localStorage.setItem('honest_immigration_case', caseNumber);
      localStorage.setItem('honest_immigration_client_id', 'demo_client_123');
      localStorage.setItem('honest_immigration_client_name', 'Maria Rodriguez');
      
      // Show success message
      console.log("Login successful, showing app...");
      
      // Small delay to show success
      setTimeout(() => {
        showAppScreen();
      }, 100);
      
      return;
    }

    // If not HI- case, try database login
    try {
      console.log("Trying database login...");
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('case_logins')
        .select('*')
        .eq('case_ref', caseNumber)
        .eq('pin', pin)
        .single();

      if (error || !data) {
        alert('Invalid case number or PIN. For demo, use a case number starting with HI-');
        return;
      }

      localStorage.setItem('honest_immigration_logged_in', 'true');
      localStorage.setItem('honest_immigration_case', caseNumber);
      localStorage.setItem('honest_immigration_client_id', data.client_id);
      
      showAppScreen();
      
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Using demo mode instead.");
      
      // Fallback to demo
      localStorage.setItem('honest_immigration_logged_in', 'true');
      localStorage.setItem('honest_immigration_case', 'HI-2024-001234');
      localStorage.setItem('honest_immigration_client_id', 'demo_client_123');
      localStorage.setItem('honest_immigration_client_name', 'Maria Rodriguez');
      
      showAppScreen();
    }
  }

  function handleMagicLink() {
    alert('Magic link feature coming soon!\n\nFor now, use:\nCase Number: HI-2024-001234\nPIN: 123456');
  }

  function handleLogout() {
    console.log("Logging out...");
    localStorage.clear();
    showLoginScreen();
  }

  // ======================
  // 4. SUPABASE CLIENT
  // ======================
  function getSupabaseClient() {
    if (!window.APP_CONFIG || !window.APP_CONFIG.supabase) {
      console.error("APP_CONFIG not loaded");
      return null;
    }
    
    if (!window._supabaseClient) {
      try {
        window._supabaseClient = window.supabase.createClient(
          window.APP_CONFIG.supabase.url,
          window.APP_CONFIG.supabase.anonKey
        );
        console.log("Supabase client created");
      } catch (error) {
        console.error("Failed to create Supabase client:", error);
        return null;
      }
    }
    return window._supabaseClient;
  }

  // ======================
  // 5. BUTTON BINDING - SIMPLIFIED
  // ======================
  function bindAppButtonsOnce() {
    console.log("Binding app buttons...");
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Education back button
    const eduBackBtn = document.getElementById('eduBackBtn');
    if (eduBackBtn) {
      eduBackBtn.addEventListener('click', () => {
        showSection('homeScreen');
        setBottomNavActive('home');
      });
    }
    
    // Education button in top bar
    const educationBtn = document.getElementById('educationBtn');
    if (educationBtn) {
      educationBtn.addEventListener('click', () => {
        showSection('educationScreen');
      });
    }
    
    // Upload passport button
    const uploadPassportBtn = document.getElementById('uploadPassportBtn');
    if (uploadPassportBtn) {
      uploadPassportBtn.addEventListener('click', () => {
        showSection('documentsScreen');
        setBottomNavActive('documents');
      });
    }
    
    // Notifications button
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        showSection('updatesScreen');
        setBottomNavActive('updates');
        const dot = document.getElementById('notifDot');
        if (dot) dot.style.display = 'none';
      });
    }
    
    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const screenKey = e.currentTarget.dataset.screen;
        const sectionId = screenKey + 'Screen';
        showSection(sectionId);
        setBottomNavActive(screenKey);
      });
    });
    
    // Accordion buttons
    document.querySelectorAll('.accordion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const panelId = e.currentTarget.dataset.accordion;
        const panel = document.getElementById(panelId);
        const icon = e.currentTarget.querySelector('.fa-chevron-down');
        
        if (panel) {
          panel.classList.toggle('open');
          panel.style.display = panel.classList.contains('open') ? 'block' : 'none';
        }
        if (icon) {
          icon.classList.toggle('fa-chevron-down');
          icon.classList.toggle('fa-chevron-up');
        }
      });
    });
    
    // Tab buttons in Documents
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        
        // Remove active from all
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active to clicked
        e.currentTarget.classList.add('active');
        const tabContent = document.getElementById(tabId);
        if (tabContent) tabContent.classList.add('active');
      });
    });
    
    // Action buttons (Take Action, Contact Manager, etc.)
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        console.log("Action clicked:", action);
        
        switch(action) {
          case 'upload-passport':
          case 'upload-document':
            showSection('documentsScreen');
            setBottomNavActive('documents');
            break;
          case 'take-action':
          case 'review-draft':
            alert(`Opening ${action.replace('-', ' ')} form...`);
            break;
          case 'contact-manager':
            alert('Your case manager will contact you within 24 hours.');
            break;
          case 'watch-video':
            alert('Playing education video...');
            break;
          case 'view-faq':
            alert('Opening FAQ...');
            break;
          default:
            // Do nothing for other actions
        }
      });
    });
  }

  // ======================
  // 6. NAVIGATION HELPERS
  // ======================
  function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.screen-content').forEach(s => {
      s.classList.remove('active');
    });
    
    // Show requested section
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('active');
    }
  }

  function setBottomNavActive(screenKey) {
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active to clicked button
    const activeBtn = document.querySelector(`.nav-btn[data-screen="${screenKey}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  // ======================
  // 7. PROGRESS SYSTEM (Clickable!)
  // ======================
  function renderProgress() {
    const progressDots = document.getElementById('progressDots');
    if (!progressDots) return;
    
    const stages = [
      { key: 'K', name: 'Kick-off', done: true },
      { key: 'DOCS', name: 'Document Collection', done: true, current: true },
      { key: 'IC', name: 'Introductory Call', done: false },
      { key: 'AQ', name: 'Additional Questions', done: false },
      { key: 'PD', name: 'Petition Draft', done: false },
      { key: 'PDR', name: 'Petition Draft Review', done: false },
      { key: 'APPREVIEW', name: 'Application Review', done: false },
      { key: 'FR', name: 'Final Review', done: false },
      { key: 'S', name: 'Submission', done: false }
    ];
    
    progressDots.innerHTML = stages.map(stage => {
      let className = 'dot-step';
      let content = `<div class="mini">${stage.key}</div>`;
      
      if (stage.done) {
        className += ' done';
        content = '<i class="fa-solid fa-check"></i>';
      }
      if (stage.current) {
        className += ' current';
      }
      
      return `
        <div class="${className}" 
             onclick="showStageDetails('${stage.key}', '${stage.name}')"
             style="cursor: pointer;"
             title="Click for details: ${stage.name}">
          ${content}
        </div>
      `;
    }).join('');
    
    // Also make the labels clickable
    const labels = document.querySelector('.progress-labels');
    if (labels) {
      labels.innerHTML = stages.map(stage => 
        `<span onclick="showStageDetails('${stage.key}', '${stage.name}')" 
               style="cursor: pointer;" 
               title="${stage.name}">
          ${stage.key}
        </span>`
      ).join('');
    }
  }

  // Make this function available globally for onclick
  window.showStageDetails = function(stageKey, stageName) {
    const descriptions = {
      'K': 'Initial case setup and client intake. We gather basic information about your situation.',
      'DOCS': 'Document collection phase. You upload required documents, we review them for completeness.',
      'IC': 'Introductory call with your case manager. We discuss your case in detail.',
      'AQ': 'Additional questions phase. We clarify any unclear information in your case.',
      'PD': 'Petition drafting. Our attorneys prepare your immigration petition.',
      'PDR': 'Petition draft review. You review the draft petition for accuracy.',
      'APPREVIEW': 'Final application review before submission to USCIS.',
      'FR': 'Final attorney review and quality check.',
      'S': 'Application submission to USCIS. Your case is officially filed.'
    };
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      ">
        <h3 style="margin-top: 0; color: #1E3A8A;">
          ${stageName} (${stageKey})
        </h3>
        <p style="color: #64748b; line-height: 1.6;">
          ${descriptions[stageKey] || 'Stage details not available.'}
        </p>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="btn-primary"
                style="width: 100%; margin-top: 16px;">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  // ======================
  // 8. DOCUMENT SYSTEM
  // ======================
  function renderDocumentChecklist() {
    // This will be called when app loads
    console.log("Document checklist ready");
    
    // Make document buttons clickable
    setTimeout(() => {
      document.querySelectorAll('.upload-specific-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const docName = this.dataset.docName;
          alert(`Would upload: ${docName}\n\nIn a real app, this would open a file picker.`);
        });
      });
    }, 500);
  }

  // ======================
  // 9. DEMO DATA SETUP
  // ======================
  function setupDemoData() {
    console.log("Setting up demo data");
    
    // Set user info
    const userName = document.getElementById('userName');
    const userInitials = document.getElementById('userInitials');
    const caseDisplay = document.getElementById('caseDisplay');
    
    if (userName) userName.textContent = 'Maria Rodriguez';
    if (userInitials) userInitials.textContent = 'MR';
    if (caseDisplay) caseDisplay.textContent = 'Case: HI-2026-00123';
    
    // Render progress
    renderProgress();
    
    // Show notification dot
    const dot = document.getElementById('notifDot');
    if (dot) dot.style.display = 'block';
  }

  // ======================
  // 10. LOAD USER PROFILE
  // ======================
  async function loadUserProfile(clientId) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('clients')
        .select('full_name, email')
        .eq('id', clientId)
        .single();
      
      if (data && !error) {
        const userName = document.getElementById('userName');
        const userInitials = document.getElementById('userInitials');
        
        if (userName) userName.textContent = data.full_name || 'Client';
        if (userInitials) {
          const initials = (data.full_name || 'Client')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
          userInitials.textContent = initials;
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  // ======================
  // 11. LOAD CASE DATA
  // ======================
  async function loadCaseData(clientId, caseNumber) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setupDemoData();
        return;
      }
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('case_ref', caseNumber)
        .single();
      
      if (data && !error) {
        console.log("Loaded real case data:", data);
        // Use real data
      } else {
        setupDemoData(); // Fallback to demo
      }
    } catch (error) {
      console.error("Error loading case:", error);
      setupDemoData();
    }
  }

  // ======================
  // 12. INITIALIZE APP
  // ======================
  function initializeApp() {
    console.log("Initializing Honest Immigration Portal...");
    
    // Check if user is logged in
    checkLoginStatus();
    
    console.log("App initialized successfully!");
  }

  // ======================
  // START THE APP
  // ======================
  initializeApp();

});

<script>
  // Debug: Check if button exists
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DEBUG: DOM loaded");
    const btn = document.getElementById('loginBtn');
    console.log("Login button found:", btn);
    
    if (btn) {
      btn.addEventListener('click', function() {
        console.log("DEBUG: Login button clicked!");
        alert("Button works! Now calling handleLogin...");
      });
    }
  });
</script>
