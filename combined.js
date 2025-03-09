document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // Initialize both applications
    // ==========================================
    
    // Set up theme and UI elements
    setupThemeToggle();
    setupMobileTabs();
    setupModalControls();
    setupImportExport();
    
    // Initialize Interest-Free Tracker
    window.interestFreeTracker = new InterestFreeTracker();
    
    // Initialize Bill Planner
    window.billPlanner = new BillPlanner();
});

// ==========================================
// Shared functionality
// ==========================================

// Theme handling
function setupThemeToggle() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeToggleButton(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeToggleButton('dark');
    }
    
    // Set up theme toggle button
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            updateThemeToggleButton(newTheme);
        });
    }
}

function updateThemeToggleButton(theme) {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (!themeToggleBtn) return;
    
    if (theme === 'dark') {
        themeToggleBtn.innerHTML = '<span class="theme-icon light-icon"></span>Light Mode';
    } else {
        themeToggleBtn.innerHTML = '<span class="theme-icon dark-icon"></span>Dark Mode';
    }
}

// Mobile tab switching
function setupMobileTabs() {
    const interestFreeTab = document.getElementById('interest-free-tab');
    const billPlannerTab = document.getElementById('bill-planner-tab');
    const interestFreePanel = document.getElementById('interest-free-panel');
    const billPlannerPanel = document.getElementById('bill-planner-panel');
    
    if (!interestFreeTab || !billPlannerTab || !interestFreePanel || !billPlannerPanel) return;
    
    interestFreeTab.addEventListener('click', function() {
        interestFreeTab.classList.add('active');
        billPlannerTab.classList.remove('active');
        interestFreePanel.style.display = 'block';
        billPlannerPanel.style.display = 'none';
    });
    
    billPlannerTab.addEventListener('click', function() {
        billPlannerTab.classList.add('active');
        interestFreeTab.classList.remove('active');
        billPlannerPanel.style.display = 'block';
        interestFreePanel.style.display = 'none';
    });
}

