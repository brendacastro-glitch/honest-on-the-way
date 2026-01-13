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
    console.log("Showing login screen");
  }

  function showAppScreen() {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';
    console.log("Showing app screen");

    // ALWAYS start at home screen
    document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
    document.getElementById('homeScreen').classList.add('active');
    
    // ALWAYS set home as active in nav
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const homeNav = document.querySelector('.nav-btn[data-screen="home"]');
    if (homeNav) homeNav.classList.add('active');
    
    // Clear any stored screen state
    localStorage.removeItem('lastScreen');
    localStorage.removeItem('lastNav');

    // Get client info from localStorage
    const clientId = localStorage.getItem('honest_immigration_client_id');
    const caseNumber = localStorage.getItem('honest_immigration_case') || '';
    
    // Update case in header
    const caseDisplay = document.getElementById('caseDisplay');
    if (caseDisplay && caseNumber) {
      caseDisplay.textContent = `Case: ${caseNumber}`;
    }

    // Load real user data or use demo
    if (clientId && clientId !== 'demo_client_123') {
      console.log("Loading real user data for client:", clientId);
      loadUserProfile(clientId);
      loadCaseData(clientId, caseNumber);
    } else {
      console.log("Using demo data");
      // Use demo data
      renderProgress();
      renderDemoDocumentChecklist();
    }

    // Bind all app interactions
    bindAppButtons();
    setupProgressStageClicks();
    setupAccordions();
    setupContactButtons();
    setupTaskButtons();
    
    // Load notifications if logged in
    if (localStorage.getItem('honest_immigration_logged_in') === 'true') {
      loadNotifications();
    }
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
    if (key === 'education') return 'educationScreen';
    return 'homeScreen';
  }

  // ----------------------
  // Supabase client (singleton)
  // ----------------------
  function getSupabaseClient() {
    if (!window.APP_CONFIG || !window.APP_CONFIG.supabase) {
      console.error("APP_CONFIG missing:", window.APP_CONFIG);
      throw new Error("APP_CONFIG missing. Check config.js load order.");
    }
    if (!window._supabaseClient) {
      console.log("Creating Supabase client");
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
    console.log("LOGIN BUTTON CLICKED ✅");

    const caseNumber = document.getElementById('caseNumber').value.trim();
    const pin = document.getElementById('pin').value.trim();

    console.log("Case:", caseNumber, "PIN:", pin);

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
      console.log("Supabase client created");

      // Get the table name from config
      const tableName = window.APP_CONFIG.supabase.tables.case_logins || 'case_logins';
      console.log("Using table:", tableName);

      // Query case_logins table
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          *,
          clients (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('case_ref', caseNumber)
        .eq('pin', pin)
        .maybeSingle();

      console.log("Login query result:", data, error);

      if (error) {
        console.error("Supabase error:", error);
        alert('Login error: ' + error.message);
        return;
      }

      if (!data) {
        // For demo purposes, allow any login with case number starting with HI-
        if (caseNumber.startsWith('HI-')) {
          console.log("DEMO MODE: Allowing login for demo purposes");
          localStorage.setItem('honest_immigration_logged_in', 'true');
          localStorage.setItem('honest_immigration_case', caseNumber);
          localStorage.setItem('honest_immigration_client_id', 'demo_client_123');
          localStorage.setItem('honest_immigration_client_name', 'Demo Client');
          
          showAppScreen();
          return;
        }
        
        alert('Invalid case number or PIN. Please try again.');
        return;
      }

      // Store login information
      localStorage.setItem('honest_immigration_logged_in', 'true');
      localStorage.setItem('honest_immigration_case', caseNumber);
      localStorage.setItem('honest_immigration_client_id', data.client_id);
      
      // Store client info if available
      if (data.clients) {
        localStorage.setItem('honest_immigration_client_name', data.clients.full_name || 'Client');
        localStorage.setItem('honest_immigration_client_email', data.clients.email || '');
      }

      console.log("Login successful, showing app screen");
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
    console.log("Logging out");
    // Clear ALL app-related localStorage
    const keys = [
      'honest_immigration_logged_in',
      'honest_immigration_case', 
      'honest_immigration_client_id',
      'honest_immigration_client_name',
      'honest_immigration_client_email',
      'lastScreen',
      'lastNav',
      'notifications_read'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    
    // Also clear any session storage
    sessionStorage.clear();
    
    showLoginScreen();
  }

  // ----------------------
  // Button Binding
  // ----------------------
  function bindAppButtons() {
    console.log("Binding app buttons");
    
    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const screenKey = e.currentTarget.dataset.screen;
        console.log("Nav button clicked:", screenKey);
        showSection(screenKeyToSectionId(screenKey));
        setBottomNavActive(screenKey);
      });
    });

    // Education Center button
    const educationBtn = document.getElementById('educationBtn');
    if (educationBtn) {
      educationBtn.addEventListener('click', () => {
        console.log("Education button clicked");
        showSection('educationScreen');
        // Update bottom nav (no active state for education since it's not in bottom nav)
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      });
    }

    // Education back button
    const eduBackBtn = document.getElementById('eduBackBtn');
    if (eduBackBtn) {
      eduBackBtn.addEventListener('click', () => {
        showSection('homeScreen');
        setBottomNavActive('home');
      });
    }

    // Notifications button
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', showNotifications);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', handleLogin);
    }

    // Magic link button
    const magicBtn = document.getElementById('magicLinkBtn');
    if (magicBtn) {
      magicBtn.addEventListener('click', handleMagicLink);
    }

    // Upload passport button
    const uploadPassportBtn = document.getElementById('uploadPassportBtn');
    if (uploadPassportBtn) {
      uploadPassportBtn.addEventListener('click', () => {
        showSection('documentsScreen');
        setBottomNavActive('documents');
      });
    }

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
      });
    });
  }

  // ----------------------
  // Setup functions
  // ----------------------
  function setupAccordions() {
    document.querySelectorAll('.accordion-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const panelId = this.getAttribute('data-accordion');
        const panel = document.getElementById(panelId);
        if (panel) {
          panel.classList.toggle('open');
          this.classList.toggle('active');
        }
      });
    });
  }

  function setupContactButtons() {
    document.querySelectorAll('[data-action="contact-manager"]').forEach(btn => {
      btn.addEventListener('click', handleContactCaseManager);
    });
  }

  function setupTaskButtons() {
    // Task action buttons
    document.querySelectorAll('[data-action="take-action"], [data-action="upload-passport"], [data-action="review-draft"]').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        if (action === 'upload-passport') {
          showSection('documentsScreen');
          setBottomNavActive('documents');
        } else {
          showToastMessage('Task action initiated. Please follow the instructions.');
        }
      });
    });
  }

  // ----------------------
  // Contact Case Manager
  // ----------------------
  function handleContactCaseManager() {
    // Show redirecting message
    showToastMessage('Redirecting to contact form... Your case manager will respond within 24 hours.');
    
    // In future, this will connect to your app core
    console.log('Contact case manager clicked - would integrate with app core');
  }

  // ----------------------
  // Toast Messages
  // ----------------------
  function showToastMessage(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1E3A8A;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ----------------------
  // Load User Profile Data
  // ----------------------
  async function loadUserProfile(clientId) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('clients')
        .select('full_name, email, phone')
        .eq('id', clientId)
        .single();
      
      if (data && !error) {
        console.log("User profile loaded:", data);
        // Update UI with real user data
        const userName = document.getElementById('userName');
        const userInitials = document.getElementById('userInitials');
        
        if (userName) userName.textContent = data.full_name || 'Client';
        if (userInitials) userInitials.textContent = getInitials(data.full_name || 'Client');
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
  // Progress Bar System
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

  function setupProgressStageClicks() {
    console.log("Setting up progress stage clicks...");
    
    // Stage definitions
    const stageDefinitions = {
      'k': { short: 'K', full: 'Know', meaning: 'Initial intake phase where we understand your case details.' },
      'docs': { short: 'DOCS', full: 'Documentation', meaning: 'Collecting and organizing all required supporting documents.' },
      'ic': { short: 'IC', full: 'Introductory Call', meaning: 'First meeting with your case manager to discuss strategy.' },
      'aq': { short: 'AQ', full: 'Assessment & Qualification', meaning: 'Legal team reviews eligibility and determines best approach.' },
      'pd': { short: 'PD', full: 'Petition Drafting', meaning: 'Our attorneys draft the complete legal petition.' },
      'pdr': { short: 'PDR', full: 'Petition Draft Review', meaning: 'You review and confirm the accuracy of the draft petition.' },
      'app_review': { short: 'APP REVIEW', full: 'Application Review', meaning: 'Final quality check by senior attorneys.' },
      'fr': { short: 'FR', full: 'Filing Ready', meaning: 'All documents are complete and ready for submission.' },
      's': { short: 'S', full: 'Submitted', meaning: 'Case has been filed with USCIS. Awaiting response.' }
    };

    // Add smoother progress bar animation
    const progressBar = document.querySelector('.progress-rail');
    if (progressBar) {
      progressBar.style.transition = 'all 0.5s ease';
    }

    // Make all progress elements clickable
    setTimeout(() => {
      const progressLabels = document.querySelector('.progress-labels');
      if (progressLabels) {
        const labels = progressLabels.querySelectorAll('span');
        labels.forEach((label, index) => {
          const stageKeys = Object.keys(stageDefinitions);
          const stageKey = stageKeys[index];
          
          if (stageKey && stageDefinitions[stageKey]) {
            label.style.cursor = 'pointer';
            label.title = `Click to learn about ${stageDefinitions[stageKey].full} stage`;
            
            label.addEventListener('click', () => {
              showStageModal(stageKey, index);
            });
            
            // Add visual feedback
            label.addEventListener('mouseenter', () => {
              label.style.color = '#3b82f6';
            });
            label.addEventListener('mouseleave', () => {
              label.style.color = '';
            });
          }
        });
      }

      // Also make progress dots clickable
      const progressDots = document.getElementById('progressDots');
      if (progressDots) {
        const dots = progressDots.querySelectorAll('.dot-step');
        dots.forEach((dot, index) => {
          const stageKeys = Object.keys(stageDefinitions);
          const stageKey = stageKeys[index];
          
          if (stageKey && stageDefinitions[stageKey]) {
            dot.style.cursor = 'pointer';
            
            dot.addEventListener('click', () => {
              showStageModal(stageKey, index);
            });
            
            // Add hover effect
            dot.addEventListener('mouseenter', () => {
              dot.style.transform = 'scale(1.1)';
            });
            dot.addEventListener('mouseleave', () => {
              dot.style.transform = '';
            });
          }
        });
      }
    }, 100);
  }

  function showStageModal(stageKey, index) {
    const stageDefinitions = {
      'k': { short: 'K', full: 'Know', meaning: 'Initial intake phase where we understand your case details.' },
      'docs': { short: 'DOCS', full: 'Documentation', meaning: 'Collecting and organizing all required supporting documents.' },
      'ic': { short: 'IC', full: 'Introductory Call', meaning: 'First meeting with your case manager to discuss strategy.' },
      'aq': { short: 'AQ', full: 'Assessment & Qualification', meaning: 'Legal team reviews eligibility and determines best approach.' },
      'pd': { short: 'PD', full: 'Petition Drafting', meaning: 'Our attorneys draft the complete legal petition.' },
      'pdr': { short: 'PDR', full: 'Petition Draft Review', meaning: 'You review and confirm the accuracy of the draft petition.' },
      'app_review': { short: 'APP REVIEW', full: 'Application Review', meaning: 'Final quality check by senior attorneys.' },
      'fr': { short: 'FR', full: 'Filing Ready', meaning: 'All documents are complete and ready for submission.' },
      's': { short: 'S', full: 'Submitted', meaning: 'Case has been filed with USCIS. Awaiting response.' }
    };
    
    const stageInfo = stageDefinitions[stageKey];
    if (!stageInfo) return;
    
    // Remove existing modal
    const existingModal = document.getElementById('stageInfoModal');
    if (existingModal) existingModal.remove();
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'stageInfoModal';
    modal.className = 'stage-modal-overlay';
    modal.innerHTML = `
      <div class="stage-modal-content">
        <div class="stage-modal-header">
          <span class="stage-number">Stage ${index + 1}</span>
          <h3>${stageInfo.full} (${stageInfo.short})</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="stage-modal-body">
          <p>${stageInfo.meaning}</p>
          <div class="stage-status">
            <strong>Status:</strong> 
            <span class="status-indicator">
              ${getStageStatusText(index)}
            </span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  function getStageStatusText(index) {
    // Demo logic
    if (index < 2) return '✅ Completed';
    if (index === 2) return '🟡 In Progress';
    return '⏳ Not Started';
  }

  // ----------------------
  // Document Upload Functions
  // ----------------------
  function handleFileSelect(input) {
    const files = input.files;
    if (files.length > 0) {
      showToastMessage(`Selected ${files.length} file(s) for upload. Click Upload to proceed.`);
    }
  }

  // ----------------------
  // Notifications System
  // ----------------------
  async function loadNotifications() {
    try {
      const caseRef = localStorage.getItem('honest_immigration_case');
      if (!caseRef) return;
      
      // For demo, create some notifications
      const demoNotifications = [
        { id: 1, title: 'Document Approved', message: 'Your passport copy has been approved.', created_at: new Date().toISOString(), is_read: false },
        { id: 2, title: 'Task Due Soon', message: 'Employment letter upload due tomorrow.', created_at: new Date(Date.now() - 86400000).toISOString(), is_read: false }
      ];
      
      window.currentNotifications = demoNotifications;
      
      // Show notification dot
      const dot = document.getElementById('notifDot');
      if (dot) {
        dot.style.display = 'block';
        dot.textContent = demoNotifications.length > 9 ? '9+' : demoNotifications.length;
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  function showNotifications() {
    const notifications = window.currentNotifications || [];
    
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.notifications-dropdown');
    if (existingDropdown) existingDropdown.remove();
    
    // Create notifications dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'notifications-dropdown';
    dropdown.innerHTML = `
      <div class="notifications-header">
        <h4>Notifications (${notifications.length})</h4>
        <button class="clear-notifications">Clear All</button>
      </div>
      <div class="notifications-list">
        ${notifications.length > 0 ? 
          notifications.map(n => `
            <div class="notification-item ${n.is_read ? 'read' : 'unread'}">
              <div class="notification-icon">
                <i class="fa-solid fa-bell"></i>
              </div>
              <div class="notification-content">
                <div class="notification-title">${n.title}</div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-time">${formatTimeAgo(n.created_at)}</div>
              </div>
            </div>
          `).join('') : 
          '<div class="no-notifications">No new notifications</div>'
        }
      </div>
    `;
    
    // Position and show dropdown
    const bellBtn = document.getElementById('notificationsBtn');
    const rect = bellBtn.getBoundingClientRect();
    dropdown.style.cssText = `
      position: fixed;
      top: ${rect.bottom + 10}px;
      right: ${window.innerWidth - rect.right}px;
      width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 1000;
      max-height: 400px;
      overflow-y: auto;
    `;
    
    document.body.appendChild(dropdown);
    
    // Clear notifications button
    dropdown.querySelector('.clear-notifications').addEventListener('click', () => {
      const dot = document.getElementById('notifDot');
      if (dot) dot.style.display = 'none';
      window.currentNotifications = [];
      dropdown.remove();
      showToastMessage('All notifications cleared.');
    });
    
    // Close dropdown when clicking outside
    setTimeout(() => {
      const clickHandler = (e) => {
        if (!dropdown.contains(e.target) && e.target !== bellBtn) {
          dropdown.remove();
          document.removeEventListener('click', clickHandler);
        }
      };
      document.addEventListener('click', clickHandler);
    }, 100);
  }

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ----------------------
  // Document Checklist (Demo)
  // ----------------------
  function renderDemoDocumentChecklist() {
    console.log("Rendering demo document checklist");
    // This would be replaced with real data from Supabase
  }

  // ----------------------
  // Load Case Data
  // ----------------------
  async function loadCaseData(clientId, caseNumber) {
    // This would load real case data from Supabase
    console.log("Loading case data for:", clientId, caseNumber);
  }

  // ----------------------
  // Initialize App
  // ----------------------
  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
    
    if (isLoggedIn) {
      showAppScreen();
    } else {
      showLoginScreen();
    }
    
    console.log("App initialized, logged in:", isLoggedIn);
  }

  // Start the app
  checkLoginStatus();
});

// Add global styles if not present
if (!document.getElementById('globalAppStyles')) {
  const styles = document.createElement('style');
  styles.id = 'globalAppStyles';
  styles.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(styles);
}
