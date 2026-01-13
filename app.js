// SIMPLE APP.JS - GUARANTEED TO WORK
console.log("🚀 app.js loading...");

// Store data
let currentNotifications = [];

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ DOM ready!");
  
  // Check login status
  const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
  
  if (isLoggedIn) {
    console.log("User already logged in");
    // Don't auto-show app - let user login fresh
  } else {
    console.log("User needs to login");
  }
  
  // Setup all buttons
  setupAllButtons();
  
  console.log("App initialized!");
});

// Setup all buttons
function setupAllButtons() {
  console.log("Setting up buttons...");
  
  // 1. Login button (already has onclick in HTML)
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    console.log("Login button found");
    // Keep the onclick from HTML, but also add event listener
    loginBtn.addEventListener('click', function(e) {
      console.log("Login button clicked via event listener");
    });
  }
  
  // 2. Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('honest_immigration_logged_in');
      localStorage.removeItem('honest_immigration_case');
      document.getElementById('appScreen').style.display = 'none';
      document.getElementById('loginScreen').style.display = 'block';
      alert('Logged out successfully.');
    });
  }
  
  // 3. Bottom navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const screen = this.getAttribute('data-screen');
      showScreen(screen);
      
      // Update active state
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // 4. Education button
  const eduBtn = document.getElementById('educationBtn');
  if (eduBtn) {
    eduBtn.addEventListener('click', function() {
      showScreen('education');
    });
  }
  
  // 5. Education back button
  const eduBackBtn = document.getElementById('eduBackBtn');
  if (eduBackBtn) {
    eduBackBtn.addEventListener('click', function() {
      showScreen('home');
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.nav-btn[data-screen="home"]').classList.add('active');
    });
  }
  
  // 6. Notifications button
  const notifBtn = document.getElementById('notificationsBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', function() {
      alert('Notifications would show here. Working!');
    });
  }
  
  // 7. Contact buttons
  document.querySelectorAll('[data-action="contact-manager"]').forEach(btn => {
    btn.addEventListener('click', function() {
      alert('Your case manager will contact you within 24 hours.');
    });
  });
  
  // 8. Task buttons
  document.querySelectorAll('[data-action="take-action"], [data-action="upload-passport"], [data-action="review-draft"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.getAttribute('data-action');
      if (action === 'upload-passport') {
        showScreen('documents');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.nav-btn[data-screen="documents"]').classList.add('active');
      } else {
        alert('Task action initiated!');
      }
    });
  });
  
  // 9. Accordions
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
  
  // 10. Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Update tab buttons
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Update tab content
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  console.log("All buttons setup complete!");
}

// Show screen
function showScreen(screenKey) {
  // Hide all screens
  document.querySelectorAll('.screen-content').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show selected screen
  let screenId;
  switch(screenKey) {
    case 'home': screenId = 'homeScreen'; break;
    case 'tasks': screenId = 'tasksScreen'; break;
    case 'documents': screenId = 'documentsScreen'; break;
    case 'updates': screenId = 'updatesScreen'; break;
    case 'education': screenId = 'educationScreen'; break;
    default: screenId = 'homeScreen';
  }
  
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
  }
}

// Make functions available globally
window.showScreen = showScreen;
window.setupAllButtons = setupAllButtons;

console.log("🏁 app.js loaded successfully!");
