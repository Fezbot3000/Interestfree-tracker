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
            this.handleAddTransaction = this.handleAddTransaction.bind(this); // Added binding

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
            document.querySelector('#edit-period-modal .close-modal').addEventListener('click', () => {
                this.editPeriodModal.style.display = 'none';
            });

            // Set default dates for custom period creation
            this.setDefaultDates();

            // Before rendering, migrate any existing billing periods to include interest-free end date
            this.migrateBillingPeriods();

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
            
            // Log debug information
            console.log('InterestFreeTracker initialized');
            console.log('Current date:', new Date().toLocaleString());
            console.log('Billing periods:', this.billingPeriods);
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
                console.log('Migrated billing periods to include interest-free end dates');
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
            
            // Force recalculation of all remaining days
            this.billingPeriods.forEach(period => {
                const daysRemaining = this.calculateRemainingDays(period);
                console.log(`Period ${period.startDate}: ${daysRemaining} days remaining`);
            });
            
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
            
            console.log(`Creating period: ${startDate} to ${endDate}`);
            console.log(`Interest-free period: ${interestFreeDays} days (until ${period.interestFreeEndDate})`);
            
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
                <table class="transactions-table">
                    <thead>
                        <tr>
                            <th>DATE</th>
                            <th>DESCRIPTION</th>
                            <th>AMOUNT</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody class="transactions-body">
                        ${this.renderTransactions(period.transactions, period.id)}
                    </tbody>
                </table>
            `;

            // Add event listeners for buttons - FIXED: using e.currentTarget
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
            
            // Log debug information
            console.log(`Rendered period: ${period.id}`);
            console.log(`- Start date: ${formattedStartDate}`);
            console.log(`- End date: ${formattedEndDate}`);
            console.log(`- Interest-free days: ${period.interestFreePeriodDays}`);
            console.log(`- Interest-free until: ${formattedInterestFreeEndDate}`);
            console.log(`- Days remaining: ${daysRemaining}`);
        }

        renderTransactions(transactions, periodId) {
            if (!transactions || transactions.length === 0) {
                console.log(`No transactions to render for period ${periodId}`);
                return '';
            }
            
            console.log(`Rendering ${transactions.length} transactions for period ${periodId}`);
            
            // Sort transactions by date (newest first)
            const sortedTransactions = [...transactions].sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            return sortedTransactions.map((transaction, index) => {
                // Format the transaction date
                const transactionDateObj = new Date(transaction.date);
                const formattedDate = this.formatDate(transactionDateObj);
                
                console.log(`Rendering transaction: ${index}, date: ${formattedDate}, amount: ${transaction.amount}`);
                
                return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${transaction.description}</td>
                    <td data-type="${transaction.type}">${transaction.type === 'repayment' ? '-$' : '$'}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}</td>
                    <td>
                        <button class="delete-transaction-btn" data-period-id="${periodId}" data-transaction-index="${index}">
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
            
            console.log('--------- Date calculations ---------');
            console.log(`Start date: ${startDate.toDateString()}`);
            console.log(`Today: ${today.toDateString()}`);
            console.log(`Days elapsed: ${daysDiff}`);
            console.log(`Interest-free period: ${period.interestFreePeriodDays} days`);
            console.log(`Days remaining: ${daysRemaining}`);
            console.log('------------------------------------');
            
            return Math.max(0, daysRemaining);
        }
        
        updateRemainingDays() {
            const now = new Date();
            console.log(`Updating days remaining at: ${now.toLocaleString()}`);
            
            // Force a full re-render instead of trying to update existing elements
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
        }

        closeModals() {
            this.transactionModal.style.display = 'none';
            this.paymentModal.style.display = 'none';
            this.editPeriodModal.style.display = 'none';
            this.transactionForm.reset();
            this.paymentForm.reset();
            this.editPeriodForm.reset();
        }

        handleAddTransaction(e, type) {
            e.preventDefault();
            console.log("handleAddTransaction called with type:", type);

            if (!this.currentPeriod) {
                console.log("No current period selected");
                return;
            }

            const form = type === 'expense' ? this.transactionForm : this.paymentForm;
            const dateInput = form.querySelector(`#${type === 'expense' ? 'transaction' : 'payment'}-date`);
            const amountInput = form.querySelector(`#${type === 'expense' ? 'transaction' : 'payment'}-amount`);
            const descInput = form.querySelector(`#${type === 'expense' ? 'transaction' : 'payment'}-description`);

            const transaction = {
                date: dateInput.value,
                amount: amountInput.value,
                description: descInput.value || (type === 'expense' ? 'Transaction' : 'Payment'),
                type: type // 'expense' or 'repayment'
            };
            
            console.log("Transaction data:", transaction);

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
                console.error("Could not find period in billingPeriods array");
                return;
            }
            
            // Add transaction to the period in the array
            this.billingPeriods[periodIndex].transactions.push(transaction);
            
            // Update our current period reference
            this.currentPeriod = this.billingPeriods[periodIndex];
            
            console.log("Added transaction to period:", this.currentPeriod.id);
            console.log("Updated transactions:", this.currentPeriod.transactions);

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
                console.log(`Period element not found for ID: ${period.id}`);
                return;
            }
            
            console.log(`Updating display for period: ${period.id}`);
            console.log(`Current transactions:`, period.transactions);
            
            const transactionsBody = periodElement.querySelector('.transactions-body');
            const totalOwingElement = periodElement.querySelector('.detail-item:nth-child(3) .detail-value');
            
            // This line is causing the issue - it's replacing all transactions
            // instead of just adding the new one
            transactionsBody.innerHTML = this.renderTransactions(period.transactions, period.id);
            
            // Add event listeners to the delete buttons
            this.addDeleteEventListeners(period.id);
            
            const totalOwing = this.calculateTotalOwing(period);
            totalOwingElement.textContent = `$${totalOwing.toFixed(2)}`;
            
            console.log(`Updated total owing: $${totalOwing.toFixed(2)}`);
        }

        addDeleteEventListeners(periodId) {
            const periodElement = document.querySelector(`[data-period-id="${periodId}"]`);
            if (!periodElement) {
                console.log(`Period element not found for ID: ${periodId} when adding delete listeners`);
                return;
            }
            
            const deleteButtons = periodElement.querySelectorAll('.delete-transaction-btn');
            console.log(`Found ${deleteButtons.length} delete buttons for period ${periodId}`);
            
            deleteButtons.forEach((btn, index) => {
                // First remove any existing listeners to avoid duplicates
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Now add the event listener to the fresh button
                newBtn.addEventListener('click', (e) => {
                    console.log("Delete button clicked");
                    const periodId = e.currentTarget.dataset.periodId;
                    const transactionIndex = parseInt(e.currentTarget.dataset.transactionIndex);
                    console.log(`Deleting transaction at index ${transactionIndex} from period ${periodId}`);
                    this.deleteTransaction(periodId, transactionIndex);
                });
            });
        }

        deleteTransaction(periodId, transactionIndex) {
            const period = this.billingPeriods.find(p => p.id === periodId);
            if (!period) return;

            if (confirm('Are you sure you want to delete this transaction?')) {
                period.transactions.splice(transactionIndex, 1);
                this.updatePeriodDisplay(period);
                this.saveBillingPeriods();
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
            
            console.log(`Updated period: ${this.currentPeriod.id}`);
            console.log(`- New start date: ${startDate} (${this.formatDate(new Date(startDate))})`);
            console.log(`- New end date: ${endDate} (${this.formatDate(new Date(endDate))})`);
            console.log(`- New interest-free days: ${interestFreeDays}`);
            console.log(`- New interest-free end date: ${this.currentPeriod.interestFreeEndDate} (${this.formatDate(interestFreeEndDate)})`);
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
                    
                    // Validate the imported data structure
                    if (!Array.isArray(importedData)) {
                        throw new Error('Imported data is not in the correct format');
                    }
                    
                    // Check if each period has the required properties
                    for (const period of importedData) {
                        if (!period.id || !period.startDate || !period.endDate || 
                            !period.interestFreePeriodDays || !Array.isArray(period.transactions)) {
                            throw new Error('One or more periods are missing required properties');
                        }
                    }
                    
                    if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                        this.billingPeriods = importedData;
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
        
        // Add a script to sort transactions after page loads
        setTimeout(() => {
            // Sort all transaction tables by date (newest first)
            const tables = document.querySelectorAll('.transactions-table');
            tables.forEach(table => {
                const tbody = table.querySelector('.transactions-body');
                if (!tbody) return;
                
                const rows = Array.from(tbody.querySelectorAll('tr'));
                if (rows.length <= 1) return;
                
                // Sort rows by date
                rows.sort((a, b) => {
                    // Helper function to parse dates in format "22nd Feb 2025"
                    const parseCustomDate = (dateText) => {
                        const parts = dateText.match(/(\d+)(?:st|nd|rd|th)\s+([A-Za-z]+)\s+(\d+)/);
                        if (!parts) return new Date();
                        
                        const day = parseInt(parts[1], 10);
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const month = monthNames.indexOf(parts[2]);
                        const year = parseInt(parts[3], 10);
                        
                        return new Date(year, month, day);
                    };
                    
                    // Get date from first cell in each row
                    const dateA = parseCustomDate(a.cells[0].textContent.trim());
                    const dateB = parseCustomDate(b.cells[0].textContent.trim());
                    
                    // Sort newest first
                    return dateB - dateA;
                });
                
                // Remove existing rows
                while (tbody.firstChild) {
                    tbody.removeChild(tbody.firstChild);
                }
                
                // Add sorted rows
                rows.forEach(row => tbody.appendChild(row));
            });
        }, 1000);
    });
})();