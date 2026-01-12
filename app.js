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

  // =============================================
  // DOCUMENT CHECKLIST SYSTEM - ADD THIS SECTION
  // =============================================
  const DOCUMENT_TEMPLATES = {
    // T VISA TEMPLATES
    'T Visa Principal': [
      { id: 't1', name: '2 Passport Pictures', required: true, category: 'required' },
      { id: 't2', name: 'G-28', required: true, category: 'required' },
      { id: 't3', name: 'I-914', required: true, category: 'required' },
      { id: 't4', name: 'PD', required: true, category: 'required' },
      { id: 't5', name: 'Birth Certificate', required: true, category: 'required' },
      { id: 't6', name: 'Birth Certificate Translation', required: true, category: 'required' },
      { id: 't7', name: 'Copy of Passport', required: true, category: 'required' },
      { id: 't8', name: 'Trafficking Report Agreement', required: true, category: 'required' },
      { id: 't9', name: 'I-914 Supplement B', required: true, category: 'required' },
      { id: 't10', name: 'I-192', required: false, category: 'conditional', condition: 'Client is NOT a Visa Overstay' },
      { id: 't11', name: 'I-765 (C) (40)', required: true, category: 'required' },
      { id: 't12', name: 'FBI Criminal Record', required: true, category: 'required' },
      { id: 't13', name: 'USC Kids Birth Certificates', required: false, category: 'conditional', condition: 'If has US-born children' },
      { id: 't14', name: 'Divorce Decree', required: false, category: 'conditional', condition: 'If previously divorced' },
      { id: 't15', name: 'OPT (Previous Immigration)', required: false, category: 'conditional', condition: 'If had previous immigration processes' }
    ],
    
    'VAWA Spouse': [
      { id: 'v1', name: '2 Passport Pictures', required: true, category: 'required' },
      { id: 'v2', name: 'G-28', required: true, category: 'required' },
      { id: 'v3', name: 'I-360', required: true, category: 'required' },
      { id: 'v4', name: 'PD', required: true, category: 'required' },
      { id: 'v5', name: 'Birth Certificate', required: true, category: 'required' },
      { id: 'v6', name: 'Birth Certificate Translation', required: true, category: 'required' },
      { id: 'v7', name: 'Copy of Passport', required: true, category: 'required' },
      { id: 'v8', name: 'Spouse\'s Legal Status Proof', required: true, category: 'required' },
      { id: 'v9', name: 'Marriage Certificate', required: true, category: 'required' },
      { id: 'v10', name: 'OPT (Previous Immigration)', required: false, category: 'conditional' },
      { id: 'v11', name: 'USC Kids Birth Certificates', required: false, category: 'conditional' },
      { id: 'v12', name: 'Divorce Decree (ALL ex-spouses)', required: false, category: 'conditional' },
      { id: 'v13', name: 'Joint Residence Evidence (3 docs)', required: true, category: 'required' },
      { id: 'v14', name: 'Joint Pictures (2-10)', required: true, category: 'required' },
      { id: 'v15', name: 'FBI Criminal Record', required: true, category: 'required' }
    ],
    
    'VAWA Parent': [
      { id: 'vp1', name: '2 Passport Pictures', required: true, category: 'required' },
      { id: 'vp2', name: 'G-28', required: true, category: 'required' },
      { id: 'vp3', name: 'I-360', required: true, category: 'required' },
      { id: 'vp4', name: 'PD', required: true, category: 'required' },
      { id: 'vp5', name: 'Birth Certificate', required: true, category: 'required' },
      { id: 'vp6', name: 'Birth Certificate Translation', required: true, category: 'required' },
      { id: 'vp7', name: 'Copy of Passport', required: true, category: 'required' },
      { id: 'vp8', name: 'Abuser-Child\'s Birth Certificate', required: true, category: 'required' },
      { id: 'vp9', name: 'Previous Immigration Petition (OPT)', required: false, category: 'conditional' },
      { id: 'vp10', name: 'Joint Residency Evidence (3 docs)', required: true, category: 'required' },
      { id: 'vp11', name: 'Joint Pictures (2-10)', required: true, category: 'required' },
      { id: 'vp12', name: 'USC Kids Birth Certificates', required: false, category: 'conditional' },
      { id: 'vp13', name: 'FBI Criminal Record', required: true, category: 'required' }
    ],
    
    'VAWA Parent + AOS': [
      { id: 'vpa1', name: '6 Passport Pictures', required: true, category: 'required' },
      { id: 'vpa2', name: 'G-28', required: true, category: 'required' },
      { id: 'vpa3', name: 'I-360', required: true, category: 'required' },
      { id: 'vpa4', name: 'I-485', required: true, category: 'required' },
      { id: 'vpa5', name: 'I-864W', required: true, category: 'required' },
      { id: 'vpa6', name: 'I-765', required: true, category: 'required' },
      { id: 'vpa7', name: 'PD', required: true, category: 'required' },
      { id: 'vpa8', name: 'AOS PD', required: true, category: 'required' },
      { id: 'vpa9', name: 'Birth Certificate', required: true, category: 'required' },
      { id: 'vpa10', name: 'Birth Certificate Translation', required: true, category: 'required' },
      { id: 'vpa11', name: 'Copy of Passport', required: true, category: 'required' },
      { id: 'vpa12', name: 'Abuser-Child\'s Birth Certificate', required: true, category: 'required' },
      { id: 'vpa13', name: 'Previous Immigration Petition (OPT)', required: false, category: 'conditional' },
      { id: 'vpa14', name: 'Joint Residency Evidence (3 docs)', required: true, category: 'required' },
      { id: 'vpa15', name: 'Joint Pictures (2-10)', required: true, category: 'required' },
      { id: 'vpa16', name: 'USC Kids Birth Certificates', required: false, category: 'conditional' },
      { id: 'vpa17', name: 'Medical Exam', required: true, category: 'required', note: 'Sent by client' },
      { id: 'vpa18', name: 'FBI Criminal Record', required: true, category: 'required' }
    ],
    
    'VAWA Spouse + AOS': [
      { id: 'vsa1', name: '6 Passport Pictures', required: true, category: 'required' },
      { id: 'vsa2', name: 'G-28', required: true, category: 'required' },
      { id: 'vsa3', name: 'I-360', required: true, category: 'required' },
      { id: 'vsa4', name: 'I-485', required: true, category: 'required' },
      { id: 'vsa5', name: 'I-864W', required: true, category: 'required' },
      { id: 'vsa6', name: 'I-765', required: true, category: 'required' },
      { id: 'vsa7', name: 'PD', required: true, category: 'required' },
      { id: 'vsa8', name: 'AOS PD', required: true, category: 'required' },
      { id: 'vsa9', name: 'Birth Certificate', required: true, category: 'required' },
      { id: 'vsa10', name: 'Birth Certificate Translation', required: true, category: 'required' },
      { id: 'vsa11', name: 'Copy of Passport', required: true, category: 'required' },
      { id: 'vsa12', name: 'Spouse\'s Legal Status Proof', required: true, category: 'required' },
      { id: 'vsa13', name: 'Marriage Certificate', required: true, category: 'required' },
      { id: 'vsa14', name: 'Previous Immigration Applications (OPT)', required: false, category: 'conditional' },
      { id: 'vsa15', name: 'USA Kids Birth Certificates', required: false, category: 'conditional' },
      { id: 'vsa16', name: 'Divorce Decree (all ex-spouses)', required: false, category: 'conditional' },
      { id: 'vsa17', name: 'Joint Residence Evidence', required: true, category: 'required' },
      { id: 'vsa18', name: 'Joint Pictures', required: true, category: 'required' },
      { id: 'vsa19', name: 'FBI Criminal Record', required: true, category: 'required' },
      { id: 'vsa20', name: 'Medical Exam', required: true, category: 'required', note: 'Sent by client' }
    ]
  };

  async function loadDocumentChecklist(caseRef, visaType = null) {
    try {
      const supabase = getSupabaseClient();
      
      // If visaType not provided, get it from cases table
      if (!visaType) {
        const { data: caseData, error: caseError } = await supabase
          .from('cases')
          .select('visa_type')
          .eq('case_ref', caseRef)
          .single();
        
        if (caseData && !caseError) {
          visaType = caseData.visa_type;
        }
      }
      
      // Default to T Visa if no type found
      if (!visaType) visaType = 'T Visa Principal';
      
      // Get template for this visa type
      const template = DOCUMENT_TEMPLATES[visaType] || DOCUMENT_TEMPLATES['T Visa Principal'];
      
      // Get uploaded documents for this case
      const { data: uploadedDocs, error: docsError } = await supabase
        .from('client_documents')
        .select('*')
        .eq('case_ref', caseRef);
      
      // Create checklist with status
      const checklist = template.map(doc => {
        const uploaded = uploadedDocs?.find(u => 
          u.document_name === doc.name || 
          u.document_name?.includes(doc.name.split(' ')[0])
        );
        
        return {
          ...doc,
          uploaded: !!uploaded,
          uploaded_id: uploaded?.id,
          status: uploaded?.status || 'pending',
          uploaded_at: uploaded?.uploaded_at,
          notes: uploaded?.notes || doc.note || ''
        };
      });
      
      return {
        visaType,
        checklist,
        stats: {
          total: checklist.length,
          required: checklist.filter(d => d.required).length,
          uploaded: checklist.filter(d => d.uploaded).length,
          approved: checklist.filter(d => d.status === 'approved').length
        }
      };
      
    } catch (error) {
      console.error('Error loading document checklist:', error);
      return null;
    }
  }

  function renderDocumentChecklist(checklistData) {
    const documentsScreen = document.getElementById('documentsScreen');
    if (!documentsScreen || !checklistData) return;
    
    const { visaType, checklist, stats } = checklistData;
    
    // Update the documents section title
    const header = documentsScreen.querySelector('.screen-header h2');
    if (header) {
      header.innerHTML = `Documents for ${visaType} <small class="muted">(${stats.uploaded}/${stats.total} uploaded)</small>`;
    }
    
    // Clear existing tab content
    const tabsContainer = documentsScreen.querySelector('.tabs');
    const tabContents = documentsScreen.querySelectorAll('.tab-content');
    
    if (tabsContainer && tabContents.length > 0) {
      // Update tabs with real counts
      const requiredCount = checklist.filter(d => d.required && !d.uploaded).length;
      const underReviewCount = checklist.filter(d => d.status === 'under_review').length;
      const approvedCount = checklist.filter(d => d.status === 'approved').length;
      
      // Update tab buttons
      const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
      if (tabButtons[0]) tabButtons[0].textContent = `To Upload (${requiredCount})`;
      if (tabButtons[1]) tabButtons[1].textContent = `Under Review (${underReviewCount})`;
      if (tabButtons[2]) tabButtons[2].textContent = `Approved (${approvedCount})`;
      
      // Render documents in appropriate tabs
      renderTabContent('toUpload', checklist.filter(d => d.required && !d.uploaded));
      renderTabContent('underReview', checklist.filter(d => d.status === 'under_review'));
      renderTabContent('approved', checklist.filter(d => d.status === 'approved'));
    }
  }

  function renderTabContent(tabId, documents) {
    const tab = document.getElementById(tabId);
    if (!tab) return;
    
    tab.innerHTML = '';
    
    if (documents.length === 0) {
      tab.innerHTML = `
        <div class="doc-card">
          <div class="doc-row">
            <div class="doc-ic green"><i class="fa-solid fa-check-circle"></i></div>
            <div class="doc-main">
              <div class="doc-title">All caught up!</div>
              <div class="doc-sub">No documents in this category</div>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    documents.forEach(doc => {
      const docCard = document.createElement('div');
      docCard.className = 'doc-card';
      
      const statusIcon = doc.status === 'approved' ? 'green' : 
                        doc.status === 'under_review' ? 'amber' : 'blue';
      
      const statusText = doc.status === 'approved' ? 'Approved' :
                        doc.status === 'under_review' ? 'Under Review' :
                        doc.uploaded ? 'Uploaded' : 'Required';
      
      docCard.innerHTML = `
        <div class="doc-row">
          <div class="doc-ic ${statusIcon}">
            <i class="fa-regular fa-file-lines"></i>
          </div>
          <div class="doc-main">
            <div class="doc-title">${doc.name}</div>
            <div class="doc-sub">
              ${doc.required ? '<span class="badge required">Required</span>' : '<span class="badge optional">Optional</span>'}
              ${doc.condition ? `<span class="meta"><i class="fa-solid fa-info-circle"></i> ${doc.condition}</span>` : ''}
            </div>
            ${doc.note ? `<div class="doc-sub"><i class="fa-solid fa-note"></i> ${doc.note}</div>` : ''}
          </div>
        </div>
        
        ${doc.uploaded ? `
          <div class="doc-status">
            <span class="badge ${doc.status === 'approved' ? 'approved' : doc.status === 'under_review' ? 'submitted' : 'pending'}">
              ${statusText}
            </span>
            ${doc.uploaded_at ? `<span class="meta"><i class="fa-regular fa-calendar"></i> ${formatDate(doc.uploaded_at)}</span>` : ''}
          </div>
          
          <button class="btn-secondary full" data-action="view-document" data-doc-id="${doc.uploaded_id}">
            <i class="fa-regular fa-eye"></i> View Details
          </button>
        ` : `
          <div class="doc-actions">
            <button class="btn-primary full" data-action="upload-specific" data-doc-name="${doc.name}">
              <i class="fa-solid fa-upload"></i> Upload ${doc.name}
            </button>
            ${doc.required ? '' : `
              <button class="btn-secondary full" data-action="skip-document" data-doc-name="${doc.name}">
                <i class="fa-solid fa-forward"></i> Skip for now
              </button>
            `}
          </div>
        `}
      `;
      
      tab.appendChild(docCard);
    });
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // ----------------------
  // Load Case Data (UPDATED)
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
        
        // Load document checklist based on visa type
        const checklistData = await loadDocumentChecklist(caseNumber, caseData.visa_type);
        if (checklistData) {
          renderDocumentChecklist(checklistData);
        }
        
        // Load other related data
        loadClientTasks(caseNumber);
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
    console.log("Setting up progress click handlers...");
    setTimeout(setupProgressStageClicks, 500);
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
    console.log("Setting up progress click handlers...");
    setTimeout(setupProgressStageClicks, 500);
  }

  // ----------------------
  // Progress Stage Click Handlers
  // ----------------------
  function setupProgressStageClicks() {
    console.log("Setting up progress stage clicks...");
    
    // Stage definitions with meanings
    const stageDefinitions = {
      'k': {
        short: 'K',
        full: 'Contract',
        meaning: 'Your Contract has been paid, signed and uploaded.'
      },
      'docs': {
        short: 'DOCS',
        full: 'Documentation',
        meaning: 'Collecting and organizing all required documents. This includes passports, IDs, Birth Certificates, etc.'
      },
      'ic': {
        short: 'IC',
        full: 'Introductory Call',
        meaning: 'First meeting with your case manager to discuss your case in detail and answer your questions.'
      },
      'aq': {
        short: 'AQ',
        full: 'Additional Questions',
        meaning: 'A brief questionnaire call to collect missing or required information for an immigration case already in progress, allowing Honest Immigration to complete the file and continue your process.'
      },
      'pd': {
        short: 'PD',
        full: 'Personal Declaration',
        meaning: 'Your scheduled testimony call in which you provide your personal history and experiences needed to prepare your personal declaration for your case.'
      },
      'pdr': {
        short: 'PDR',
        full: 'Personal Declaration Reading',
        meaning: 'A scheduled review to verify your personal declaration for accuracy, completeness, and consistency before submission.'
      },
      'app_review': {
        short: 'APP REVIEW',
        full: 'Application Review',
        meaning: 'A final validation by our assistants before submission to USCIS.'
      },
      'fr': {
        short: 'FR',
        full: 'Filing Ready',
        meaning: 'All documents are complete and ready for filing with immigration authorities.'
      },
      's': {
        short: 'S',
        full: 'Case Sent',
        meaning: 'Case has been submitted to USCIS. Now waiting for response or next steps.'
      }
    };

    // Make progress labels clickable
    const progressLabels = document.querySelector('.progress-labels');
    console.log("Progress labels element:", progressLabels);
    
    if (progressLabels) {
      // Add click event to each label span
      const labels = progressLabels.querySelectorAll('span');
      console.log("Found labels:", labels.length);
      
      labels.forEach((label, index) => {
        // Find which stage this label represents
        const labelText = label.textContent.trim().toLowerCase().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        console.log(`Label ${index}: "${labelText}"`);
        
        let stageKey = '';
        
        // Map label text to stage key
        if (labelText.includes('k')) stageKey = 'k';
        else if (labelText.includes('docs')) stageKey = 'docs';
        else if (labelText.includes('ic')) stageKey = 'ic';
        else if (labelText.includes('aq')) stageKey = 'aq';
        else if (labelText.includes('pd')) stageKey = 'pd';
        else if (labelText.includes('pdr')) stageKey = 'pdr';
        else if (labelText.includes('app') && labelText.includes('review')) stageKey = 'app_review';
        else if (labelText.includes('fr')) stageKey = 'fr';
        else if (labelText.includes('s')) stageKey = 's';
        
        if (stageKey && stageDefinitions[stageKey]) {
          console.log(`Label ${index} mapped to stage: ${stageKey}`);
          
          // Make label clickable
          label.style.cursor = 'pointer';
          label.style.textDecoration = 'underline';
          label.style.textDecorationStyle = 'dotted';
          label.title = `Click to learn about ${stageDefinitions[stageKey].full} stage`;
          
          // Remove any existing listeners and add new one
          label.removeEventListener('click', handleLabelClick);
          label.addEventListener('click', handleLabelClick);
          
          // Store stage info on the element
          label.dataset.stageKey = stageKey;
          label.dataset.stageIndex = index;
          
          // Add hover effect
          label.addEventListener('mouseenter', () => {
            label.style.color = '#3b82f6';
          });
          label.addEventListener('mouseleave', () => {
            label.style.color = '';
          });
        } else {
          console.log(`Label ${index} could not be mapped to a stage`);
        }
      });
    } else {
      console.error("Could not find .progress-labels element!");
    }

    // Also make progress dots clickable
    const progressDots = document.getElementById('progressDots');
    console.log("Progress dots element:", progressDots);
    
    if (progressDots) {
      const dots = progressDots.querySelectorAll('.dot-step');
      console.log("Found dots:", dots.length);
      
      dots.forEach((dot, index) => {
        // Find which stage this dot represents
        const stageKeys = Object.keys(stageDefinitions);
        const stageKey = index < stageKeys.length ? stageKeys[index] : null;
        
        if (stageKey && stageDefinitions[stageKey]) {
          console.log(`Dot ${index} mapped to stage: ${stageKey}`);
          
          // Make dot clickable
          dot.style.cursor = 'pointer';
          
          // Remove any existing listeners and add new one
          dot.removeEventListener('click', handleDotClick);
          dot.addEventListener('click', handleDotClick);
          
          // Store stage info on the element
          dot.dataset.stageKey = stageKey;
          dot.dataset.stageIndex = index;
          
          // Add hover effect
          dot.addEventListener('mouseenter', () => {
            dot.style.transform = 'scale(1.1)';
          });
          dot.addEventListener('mouseleave', () => {
            dot.style.transform = 'scale(1)';
          });
        }
      });
    } else {
      console.error("Could not find #progressDots element!");
    }
    
    // Click handler functions
    function handleLabelClick(e) {
      e.stopPropagation();
      const stageKey = this.dataset.stageKey;
      const stageIndex = parseInt(this.dataset.stageIndex);
      console.log(`Label clicked: ${stageKey} at index ${stageIndex}`);
      
      if (stageKey && stageDefinitions[stageKey]) {
        showStageInfo(stageKey, stageDefinitions[stageKey], stageIndex);
      }
    }
    
    function handleDotClick(e) {
      e.stopPropagation();
      const stageKey = this.dataset.stageKey;
      const stageIndex = parseInt(this.dataset.stageIndex);
      console.log(`
