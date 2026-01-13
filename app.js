document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // APP STATE & CONFIGURATION
    // ======================
    const appState = {
        currentUser: null,
        currentCase: null,
        currentScreen: 'home',
        expandedStage: null
    };

    // Progress stages configuration
    const stages = [
        { id: 1, abbrev: 'K', name: 'Signed Contract', completed: true },
        { id: 2, abbrev: 'DOCS', name: 'Documentation Uploaded', completed: true },
        { id: 3, abbrev: 'IC', name: 'Introductory Call', completed: false, current: true },
        { id: 4, abbrev: 'AQ', name: 'Additional Questions Call', completed: false },
        { id: 5, abbrev: 'PD', name: 'Personal Declaration Call', completed: false },
        { id: 6, abbrev: 'PDR', name: 'Personal Declaration Reading', completed: false },
        { id: 7, abbrev: 'APP REVIEW', name: 'Application Review Call', completed: false },
        { id: 8, abbrev: 'CR', name: 'Case Ready to be Send', completed: false },
        { id: 9, abbrev: 'S', name: 'Case Sent to Immigration', completed: false }
    ];

    // ======================
    // INITIALIZATION
    // ======================
    function initApp() {
        setupEventListeners();
        renderProgressTracker();
        updateTaskExpansions();
        checkLoginStatus();
    }

    // ======================
    // LOGIN/LOGOUT - FIXED VERSION
    // ======================
    function checkLoginStatus() {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
        
        if (isLoggedIn) {
            showAppScreen();
        } else {
            showLoginScreen();
        }
    }

    function handleLogin() {
        console.log("Login button clicked!");
        
        const caseNumber = document.getElementById('caseNumber').value;
        const pin = document.getElementById('pin').value;
        
        // Basic validation
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
        
        // SIMPLE LOGIN - Works with ANY case number
        console.log("Logging in with:", { caseNumber, pin });
        
        // Store login info
        localStorage.setItem('honest_immigration_logged_in', 'true');
        localStorage.setItem('honest_immigration_case', caseNumber || 'HI-2024-00123');
        localStorage.setItem('honest_immigration_client_name', 'Maria Rodriguez');
        
        // Show success
        console.log("Login successful!");
        showAppScreen();
    }

    function handleMagicLink() {
        alert('A magic link has been sent to your email. Please check your inbox.');
    }

    function handleLogout() {
        // Clear all stored data
        localStorage.removeItem('honest_immigration_logged_in');
        localStorage.removeItem('honest_immigration_case');
        localStorage.removeItem('honest_immigration_client_name');
        
        // Go back to login screen
        showLoginScreen();
    }

    function showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appScreen').style.display = 'none';
        
        // Clear form
        document.getElementById('caseNumber').value = '';
        document.getElementById('pin').value = '';
    }

    function showAppScreen() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
        
        // Set current case number from localStorage
        const caseNumber = localStorage.getItem('honest_immigration_case') || 'HI-2024-00123';
        
        // Update header info
        const caseDisplay = document.getElementById('caseDisplay');
        const userName = document.getElementById('userName');
        const userInitials = document.getElementById('userInitials');
        
        if (caseDisplay) caseDisplay.textContent = `Case: ${caseNumber}`;
        if (userName) userName.textContent = 'Maria Rodriguez';
        if (userInitials) userInitials.textContent = 'MR';
        
        // Update progress tracker
        renderProgressTracker();
        
        // Update document counts in tabs
        updateDocumentTabCounts();
    }

    // ======================
    // PROGRESS TRACKER - CLICKABLE VERSION
    // ======================
    function renderProgressTracker() {
        const progressDots = document.getElementById('progressDots');
        if (!progressDots) return;
        
        // Clear existing dots
        progressDots.innerHTML = '';
        
        // Create progress dots
        stages.forEach((stage, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot-step';
            
            if (stage.completed) {
                dot.classList.add('done');
                dot.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else if (stage.current) {
                dot.classList.add('current');
                dot.innerHTML = `<div class="mini">${stage.abbrev}</div>`;
            } else {
                dot.innerHTML = `<div class="mini">${stage.abbrev}</div>`;
            }
            
            // Make it clickable
            dot.style.cursor = 'pointer';
            dot.title = `Click for details: ${stage.name}`;
            
            // Add click event
            dot.addEventListener('click', () => {
                showStageDescription(stage);
            });
            
            progressDots.appendChild(dot);
        });
        
        // Make progress labels clickable too
        const progressLabels = document.querySelector('.progress-labels');
        if (progressLabels) {
            const labels = progressLabels.querySelectorAll('span');
            labels.forEach((label, index) => {
                if (index < stages.length) {
                    label.style.cursor = 'pointer';
                    label.title = stages[index].name;
                    label.addEventListener('click', () => {
                        showStageDescription(stages[index]);
                    });
                }
            });
        }
    }

    function showStageDescription(stage) {
        // Create a simple modal
        const modal = document.createElement('div');
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
                    <h3 style="margin: 0; color: #1E3A8A;">
                        Stage: ${stage.abbrev} - ${stage.name}
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
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        <span style="
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: ${stage.completed ? '#10b981' : stage.current ? '#f59e0b' : '#e5e7eb'};
                            border: 2px solid ${stage.completed ? '#10b981' : stage.current ? '#f59e0b' : '#d1d5db'};
                        "></span>
                        <strong>Status:</strong> 
                        ${stage.completed ? 'Completed' : stage.current ? 'Current Stage' : 'Upcoming'}
                    </div>
                    
                    <p style="color: #64748b; line-height: 1.6;">
                        ${getStageDescription(stage.id)}
                    </p>
                    
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

    function getStageDescription(stageId) {
        const descriptions = {
            1: 'The initial agreement between you and Honest Immigration. This contract outlines our services and your responsibilities.',
            2: 'All required documents have been uploaded and are being reviewed by our team.',
            3: 'Your case manager will schedule a call to discuss your application strategy and answer initial questions.',
            4: 'Follow-up call to address any additional questions about your case or documentation.',
            5: 'Detailed discussion about your personal history and circumstances for the visa application.',
            6: 'Our legal team reviews your personal declaration for completeness and accuracy.',
            7: 'Final review of your complete application package before submission.',
            8: 'Your case is prepared and ready for submission to immigration authorities.',
            9: 'Your application has been officially submitted. Next steps involve government processing.'
        };
        
        return descriptions[stageId] || 'Stage information will be available soon.';
    }

    // ======================
    // SCREEN NAVIGATION
    // ======================
    function switchScreen(screenId) {
        // Update bottom navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.screen === screenId) {
                btn.classList.add('active');
            }
        });
        
        // Update screen content
        document.querySelectorAll('.screen-content').forEach(screen => {
            screen.classList.remove('active');
            if (screen.id === `${screenId}Screen`) {
                screen.classList.add('active');
            }
        });
        
        // Update app state
        appState.currentScreen = screenId;
    }

    // ======================
    // TASK MANAGEMENT
    // ======================
    function updateTaskExpansions() {
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
    }

    // ======================
    // DOCUMENT TAB COUNTS
    // ======================
    function updateDocumentTabCounts() {
        // Update counts in document tabs
        const tabs = {
            'toUpload': 1,
            'underReview': 2,
            'approved': 2
        };
        
        Object.keys(tabs).forEach(tabId => {
            const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
            if (tabBtn) {
                tabBtn.textContent = tabBtn.textContent.replace(/\(\d+\)/, `(${tabs[tabId]})`);
            }
        });
    }

    // ======================
    // EVENT LISTENERS SETUP - FIXED VERSION
    // ======================
    function setupEventListeners() {
        console.log("Setting up event listeners...");
        
        // 1. LOGIN BUTTON - SIMPLE BINDING
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            console.log("Found login button");
            loginBtn.addEventListener('click', handleLogin);
        } else {
            console.error("Login button not found!");
        }
        
        // 2. MAGIC LINK BUTTON
        const magicBtn = document.getElementById('magicLinkBtn');
        if (magicBtn) {
            magicBtn.addEventListener('click', handleMagicLink);
        }
        
        // 3. PRESS ENTER IN PIN FIELD TO LOGIN
        const pinField = document.getElementById('pin');
        if (pinField) {
            pinField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
        
        // 4. LOGOUT BUTTON
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // 5. BOTTOM NAVIGATION
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const screenId = this.dataset.screen;
                switchScreen(screenId);
            });
        });
        
        // 6. EDUCATION BUTTON IN HEADER
        const educationBtn = document.getElementById('educationBtn');
        if (educationBtn) {
            educationBtn.addEventListener('click', function() {
                showSection('educationScreen');
                // Remove active from bottom nav (education is not in bottom nav)
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
            });
        }
        
        // 7. EDUCATION BACK BUTTON
        const eduBackBtn = document.getElementById('eduBackBtn');
        if (eduBackBtn) {
            eduBackBtn.addEventListener('click', function() {
                showSection('homeScreen');
                setBottomNavActive('home');
            });
        }
        
        // 8. UPLOAD PASSPORT BUTTON
        const uploadPassportBtn = document.getElementById('uploadPassportBtn');
        if (uploadPassportBtn) {
            uploadPassportBtn.addEventListener('click', function() {
                showSection('documentsScreen');
                setBottomNavActive('documents');
            });
        }
        
        // 9. NOTIFICATIONS BUTTON
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', function() {
                showSection('updatesScreen');
                setBottomNavActive('updates');
                // Hide notification dot
                document.getElementById('notifDot').style.display = 'none';
            });
        }
        
        // 10. TAB BUTTONS IN DOCUMENTS
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Remove active from all tabs
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active to clicked tab
                this.classList.add('active');
                const tabContent = document.getElementById(tabId);
                if (tabContent) tabContent.classList.add('active');
            });
        });
        
        // 11. ACTION BUTTONS (Take Action, Contact Manager, etc.)
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                console.log("Action clicked:", action);
                
                switch(action) {
                    case 'upload-passport':
                    case 'upload-document':
                        showSection('documentsScreen');
                        setBottomNavActive('documents');
                        break;
                    case 'take-action':
                    case 'review-draft':
                        alert(`Opening ${action.replace('-', ' ')} form...`);
                        break;
                    case 'contact-manager':
                        alert('Your case manager will contact you within 24 hours.');
                        break;
                    case 'watch-video':
                        alert('Playing education video...');
                        break;
                    case 'view-faq':
                        alert('Opening FAQ...');
                        break;
                    case 'view-journey':
                        alert('Showing document journey...');
                        break;
                    default:
                        // Do nothing for other actions
                }
            });
        });
        
        console.log("All event listeners set up!");
    }

    // Helper functions for navigation
    function showSection(sectionId) {
        document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
        const section = document.getElementById(sectionId);
        if (section) section.classList.add('active');
    }

    function setBottomNavActive(screenKey) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-screen="${screenKey}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // ======================
    // START THE APP
    // ======================
    initApp();
});