// Modal controls
function setupModalControls() {
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal, .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.app-modal') || this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('app-modal') || event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Import / Export functionality
function setupImportExport() {
    // Export button handling
    const exportAllBtn = document.getElementById('export-all-btn');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', function() {
            const exportModal = document.getElementById('export-modal');
            if (exportModal) {
                exportModal.style.display = 'block';
            }
        });
    }
    
    // Feature-specific export buttons
    const exportInterestFreeBtn = document.getElementById('export-interest-free-btn');
    const exportBillPlannerBtn = document.getElementById('export-bill-planner-btn');
    const exportBothBtn = document.getElementById('export-both-btn');
    
    if (exportInterestFreeBtn) {
        exportInterestFreeBtn.addEventListener('click', function() {
            exportData('interest-free');
            closeAllModals();
        });
    }
    
    if (exportBillPlannerBtn) {
        exportBillPlannerBtn.addEventListener('click', function() {
            exportData('bill-planner');
            closeAllModals();
        });
    }
    
    if (exportBothBtn) {
        exportBothBtn.addEventListener('click', function() {
            exportData('both');
            closeAllModals();
        });
    }
    
    // Import button handling
    const importAllBtn = document.getElementById('import-all-btn');
    if (importAllBtn) {
        importAllBtn.addEventListener('click', function() {
            const importModal = document.getElementById('import-modal');
            if (importModal) {
                importModal.style.display = 'block';
            }
        });
    }
    
    // Feature-specific import buttons
    const importInterestFreeBtn = document.getElementById('import-interest-free-btn');
    const importBillPlannerBtn = document.getElementById('import-bill-planner-btn');
    const importBothBtn = document.getElementById('import-both-btn');
    const importFileInput = document.getElementById('import-file');
    
    if (importInterestFreeBtn && importFileInput) {
        importInterestFreeBtn.addEventListener('click', function() {
            importFileInput.setAttribute('data-import-type', 'interest-free');
            importFileInput.click();
            closeAllModals();
        });
    }
    
    if (importBillPlannerBtn && importFileInput) {
        importBillPlannerBtn.addEventListener('click', function() {
            importFileInput.setAttribute('data-import-type', 'bill-planner');
            importFileInput.click();
            closeAllModals();
        });
    }
    
    if (importBothBtn && importFileInput) {
        importBothBtn.addEventListener('click', function() {
            importFileInput.setAttribute('data-import-type', 'both');
            importFileInput.click();
            closeAllModals();
        });
    }
    
    // File input change handler
    if (importFileInput) {
        importFileInput.addEventListener('change', handleFileImport);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.app-modal, .modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Export data functions
function exportData(type) {
    let data = {};
    
    if (type === 'interest-free' || type === 'both') {
        data.interestFreeData = {
            billingPeriods: JSON.parse(localStorage.getItem('billingPeriods') || '[]')
        };
    }
    
    if (type === 'bill-planner' || type === 'both') {
        data.billPlannerData = {
            payCycleStart: localStorage.getItem('payCycleStart'),
            payCycleFrequency: localStorage.getItem('payCycleFrequency'),
            payCycleIncome: localStorage.getItem('payCycleIncome'),
            billData: localStorage.getItem('billData')
        };
    }
    
    // Generate filename with date
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    let filename;
    
    if (type === 'interest-free') {
        filename = `interest_free_tracker_${dateStr}.json`;
    } else if (type === 'bill-planner') {
        filename = `bill_planner_${dateStr}.json`;
    } else {
        filename = `finance_tracker_all_${dateStr}.json`;
    }
    
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
    showSnackbar('Data exported successfully!');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Import data functions
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    const importType = event.target.getAttribute('data-import-type');
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importType === 'interest-free' || importType === 'both') {
                if (importedData.interestFreeData && importedData.interestFreeData.billingPeriods) {
                    if (confirm('This will replace all your Interest-Free Tracker data. Continue?')) {
                        localStorage.setItem('billingPeriods', JSON.stringify(importedData.interestFreeData.billingPeriods));
                        
                        // Reload interest-free tracker
                        if (window.interestFreeTracker) {
                            window.interestFreeTracker.billingPeriods = importedData.interestFreeData.billingPeriods;
                            window.interestFreeTracker.renderExistingBillingPeriods();
                        }
                        
                        showSnackbar('Interest-Free Tracker data imported successfully!');
                    }
                } else if (importType === 'interest-free') {
                    alert('Invalid Interest-Free Tracker data format');
                }
            }
            
            if (importType === 'bill-planner' || importType === 'both') {
                if (importedData.billPlannerData) {
                    if (confirm('This will replace all your Bill Planner data. Continue?')) {
                        const plannerData = importedData.billPlannerData;
                        
                        if (plannerData.payCycleStart) {
                            localStorage.setItem('payCycleStart', plannerData.payCycleStart);
                        }
                        
                        if (plannerData.payCycleFrequency) {
                            localStorage.setItem('payCycleFrequency', plannerData.payCycleFrequency);
                        }
                        
                        if (plannerData.payCycleIncome) {
                            localStorage.setItem('payCycleIncome', plannerData.payCycleIncome);
                        }
                        
                        if (plannerData.billData) {
                            localStorage.setItem('billData', plannerData.billData);
                        }
                        
                        // Reload bill planner
                        if (window.billPlanner) {
                            window.billPlanner.loadData();
                            window.billPlanner.updateUI();
                        }
                        
                        showSnackbar('Bill Planner data imported successfully!');
                    }
                } else if (importType === 'bill-planner') {
                    alert('Invalid Bill Planner data format');
                }
            }
            
        } catch (error) {
            alert(`Error importing data: ${error.message}`);
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// UI helper functions
function showSnackbar(message) {
    const snackbar = document.getElementById('snackbar');
    if (!snackbar) return;
    
    snackbar.textContent = message;
    snackbar.className = 'show';
    
    setTimeout(function() {
        snackbar.className = snackbar.className.replace('show', '');
    }, 3000);
}

// ==========================================
// Bill Planner Class
// ==========================================
class BillPlanner {
    constructor() {
        // DOM Elements
        this.masterListEl = document.getElementById('masterList');
        this.masterListContainerEl = document.getElementById('masterListContainer');
        this.payCyclesEl = document.getElementById('payCycles');
        this.payCycleStartEl = document.getElementById('payCycleStart');
        this.payCycleFrequencyEl = document.getElementById('payCycleFrequency');
        this.payCycleIncomeEl = document.getElementById('payCycleIncome');
        this.billNameEl = document.getElementById('billName');
        this.billAmountEl = document.getElementById('billAmount');
        this.billDateEl = document.getElementById('billDate');
        this.billFrequencyEl = document.getElementById('billFrequency');
        this.billGroupEl = document.getElementById('billGroup');
        this.toggleMasterListBtn = document.getElementById('toggleMasterList');
        this.toggleAllCyclesBtn = document.getElementById('toggleAllCycles');
        this.customFrequencyModal = document.getElementById('customFrequencyModal');
        
        if (!this.masterListEl) return; // Exit if elements not found
        
        // Initialize variables
        this.masterBills = [];
        this.payCycles = [];
        this.payCycleStart = new Date();
        this.payCycleFrequency = 'Fortnightly';
        this.payCycleIncome = 0;
        this.customFrequencySettings = null;
        
        // Load saved data
        this.loadData();
        
        // Initialize UI
        this.setupUI();

        // Update the UI to show master list
        this.updateUI();
        
        // Generate pay cycles with the loaded data
        this.generatePayCycles();
    }
    
    // Load data from localStorage
    loadData() {
        if (localStorage.getItem('payCycleStart')) {
            this.payCycleStart = new Date(localStorage.getItem('payCycleStart'));
            if (this.payCycleStartEl) {
                this.payCycleStartEl.value = this.payCycleStart.toISOString().split('T')[0];
            }
        }
        
        if (localStorage.getItem('payCycleFrequency')) {
            this.payCycleFrequency = localStorage.getItem('payCycleFrequency');
            if (this.payCycleFrequencyEl) {
                this.payCycleFrequencyEl.value = this.payCycleFrequency;
            }
        }
        
        if (localStorage.getItem('payCycleIncome')) {
            this.payCycleIncome = parseFloat(localStorage.getItem('payCycleIncome'));
            if (this.payCycleIncomeEl) {
                this.payCycleIncomeEl.value = this.payCycleIncome;
            }
        }
        
        let storedData = localStorage.getItem('billData');
        if (storedData) {
            this.masterBills = JSON.parse(storedData);
        }
    }
    
    // Set up UI event listeners
    setupUI() {
         
if (this.toggleMasterListBtn) {
        this.toggleMasterListBtn.addEventListener('click', () => {
            const masterListContainer = document.getElementById('masterListContainer');
            const iconElem = this.toggleMasterListBtn.querySelector('.material-icons-round');
            const textElem = this.toggleMasterListBtn.querySelector('.btn-text');
            
            const isHidden = masterListContainer.classList.contains('hidden');
            
            masterListContainer.classList.toggle('hidden', !isHidden);
            
            if (isHidden) {
                iconElem.textContent = 'visibility_off';
                textElem.textContent = 'Hide List';
            } else {
                iconElem.textContent = 'visibility';
                textElem.textContent = 'Show List';
            }
        });
        
        // Set initial state - ensure master list is visible by default
        const masterListContainer = document.getElementById('masterListContainer');
        masterListContainer.classList.remove('hidden');
    }
        
        // Toggle all cycles button
        if (this.toggleAllCyclesBtn) {
            this.toggleAllCyclesBtn.addEventListener('click', () => {
                const allContents = document.querySelectorAll('.cycle-content');
                const allButtons = document.querySelectorAll('.cycle-toggle');
                const allExpanded = this.toggleAllCyclesBtn.querySelector('.btn-text').textContent === 'Collapse All';
                
                allContents.forEach(content => {
                    content.classList.toggle('hidden', allExpanded);
                });
                
                allButtons.forEach(button => {
                    const iconElem = button.querySelector('.material-icons-round');
                    if (iconElem) {
                        iconElem.textContent = allExpanded ? 'expand_more' : 'expand_less';
                        button.classList.toggle('collapsed', allExpanded);
                    }
                });
                
                this.updateToggleAllButton(!allExpanded);
            });
            
            // Set initial state
            this.updateToggleAllButton(true); // Start with "Collapse All"
        }
        
        // Bill frequency dropdown
        if (this.billFrequencyEl) {
            this.billFrequencyEl.addEventListener('change', () => {
                if (this.billFrequencyEl.value === 'Custom' && this.customFrequencyModal) {
                    this.customFrequencyModal.style.display = 'block';
                }
            });
        }
        
        // Setup custom frequency modal
        this.setupCustomFrequencyModal();
    }
    
    // Update the toggle button text and icon
    updateToggleButton(button, isHidden) {
        if (!button) return;
        
        const iconElem = button.querySelector('.material-icons-round');
        const textElem = button.querySelector('.btn-text');
        
        if (iconElem && textElem) {
            if (isHidden) {
                iconElem.textContent = 'visibility';
                textElem.textContent = 'Show List';
            } else {
                iconElem.textContent = 'visibility_off';
                textElem.textContent = 'Hide List';
            }
        }
    }
    
    // Update the toggle all cycles button
    updateToggleAllButton(isExpanded) {
        if (!this.toggleAllCyclesBtn) return;
        
        const iconElem = this.toggleAllCyclesBtn.querySelector('.material-icons-round');
        const textElem = this.toggleAllCyclesBtn.querySelector('.btn-text');
        
        if (iconElem && textElem) {
            if (isExpanded) {
                iconElem.textContent = 'expand_less';
                textElem.textContent = 'Collapse All';
            } else {
                iconElem.textContent = 'expand_more';
                textElem.textContent = 'Expand All';
            }
        }
    }

    // Set up custom frequency modal
    setupCustomFrequencyModal() {
        if (!this.customFrequencyModal) return;
        
        const frequencyUnit = document.getElementById('customFrequencyUnit');
        const weekdaySelector = document.getElementById('weekdaySelector');
        const weekdayButtons = document.querySelectorAll('.weekday-btn');
        const cancelBtn = document.getElementById('cancelCustomFrequency');
        const saveBtn = document.getElementById('saveCustomFrequency');
        const closeBtn = this.customFrequencyModal.querySelector('.close');
        
        // Show weekday selector when 'Week(s)' is selected
        if (frequencyUnit) {
            frequencyUnit.addEventListener('change', function() {
                if (this.value === 'weeks' && weekdaySelector) {
                    weekdaySelector.style.display = 'block';
                } else if (weekdaySelector) {
                    weekdaySelector.style.display = 'none';
                }
            });
        }
        
        // Toggle weekday button selection
        weekdayButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('selected');
            });
        });
        
        // Close the modal
        const closeModal = () => {
            this.customFrequencyModal.style.display = 'none';
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        
        // Window click to close modal
        window.addEventListener('click', (event) => {
            if (event.target === this.customFrequencyModal) {
                closeModal();
            }
        });
        
        // Save custom frequency
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const value = parseInt(document.getElementById('customFrequencyValue').value) || 1;
                const unit = document.getElementById('customFrequencyUnit').value;
                let selectedDays = [];
                
                if (unit === 'weeks') {
                    document.querySelectorAll('.weekday-btn.selected').forEach(btn => {
                        selectedDays.push(parseInt(btn.dataset.day));
                    });
                    if (selectedDays.length === 0) {
                        // If no days selected, use the current day of the week
                        selectedDays.push(new Date().getDay());
                    }
                }
                
                this.customFrequencySettings = {
                    value: value,
                    unit: unit,
                    days: selectedDays
                };
                
                // Set a descriptive text in the frequency dropdown
                if (this.billFrequencyEl) {
                    let customText = `Custom: Every ${value} ${unit}`;
                    if (unit === 'weeks' && selectedDays.length > 0) {
                        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                        customText += ` on ${selectedDays.map(d => dayNames[d]).join(', ')}`;
                    }
                    
                    // Create or update the custom option
                    let customOption = this.billFrequencyEl.querySelector('option[value="Custom"]');
                    if (customOption) {
                        customOption.textContent = customText;
                    }
                }
                
                closeModal();
            });
        }
    }

    // Update the UI with the current data
    updateUI() {
        this.updateMasterList();
        this.generatePayCycles();
    }
    
    // Add a new bill to the master list
    addBill() {
        if (!this.billNameEl || !this.billAmountEl || !this.billDateEl || 
            !this.billFrequencyEl || !this.billGroupEl) return;
            
        let name = this.billNameEl.value;
        let amount = parseFloat(this.billAmountEl.value);
        let date = this.billDateEl.value;
        let frequency = this.billFrequencyEl.value;
        let group = this.billGroupEl.value;
        
        if (name && amount && date && frequency && group) {
            // For custom frequency, save the settings with the bill
            let billData = { name, amount, date, frequency, group };
            
            if (frequency === 'Custom' && this.customFrequencySettings) {
                billData.customFrequency = this.customFrequencySettings;
            }
            
            this.masterBills.push(billData);
            localStorage.setItem('billData', JSON.stringify(this.masterBills));
            
            // Clear form fields
            this.billNameEl.value = "";
            this.billAmountEl.value = "";
            this.customFrequencySettings = null;
            
            this.updateUI();
            
            // Show success feedback
            showSnackbar("Bill added successfully!");
        } else {
            alert("Please fill in all fields");
        }
    }
    
    // Update the displayed master bill list
    updateMasterList() {
        if (!this.masterListEl) return;
        
        this.masterListEl.innerHTML = "";
        
        this.masterBills.forEach((bill, index) => {
            let li = document.createElement("li");
            
            // Create frequency description for display
            let frequencyDisplay = bill.frequency;
            if (bill.frequency === 'Custom' && bill.customFrequency) {
                const cf = bill.customFrequency;
                frequencyDisplay = `Every ${cf.value} ${cf.unit}`;
                if (cf.unit === 'weeks' && cf.days && cf.days.length > 0) {
                    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                    frequencyDisplay += ` on ${cf.days.map(d => dayNames[d]).join(', ')}`;
                }
            }
            
            // Parse date safely regardless of format
            let billDate;
            if (typeof bill.date === 'string' && bill.date.includes('/')) {
                // Handle DD/MM/YYYY format
                const [day, month, year] = bill.date.split('/').map(Number);
                billDate = new Date(year, month - 1, day);
            } else {
                // Handle ISO format YYYY-MM-DD
                billDate = new Date(bill.date + 'T12:00:00Z');
            }
            
            li.innerHTML = `
                <span class="bill-details">
                    <strong>${bill.name}</strong>
                    <div class="bill-subtext">${billDate.toLocaleDateString()} (${frequencyDisplay})</div>
                </span>
                <span class="bill-amount">${bill.amount.toFixed(2)}</span>
            `;
            
            let deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '<span class="material-icons-round">delete</span>';
            deleteButton.setAttribute('aria-label', 'Delete bill');
            deleteButton.onclick = () => {
                if (confirm(`Are you sure you want to delete "${bill.name}"?`)) {
                    this.masterBills.splice(index, 1);
                    localStorage.setItem('billData', JSON.stringify(this.masterBills));
                    this.updateUI();
                    showSnackbar("Bill deleted");
                }
            };
            
            li.appendChild(deleteButton);
            this.masterListEl.appendChild(li);
        });
    }
    
    // Set the pay cycle parameters
    setPayCycle() {
        if (!this.payCycleStartEl || !this.payCycleFrequencyEl || !this.payCycleIncomeEl) return;
        
        let start = this.payCycleStartEl.value;
        let frequency = this.payCycleFrequencyEl.value;
        let income = parseFloat(this.payCycleIncomeEl.value);
        
        if (start && !isNaN(income)) {
            this.payCycleStart = new Date(start);
            this.payCycleFrequency = frequency;
            this.payCycleIncome = income;
            
            localStorage.setItem('payCycleStart', this.payCycleStart.toISOString());
            localStorage.setItem('payCycleFrequency', this.payCycleFrequency);
            localStorage.setItem('payCycleIncome', this.payCycleIncome.toString());
            
            this.generatePayCycles();
            showSnackbar("Pay cycle updated!");
        } else {
            alert("Please select a start date and enter valid income");
        }
    }

    // Date helper: Normalize a date by removing time components
    normalizeDate(date) {
        const normalized = new Date(date);
        normalized.setHours(12, 0, 0, 0);
        return normalized;
    }
    
    // Determine the date category for recurring bill calculations
    determineDateCategory(originalDate) {
        // Ensure we have a Date object
        const date = (typeof originalDate === 'string') 
            ? new Date(originalDate) 
            : new Date(originalDate);
        
        const day = date.getDate();
        
        // Categorize based on day of month
        if (day === 31) {
            return 'day31';
        } else if (day === 30) {
            return 'day30';
        } else if (day === 29) {
            return 'day29';
        } else if (day === 28) {
            return 'day28';
        } else {
            return 'normal';
        }
    }
    
    // Assigns a date category to a bill
    categorizeBill(bill) {
        // Only add category if it doesn't exist
        if (!bill.dateCategory) {
            const date = (typeof bill.date === 'string') 
                ? new Date(bill.date) 
                : new Date(bill.date);
            
            bill.dateCategory = this.determineDateCategory(date);
        }
        
        return bill;
    }
    
    // Advance a date by days
    advanceDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return this.normalizeDate(result);
    }
    
    // Advance a date by weeks
    advanceWeeks(date, weeks) {
        return this.advanceDays(date, weeks * 7);
    }
    
    // Advance a date by months with category-specific handling
    advanceMonthsByCategory(date, months, category) {
        const originalDate = new Date(date);
        let targetYear = originalDate.getFullYear();
        let targetMonth = originalDate.getMonth() + months;
        
        // Adjust year based on target month
        targetYear += Math.floor(targetMonth / 12);
        targetMonth = targetMonth % 12;
        
        // Get the last day of the target month
        const targetLastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        
        let targetDay;
        
        // Apply category-specific rules
        switch (category) {
            case 'day31':
                // Day 31 bills always go to the last day of the month
                targetDay = targetLastDay;
                break;
                
            case 'day30':
                // Day 30 bills stay on 30th if possible, otherwise last day
                targetDay = (targetLastDay >= 30) ? 30 : targetLastDay;
                break;
                
            case 'day29':
                // Day 29 bills stay on 29th if possible, otherwise last day
                targetDay = (targetLastDay >= 29) ? 29 : targetLastDay;
                break;
                
            case 'day28':
                // Day 28 bills always stay on 28th
                targetDay = 28;
                break;
                
            case 'normal':
            default:
                // Normal bills keep their day unless it exceeds the month's length
                targetDay = Math.min(originalDate.getDate(), targetLastDay);
                break;
        }
        
        // Create new date with normalized time
        return this.normalizeDate(new Date(targetYear, targetMonth, targetDay));
    }

    // Finds the next occurrence of a specific day of the week
    getNextDayOfWeek(date, dayOfWeek) {
        const result = new Date(date);
        result.setDate(result.getDate() + (7 + dayOfWeek - result.getDay()) % 7);
        return this.normalizeDate(result);
    }
    
    // Calculate the next occurrence of a bill based on its frequency
    calculateNextBillDate(bill, currentDate) {
        // Ensure the bill has a date category
        const categorizedBill = this.categorizeBill(bill);
        const current = new Date(currentDate);
        
        switch (categorizedBill.frequency) {
            case 'Monthly':
                return this.advanceMonthsByCategory(current, 1, categorizedBill.dateCategory);
                
            case 'Fortnightly':
                return this.advanceDays(current, 14);
                
            case 'Yearly':
                return this.advanceMonthsByCategory(current, 12, categorizedBill.dateCategory);
                
            case '6-Monthly':
                return this.advanceMonthsByCategory(current, 6, categorizedBill.dateCategory);
                
            case 'Custom':
                if (!categorizedBill.customFrequency) return null;
                
                const cf = categorizedBill.customFrequency;
                
                if (cf.unit === 'days') {
                    return this.advanceDays(current, cf.value);
                } else if (cf.unit === 'weeks') {
                    const nextDate = this.advanceWeeks(current, cf.value);
                    
                    // Handle specific days of week if specified
                    if (cf.days && cf.days.length > 0) {
                        // Find the next matching day of week
                        for (let i = 0; i < 7; i++) {
                            const checkDate = this.advanceDays(nextDate, i);
                            if (cf.days.includes(checkDate.getDay())) {
                                return checkDate;
                            }
                        }
                    }
                    
                    return nextDate;
                } else if (cf.unit === 'months') {
                    return this.advanceMonthsByCategory(current, cf.value, categorizedBill.dateCategory);
                } else if (cf.unit === 'years') {
                    return this.advanceMonthsByCategory(current, cf.value * 12, categorizedBill.dateCategory);
                }
                
                return null;
                
            case 'Every 1 weeks on Mo':
                return this.getNextDayOfWeek(this.advanceDays(current, 1), 1); // 1 = Monday
                
            case 'One-Off':
                return null;
                
            default:
                console.warn(`Unknown frequency: ${categorizedBill.frequency}`);
                return null;
        }
    }

    // Check if a date is within a date range (inclusive)
    isDateInRange(date, startDate, endDate) {
        const normalizedDate = this.normalizeDate(date);
        const normalizedStart = this.normalizeDate(startDate);
        const normalizedEnd = this.normalizeDate(endDate);
        
        return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
    }
    
    // Format a date as YYYY-MM-DD for consistent storage
    formatDateForStorage(date) {
        return date.toISOString().split('T')[0];
    }

    // Generate pay cycles with bills assigned to their correct dates
    generatePayCycles() {
        if (!this.payCyclesEl) return;
        
        this.payCycles = [];
        let cycleStart = this.normalizeDate(new Date(this.payCycleStart));
        
        // Initialize master bills with categories
        this.masterBills.forEach(bill => this.categorizeBill(bill));
        
        // Generate pay cycles
        for (let i = 0; i < 26; i++) {  // Reduced from 29 to 6 cycles for better performance
            let cycleEnd;
            
            // Set cycle end date based on frequency
            if (this.payCycleFrequency === 'Monthly') {
                // For monthly cycles, need to use the categorical approach
                const category = 'normal'; // Normal day handling for cycle dates
                cycleEnd = this.advanceMonthsByCategory(cycleStart, 1, category);
                // Adjust back by 1 day to not overlap with next cycle
                cycleEnd.setDate(cycleEnd.getDate() - 1);
            } else { // Fortnightly
                cycleEnd = new Date(cycleStart);
                cycleEnd.setDate(cycleStart.getDate() + 14 - 1); // -1 to avoid overlap
            }
            
            // Normalize the end date (remove time component)
            cycleEnd = this.normalizeDate(cycleEnd);
            
            let cycleBills = [];
            
            // Process each bill
            this.masterBills.forEach(bill => {
                // Ensure the bill has a category
                const categorizedBill = this.categorizeBill(bill);
                
                // Parse the original bill date with our consistent formatter
                let originalBillDate;
                
                // Check if the date is already in the right format (for bills from master list)
                if (typeof categorizedBill.date === 'string' && categorizedBill.date.includes('/')) {
                    const [day, month, year] = categorizedBill.date.split('/').map(Number);
                    originalBillDate = this.normalizeDate(new Date(year, month - 1, day));
                } else {
                    originalBillDate = this.normalizeDate(new Date(categorizedBill.date));
                }
                
                // For first cycle, start with the original date
                let currentBillDate = new Date(originalBillDate);
                
                // For subsequent cycles, find the right occurrence within this cycle
                if (i > 0) {
                    // Start with the original date
                    currentBillDate = new Date(originalBillDate);
                    
                    // Keep advancing the date until we reach or pass the cycle start
                    while (currentBillDate < cycleStart) {
                        // Use the categorical approach for calculating next date
                        const nextDate = this.calculateNextBillDate(categorizedBill, currentBillDate);
                        
                        if (!nextDate) {
                            // Handle one-off bills
                            if (categorizedBill.frequency === 'One-Off') {
                                // One-off bill should only appear in its specific cycle
                                break;
                            } else {
                                // Unknown frequency or calculation error
                                console.warn(`Could not calculate next date for bill: ${categorizedBill.name}`);
                                break;
                            }
                        }
                        
                        currentBillDate = nextDate;
                    }
                }
                
                // After finding the right occurrence for this cycle, check if it falls within the cycle
                // Use inclusive comparison for both start and end dates
                if (this.isDateInRange(currentBillDate, cycleStart, cycleEnd)) {
                    // Convert to a format safe for storage with consistent timezone handling
                    const formattedDate = this.formatDateForStorage(currentBillDate);
                    
                    cycleBills.push({
                        ...categorizedBill,
                        date: formattedDate,
                        // Store original day for debugging
                        _originalDay: originalBillDate.getDate()
                    });
                }
                
                // For weekly or fortnightly bills, check for additional occurrences within this cycle
                if (categorizedBill.frequency === 'Fortnightly' || 
                    categorizedBill.frequency === 'Every 1 weeks on Mo' || 
                    (categorizedBill.frequency === 'Custom' && categorizedBill.customFrequency && categorizedBill.customFrequency.unit === 'weeks')) {
                    
                    // Use the categorical approach for calculating next date
                    let nextDate = this.calculateNextBillDate(categorizedBill, currentBillDate);
                    
                    // Keep adding occurrences as long as they fall within this cycle
                    while (nextDate && this.isDateInRange(nextDate, cycleStart, cycleEnd)) {
                        const formattedNextDate = this.formatDateForStorage(nextDate);
                        
                        // Add this occurrence to the cycle
                        cycleBills.push({
                            ...categorizedBill,
                            date: formattedNextDate,
                            _originalDay: originalBillDate.getDate()
                        });
                        
                        // Calculate the next occurrence using the categorical approach
                        nextDate = this.calculateNextBillDate(categorizedBill, nextDate);
                    }
                }
            });
            
            // Add this cycle to our pay cycles
            this.payCycles.push({
                cycleStart: cycleStart.toDateString(),
                cycleEnd: cycleEnd.toDateString(),
                bills: cycleBills,
                income: this.payCycleIncome
            });
            
            // Next cycle starts where this one ended plus one day
            cycleStart = this.advanceDays(cycleEnd, 1);
        }
        
        this.updatePayCycles();
    }
    
    // Update the displayed pay cycles
    updatePayCycles() {
        if (!this.payCyclesEl) return;
        
        this.payCyclesEl.innerHTML = "";
        
        this.payCycles.forEach((cycle, index) => {
            // Calculate financial details
            let total = cycle.bills.reduce((sum, bill) => sum + bill.amount, 0);
            let balance = cycle.income - total;
            let balanceClass = balance >= 0 ? 'positive-balance' : 'negative-balance';
            
            // Create pay cycle container
            let cycleContainer = document.createElement("div");
            cycleContainer.className = "pay-cycle";
            
            // Store cycle dates as data attributes for easy access
            cycleContainer.dataset.cycleStart = cycle.cycleStart;
            cycleContainer.dataset.cycleEnd = cycle.cycleEnd;
            
            // Format dates nicely
            const startDate = new Date(cycle.cycleStart);
            const endDate = new Date(cycle.cycleEnd);
            const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedStartDate = startDate.toLocaleDateString(undefined, dateOptions);
            const formattedEndDate = endDate.toLocaleDateString(undefined, dateOptions);
            
            // Create cycle header
            let cycleHeader = document.createElement("div");
            cycleHeader.className = "cycle-header";
            
            // Add content to header
            let headerContent = document.createElement("div");
            headerContent.innerHTML = `
                <h3>Cycle ${index + 1} (${formattedStartDate} - ${formattedEndDate})</h3>
                <div class="financial-info">
                    <p>Income: <span>${cycle.income.toFixed(2)}</span></p>
                    <p>Expenses: <span>${total.toFixed(2)}</span></p>
                    <p class="${balanceClass}">Balance: <span>${balance.toFixed(2)}</span></p>
                </div>
            `;
            
            // Add toggle button with Material icon
            let toggleButton = document.createElement("button");
            toggleButton.className = "toggle-btn cycle-toggle";
            toggleButton.innerHTML = '<span class="material-icons-round">' + (index === 0 ? 'expand_less' : 'expand_more') + '</span>';
            
            if (index !== 0) {
                toggleButton.classList.add("collapsed");
            }
            
            // Add elements to header
            cycleHeader.appendChild(headerContent);
            cycleHeader.appendChild(toggleButton);
            
            // Create cycle content
            let cycleContent = document.createElement("div");
            cycleContent.className = "cycle-content";
            if (index !== 0) {
                cycleContent.classList.add("hidden"); // Only first cycle open by default
            }
            
            // Group bills by their group
            let groupedBills = {};
            cycle.bills.forEach(bill => {
                if (!groupedBills[bill.group]) {
                    groupedBills[bill.group] = [];
                }
                groupedBills[bill.group].push(bill);
            });
            
            // Create a list for each group
            for (let group in groupedBills) {
                let groupTotal = groupedBills[group].reduce((sum, bill) => sum + bill.amount, 0);
                
                let groupHeader = document.createElement("h4");
                groupHeader.innerHTML = `${group} <span>${groupTotal.toFixed(2)}</span>`;
                cycleContent.appendChild(groupHeader);
                
                let ul = document.createElement("ul");
                
                groupedBills[group].forEach(bill => {
                    let li = document.createElement("li");
                    const billDate = new Date(bill.date + 'T12:00:00Z');
                    
                    li.innerHTML = `
                        <span class="bill-details">
                            <strong>${bill.name}</strong>
                            <div class="bill-subtext">${billDate.toLocaleDateString()}</div>
                        </span>
                        <span class="bill-amount">${bill.amount.toFixed(2)}</span>
                    `;
                    ul.appendChild(li);
                });
                
                cycleContent.appendChild(ul);
            }
            
            // Add click handler to toggle button
            toggleButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent header click from triggering
                
                const isHidden = !cycleContent.classList.contains('hidden');
                cycleContent.classList.toggle('hidden');
                
                // Update toggle icon
                const iconElem = this.querySelector('.material-icons-round');
                if (iconElem) {
                    iconElem.textContent = isHidden ? 'expand_more' : 'expand_less';
                }
                
                this.classList.toggle('collapsed');
            });
            
            // Add click handler to header
            cycleHeader.addEventListener('click', function() {
                const isHidden = !cycleContent.classList.contains('hidden');
                cycleContent.classList.toggle('hidden');
                
                // Update toggle icon
                const iconElem = toggleButton.querySelector('.material-icons-round');
                if (iconElem) {
                    iconElem.textContent = isHidden ? 'expand_more' : 'expand_less';
                }
                
                toggleButton.classList.toggle('collapsed');
            });
            
            // Add elements to pay cycle container
            cycleContainer.appendChild(cycleHeader);
            cycleContainer.appendChild(cycleContent);
            
            // Add pay cycle to container
            this.payCyclesEl.appendChild(cycleContainer);
        });
