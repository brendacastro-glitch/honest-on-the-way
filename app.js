// ============================================
// SUPER SIMPLE APP.JS THAT WILL WORK 100%
// ============================================

console.log("APP.JS LOADED ✅");

// 1. FIRST THING: Bind the login button immediately
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM is ready!");
  
  // Find login button
  const loginBtn = document.getElementById('loginBtn');
  console.log("Login button found:", loginBtn);
  
  if (loginBtn) {
    // Remove any old event listeners
    loginBtn.replaceWith(loginBtn.cloneNode(true));
    
    // Get fresh reference
    const freshBtn = document.getElementById('loginBtn');
    
    // Add simple click handler
    freshBtn.addEventListener('click', function() {
      console.log("LOGIN BUTTON CLICKED!");
      simpleLogin();
    });
    
    console.log("Login button bound successfully!");
  }
  
  // Also bind magic link button
  const magicBtn = document.getElementById('magicLinkBtn');
  if (magicBtn) {
    magicBtn.addEventListener('click', function() {
      alert('Magic link coming soon! For now, use:\nCase: HI-TEST\nPIN: 123456');
    });
  }
  
  // Press Enter to login
  const pinField = document.getElementById('pin');
  if (pinField) {
    pinField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        simpleLogin();
      }
    });
  }
  
  // Check if already logged in
  checkIfLoggedIn();
});

// 2. SUPER SIMPLE LOGIN FUNCTION
function simpleLogin() {
  console.log("simpleLogin() called");
  
  const caseNumber = document.getElementById('caseNumber').value;
  const pin = document.getElementById('pin').value;
  
  console.log("Case:", caseNumber, "PIN:", pin);
  
  // Validate
  if (!caseNumber) {
    alert('Please enter your case number');
    document.getElementById('caseNumber').focus();
    return;
  }
  
  if (!pin) {
    alert('Please enter your PIN');
    document.getElementById('pin').focus();
    return;
  }
  
  // DEMO MODE: Accept ANY case that starts with HI-
  if (caseNumber.toUpperCase().includes('HI')) {
    console.log("DEMO LOGIN SUCCESS!");
    
    // Store login info
    localStorage.setItem('honest_immigration_logged_in', 'true');
    localStorage.setItem('honest_immigration_case', caseNumber || 'HI-2024-001234');
    localStorage.setItem('honest_immigration_client_name', 'Maria Rodriguez');
    
    // Show app screen
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    
    // Update user info
    document.getElementById('userName').textContent = 'Maria Rodriguez';
    document.getElementById('userInitials').textContent = 'MR';
    document.getElementById('caseDisplay').textContent = `Case: ${caseNumber || 'HI-2024-001234'}`;
    
    // Make progress dots clickable
    setupClickableProgress();
    
    // Setup navigation
    setupNavigation();
    
    // Show notification dot
    document.getElementById('notifDot').style.display = 'block';
    
    console.log("Login successful!");
    
  } else {
    alert('For demo, use a case number containing "HI" (like HI-2024-001234)');
  }
}

// 3. CHECK IF ALREADY LOGGED IN
function checkIfLoggedIn() {
  const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
  console.log("Already logged in?", isLoggedIn);
  
  if (isLoggedIn) {
    // Show app screen
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    
    // Setup everything
    setupNavigation();
    setupClickableProgress();
  }
}

// 4. SETUP CLICKABLE PROGRESS DOTS
function setupClickableProgress() {
  console.log("Setting up clickable progress...");
  
  const progressDots = document.getElementById('progressDots');
  if (!progressDots) return;
  
  // Make existing dots clickable
  const dots = progressDots.querySelectorAll('.dot-step');
  dots.forEach((dot, index) => {
    dot.style.cursor = 'pointer';
    dot.title = 'Click for stage details';
    
    dot.addEventListener('click', function() {
      const stages = [
        'Kick-off: Initial case setup',
        'Document Collection: Upload your documents',
        'Introductory Call: Meet your case manager',
        'Additional Questions: Clarify details',
        'Petition Draft: We prepare your application',
        'Petition Review: You review the draft',
        'Application Review: Final checks',
        'Final Review: Attorney approval',
        'Submission: Filed with USCIS'
      ];
      
      alert(`Stage ${index + 1}:\n\n${stages[index] || 'Stage details'}`);
    });
  });
  
  // Make progress labels clickable too
  const labels = document.querySelector('.progress-labels');
  if (labels) {
    const labelSpans = labels.querySelectorAll('span');
    labelSpans.forEach((span, index) => {
      span.style.cursor = 'pointer';
      span.addEventListener('click', function() {
        alert(`Stage: ${span.textContent}\n\nClick the dot above for more details.`);
      });
    });
  }
}

