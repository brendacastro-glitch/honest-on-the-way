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

    // Get client info from localStorage
    const clientId = localStorage.getItem('honest_immigration_client_id');
    const caseNumber = localStorage.getItem('honest_immigration_case') || '';
    
    // Update case in header
    const caseDisplay = document.getElementById('caseDisplay');
    if (caseDisplay && caseNumber) caseDisplay.textContent = `Case: ${caseNumber}`;

    // Load real user data or use demo
    if (clientId && clientId !== 'demo_client_123') {
      loadUserProfile(clientId);
      loadCaseData(clientId, caseNumber);
    } else {
      // Use demo data
      renderProgress();
    }

    // Bind app interactions
    bindAppButtonsOnce();
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

      // Query case_logins table with JOIN to clients
      const { data, error } = await supabase
        .from('case_logins')
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
    localStorage.removeItem('honest_immigration_client_name');
    localStorage.removeItem('honest_immigration_client_email');
    showLoginScreen();
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
  // Load Case Data
  // ----------------------
  async function loadCaseData(clientId, caseNumber) {
    try {
      const supabase = getSupabaseClient();
      
      // Load case information
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('case_ref', caseNumber)
        .single();
      
      if (caseData && !caseError) {
        // Update progress based on real case stage
        updateRealProgress(caseData.current_stage);
        
        // Load related data
        loadClientTasks(caseNumber);
        loadClientDocuments(caseNumber);
        loadCaseUpdates(caseNumber);
      } else {
        // Fallback to demo data
        renderProgress();
      }
    } catch (error) {
      console.error('Error loading case data:', error);
      renderProgress();
    }
  }

  // ----------------------
  // Load Client Tasks
  // ----------------------
  async function loadClientTasks(caseRef) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .eq('case_ref', caseRef)
        .order('due_date', { ascending: true });
      
      if (data && !error && data.length > 0) {
        updateTasksUI(data);
      } else {
        // Show demo tasks if no real data
        console.log('No tasks found, showing demo data');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  function updateTasksUI(tasks) {
    // For now, just log the tasks
    console.log('Tasks to display:', tasks);
    // TODO: Implement UI update for tasks
  }

  // ----------------------
  // Load Client Documents
  // ----------------------
  async function loadClientDocuments(caseRef) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('case_ref', caseRef)
        .order('uploaded_at', { ascending: false });
      
      if (data && !error && data.length > 0) {
        updateDocumentsUI(data);
      } else {
        console.log('No documents found');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }

  function updateDocumentsUI(documents) {
    console.log('Documents to display:', documents);
    // TODO: Implement UI update for documents
  }

  // ----------------------
  // Load Case Updates
  // ----------------------
  async function loadCaseUpdates(caseRef) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('case_updates')
        .select('*')
        .eq('case_ref', caseRef)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && !error && data.length > 0) {
        updateUpdatesUI(data);
        
        // Show notification dot if there are unread updates
        const dot = document.getElementById('notifDot');
        if (dot && data.length > 0) {
          dot.style.display = 'block';
        }
      } else {
        console.log('No updates found');
      }
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  }

  function updateUpdatesUI(updates) {
    console.log('Updates to display:', updates);
    // TODO: Implement UI update for updates
  }

  // ----------------------
  // Progress Functions
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
    
    // Setup click handlers for progress
    setTimeout(setupProgressStageClicks, 100);
  }

  function updateRealProgress(currentStage) {
    const host = document.getElementById('progressDots');
    if (!host) return;

    // Map stage names to indices based on your progress labels
    const stageMap = {
      'k': 0,
      'docs': 1,
      'ic': 2,
      'aq': 3,
      'pd': 4,
      'pdr': 5,
      'app_review': 6,
      'fr': 7,
      's': 8
    };
    
    // Convert stage to lowercase for matching
    const stageKey = currentStage ? currentStage.toLowerCase() : 'ic';
    const currentIndex = stageMap[stageKey] || 2; // Default to stage 2 if not found
    const doneCount = currentIndex; // All stages before current are done
    const total = 9;
    
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
    
    // Setup click handlers for progress
    setTimeout(setupProgressStageClicks, 100);
  }

  // ----------------------
  // Progress Stage Click Handlers
  // ----------------------
  function setupProgressStageClicks() {
    // Stage definitions with meanings
    const stageDefinitions = {
      'k': {
        short: 'K',
        full: 'Know',
        meaning: 'Initial intake and understanding of your case. We gather basic information about your situation.'
      },
      'docs': {
        short: 'DOCS',
        full: 'Documentation',
        meaning: 'Collecting and organizing all required documents. This includes passports, IDs, employment letters, etc.'
      },
      'ic': {
        short: 'IC',
        full: 'Introductory Call',
        meaning: 'First meeting with your case manager to discuss your case in detail and answer your questions.'
      },
      'aq': {
        short: 'AQ',
        full: 'Assessment & Qualification',
        meaning: 'Our legal team reviews your case to determine eligibility and best strategy.'
      },
      'pd': {
        short: 'PD',
        full: 'Petition Drafting',
        meaning: 'Drafting the legal petition or application with all supporting evidence.'
      },
      'pdr': {
        short: 'PDR',
        full: 'Petition Draft Review',
        meaning: 'You review the draft petition for accuracy before final submission.'
      },
      'app_review': {
        short: 'APP REVIEW',
        full: 'Application Review',
        meaning: 'Final review by our senior attorneys before submission to USCIS.'
      },
      'fr': {
        short: 'FR',
        full: 'Filing Ready',
        meaning: 'All documents are complete and ready for filing with immigration authorities.'
      },
      's': {
        short: 'S',
        full: 'Submitted',
        meaning: 'Case has been submitted to USCIS. Now waiting for response or next steps.'
      }
    };

    // Make progress labels clickable
    const progressLabels = document.querySelector('.progress-labels');
    if (progressLabels) {
      // Add click event to each label span
      const labels = progressLabels.querySelectorAll('span');
      labels.forEach((label, index) => {
        // Find which stage this label represents
        const labelText = label.textContent.trim().toLowerCase().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        let stageKey = '';
        
        // Map label text to stage key
        if (labelText.includes('k')) stageKey = 'k';
        else if (labelText.includes('docs')) stageKey = 'docs';
        else if (labelText.includes('ic')) stageKey = 'ic';
        else if (labelText.includes('aq')) stageKey = 'aq';
        else if (labelText.includes('pd')) stageKey = 'pd';
        else if (labelText.includes('pdr')) stageKey = 'pdr';
        else if (labelText.includes('app review')) stageKey = 'app_review';
        else if (labelText.includes('fr')) stageKey = 'fr';
        else if (labelText.includes('s')) stageKey = 's';
        
        if (stageKey && stageDefinitions[stageKey]) {
          label.style.cursor = 'pointer';
          label.style.textDecoration = 'underline';
          label.style.textDecorationStyle = 'dotted';
          label.title = `Click to learn about ${stageDefinitions[stageKey].full} stage`;
          
          label.addEventListener('click', (e) => {
            e.stopPropagation();
            showStageInfo(stageKey, stageDefinitions[stageKey], index);
          });
        }
      });
    }

    // Also make progress dots clickable
    const progressDots = document.getElementById('progressDots');
    if (progressDots) {
      const dots = progressDots.querySelectorAll('.dot-step');
      dots.forEach((dot, index) => {
        dot.style.cursor = 'pointer';
        
        // Find which stage this dot represents
        const stageKeys = Object.keys(stageDefinitions);
        const stageKey = index < stageKeys.length ? stageKeys[index] : null;
        
        if (stageKey && stageDefinitions[stageKey]) {
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            showStageInfo(stageKey, stageDefinitions[stageKey], index);
          });
        }
      });
    }
  }

  function showStageInfo(stageKey, stageInfo, index) {
    // Create or show stage info modal
    let modal = document.getElementById('stageInfoModal');
    
    if (!modal) {
      // Create modal if it doesn't exist
      modal = document.createElement('div');
      modal.id = 'stageInfoModal';
      modal.className = 'stage-modal-overlay';
      modal.innerHTML = `
        <div class="stage-modal">
          <div class="stage-modal-header">
            <h3>Stage ${index + 1}: ${stageInfo.full}</h3>
            <button class="stage-modal-close">&times;</button>
          </div>
          <div class="stage-modal-body">
            <div class="stage-badge">${stageInfo.short}</div>
            <p>${stageInfo.meaning}</p>
            <div class="stage-status">
              <strong>Your status:</strong> 
              <span class="stage-status-text" id="currentStageStatus">Loading...</span>
            </div>
          </div>
          <div class="stage-modal-footer">
            <button class="btn-secondary stage-modal-close">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add close handlers
      modal.querySelectorAll('.stage-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      });
      
      // Close when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
      
      // Add CSS for modal
      addStageModalStyles();
    }
    
    // Update modal content
    modal.querySelector('h3').textContent = `Stage ${index + 1}: ${stageInfo.full}`;
    modal.querySelector('.stage-badge').textContent = stageInfo.short;
    modal.querySelector('p').textContent = stageInfo.meaning;
    
    // Determine status for this stage
    const caseNumber = localStorage.getItem('honest_immigration_case');
    const statusText = getStageStatus(index, caseNumber);
    modal.querySelector('#currentStageStatus').textContent = statusText;
    
    // Show modal
    modal.style.display = 'flex';
  }

  function getStageStatus(stageIndex, caseNumber) {
    // This function determines the status of a specific stage
    // In a real app, you'd check the database
    // For now, using demo logic
    
    const clientId = localStorage.getItem('honest_immigration_client_id');
    
    if (clientId === 'demo_client_123') {
      // Demo logic
      if (stageIndex < 2) return '✅ Completed';
      if (stageIndex === 2) return '🟡 In Progress';
      return '⏳ Not Started';
    }
    
    // Real logic would check database here
    return '⏳ Not Started';
  }

  function addStageModalStyles() {
    // Only add styles once
    if (document.getElementById('stageModalStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'stageModalStyles';
    styles.textContent = `
      .stage-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
      }
      
      .stage-modal {
        background: white;
        border-radius: 20px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      
      .stage-modal-header {
        background: linear-gradient(180deg, #2a58c7 0%, #1E3A8A 100%);
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .stage-modal-header h3 {
        margin: 0;
        font-size: 18px;
      }
      
      .stage-modal-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .stage-modal-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .stage-modal-body {
        padding: 25px;
      }
      
      .stage-badge {
        display: inline-block;
        background: #3b82f6;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 15px;
      }
      
      .stage-modal-body p {
        color: #64748b;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      
      .stage-status {
        background: #f8fafc;
        padding: 12px;
        border-radius: 10px;
        border-left: 4px solid #3b82f6;
      }
      
      .stage-status strong {
        color: #1e293b;
      }
      
      .stage-status-text {
        display: block;
        margin-top: 5px;
        color: #475569;
      }
      
      .stage-modal-footer {
        padding: 20px;
        border-top: 1px solid #e5e7eb;
        text-align: right;
      }
      
      /* Make progress labels more interactive */
      .progress-labels span:hover {
        color: #3b82f6;
        text-decoration: underline !important;
      }
      
      .dot-step:hover {
        transform: scale(1.1);
        transition: transform 0.2s;
      }
    `;
    document.head.appendChild(styles);
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

    // Progress stage click handlers
    setTimeout(setupProgressStageClicks, 300);
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
});