this.renderFinancialChart();
    }


    renderFinancialChart() {
    const chartCanvas = document.getElementById('financial-chart');
    if (!chartCanvas || !window.Chart || this.payCycles.length === 0) return;
    
    // Clear any existing chart
    if (this.financialChart) {
        this.financialChart.destroy();
    }
    
    // Prepare data
    const labels = this.payCycles.map((cycle, index) => `Cycle ${index + 1}`);
    const incomeData = this.payCycles.map(cycle => cycle.income);
    const expensesData = this.payCycles.map(cycle => {
        return cycle.bills.reduce((total, bill) => total + bill.amount, 0);
    });
    const balanceData = this.payCycles.map((cycle, index) => {
        return incomeData[index] - expensesData[index];
    });
    
    // Create chart
    this.financialChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(100, 149, 237, 0.5)',
                    borderColor: 'rgba(100, 149, 237, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Balance',
                    data: balanceData,
                    type: 'line',
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Balance ($)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Financial Overview Across Pay Cycles'
                }
            }
        }
    });
}
}

// ==========================================
// Interest-Free Tracker Class
// ==========================================
class InterestFreeTracker {
    constructor() {
        // DOM Elements
        this.billingPeriodsContainer = document.getElementById('billing-periods');
        this.addPeriodBtn = document.getElementById('add-period-btn');
        this.createCustomPeriodBtn = document.getElementById('create-custom-period-btn');
        this.startDateInput = document.getElementById('start-date');
        this.endDateInput = document.getElementById('end-date');
        this.interestFreeDaysInput = document.getElementById('interest-free-days');
        this.transactionModal = document.getElementById('transaction-modal');
        this.paymentModal = document.getElementById('payment-modal');
        this.editPeriodModal = document.getElementById('edit-period-modal');
        this.transactionForm = document.getElementById('transaction-form');
        this.paymentForm = document.getElementById('payment-form');
        this.editPeriodForm = document.getElementById('edit-period-form');
        this.editStartDateInput = document.getElementById('edit-start-date');
        this.editEndDateInput = document.getElementById('edit-end-date');
        this.editInterestFreeDaysInput = document.getElementById('edit-interest-free-days');
        
        if (!this.billingPeriodsContainer) return; // Exit if elements not found
        
        // Current state
        this.billingPeriods = this.loadBillingPeriods();
        this.currentPeriod = null;

        // Bind methods to ensure correct 'this' context
        this.createCustomBillingPeriod = this.createCustomBillingPeriod.bind(this);
        this.createDefaultBillingPeriod = this.createDefaultBillingPeriod.bind(this);
        this.updateRemainingDays = this.updateRemainingDays.bind(this);
        this.handleEditPeriodFormSubmit = this.handleEditPeriodFormSubmit.bind(this);
        this.handleAddTransaction = this.handleAddTransaction.bind(this);
        
        // Event Listeners
        if (this.addPeriodBtn) {
            this.addPeriodBtn.addEventListener('click', this.createDefaultBillingPeriod);
        }
        
        if (this.createCustomPeriodBtn) {
            this.createCustomPeriodBtn.addEventListener('click', this.createCustomBillingPeriod);
        }
        
        if (this.transactionForm) {
            this.transactionForm.addEventListener('submit', (e) => this.handleAddTransaction(e, 'expense'));
        }
        
        if (this.paymentForm) {
            this.paymentForm.addEventListener('submit', (e) => this.handleAddTransaction(e, 'repayment'));
        }
        
        if (this.editPeriodForm) {
            this.editPeriodForm.addEventListener('submit', this.handleEditPeriodFormSubmit);
        }
        
        document.querySelector('#edit-period-modal .close-modal').addEventListener('click', () => {
            this.editPeriodModal.style.display = 'none';
        });
        
        // Set default dates for custom period creation
        this.setDefaultDates();

        // Before rendering, migrate any existing billing periods
        this.migrateBillingPeriods();
        
        // Migrate transactions to include unique IDs
        this.migrateTransactionsWithIds();

        // Render existing billing periods
        this.renderExistingBillingPeriods();
        
        // Set up automatic updates for the remaining days
        this.updateRemainingDays(); // Initial update
        
        // Update days every minute
        this.dayUpdateInterval = setInterval(() => this.updateRemainingDays(), 60000);
        
        // Update days when tab becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.updateRemainingDays();
            }
        });
    }
    
    migrateBillingPeriods() {
        let migrated = false;
        
        this.billingPeriods.forEach(period => {
            if (!period.interestFreeEndDate) {
                // Calculate the interest-free end date
                const startDateObj = new Date(period.startDate.split('-')[0], 
                                             period.startDate.split('-')[1] - 1, 
                                             period.startDate.split('-')[2]);
                const endDateObj = new Date(startDateObj);
                endDateObj.setDate(startDateObj.getDate() + period.interestFreePeriodDays - 1);
                period.interestFreeEndDate = this.getInputDateFormat(endDateObj);
                migrated = true;
            }
        });
        
        if (migrated) {
            this.saveBillingPeriods();
        }
    }

    migrateTransactionsWithIds() {
        let migrated = false;
        
        this.billingPeriods.forEach(period => {
            if (period.transactions && period.transactions.length > 0) {
                period.transactions.forEach((transaction, index) => {
                    if (!transaction.id) {
                        // Generate a unique ID for the transaction
                        transaction.id = `transaction-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
                        migrated = true;
                    }
                });
            }
        });
        
        if (migrated) {
            this.saveBillingPeriods();
        }
    }

    // Save billing periods to localStorage
    saveBillingPeriods() {
        localStorage.setItem('billingPeriods', JSON.stringify(this.billingPeriods));
    }

    // Load billing periods from localStorage
    loadBillingPeriods() {
        const savedPeriods = localStorage.getItem('billingPeriods');
        return savedPeriods ? JSON.parse(savedPeriods) : [];
    }

    // Render existing billing periods when page loads
    renderExistingBillingPeriods() {
        if (!this.billingPeriodsContainer) return;
        
        this.billingPeriodsContainer.innerHTML = '';
        
        // Ensure we're working with the latest data
        this.billingPeriods = this.loadBillingPeriods();
        
        // Sort periods by start date (newest first)
        const sortedPeriods = [...this.billingPeriods].sort((a, b) => {
            return new Date(b.startDate) - new Date(a.startDate);
        });
        
        sortedPeriods.forEach(period => this.renderBillingPeriod(period));
    }

    setDefaultDates() {
        if (!this.startDateInput || !this.endDateInput) return;
        
        const startDate = new Date();
        startDate.setDate(10);
        this.startDateInput.value = this.getInputDateFormat(startDate);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(9);
        this.endDateInput.value = this.getInputDateFormat(endDate);
    }

    createDefaultBillingPeriod() {
        if (!this.startDateInput || !this.endDateInput || !this.interestFreeDaysInput) return;
        
        this.createBillingPeriod(
            this.startDateInput.value,
            this.endDateInput.value,
            parseInt(this.interestFreeDaysInput.value) || 55
        );
    }

    createCustomBillingPeriod() {
        if (!this.startDateInput || !this.endDateInput || !this.interestFreeDaysInput) return;
        
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;
        const interestFreeDays = parseInt(this.interestFreeDaysInput.value, 10) || 55;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date must be before end date');
            return;
        }
        this.createBillingPeriod(startDate, endDate, interestFreeDays);
    }

    createBillingPeriod(startDate, endDate, interestFreeDays) {
        // Calculate the actual interest-free end date for internal tracking
        const startDateObj = new Date(startDate);
        const interestFreeEndDate = new Date(startDateObj);
        interestFreeEndDate.setDate(startDateObj.getDate() + interestFreeDays - 1); // -1 because day 1 counts
        
        const period = {
            id: `period-${Date.now()}`,
            startDate,
            endDate,
            interestFreePeriodDays: interestFreeDays,
            interestFreeEndDate: this.getInputDateFormat(interestFreeEndDate), // Store the actual interest-free end date
            transactions: []
        };
        
        this.billingPeriods.push(period);
        this.renderBillingPeriod(period);
        this.currentPeriod = period;
        this.saveBillingPeriods();
        this.setDefaultDates();
    }

    deleteBillingPeriod(periodId) {
        // Show confirmation dialog
        if (confirm('Are you sure you want to delete this billing period? This action cannot be undone.')) {
            // Find the period index
            const periodIndex = this.billingPeriods.findIndex(p => p.id === periodId);
            
            if (periodIndex !== -1) {
                // Remove the period from the array
                this.billingPeriods.splice(periodIndex, 1);
                
                // Save updated periods
                this.saveBillingPeriods();
                
                // Re-render the billing periods
                this.renderExistingBillingPeriods();
                
                // Show success message
                showSnackbar("Billing period deleted successfully");
            }
        }
    }
    
    renderBillingPeriod(period) {
        const totalOwing = this.calculateTotalOwing(period);
        const daysRemaining = this.calculateRemainingDays(period);
        const status = daysRemaining > 0 ? 'Active' : 'Expired';
        
        // Get the date objects for display formatting
        const startDateObj = new Date(period.startDate);
        const endDateObj = new Date(period.endDate);
        
        // Display dates in the human-readable format
        const formattedStartDate = this.formatDate(startDateObj);
        const formattedEndDate = this.formatDate(endDateObj);
        
        // Calculate the interest-free end date if it doesn't exist
        let interestFreeEndDate = period.interestFreeEndDate;
        if (!interestFreeEndDate) {
            const endDateObj = new Date(startDateObj);
            endDateObj.setDate(startDateObj.getDate() + period.interestFreePeriodDays - 1);
            interestFreeEndDate = this.getInputDateFormat(endDateObj);
            
            // Save this for future reference
            period.interestFreeEndDate = interestFreeEndDate;
            this.saveBillingPeriods();
        }
        
        // Format the interest-free end date for display
        const interestFreeEndDateObj = new Date(interestFreeEndDate);
        const formattedInterestFreeEndDate = this.formatDate(interestFreeEndDateObj);

        const periodElement = document.createElement('div');
        periodElement.classList.add('billing-period', 'app-card');
        periodElement.dataset.periodId = period.id;

        periodElement.innerHTML = `
            <div class="header-container">
                <h2>
                    Billing Period ${this.billingPeriods.indexOf(period) + 1}
                    <span>${formattedStartDate} to ${formattedEndDate}</span>
                </h2>
                <div class="period-buttons">
                    <button class="edit-period-btn app-btn app-btn-secondary" data-period-id="${period.id}">
                        <span class="edit-icon"></span>
                        Edit
                    </button>
                    <button class="delete-period-btn app-btn app-btn-delete" data-period-id="${period.id}">
                        <span class="material-icons-round">delete</span>
                        Delete
                    </button>
                </div>
            </div>
            <div class="period-info">
                <p>Interest-free until: ${formattedInterestFreeEndDate} (${period.interestFreePeriodDays} days)</p>
            </div>
            <div class="period-details">
                <div class="detail-item">
                    <span class="detail-label">Days Remaining</span>
                    <span class="detail-value">${daysRemaining}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Interest-Free Period</span>
                    <span class="detail-value">${period.interestFreePeriodDays} days</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Owing</span>
                    <span class="detail-value">$${totalOwing.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${status}</span>
                </div>
            </div>
            <div class="period-actions">
                <button class="add-transaction-btn app-btn app-btn-primary" data-period-id="${period.id}">Add Transaction</button>
                <button class="add-repayment-btn app-btn app-btn-primary" data-period-id="${period.id}">Add Repayment</button>
            </div>
            <div class="responsive-table-container">
                <table class="transactions-table">
                    <thead>
                        <tr>
                            <th>DATE</th>
                            <th>DESCRIPTION</th>
                            <th>AMOUNT</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody class="transactions-body">
                        ${this.renderTransactions(period.transactions, period.id)}
                    </tbody>
                </table>
            </div>
        `;


        // Add event listeners for buttons
        periodElement.querySelector('.add-transaction-btn').addEventListener('click', (e) => {
            this.currentPeriod = this.billingPeriods.find(p => p.id === e.currentTarget.dataset.periodId);
            this.openTransactionModal('expense');
        });

        periodElement.querySelector('.add-repayment-btn').addEventListener('click', (e) => {
            this.currentPeriod = this.billingPeriods.find(p => p.id === e.currentTarget.dataset.periodId);
            this.openTransactionModal('repayment');
        });

        periodElement.querySelector('.edit-period-btn').addEventListener('click', (e) => {
            this.openEditPeriodModal(e.currentTarget.dataset.periodId);
        });

        // New event listener for the delete button
        periodElement.querySelector('.delete-period-btn').addEventListener('click', (e) => {
            this.deleteBillingPeriod(e.currentTarget.dataset.periodId);
        });

        this.billingPeriodsContainer.appendChild(periodElement);
        
        // Add delete transaction event listeners
        this.addDeleteEventListeners(period.id);
    }

    renderTransactions(transactions, periodId) {
        if (!transactions || transactions.length === 0) {
            return '';
        }
        
        // Sort transactions by date (newest first)
        const sortedTransactions = [...transactions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        return sortedTransactions.map((transaction) => {
            // Format the transaction date
            const transactionDateObj = new Date(transaction.date);
            const formattedDate = this.formatDate(transactionDateObj);
            
            // Ensure transaction has an ID (for compatibility with old data)
            const transactionId = transaction.id || `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            return `
            <tr>
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td data-type="${transaction.type}">${transaction.type === 'repayment' ? '-$' : '$'}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}</td>
                <td>
                    <button class="delete-transaction-btn app-btn app-btn-delete" data-period-id="${periodId}" data-transaction-id="${transactionId}">
                        <span class="material-icons-round" style="font-size: 14px;">delete</span>
                    </button>
                </td>
            </tr>
        `}).join('');
    }

    calculateRemainingDays(period) {
        // Parse dates using local date parts to ensure consistent timezone handling
        const [startYear, startMonth, startDay] = period.startDate.split('-').map(Number);
        
        // Create start date in local time, months are 0-indexed in JS Date
        const startDate = new Date(startYear, startMonth - 1, startDay);
        
        // Get current date with time set to midnight
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Calculate milliseconds per day
        const msPerDay = 24 * 60 * 60 * 1000;
        
        // Calculate days elapsed (including the start day)
        const daysDiff = Math.floor((today - startDate) / msPerDay);
        
        // Calculate the interest-free days remaining
        const daysRemaining = period.interestFreePeriodDays - daysDiff;
        
        return Math.max(0, daysRemaining);
    }
    
    updateRemainingDays() {
        // Force a full re-render to update the days
        this.renderExistingBillingPeriods();
    }

    calculateTotalOwing(period) {
        return period.transactions.reduce((total, transaction) => {
            return transaction.type === 'repayment'
                ? total - parseFloat(transaction.amount)
                : total + parseFloat(transaction.amount);
        }, 0);
    }

    openTransactionModal(type) {
        if (type === 'expense') {
            this.transactionModal.style.display = 'block';
            document.getElementById('transaction-date').value = this.getInputDateFormat(new Date());
        } else if (type === 'repayment') {
            this.paymentModal.style.display = 'block';
            document.getElementById('payment-date').value = this.getInputDateFormat(new Date());
        }
        
        // Ensure the modal is scrollable on mobile
        document.body.style.overflow = 'hidden';
        document.querySelector(type === 'expense' ? '#transaction-modal' : '#payment-modal').style.overflowY = 'auto';
        document.querySelector(type === 'expense' ? '#transaction-modal' : '#payment-modal').style.webkitOverflowScrolling = 'touch';
    }

    closeModals() {
        this.transactionModal.style.display = 'none';
        this.paymentModal.style.display = 'none';
        this.editPeriodModal.style.display = 'none';
        this.transactionForm.reset();
        this.paymentForm.reset();
        this.editPeriodForm.reset();
        
        // Restore body scrolling
        document.body.style.overflow = '';
    }

    handleAddTransaction(e, type) {
        e.preventDefault();

        if (!this.currentPeriod) {
            return;
        }

        const form = type === 'expense' ? this.transactionForm : this.paymentForm;
        const dateInput = form.querySelector(`#${type === 'expense' ? 'transaction' : 'payment'}-date`);
        const amountInput = form.querySelector(`#${type === 'expense' ? 'transaction' : 'payment'}-amount`);
        const descInput = form.querySelector(`#${type === 'expense' ? 'transaction' : 'payment'}-description`);

        const transaction = {
            id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: dateInput.value,
            amount: amountInput.value,
            description: descInput.value || (type === 'expense' ? 'Transaction' : 'Payment'),
            type: type // 'expense' or 'repayment'
        };

        // Validate date
        const transactionDate = new Date(transaction.date);
        const periodStartDate = new Date(this.currentPeriod.startDate);
        const periodEndDate = new Date(this.currentPeriod.endDate);
        
        if (transactionDate < periodStartDate || transactionDate > periodEndDate) {
            alert(`Date must be between ${this.formatDate(periodStartDate)} and ${this.formatDate(periodEndDate)}`);
            return;
        }

        // Find the period in the array by ID to ensure we're updating the correct one
        const periodIndex = this.billingPeriods.findIndex(p => p.id === this.currentPeriod.id);
        if (periodIndex === -1) {
            return;
        }
        
        // Add transaction to the period in the array
        this.billingPeriods[periodIndex].transactions.push(transaction);
        
        // Update our current period reference
        this.currentPeriod = this.billingPeriods[periodIndex];

        // Save before updating UI
        this.saveBillingPeriods();
        
        // Update UI
        this.updatePeriodDisplay(this.currentPeriod);

        // Close modal
        this.closeModals();
    }

    updatePeriodDisplay(period) {
        const periodElement = document.querySelector(`[data-period-id="${period.id}"]`);
        if (!periodElement) {
            return;
        }
        
        const transactionsBody = periodElement.querySelector('.transactions-body');
        const totalOwingElement = periodElement.querySelector('.detail-item:nth-child(3) .detail-value');
        
        transactionsBody.innerHTML = this.renderTransactions(period.transactions, period.id);
        
        // Add event listeners to the delete buttons
        this.addDeleteEventListeners(period.id);
        
        const totalOwing = this.calculateTotalOwing(period);
        totalOwingElement.textContent = `${totalOwing.toFixed(2)}`;
    }

    addDeleteEventListeners(periodId) {
        const periodElement = document.querySelector(`[data-period-id="${periodId}"]`);
        if (!periodElement) {
            return;
        }
        
        const deleteButtons = periodElement.querySelectorAll('.delete-transaction-btn');
        
        deleteButtons.forEach((btn) => {
            // First remove any existing listeners to avoid duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Now add the event listener to the fresh button with increased touch target size
            newBtn.style.padding = '8px';
            newBtn.style.minWidth = '30px';
            newBtn.style.minHeight = '30px';
            
            newBtn.addEventListener('click', (e) => {
                const periodId = e.currentTarget.dataset.periodId;
                const transactionId = e.currentTarget.dataset.transactionId;
                this.deleteTransaction(periodId, transactionId);
            });
        });
    }

    deleteTransaction(periodId, transactionId) {
        const period = this.billingPeriods.find(p => p.id === periodId);
        if (!period) return;

        if (confirm('Are you sure you want to delete this transaction?')) {
            const transactionIndex = period.transactions.findIndex(t => t.id === transactionId);
            if (transactionIndex !== -1) {
                period.transactions.splice(transactionIndex, 1);
                this.saveBillingPeriods();
                this.updatePeriodDisplay(period);
            }
        }
    }

    // Method to open the edit period modal
    openEditPeriodModal(periodId) {
        this.currentPeriod = this.billingPeriods.find(p => p.id === periodId);
        
        if (!this.currentPeriod) return;
        
        // Populate form fields with current values
        this.editStartDateInput.value = this.currentPeriod.startDate;
        this.editEndDateInput.value = this.currentPeriod.endDate;
        this.editInterestFreeDaysInput.value = this.currentPeriod.interestFreePeriodDays;
        
        // Display the modal
        this.editPeriodModal.style.display = 'block';
        
        // Ensure the modal is scrollable on mobile
        document.body.style.overflow = 'hidden';
        document.querySelector('#edit-period-modal').style.overflowY = 'auto';
        document.querySelector('#edit-period-modal').style.webkitOverflowScrolling = 'touch';
    }

    // Method to handle form submission for editing a period
    handleEditPeriodFormSubmit(e) {
        e.preventDefault();
        
        if (!this.currentPeriod) return;
        
        const startDate = this.editStartDateInput.value;
        const endDate = this.editEndDateInput.value;
        const interestFreeDays = parseInt(this.editInterestFreeDaysInput.value, 10);
        
        if (!startDate || !endDate || isNaN(interestFreeDays)) {
            alert('Please fill out all fields with valid values');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date must be before end date');
            return;
        }
        
        // Calculate the new interest-free end date
        const startDateObj = new Date(startDate);
        const interestFreeEndDate = new Date(startDateObj);
        interestFreeEndDate.setDate(startDateObj.getDate() + interestFreeDays - 1);
        
        // Update the current period
        this.currentPeriod.startDate = startDate;
        this.currentPeriod.endDate = endDate;
        this.currentPeriod.interestFreePeriodDays = interestFreeDays;
        this.currentPeriod.interestFreeEndDate = this.getInputDateFormat(interestFreeEndDate);
        
        // Save and update the UI
        this.saveBillingPeriods();
        this.renderExistingBillingPeriods();
        
        // Close the modal
        this.editPeriodModal.style.display = 'none';
        
        // Restore body scrolling
        document.body.style.overflow = '';
    }

    // Format a date as "9th Jan 2025"
    formatDate(date) {
        const day = date.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        // Add the appropriate suffix to the day
        let suffix = 'th';
        if (day === 1 || day === 21 || day === 31) {
            suffix = 'st';
        } else if (day === 2 || day === 22) {
            suffix = 'nd';
        } else if (day === 3 || day === 23) {
            suffix = 'rd';
        }
        
        return `${day}${suffix} ${month} ${year}`;
    }

    // Get YYYY-MM-DD format for form inputs and localStorage
    getInputDateFormat(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Add at the bottom of the file, outside any classes
function setPayCycle() {
    if (window.billPlanner) {
        window.billPlanner.setPayCycle();
    }
}

function addBill() {
    if (window.billPlanner) {
        window.billPlanner.addBill();
    }
}