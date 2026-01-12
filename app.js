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

    // Bind app interactions
    bindAppButtonsOnce();
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
    console.log("Login status:", isLoggedIn);
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
  // Login (Supabase) - FIXED VERSION
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

      // Get the table name from config or use default
      const tableName = window.APP_CONFIG.supabase.tables.case_logins || 'case_logins';
      console.log("Using table:", tableName);

      // Query case_logins table with JOIN to clients
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
    localStorage.removeItem('honest_immigration_logged_in');
    localStorage.removeItem('honest_immigration_case');
    localStorage.removeItem('honest_immigration_client_id');
    localStorage.removeItem('honest_immigration_client_name');
    localStorage.removeItem('honest_immigration_client_email');
    showLoginScreen();
  }

  // ----------------------
  // Button Binding
  // ----------------------
  function bindAppButtonsOnce() {
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

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // Upload buttons in documents section
    document.querySelectorAll('[data-action="upload-specific"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const docName = e.currentTarget.dataset.docName;
        alert(`Would upload: ${docName}`);
        // Implement actual upload logic here
      });
    });

    // Skip buttons in documents section
    document.querySelectorAll('[data-action="skip-document"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const docName = e.currentTarget.dataset.docName;
        console.log(`Skipping document: ${docName}`);
        // Implement skip logic here
      });
    });

    // Login button - ADDED THIS
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      console.log("Found login button, adding event listener");
      loginBtn.removeEventListener('click', handleLogin); // Remove old if exists
      loginBtn.addEventListener('click', handleLogin);
    } else {
      console.error("Login button not found! Check HTML ID");
    }

    // Magic link button
    const magicBtn = document.getElementById('magicLinkBtn');
    if (magicBtn) {
      magicBtn.addEventListener('click', handleMagicLink);
    }
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

  // =============================================
  // DOCUMENT CHECKLIST SYSTEM
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
      
      console.log("Loading document checklist for case:", caseRef, "visa type:", visaType);
      
      // If visaType not provided, get it from cases table
      if (!visaType) {
        const { data: caseData, error: caseError } = await supabase
          .from('cases')
          .select('visa_type')
          .eq('case_ref', caseRef)
          .single();
        
        if (caseData && !caseError) {
          visaType = caseData.visa_type;
          console.log("Found visa type in database:", visaType);
        } else {
          console.log("Could not find visa type, error:", caseError);
        }
      }
      
      // Default to T Visa if no type found
      if (!visaType || !DOCUMENT_TEMPLATES[visaType]) {
        console.log("Using default T Visa Principal template");
        visaType = 'T Visa Principal';
      }
      
      // Get template for this visa type
      const template = DOCUMENT_TEMPLATES[visaType];
      console.log("Using template for:", visaType, "with", template.length, "documents");
      
      // Get uploaded documents for this case
      const { data: uploadedDocs, error: docsError } = await supabase
        .from('client_documents')
        .select('*')
        .eq('case_ref', caseRef);
      
      if (docsError) {
        console.error("Error loading uploaded docs:", docsError);
      } else {
        console.log("Found", uploadedDocs?.length || 0, "uploaded documents");
      }
      
      // Create checklist with status
      const checklist = template.map(doc => {
        const uploaded = uploadedDocs?.find(u => 
          u.document_name === doc.name || 
          u.document_name?.includes(doc.name.split(' ')[0]) ||
          u.document_type === doc.name
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
      
      const stats = {
        total: checklist.length,
        required: checklist.filter(d => d.required).length,
        uploaded: checklist.filter(d => d.uploaded).length,
        approved: checklist.filter(d => d.status === 'approved').length
      };
      
      console.log("Checklist stats:", stats);
      
      return {
        visaType,
        checklist,
        stats
      };
      
    } catch (error) {
      console.error('Error loading document checklist:', error);
      return null;
    }
  }

  function renderDocumentChecklist(checklistData) {
    console.log("Rendering document checklist:", checklistData);
    
    const documentsScreen = document.getElementById('documentsScreen');
    if (!documentsScreen) {
      console.error("documentsScreen element not found!");
      return;
    }
    
    if (!checklistData) {
      documentsScreen.innerHTML = '<p>Error loading document checklist</p>';
      return;
    }
    
    const { visaType, checklist, stats } = checklistData;
    
    // Update the documents section title
    const header = documentsScreen.querySelector('.screen-header h2');
    if (header) {
      header.innerHTML = `Documents for ${visaType} <small class="muted">(${stats.uploaded}/${stats.total} uploaded)</small>`;
    }
    
    // Render the checklist UI
    documentsScreen.innerHTML = `
      <div class="screen-header">
        <h2>Documents for ${visaType} <small class="muted">(${stats.uploaded}/${stats.total} uploaded)</small></h2>
      </div>
      
      <div class="stats-bar">
        <div class="stat">
          <div class="stat-value">${stats.uploaded}/${stats.total}</div>
          <div class="stat-label">Uploaded</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.approved}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.required}</div>
          <div class="stat-label">Required</div>
        </div>
      </div>
      
      <div class="documents-list">
        ${checklist.map(doc => renderDocumentCard(doc)).join('')}
      </div>
      
      <div class="upload-section">
        <h4>Upload New Document</h4>
        <input type="file" id="documentUpload" multiple>
        <button onclick="handleDocumentUpload()" class="btn-primary full">
          <i class="fa-solid fa-upload"></i> Upload Selected Files
        </button>
      </div>
    `;
    
    // Re-bind document action buttons
    setTimeout(() => {
      document.querySelectorAll('[data-action="view-document"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const docId = e.currentTarget.dataset.docId;
          alert(`Viewing document ${docId}`);
        });
      });
      
      document.querySelectorAll('[data-action="upload-specific"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const docName = e.currentTarget.dataset.docName;
          document.getElementById('documentUpload').click();
        });
      });
    }, 100);
  }

  function renderDocumentCard(doc) {
    const statusIcon = doc.status === 'approved' ? 'green' : 
                      doc.status === 'under_review' ? 'amber' : 'blue';
    
    const statusText = doc.status === 'approved' ? 'Approved' :
                      doc.status === 'under_review' ? 'Under Review' :
                      doc.uploaded ? 'Uploaded' : 'Required';
    
    const statusClass = doc.status === 'approved' ? 'approved' : 
                       doc.status === 'under_review' ? 'submitted' : 'pending';
    
    return `
      <div class="doc-card ${doc.uploaded ? 'uploaded' : 'pending'}">
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
          <div class="doc-status">
            <span class="badge ${statusClass}">
              ${statusText}
            </span>
            ${doc.uploaded_at ? `<span class="meta"><i class="fa-regular fa-calendar"></i> ${formatDate(doc.uploaded_at)}</span>` : ''}
          </div>
        </div>
        
        ${doc.uploaded ? `
          <div class="doc-actions">
            <button class="btn-secondary" data-action="view-document" data-doc-id="${doc.uploaded_id}">
              <i class="fa-regular fa-eye"></i> View Details
            </button>
            <button class="btn-secondary" onclick="reuploadDocument('${doc.name}')">
              <i class="fa-solid fa-rotate"></i> Re-upload
            </button>
          </div>
        ` : `
          <div class="doc-actions">
            <button class="btn-primary" data-action="upload-specific" data-doc-name="${doc.name}">
              <i class="fa-solid fa-upload"></i> Upload ${doc.name.split(' ')[0]}
            </button>
            ${doc.required ? '' : `
              <button class="btn-secondary" onclick="skipDocument('${doc.name}')">
                <i class="fa-solid fa-forward"></i> Skip
              </button>
            `}
          </div>
        `}
      </div>
    `;
  }

  function renderDemoDocumentChecklist() {
    console.log("Rendering demo document checklist");
    const demoData = {
      visaType: 'T Visa Principal',
      checklist: DOCUMENT_TEMPLATES['T Visa Principal'].slice(0, 5).map((doc, i) => ({
        ...doc,
        uploaded: i < 2, // First 2 uploaded for demo
        status: i < 1 ? 'approved' : (i < 2 ? 'under_review' : 'pending'),
        uploaded_at: i < 2 ? new Date().toISOString() : null
      })),
      stats: {
        total: 5,
        required: 5,
        uploaded: 2,
        approved: 1
      }
    };
    
    renderDocumentChecklist(demoData);
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  // ----------------------
  // Document Upload Functions
  // ----------------------
  async function handleDocumentUpload() {
    const fileInput = document.getElementById('documentUpload');
    const files = fileInput.files;
    const caseRef = localStorage.getItem('honest_immigration_case');
    
    if (!files.length) {
      alert('Please select files to upload');
      return;
    }
    
    if (!caseRef) {
      alert('No case selected. Please login again.');
      return;
    }
    
    console.log("Uploading", files.length, "files for case:", caseRef);
    
    for (const file of files) {
      await uploadSingleDocument(file, caseRef);
    }
    
    // Refresh the document list
    const clientId = localStorage.getItem('honest_immigration_client_id');
    loadCaseData(clientId, caseRef);
    
    // Clear file input
    fileInput.value = '';
  }

  async function uploadSingleDocument(file, caseRef) {
    try {
      const supabase = getSupabaseClient();
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const random = Math.random().toString(36).substring(7);
      const fileName = `${caseRef}_${timestamp}_${random}.${fileExt}`;
      const filePath = `documents/${caseRef}/${fileName}`;
      
      console.log("Uploading file:", file.name, "as", fileName);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        alert(`Error uploading ${file.name}: ${uploadError.message}`);
        return;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Insert record into client_documents table
      const { error: dbError } = await supabase
        .from('client_documents')
        .insert({
          case_ref: caseRef,
          document_name: file.name,
          file_name: fileName,
          file_path: filePath,
          url: publicUrl,
          uploaded_at: new Date().toISOString(),
          status: 'pending',
          file_type: file.type,
          file_size: file.size
        });
      
      if (dbError) {
        console.error('Database insert error:', dbError);
        alert(`Error saving ${file.name} to database: ${dbError.message}`);
        return;
      }
      
      console.log("Successfully uploaded:", file.name);
      // alert(`Successfully uploaded: ${file.name}`);
      
    } catch (error) {
      console.error('Error in uploadSingleDocument:', error);
      alert(`Error uploading ${file.name}: ${error.message}`);
    }
  }

  // ----------------------
  // Load Case Data (UPDATED)
  // ----------------------
  async function loadCaseData(clientId, caseNumber) {
    try {
      console.log("Loading case data for:", clientId, caseNumber);
      const supabase = getSupabaseClient();
      
      // Load case information
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('case_ref', caseNumber)
        .single();
      
      console.log("Case data:", caseData, "Error:", caseError);
      
      if (caseData && !caseError) {
        // Update progress based on real case stage
        updateRealProgress(caseData.current_stage);
        
        // Load document checklist based on visa type
        const checklistData = await loadDocumentChecklist(caseNumber, caseData.visa_type);
        if (checklistData) {
          renderDocumentChecklist(checklistData);
        } else {
          console.log("No checklist data, rendering demo");
          renderDemoDocumentChecklist();
        }
        
        // Load other related data
        loadClientTasks(caseNumber);
        loadCaseUpdates(caseNumber);
      } else {
        console.log("No real case data found, using demo");
        // Fallback to demo data
        renderProgress();
        renderDemoDocumentChecklist();
      }
    } catch (error) {
      console.error('Error loading case data:', error);
      renderProgress();
      renderDemoDocumentChecklist();
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
        console.log("Loaded tasks:", data.length);
        updateTasksUI(data);
      } else {
        console.log('No tasks found for case:', caseRef);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  function updateTasksUI(tasks) {
    const tasksScreen = document.getElementById('tasksScreen');
    if (!tasksScreen) return;
    
    tasksScreen.innerHTML = `
      <div class="screen-header">
        <h2>Your Tasks (${tasks.length})</h2>
      </div>
      <div class="tasks-list">
        ${tasks.map(task => `
          <div class="task-card ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox">
              <input type="checkbox" ${task.completed ? 'checked' : ''}>
            </div>
            <div class="task-details">
              <div class="task-title">${task.title}</div>
              <div class="task-description">${task.description || ''}</div>
              ${task.due_date ? `<div class="task-due">Due: ${formatDate(task.due_date)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
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
        console.log("Loaded updates:", data.length);
        updateUpdatesUI(data);
        
        // Show notification dot if there are unread updates
        const dot = document.getElementById('notifDot');
        if (dot && data.length > 0) {
          dot.style.display = 'block';
        }
      } else {
        console.log('No updates found for case:', caseRef);
      }
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  }

  function updateUpdatesUI(updates) {
    const updatesScreen = document.getElementById('updatesScreen');
    if (!updatesScreen) return;
    
    updatesScreen.innerHTML = `
      <div class="screen-header">
       
