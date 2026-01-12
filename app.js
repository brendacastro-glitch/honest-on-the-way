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
    // LOGIN/LOGOUT
    // ======================
    function checkLoginStatus() {
        // Check if user is logged in (in a real app, this would check localStorage or session)
        const isLoggedIn = localStorage.getItem('honest_immigration_logged_in') === 'true';
        
        if (isLoggedIn) {
            showAppScreen();
        } else {
            showLoginScreen();
        }
    }

    function handleLogin() {
        const caseNumber = document.getElementById('caseNumber').value;
        const pin = document.getElementById('pin').value;
        
        // Basic validation
        if (!caseNumber || !pin) {
            alert('Please enter your case number and PIN');
            return;
        }
        
        // In a real app, this would call your API/Supabase
        // For demo purposes, we'll simulate successful login
        localStorage.setItem('honest_immigration_logged_in', 'true');
        localStorage.setItem('honest_immigration_case', caseNumber);
        
        showAppScreen();
    }

    function handleMagicLink() {
        alert('A magic link has been sent to your email. Please check your inbox.');
    }

    function showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appScreen').style.display = 'none';
    }

    function showAppScreen() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'flex';
        
        // Set current case number from localStorage
        const caseNumber = localStorage.getItem('honest_immigration_case') || 'HI-2024-00123';
        document.querySelector('.user-info p').textContent = `Case: ${caseNumber}`;
    }

    // ======================
    // PROGRESS TRACKER
    // ======================
    function renderProgressTracker() {
        const container = document.getElementById('progressTracker');
        container.innerHTML = '';
        
        // Create stages container
        const stagesContainer = document.createElement('div');
        stagesContainer.className = 'progress-stages';
        
        // Create progress line
        const progressLine = document.createElement('div');
        progressLine.className = 'progress-line';
        
        // Calculate progress width (2 completed stages out of 9)
        const progressPercent = (2 / 9) * 100;
        progressLine.style.width = `${progressPercent}%`;
        
        stagesContainer.appendChild(progressLine);
        
        // Create each stage
        stages.forEach(stage => {
            const stageElement = document.createElement('div');
            stageElement.className = 'stage-item';
            stageElement.dataset.stageId = stage.id;
            
            if (stage.completed) {
                stageElement.classList.add('completed');
            }
            if (stage.current) {
                stageElement.classList.add('current');
            }
            
            stageElement.innerHTML = `
                <div class="stage-circle">${stage.abbrev}</div>
                <div class="stage-label">${stage.abbrev}</div>
            `;
            
            // Add click event
            stageElement.addEventListener('click', () => showStageDescription(stage));
            
            stagesContainer.appendChild(stageElement);
        });
        
        container.appendChild(stagesContainer);
    }

    function showStageDescription(stage) {
        // If clicking the same stage, close it
        if (appState.expandedStage === stage.id) {
            closeStageDescription();
            return;
        }
        
        appState.expandedStage = stage.id;
        
        const descriptionContainer = document.getElementById('stageDescription');
        const abbrevElement = document.getElementById('stageAbbrev');
        const nameElement = document.getElementById('stageFullName');
        const descElement = document.getElementById('stageDescText');
        
        // Set stage info
        abbrevElement.textContent = stage.abbrev;
        nameElement.textContent = stage.name;
        
        // Set description based on stage
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
        
        descElement.textContent = descriptions[stage.id] || 'Stage information will be available soon.';
        
        // Show description
        descriptionContainer.style.display = 'block';
        descriptionContainer.classList.add('expanding');
    }

    function closeStageDescription() {
        appState.expandedStage = null;
        document.getElementById('stageDescription').style.display = 'none';
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
        document.querySelectorAll('.task-card').forEach(card => {
            const expandBtn = card.querySelector('.expand-btn');
            if (expandBtn) {
                expandBtn.addEventListener('click', function() {
                    const isExpanded = card.dataset.expanded === 'true';
                    card.dataset.expanded = !isExpanded;
                    
                    // Rotate arrow icon
                    const icon = this.querySelector('i');
                    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                });
            }
        });
    }

    // ======================
    // TAB SWITCHING
    // ======================
    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Update active tab button
                this.parentElement.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                // Show corresponding tab content
                const container = this.closest('.section');
                container.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}Tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    // ======================
    // FILTERS
    // ======================
    function setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active filter
                this.parentElement.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                // In a real app, this would filter content
                console.log(`Filter changed to: ${this.textContent}`);
            });
        });
    }

    // ======================
    // EVENT LISTENERS SETUP
    // ======================
    function setupEventListeners() {
        // Login buttons
        document.getElementById('loginBtn').addEventListener('click', handleLogin);
        document.getElementById('magicLinkBtn').addEventListener('click', handleMagicLink);
        
        // Bottom navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                switchScreen(this.dataset.screen);
            });
        });
        
        // Education button in header
        document.getElementById('educationBtn').addEventListener('click', function() {
            switchScreen('education');
        });
        
        // Close stage description
        document.getElementById('closeDescBtn').addEventListener('click', closeStageDescription);
        
        // Tab switching
        setupTabs();
        
        // Filters
        setupFilters();
        
        // Document upload simulation
        document.querySelectorAll('.document-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.textContent.includes('Photo') ? 'camera' : 'file';
                simulateDocumentUpload(action);
            });
        });
        
        // View journey button
        document.querySelectorAll('.view-journey-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                alert('Document journey would show detailed timeline in a real app.');
            });
        });
        
        // Upload now buttons
        document.querySelectorAll('.btn-primary').forEach(btn => {
            if (btn.textContent.includes('Upload Now')) {
                btn.addEventListener('click', simulateDocumentUpload);
            }
        });
    }

    // ======================
    // SIMULATION FUNCTIONS
    // ======================
    function simulateDocumentUpload(action = 'file') {
        const message = action === 'camera' 
            ? 'Camera would open to take a photo. Remember: No cropped pictures are allowed!'
            : 'File picker would open to select document.';
        
        alert(message);
        
        // In a real app, this would:
        // 1. Open camera or file picker
        // 2. Upload to Supabase Storage
        // 3. Update document status
        // 4. Show success message
    }

    // ======================
    // START THE APP
    // ======================
    initApp();
});

