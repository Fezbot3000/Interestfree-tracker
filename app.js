(function() {
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
            this.closeModalButtons = document.querySelectorAll('.close-modal');
            this.transactionForm = document.getElementById('transaction-form');
            this.paymentForm = document.getElementById('payment-form');
            this.editPeriodForm = document.getElementById('edit-period-form');
            this.editStartDateInput = document.getElementById('edit-start-date');
            this.editEndDateInput = document.getElementById('edit-end-date');
            this.editInterestFreeDaysInput = document.getElementById('edit-interest-free-days');
            this.exportDataBtn = document.getElementById('export-data-btn');
            this.importDataBtn = document.getElementById('import-data-btn');
            this.importFileInput = document.getElementById('import-file');
            this.themeToggleBtn = document.getElementById('theme-toggle-btn');

            // Current state
            this.billingPeriods = this.loadBillingPeriods();
            this.currentPeriod = null;

            // Bind methods to ensure correct 'this' context
            this.createCustomBillingPeriod = this.createCustomBillingPeriod.bind(this);
            this.createDefaultBillingPeriod = this.createDefaultBillingPeriod.bind(this);
            this.exportData = this.exportData.bind(this);
            this.importData = this.importData.bind(this);
            this.updateRemainingDays = this.updateRemainingDays.bind(this);
            this.handleEditPeriodFormSubmit = this.handleEditPeriodFormSubmit.bind(this);
            this.handleAddTransaction = this.handleAddTransaction.bind(this);
            this.handleThemeToggle = this.handleThemeToggle.bind(this);

            // Set up dark mode from saved preference or system preference
            this.setupThemePreference();

            // Event Listeners
            this.addPeriodBtn.addEventListener('click', this.createDefaultBillingPeriod);
            this.createCustomPeriodBtn.addEventListener('click', this.createCustomBillingPeriod);
            this.closeModalButtons.forEach(btn => btn.addEventListener('click', () => this.closeModals()));
            this.transactionForm.addEventListener('submit', (e) => this.handleAddTransaction(e, 'expense'));
            this.paymentForm.addEventListener('submit', (e) => this.handleAddTransaction(e, 'repayment'));
            this.editPeriodForm.addEventListener('submit', this.handleEditPeriodFormSubmit);
            this.exportDataBtn.addEventListener('click', this.exportData);
            this.importDataBtn.addEventListener('click', () => this.importFileInput.click());
            this.importFileInput.addEventListener('change', this.importData);
            this.themeToggleBtn.addEventListener('click', this.handleThemeToggle);
            document.querySelector('#edit-period-modal .close-modal').addEventListener('click', () => {
                this.editPeriodModal.style.display = 'none';
            });

            // Fix viewport for mobile
            this.setupMobileViewport();
            
            // Set default dates for custom period creation
            this.setDefaultDates();

            // Before rendering, migrate any existing billing periods to include interest-free end date
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
            
            // Listen for system preference changes if supported
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                    // Only apply system preference if no saved preference
                    if (!localStorage.getItem('theme')) {
                        const newTheme = e.matches ? 'dark' : 'light';
                        document.documentElement.setAttribute('data-theme', newTheme);
                        this.updateThemeToggleButton(newTheme);
                    }
                });
            }
        }
        
        setupThemePreference() {
            // Check for saved theme preference or use device preference
            const savedTheme = localStorage.getItem('theme');
            
            // Apply the saved theme or use system preference
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                this.updateThemeToggleButton(savedTheme);
            } else {
                // Check system preference
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    this.updateThemeToggleButton('dark');
                }
            }
        }
        
        // Handle theme toggle button click
        handleThemeToggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Update HTML attribute
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Save preference
            localStorage.setItem('theme', newTheme);
            
            // Update button
            this.updateThemeToggleButton(newTheme);
        }
        
        // Update theme toggle button text and icon
        updateThemeToggleButton(theme) {
            if (theme === 'dark') {
                this.themeToggleBtn.innerHTML = '<span class="theme-icon light-icon"></span>Light Mode';
            } else {
                this.themeToggleBtn.innerHTML = '<span class="theme-icon dark-icon"></span>Dark Mode';
            }
        }
        
        setupMobileViewport() {
            // Check if a viewport meta tag already exists
            let viewport = document.querySelector('meta[name="viewport"]');
            
            // If it doesn't exist, create it
            if (!viewport) {
                viewport = document.createElement('meta');
                viewport.name = 'viewport';
                document.head.appendChild(viewport);
            }
            
            // Set the viewport content to ensure proper mobile scaling and scrolling
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes';
            
            // Add touch-action styles to ensure scrolling works properly on mobile
            const style = document.createElement('style');
            style.textContent = `
                body, html {
                    height: 100%;
                    width: 100%;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    touch-action: pan-y;
                }
                .transactions-table {
                    max-width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                @media (max-width: 767px) {
                    .billing-period {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    .period-details {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                    }
                    .detail-item {
                        flex: 0 0 calc(50% - 10px);
                        margin-bottom: 10px;
                    }
                    .transactions-table {
                        display: block;
                        width: 100%;
                    }
                    .transactions-table th, 
                    .transactions-table td {
                        padding: 8px 4px;
                        font-size: 14px;
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Prevent double-tap zoom on mobile devices
            document.addEventListener('touchend', function(event) {
                // Don't prevent default for form elements that need focus
                if (event.target.tagName === 'INPUT' || 
                    event.target.tagName === 'SELECT' || 
                    event.target.tagName === 'TEXTAREA' || 
                    event.target.tagName === 'BUTTON') {
                    return;
                }
                
                // For everything else, prevent the default if it's a double-tap
                const now = Date.now();
                const lastTouch = this.lastTouchEnd || 0;
                this.lastTouchEnd = now;
                
                if (now - lastTouch < 300) {
                    event.preventDefault();
                }
            }, false);
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
            const startDate = new Date();
            startDate.setDate(10);
            this.startDateInput.value = this.getInputDateFormat(startDate);

            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(9);
            this.endDateInput.value = this.getInputDateFormat(endDate);
        }

        createDefaultBillingPeriod() {
            this.createBillingPeriod(
                this.startDateInput.value,
                this.endDateInput.value,
                parseInt(this.interestFreeDaysInput.value) || 55
            );
        }

        createCustomBillingPeriod() {
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
            periodElement.classList.add('billing-period');
            periodElement.dataset.periodId = period.id;

            periodElement.innerHTML = `
                <div class="header-container">
                    <h2>
                        Billing Period ${this.billingPeriods.indexOf(period) + 1}
                        <span>${formattedStartDate} to ${formattedEndDate}</span>
                    </h2>
                    <button class="edit-period-btn" data-period-id="${period.id}">
                        <span class="edit-icon"></span>
                        Edit
                    </button>
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
                    <button class="add-transaction-btn" data-period-id="${period.id}">Add Transaction</button>
                    <button class="add-repayment-btn" data-period-id="${period.id}">Add Repayment</button>
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
                        <button class="delete-transaction-btn" data-period-id="${periodId}" data-transaction-id="${transactionId}">
                            <span class="delete-icon">×</span>
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

        exportData() {
            const data = JSON.stringify(this.billingPeriods, null, 2);
            this.downloadFile(data, 'interest-free-tracker-data.json', 'application/json');
        }
        
        importData(event) {
            const file = event.target.files[0];
            if (!file) return;
        
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
        
                    // Check if importedData is an array (direct billing periods)
                    // or an object with billingPeriods property
                    const billingPeriods = Array.isArray(importedData) 
                        ? importedData 
                        : importedData.billingPeriods;
        
                    // Validate the imported data structure
                    if (!Array.isArray(billingPeriods)) {
                        throw new Error('Imported data is not in the correct format');
                    }
        
                    // Check if each period has the required properties
                    for (const period of billingPeriods) {
                        if (!period.id || !period.startDate || !period.endDate ||
                            !period.interestFreePeriodDays || !Array.isArray(period.transactions)) {
                            throw new Error('One or more periods are missing required properties');
                        }
                    }
        
                    if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                        this.billingPeriods = billingPeriods;
        
                        // Ensure all transactions have IDs
                        this.migrateTransactionsWithIds();
        
                        this.saveBillingPeriods();
                        this.renderExistingBillingPeriods();
                        alert('Data imported successfully!');
                    }
                } catch (error) {
                    alert(`Error importing data: ${error.message}`);
                }
        
                // Clear the file input so the same file can be selected again
                event.target.value = '';
            };
        
            reader.onerror = () => {
                alert('Error reading the file');
                event.target.value = '';
            };
        
            reader.readAsText(file);
        }

        downloadFile(content, fileName, contentType) {
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

        formatDate(date) {
            // Format a date as "9th Jan 2025"
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

        // Parse a formatted date back to a Date object
        parseFormattedDate(formattedDate) {
            // Parse a date like "9th Jan 2025" back to a Date object
            const parts = formattedDate.match(/(\d+)(st|nd|rd|th)\s+([A-Za-z]+)\s+(\d+)/);
            if (!parts) return null;
            
            const day = parseInt(parts[1], 10);
            const monthName = parts[3];
            const year = parseInt(parts[4], 10);
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames.findIndex(m => m === monthName);
            
            if (month === -1) return null;
            
            return new Date(year, month, day);
        }
    }

    // Initialize the tracker when the page loads
    document.addEventListener('DOMContentLoaded', () => {
        window.interestFreeTracker = new InterestFreeTracker();
        
        // Add additional event listener for mobile viewport resizing
        window.addEventListener('resize', () => {
            // Force relayout to help with scrolling issues
            document.body.style.display = 'none';
            setTimeout(() => {
                document.body.style.display = '';
            }, 5);
        });
        
        // Add extra CSS for mobile-friendly modals
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            @media (max-width: 767px) {
                .modal {
                    padding: 10px;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    max-height: 90vh;
                }
                .modal-content {
                    width: 95%;
                    margin: 5% auto;
                    padding: 15px;
                }
                input, select, button {
                    font-size: 16px !important; /* Prevents iOS zoom on focus */
                    min-height: 44px;
                    margin-bottom: 10px;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .close-modal {
                    font-size: 24px;
                    padding: 8px;
                }
            }
        `;
        document.head.appendChild(modalStyle);
    });
})();
