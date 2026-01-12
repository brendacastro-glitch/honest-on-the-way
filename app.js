  function updateUpdatesUI(updates) {
    const updatesScreen = document.getElementById('updatesScreen');
    if (!updatesScreen) return;
    
    updatesScreen.innerHTML = `
      <div class="screen-header">
        <h2>Case Updates (${updates.length})</h2>
      </div>
      <div class="updates-list">
        ${updates.map(update => `
          <div class="update-card ${update.is_new ? 'new' : ''}">
            <div class="update-icon">
              <i class="fa-solid fa-bullhorn"></i>
            </div>
            <div class="update-content">
              <div class="update-title">${update.title}</div>
              <div class="update-message">${update.message}</div>
              <div class="update-meta">
                <span class="update-date">${formatDate(update.created_at)}</span>
                ${update.is_new ? '<span class="update-new">NEW</span>' : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
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
    
    // Update the "CURRENT STAGE" text
    const currentStageElement = document.querySelector('.current-stage');
    if (currentStageElement) {
      const stageNames = {
        'k': 'Know',
        'docs': 'Documentation',
        'ic': 'Introductory Call',
        'aq': 'Assessment & Qualification',
        'pd': 'Petition Drafting',
        'pdr': 'Petition Draft Review',
        'app_review': 'Application Review',
        'fr': 'Filing Ready',
        's': 'Submitted'
      };
      
      const stageName = stageNames[stageKey] || 'Documentation';
      currentStageElement.textContent = stageName;
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
      console.log(`Dot clicked: ${stageKey} at index ${stageIndex}`);
      
      if (stageKey && stageDefinitions[stageKey]) {
        showStageInfo(stageKey, stageDefinitions[stageKey], stageIndex);
      }
    }
  }

  function showStageInfo(stageKey, stageInfo, index) {
    console.log(`Showing stage info for ${stageKey} at index ${index}`);
    
    // Create or show stage info modal
    let modal = document.getElementById('stageInfoModal');
    
    if (!modal) {
      console.log("Creating stage info modal...");
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
    console.log("Modal should be visible now");
  }

  function getStageStatus(stageIndex, caseNumber) {
    // This function determines the status of a specific stage
    const clientId = localStorage.getItem('honest_immigration_client_id');
    
    if (clientId === 'demo_client_123') {
      // Demo logic
      if (stageIndex < 2) return '✅ Completed';
      if (stageIndex === 2) return '🟡 In Progress';
      return '⏳ Not Started';
    }
    
    // Real logic: check the current stage from cases table
    try {
      const supabase = getSupabaseClient();
      // We would query the database here
      // For now, return default status
      return '⏳ Check with your case manager';
    } catch (error) {
      return '⏳ Status unknown';
    }
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
      .progress-labels span {
        transition: color 0.2s;
      }
      
      .progress-labels span:hover {
        color: #3b82f6;
        text-decoration: underline !important;
      }
      
      .dot-step {
        transition: transform 0.2s;
      }
      
      .dot-step:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(styles);
    console.log("Stage modal styles added");
  }

  // ----------------------
  // Global Functions (for buttons in HTML)
  // ----------------------
  window.handleLogin = handleLogin;
  window.handleMagicLink = handleMagicLink;
  window.handleLogout = handleLogout;
  window.handleDocumentUpload = handleDocumentUpload;
  window.reuploadDocument = function(docName) {
    alert(`Would re-upload: ${docName}`);
    document.getElementById('documentUpload').click();
  };
  
  window.skipDocument = function(docName) {
    console.log(`Skipping document: ${docName}`);
    alert(`Document "${docName}" skipped. You can upload it later.`);
  };

  // ----------------------
  // Initialize App
  // ----------------------
  console.log("Initializing app...");
  
  // Check if Supabase is loaded
  if (typeof supabase === 'undefined') {
    console.error("Supabase not loaded! Make sure supabase.js is loaded before app.js");
  } else {
    console.log("Supabase loaded ✅");
  }
  
  // Check if config is loaded
  if (!window.APP_CONFIG) {
    console.error("APP_CONFIG not loaded! Make sure config.js is loaded before app.js");
  } else {
    console.log("APP_CONFIG loaded ✅");
  }
  
  // Initialize
  checkLoginStatus();
  
  console.log("App initialization complete");
});

