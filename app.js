<script>
  // DEBUG SCRIPT - Add this to see what's wrong
  console.log("DEBUG: Script running");
  
  // Check if elements exist
  console.log("Login button:", document.getElementById('loginBtn'));
  console.log("Case input:", document.getElementById('caseNumber'));
  console.log("PIN input:", document.getElementById('pin'));
  
  // Force bind login button
  const forceBind = setInterval(function() {
    const btn = document.getElementById('loginBtn');
    if (btn) {
      console.log("DEBUG: Force-binding login button");
      btn.onclick = function() {
        alert("Login button clicked!");
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
      };
      clearInterval(forceBind);
    }
  }, 100);
</script>