// 5. SIMPLE NAVIGATION SETUP
function setupNavigation() {
  console.log("Setting up navigation...");
  
  // Bottom nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const screen = this.dataset.screen;
      
      // Remove active from all
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
      
      // Add active to clicked
      this.classList.add('active');
      
      // Show corresponding screen
      const screenElement = document.getElementById(screen + 'Screen');
      if (screenElement) {
        screenElement.classList.add('active');
      }
      
      console.log("Navigated to:", screen);
    });
  });
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      location.reload(); // Simple reload to go back to login
    });
  }
  
  // Education button
  const educationBtn = document.getElementById('educationBtn');
  if (educationBtn) {
    educationBtn.addEventListener('click', function() {
      // Hide all screens
      document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
      // Show education
      document.getElementById('educationScreen').classList.add('active');
      // No active nav button for education
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    });
  }
  
  // Education back button
  const eduBackBtn = document.getElementById('eduBackBtn');
  if (eduBackBtn) {
    eduBackBtn.addEventListener('click', function() {
      // Go back to home
      document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
      document.getElementById('homeScreen').classList.add('active');
      document.querySelector('.nav-btn[data-screen="home"]').classList.add('active');
    });
  }
  
  // Notifications button
  const notificationsBtn = document.getElementById('notificationsBtn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', function() {
      // Go to updates
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
      document.querySelector('.nav-btn[data-screen="updates"]').classList.add('active');
      document.getElementById('updatesScreen').classList.add('active');
      // Hide notification dot
      document.getElementById('notifDot').style.display = 'none';
    });
  }
  
  // Upload passport button
  const uploadPassportBtn = document.getElementById('uploadPassportBtn');
  if (uploadPassportBtn) {
    uploadPassportBtn.addEventListener('click', function() {
      // Go to documents
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
      document.querySelector('.nav-btn[data-screen="documents"]').classList.add('active');
      document.getElementById('documentsScreen').classList.add('active');
    });
  }
  
  // Accordion buttons
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const panelId = this.dataset.accordion;
      const panel = document.getElementById(panelId);
      const icon = this.querySelector('.fa-chevron-down');
      
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
  
  // Tab buttons in documents
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      
      // Remove active from all
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active to clicked
      this.classList.add('active');
      const tabContent = document.getElementById(tabId);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
  
  // Action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      
      switch(action) {
        case 'upload-passport':
        case 'upload-document':
          // Go to documents
          document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
          document.querySelector('.nav-btn[data-screen="documents"]').classList.add('active');
          document.getElementById('documentsScreen').classList.add('active');
          break;
        case 'take-action':
        case 'review-draft':
          alert('Opening form...');
          break;
        case 'contact-manager':
          alert('Your case manager will contact you soon!');
          break;
        case 'watch-video':
          alert('Playing video...');
          break;
        case 'view-faq':
          alert('Opening FAQ...');
          break;
        case 'view-journey':
          alert('Showing document journey...');
          break;
      }
    });
  });
}

// 6. MAKE SURE LOGIN BUTTON WORKS EVEN IF SCRIPT LOADS LATE
// This runs after everything else
setTimeout(function() {
  console.log("Double-checking login button...");
  
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    // One more try to bind it
    loginBtn.onclick = function() {
      console.log("Login button clicked via onclick!");
      simpleLogin();
    };
  }
}, 1000);
