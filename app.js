console.log("🚀 APP.JS STARTING...");

// Quick test - is this file loading?
alert("app.js is loading! Click OK to continue.");

document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ DOM fully loaded!");
  
  // TEST 1: Can we find the login button?
  const loginBtn = document.getElementById('loginBtn');
  console.log("Login button found:", !!loginBtn);
  
  if (loginBtn) {
    // Add a SUPER SIMPLE click handler
    loginBtn.onclick = function() {
      console.log("🎯 LOGIN BUTTON CLICKED!");
      alert("Login button works! Now testing login function...");
      
      // Try the actual login
      handleLoginTest();
    };
    
    // Also add event listener
    loginBtn.addEventListener('click', function(e) {
      console.log("Event listener fired!");
    });
  }
  
  // Check other critical elements
  console.log("Login screen found:", !!document.getElementById('loginScreen'));
  console.log("App screen found:", !!document.getElementById('appScreen'));
  console.log("Case input found:", !!document.getElementById('caseNumber'));
  console.log("PIN input found:", !!document.getElementById('pin'));
});

// SIMPLE TEST FUNCTION
function handleLoginTest() {
  console.log("🔐 Testing login...");
  
  const caseInput = document.getElementById('caseNumber');
  const pinInput = document.getElementById('pin');
  
  if (!caseInput || !pinInput) {
    alert("ERROR: Inputs not found!");
    return;
  }
  
  const caseNumber = caseInput.value;
  const pin = pinInput.value;
  
  console.log("Case:", caseNumber, "PIN:", pin);
  
  if (!caseNumber || !pin) {
    alert("Please enter both case number and PIN");
    return;
  }
  
  // DEMO LOGIN - any HI- works
  if (caseNumber.startsWith('HI-')) {
    console.log("✅ Demo login successful!");
    
    // Hide login, show app
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    
    alert("SUCCESS! Logged in. App should be visible now.");
  } else {
    alert("For demo, use case number starting with HI-");
  }
}

// Make function globally available
window.handleLoginTest = handleLoginTest;

console.log("🏁 APP.JS LOADED (but DOM might not be ready yet)");
