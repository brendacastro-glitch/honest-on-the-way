document.addEventListener('DOMContentLoaded', () => {
  console.log("APP.JS LOADED ✅");

  // ======================
  // 1. SCREEN HELPERS
  // ======================
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');

  function showLoginScreen() {
    loginScreen.style.display = 'flex';
    appScreen.style.display = 'none';
    document.getElementById('caseNumber').value = '';
    document.getElementById('pin').value = '';
  }

  function showAppScreen() {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';

    const caseNumber = localStorage.getItem('honest_immigration_case') || '';
    const clientId = localStorage.getItem('honest_immigration_client_id');
    
    // Update header
    const caseDisplay = document.getElementById('caseDisplay');
    if (caseDisplay && caseNumber) {
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
    isLoggedIn ? showAppScreen() : showLoginScreen();
  }

  // ======================
  // 2. NAVIGATION
  // ======================
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

  // ======================
  // 3. SUPABASE CLIENT
  // ======================
  function getSupabaseClient() {
    if (!window.APP_CONFIG || !window.APP_CONFIG.supabase) {
      console.error("APP_CONFIG missing");
      throw new Error("APP_CONFIG missing");
    }
    if (!window._supabaseClient) {
      window._supabaseClient = window.supabase.createClient(
        window.APP_CONFIG.supabase.url,
        window.APP_CONFIG.supabase.anonKey
      );
    }
    return window._supabaseClient;
  }

  // ======================
  // 4. LOGIN SYSTEM
  // ======================
  async function handleLogin() {
    const caseNumber = document.getElementById('caseNumber').value.trim();
    const pin = document.getElementById('pin').value.trim();

    if (!caseNumber || !pin) {
      alert('Please enter your case number and PIN');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      
      // DEMO MODE: Allow any HI- case
      if (caseNumber.startsWith('HI-')) {
        localStorage.setItem('honest_immigration_logged_in', 'true');
        localStorage.setItem('honest_immigration_case', caseNumber);
        localStorage.setItem('honest_immigration_client_id', 'demo_client_123');
        localStorage.setItem('honest_immigration_client_name', 'Demo Client');
        showAppScreen();
        return;
      }

      // REAL DATABASE LOGIN
      const { data, error } = await supabase
        .from(window.APP_CONFIG.supabase.tables.case_logins || 'case_logins')
        .select(`
          *,
          clients (
            id,
            full_name,
            email
          )
        `)
        .eq('case_ref', caseNumber)
        .eq('pin', pin)
        .maybeSingle();

      if (error || !data) {
        alert('Invalid case number or PIN. For demo, use case starting with HI-');
        return;
      }

      localStorage.setItem('honest_immigration_logged_in', 'true');
      localStorage.setItem('honest_immigration_case', caseNumber);
      localStorage.setItem('honest_immigration_client_id', data.client_id);
      
      if (data.clients) {
        localStorage.setItem('honest_immigration_client_name', data.clients.full_name || 'Client');
      }

      showAppScreen();
      
    } catch (error) {
      console.error("Login error:", error);
      alert("Login error. Check console.");
    }
  }

  function handleLogout() {
    localStorage.clear();
    showLoginScreen();
  }

  // ======================
  // 5. PROGRESS SYSTEM - CLICKABLE PROGRESS STAGES
  // ======================
  function renderProgress(visaType = 'T Visa Principal') {
    const progressDots = document.getElementById('progressDots');
    if (!progressDots) return;
    
    // Define all stages with descriptions
    const stages = [
      { 
        key: 'K', 
        label: 'K', 
        name: 'Kick-off', 
        description: 'Initial case setup and intake',
        done: true 
      },
      { 
        key: 'DOCS', 
        label: 'DOCS', 
        name: 'Document Collection', 
        description: 'Gathering all required documents',
        done: true,
        current: true 
      },
      { 
        key: 'IC', 
        label: 'IC', 
        name: 'Introductory Call', 
        description: 'First meeting with case manager',
        done: false 
      },
      { 
        key: 'AQ', 
        label: 'AQ', 
        name: 'Additional Questions', 
        description: 'Clarifying case details',
        done: false 
      },
      { 
        key: 'PD', 
        label: 'PD', 
        name: 'Petition Draft', 
        description: 'Preparing your immigration petition',
        done: false 
      },
      { 
        key: 'PDR', 
        label: 'PDR', 
        name: 'Petition Draft Review', 
        description: 'You review the draft petition',
        done: false 
      },
      { 
        key: 'APPREVIEW', 
        label: 'APP<br>REVIEW', 
        name: 'Application Review', 
        description: 'Final review before submission',
        done: false 
      },
      { 
        key: 'FR', 
        label: 'FR', 
        name: 'Final Review', 
        description: 'Attorney final review',
        done: false 
      },
      { 
        key: 'S', 
        label: 'S', 
        name: 'Submission', 
        description: 'Application filed with USCIS',
        done: false 
      }
    ];
    
    // Clear and render progress dots
    progressDots.innerHTML = '';
    
    stages.forEach((stage, index) => {
      const dot = document.createElement('div');
      dot.className = `dot-step ${stage.done ? 'done' : ''} ${stage.current ? 'current' : ''}`;
      dot.dataset.stageKey = stage.key;
      dot.dataset.stageName = stage.name;
      dot.dataset.stageDesc = stage.description;
      dot.dataset.stageIndex = index;
      
      if (stage.done) {
        dot.innerHTML = '<i class="fa-solid fa-check"></i>';
      } else {
        dot.innerHTML = `<div class="mini">${stage.label}</div>`;
      }
      
      // Make it clickable
      dot.style.cursor = 'pointer';
      dot.title = `Click for details: ${stage.name}`;
      
      dot.addEventListener('click', () => {
        showStageDetails(stage);
      });
      
      progressDots.appendChild(dot);
    });
    
    // Add clickable labels
    const progressLabels = document.querySelector('.progress-labels');
    if (progressLabels) {
      progressLabels.innerHTML = '';
      stages.forEach(stage => {
        const label = document.createElement('span');
        label.innerHTML = stage.label;
        label.style.cursor = 'pointer';
        label.title = stage.name;
        label.addEventListener('click', () => {
          showStageDetails(stage);
        });
        progressLabels.appendChild(label);
      });
    }
  }

  function showStageDetails(stage) {
    // Create modal for stage details
    const modal = document.createElement('div');
    modal.className = 'stage-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #1E3A8A;">${stage.name}</h3>
          <button class="close-modal" style="
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #64748b;
          ">×</button>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="
              display: inline-block;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${stage.done ? '#10b981' : stage.current ? '#f59e0b' : '#e5e7eb'};
              border: 2px solid ${stage.done ? '#10b981' : stage.current ? '#f59e0b' : '#d1d5db'};
            "></span>
            <strong>Status:</strong> ${stage.done ? 'Completed' : stage.current ? 'Current Stage' : 'Upcoming'}
          </div>
          
          <p style="color: #64748b; line-height: 1.6;">${stage.description}</p>
          
          ${stage.current ? `
            <div style="
              background: #fff3cf;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin-top: 16px;
              border-radius: 4px;
            ">
              <strong><i class="fa-solid fa-lightbulb"></i> What you need to do:</strong>
              <p style="margin: 8px 0 0 0; color: #92400e;">
                Complete your document uploads to move to the next stage.
              </p>
            </div>
          ` : ''}
        </div>
        
        <button class="btn-primary" style="width: 100%;" onclick="this.parentElement.parentElement.remove()">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when X is clicked
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // ======================
  // 6. DOCUMENT SYSTEM - FULL CHECKLIST BY CASE TYPE
  // ======================
  const DOCUMENT_TEMPLATES = {
    'T Visa Principal': [
      { id: 't1', name: '2 Passport Pictures', required: true, category: 'required', notes: 'Recent color photos, 2x2 inches' },
      { id: 't2', name: 'G-28', required: true, category: 'required', notes: 'Notice of Entry of Appearance as Attorney' },
      { id: 't3', name: 'I-914', required: true, category: 'required', notes: 'Application for T Nonimmigrant Status' },
      { id: 't4', name: 'PD', required: true, category: 'required', notes: 'Personal Declaration statement' },
      { id: 't5', name: 'Birth Certificate', required: true, category: 'required', notes: 'Original or certified copy' },
      { id: 't6', name: 'Birth Certificate Translation', required: true, category: 'required', notes: 'Certified translation if not in English' },
      { id: 't7', name: 'Copy of Passport', required: true, category: 'required', notes: 'All pages, including blank ones' },
      { id: 't8', name: 'Trafficking Report Agreement', required: true, category: 'required', notes: 'Authorization to report trafficking' },
      { id: 't9', name: 'I-914 Supplement B', required: true, category: 'required', notes: 'Declaration of Law Enforcement Officer' },
      { id: 't10', name: 'I-192', required: false, category: 'conditional', notes: 'Only if client entered without inspection' },
      { id: 't11', name: 'I-765 (C) (40)', required: true, category: 'required', notes: 'Application for Employment Authorization' },
      { id: 't12', name: 'FBI Criminal Record', required: true, category: 'required', notes: 'Fingerprint-based background check' },
      { id: 't13', name: 'USC Kids Birth Certificates', required: false, category: 'conditional', notes: 'If applicable for derivative benefits' },
      { id: 't14', name: 'Divorce Decree', required: false, category: 'conditional', notes: 'If previously married and divorced' },
      { id: 't15', name: 'OPT (Previous Immigration)', required: false, category: 'conditional', notes: 'Any previous immigration filings' }
    ],
    
    'VAWA Spouse': [
      { id: 'v1', name: '2 Passport Pictures', required: true, category: 'required' },
      { id: 'v2', name: 'G-28', required: true, category: 'required' },
      { id: 'v3', name: 'I-360', required: true, category: 'required', notes: 'Petition for Amerasian, Widow(er), or Special Immigrant' },
      { id: 'v4', name: 'PD', required: true, category: 'required' },
      { id: 'v5', name: 'Birth Certificate', required: true, category: 'required' },
      { id: 'v6', name: 'Birth Certificate Translation', required: true, category: 'required' },
      { id: 'v7', name: 'Copy of Passport', required: true, category: 'required' },
      { id: 'v8', name: 'Spouse\'s Legal Status Proof', required: true, category: 'required', notes: 'USC or LPR proof of status' },
      { id: 'v9', name: 'Marriage Certificate', required: true, category: 'required' },
      { id: 'v10', name: 'OPT (Previous Immigration)', required: false, category: 'conditional' },
      { id: 'v11', name: 'USC Kids Birth Certificates', required: false, category: 'conditional' },
      { id: 'v12', name: 'Divorce Decree (ALL ex-spouses)', required: false, category: 'conditional' },
      { id: 'v13', name: 'Joint Residence Evidence (3 docs)', required: true, category: 'required', notes: 'Lease, utility bills, bank statements' },
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
      { id: 'vp8', name: 'Abuser-Child\'s Birth Certificate', required: true, category: 'required', notes: 'Proof of relationship to abusive US citizen child' },
      { id: 'vp9', name: 'Previous Immigration Petition (OPT)', required: false, category: 'conditional' },
      { id: 'vp10', name: 'Joint Residency Evidence (3 docs)', required: true, category: 'required' },
      { id: 'vp11', name: 'Joint Pictures (2-10)', required: true, category: 'required' },
      { id: 'vp12', name: 'USC Kids Birth Certificates', required: false, category: 'conditional' },
      { id: 'vp13', name: 'FBI Criminal Record', required: true, category: 'required' }
    ]
  };

  function renderDocumentChecklist(visaType = 'T Visa Principal') {
    const documentsScreen = document.getElementById('documentsScreen');
    if (!documentsScreen) return;
    
    const template = DOCUMENT_TEMPLATES[visaType] || DOCUMENT_TEMPLATES['T Visa Principal'];
    const caseNumber = localStorage.getItem('honest_immigration_case') || 'HI-2026-00123';
    
    // Calculate stats
    const total = template.length;
    const required = template.filter(d => d.required).length;
    const uploaded = Math.floor(total * 0.3); // Demo: 30% uploaded
    const approved = Math.floor(uploaded * 0.5); // Demo: 50% of uploaded approved
    
    // Update tab counts
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const tab = btn.dataset.tab;
      if (tab === 'toUpload') {
        btn.textContent = `To Upload (${total - uploaded})`;
      } else if (tab === 'underReview') {
        btn.textContent = `Under Review (${uploaded - approved})`;
      } else if (tab === 'approved') {
        btn.textContent = `Approved (${approved})`;
      }
    });
    
    // Render checklist in appropriate tabs
    const toUploadContent = document.getElementById('toUpload');
    const underReviewContent = document.getElementById('underReview');
    const approvedContent = document.getElementById('approved');
    
    if (toUploadContent) {
      // Show documents that need to be uploaded
      const toUploadDocs = template.filter((doc, index) => index >= uploaded);
      toUploadContent.innerHTML = toUploadDocs.map(doc => `
        <div class="doc-card">
          <div class="doc-row">
            <div class="doc-ic blue"><i class="fa-regular fa-image"></i></div>
            <div class="doc-main">
              <div class="doc-title">${doc.name}</div>
              <span class="badge ${doc.required ? 'required' : 'optional'}">
                ${doc.required ? 'Required' : 'Optional'}
              </span>
              ${doc.notes ? `<p class="doc-notes">${doc.notes}</p>` : ''}
            </div>
          </div>
          
          <button class="btn-primary full upload-specific-btn" data-doc-name="${doc.name}">
            <i class="fa-solid fa-upload"></i> Upload ${doc.name.split(' ')[0]}
          </button>
          
          <button class="btn-secondary full view-details-btn" data-doc-name="${doc.name}">
            <i class="fa-solid fa-circle-info"></i> View Details
          </button>
        </div>
      `).join('');
    }
    
    if (underReviewContent) {
      // Show documents under review
      const underReviewDocs = template.slice(approved, uploaded);
      underReviewContent.innerHTML = underReviewDocs.map(doc => `
        <div class="doc-card">
          <div class="doc-row">
            <div class="doc-ic amber"><i class="fa-regular fa-file-lines"></i></div>
            <div class="doc-main">
              <div class="doc-title">${doc.name}</div>
              <div class="doc-sub">
                <i class="fa-regular fa-clock"></i> Under review by Sarah Chen
              </div>
            </div>
          </div>
          <button class="btn-secondary full view-journey-btn" data-doc-name="${doc.name}">
            <i class="fa-regular fa-eye"></i> View Journey
          </button>
        </div>
      `).join('');
    }
    
    if (approvedContent) {
      // Show approved documents
      const approvedDocs = template.slice(0, approved);
      approvedContent.innerHTML = approvedDocs.map((doc, index) => `
        <div class="doc-card">
          <div class="doc-row">
            <div class="doc-ic green"><i class="fa-regular fa-file-lines"></i></div>
            <div class="doc-main">
              <div class="doc-title">${doc.name}</div>
              <div class="doc-sub">
                <i class="fa-regular fa-circle-check"></i> Approved on Jan ${4 + index}, 2026
              </div>
            </div>
          </div>
          <button class="btn-secondary full view-journey-btn" data-doc-name="${doc.name}">
            <i class="fa-regular fa-eye"></i> View Journey
          </button>
        </div>
      `).join('');
    }
    
    // Add event listeners for the new buttons
    setTimeout(() => {
      // Upload buttons
      document.querySelectorAll('.upload-specific-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const docName = e.target.dataset.docName || e.currentTarget.dataset.docName;
          alert(`Uploading: ${docName}\n\nPlease select your file.`);
          // In real app: open file picker
        });
      });
      
      // View details buttons
      document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const docName = e.target.dataset.docName || e.currentTarget.dataset.docName;
          const doc = template.find(d => d.name === docName);
          if (doc) {
            showDocumentDetails(doc);
          }
        });
      });
      
      // View journey buttons
      document.querySelectorAll('.view-journey-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const docName = e.target.dataset.docName || e.currentTarget.dataset.docName;
          alert(`Showing journey for: ${docName}\n\nThis shows the history of this document from upload to approval.`);
        });
      });
    }, 100);
  }

  function showDocumentDetails(doc) {
    const modal = document.createElement('div');
    modal.className = 'document-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #1E3A8A;">
            <i class="fa-solid fa-file-lines"></i> ${doc.name}
          </h3>
          <button class="close-modal" style="
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #64748b;
          ">×</button>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 20px;
            background: ${doc.required ? '#fee2e2' : '#e0e7ff'};
            color: ${doc.required ? '#991b1b' : '#4338ca'};
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 16px;
          ">
            ${doc.required ? 'Required Document' : 'Optional Document'}
          </div>
          
          <div style="margin-bottom: 16px;">
            <strong>Category:</strong> ${doc.category}
          </div>
          
          ${doc.notes ? `
            <div style="
              background: #f8fafc;
              border-left: 4px solid #3b82f6;
              padding: 12px;
              margin-bottom: 16px;
              border-radius: 4px;
            ">
              <strong><i class="fa-solid fa-circle-info"></i> Notes:</strong>
              <p style="margin: 8px 0 0 0; color: #475569;">${doc.notes}</p>
            </div>
          ` : ''}
          
          <div style="
            background: ${doc.required ? '#fef3c7' : '#ecfdf5'};
            padding: 12px;
            border-radius: 8px;
            margin-top: 16px;
          ">
            <strong><i class="fa-solid fa-lightbulb"></i> Tips:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #475569;">
              <li>Make sure the document is clear and readable</li>
              <li>Upload in PDF format if possible</li>
              <li>File size should be under 10MB</li>
              ${doc.required ? '<li><strong>This document is required to proceed</strong></li>' : ''}
            </ul>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button class="btn-primary" style="flex: 1;" onclick="alert('Upload feature coming soon')">
            <i class="fa-solid fa-upload"></i> Upload Now
          </button>
          <button class="btn-secondary" style="flex: 1;" onclick="this.parentElement.parentElement.parentElement.remove()">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // ======================
  // 7. BUTTON BINDING
  // ======================
  function bindAppButtonsOnce() {
    console.log("Binding all buttons");
    
    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const screenKey = e.currentTarget.dataset.screen;
        const sectionId = `${screenKey}Screen`;
        showSection(sectionId);
        setBottomNavActive(screenKey);
      });
    });

    // Login button
    document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
    
    // Magic link button
    document.getElementById('magicLinkBtn')?.addEventListener('click', () => {
      alert('Magic link feature coming soon. For now, use case number and PIN.');
    });
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    
    // Education back button
    document.getElementById('eduBackBtn')?.addEventListener('click', () => {
      showSection('homeScreen');
      setBottomNavActive('home');
    });
    
    // Education button in top bar
    document.getElementById('educationBtn')?.addEventListener('click', () => {
      showSection('educationScreen');
      setBottomNavActive('education');
    });
    
    // Notifications button
    document.getElementById('notificationsBtn')?.addEventListener('click', () => {
      showSection('updatesScreen');
      setBottomNavActive('updates');
      document.getElementById('notifDot').style.display = 'none';
    });
    
    // Upload passport button
    document.getElementById('uploadPassportBtn')?.addEventListener('click', () => {
      showSection('documentsScreen');
      setBottomNavActive('documents');
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
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.getElementById(tabId)?.classList.add('active');
      });
    });
    
    // Action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        switch(action) {
          case 'upload-passport':
          case 'upload-document':
            showSection('documentsScreen');
            setBottomNavActive('documents');
            break;
          case 'watch-video':
            alert('Playing education video...');
            break;
          case 'view-faq':
            alert('Opening FAQ...');
            break;
          case 'contact-manager':
            alert('Your case manager will contact you within 24 hours.');
            break;
          default:
            console.log('Action:', action);
        }
      });
    });
    
    // Press Enter to login
    document.getElementById('pin')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  // ======================
  // 8. DEMO DATA SETUP
  // ======================
  function setupDemoData() {
    console.log("Setting up demo data");
    
    // Set user info
    document.getElementById('userName').textContent = 'Maria Rodriguez';
    document.getElementById('userInitials').textContent = 'MR';
    document.getElementById('caseDisplay').textContent = 'Case: HI-2026-00123';
    
    // Render progress (clickable)
    renderProgress('T Visa Principal');
    
    // Render document checklist
    renderDocumentChecklist('T Visa Principal');
    
    // Show notification dot
    document.getElementById('notifDot').style.display = 'block';
  }

  // ======================
  // 9. LOAD CASE DATA FROM SUPABASE
  // ======================
  async function loadCaseData(clientId, caseNumber) {
    try {
      if (clientId === 'demo_client_123') {
        setupDemoData();
        return;
      }
      
      const supabase = getSupabaseClient();
      
      // Load case from database
      const { data: caseData, error } = await supabase
        .from('cases')
        .select('*')
        .eq('case_ref', caseNumber)
        .single();
      
      if (caseData && !error) {
        console.log("Loaded case:", caseData);
        
        // Update UI with real case data
        document.getElementById('userName').textContent = caseData.client_name || 'Client';
        document.getElementById('caseDisplay').textContent = `Case: ${caseData.case_ref}`;
        
        // Render progress based on real stage
        renderProgress(caseData.visa_type);
        
        // Render documents based on visa type
        renderDocumentChecklist(caseData.visa_type);
        
      } else {
        setupDemoData(); // Fallback to demo
      }
    } catch (error) {
      console.error("Error loading case:", error);
      setupDemoData();
    }
  }

  // ======================
  // 10. INITIALIZE APP
  // ======================
  function initializeApp() {
    console.log("Initializing Honest Immigration Portal");
    
    // Check login status
    checkLoginStatus();
    
    // Initial button binding
    bindAppButtonsOnce();
    
    // Add CSS for modals
    const style = document.createElement('style');
    style.textContent = `
      .stage-modal, .document-modal {
        animation: fadeIn 0.3s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .dot-step:hover {
        transform: scale(1.1);
        transition: transform 0.2s;
      }
      .progress-labels span:hover {
        color: #1E3A8A;
        text-decoration: underline;
        cursor: pointer;
      }
      .accordion-panel.open {
        display: block !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log("App ready!");
  }

  // ======================
  // START THE APP
  // ======================
  initializeApp();

});