// Add some global CSS if not already present
if (!document.getElementById('globalAppStyles')) {
  const styles = document.createElement('style');
  styles.id = 'globalAppStyles';
  styles.textContent = `
    .stats-bar {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
      padding: 15px;
      background: #f8fafc;
      border-radius: 10px;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
    }
    
    .stat-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .documents-list {
      margin-bottom: 30px;
    }
    
    .doc-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 10px;
    }
    
    .doc-card.uploaded {
      border-left: 4px solid #10b981;
    }
    
    .doc-card.pending {
      border-left: 4px solid #f59e0b;
    }
    
    .doc-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 15px;
    }
    
    .doc-ic {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    
    .doc-ic.green { background: #d1fae5; color: #047857; }
    .doc-ic.amber { background: #fef3c7; color: #d97706; }
    .doc-ic.blue { background: #dbeafe; color: #1d4ed8; }
    
    .doc-main {
      flex: 1;
    }
    
    .doc-title {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .doc-sub {
      font-size: 14px;
      color: #6b7280;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
    }
    
    .badge.required { background: #fee2e2; color: #dc2626; }
    .badge.optional { background: #e0e7ff; color: #3730a3; }
    .badge.approved { background: #d1fae5; color: #065f46; }
    .badge.submitted { background: #fef3c7; color: #92400e; }
    .badge.pending { background: #f3f4f6; color: #374151; }
    
    .doc-status {
      text-align: right;
    }
    
    .meta {
      font-size: 12px;
      color: #9ca3af;
    }
    
    .doc-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    
    .btn-primary, .btn-secondary {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    
    .btn-primary.full, .btn-secondary.full {
      width: 100%;
      justify-content: center;
    }
    
    .upload-section {
      padding: 20px;
      background: #f9fafb;
      border-radius: 10px;
      border: 2px dashed #d1d5db;
      text-align: center;
    }
    
    .upload-section input[type="file"] {
      margin: 15px 0;
      width: 100%;
    }
    
    .tasks-list, .updates-list {
      padding: 10px;
    }
    
    .task-card, .update-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 10px;
    }
    
    .task-card.completed {
      opacity: 0.7;
      background: #f9fafb;
    }
    
    .task-checkbox input {
      margin-right: 10px;
    }
    
    .task-details {
      margin-left: 30px;
    }
    
    .task-title {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .task-description {
      color: #6b7280;
      font-size: 14px;
    }
    
    .task-due {
      font-size: 12px;
      color: #ef4444;
      margin-top: 5px;
    }
    
    .update-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0369a1;
      display: flex;
      align-items: center;
      justify-content: center;
      float: left;
      margin-right: 15px;
    }
    
    .update-content {
      overflow: hidden;
    }
    
    .update-title {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .update-message {
      color: #6b7280;
      font-size: 14px;
    }
    
    .update-meta {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 5px;
    }
    
    .update-new {
      background: #ef4444;
      color: white;
      padding: 2px 6px;
      border-radius: 12px;
      margin-left: 10px;
    }
    
    .muted {
      color: #6b7280;
      font-weight: normal;
    }
    
    /* Progress styles */
    .progress-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 11px;
      color: #6b7280;
      font-weight: 600;
    }
    
    .progress-labels span {
      cursor: pointer;
      text-align: center;
      width: 11%;
    }
    
    .dot-step {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e5e7eb;
      cursor: pointer;
      position: relative;
      transition: all 0.3s;
    }
    
    .dot-step.done {
      background: #10b981;
    }
    
    .dot-step.current {
      background: #3b82f6;
      transform: scale(1.2);
    }
    
    .dot-step.done i {
      position: absolute;
      top: -3px;
      left: -3px;
      font-size: 16px;
      color: #10b981;
    }
    
    .dot-step.current .mini {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
    }
    
    .current-stage {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
      text-align: center;
      margin-top: 5px;
    }
  `;
  document.head.appendChild(styles);
}
