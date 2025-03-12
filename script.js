// PART 1: Initialization and Data Management

// Global variables and state management
let billingPeriods = [];
let currentPeriod = null;

// Save billing periods to localStorage
function saveBillingPeriods() {
    localStorage.setItem('billingPeriods', JSON.stringify(billingPeriods));
}

// Load billing periods from localStorage
function loadBillingPeriods() {
    const savedPeriods = localStorage.getItem('billingPeriods');
    return savedPeriods ? JSON.parse(savedPeriods) : [];
}

// Trigger file input dialog for import
function triggerImportDialog() {
    document.getElementById('importFileInput').click();
}

// Export data to a JSON file
function exportData() {
    // Create data object with billing periods
    const exportData = {
        billingPeriods: billingPeriods
    };

    // Convert to JSON string
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // Create a Blob with the data
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a temporary link element
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    
    // Generate filename with current date
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    a.download = `interest_free_tracker_export_${dateStr}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    
    showSnackbar('Data exported successfully!');
}

// Import data from a JSON file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // Parse the JSON data
            let importedData = JSON.parse(e.target.result);
            
            // Check if the data is already an array (your current file format)
            // or if it has a billingPeriods property (the expected format)
            let periodsArray;
            
            if (Array.isArray(importedData)) {
                // If it's already an array, use it directly
                periodsArray = importedData;
            } else if (importedData.billingPeriods && Array.isArray(importedData.billingPeriods)) {
                // If it has a billingPeriods property, use that
                periodsArray = importedData.billingPeriods;
            } else {
                throw new Error('Invalid data format: Missing billing periods');
            }
            
            // Confirm import
            if (confirm('This will replace your current data. Are you sure you want to proceed?')) {
                // Update billing periods
                billingPeriods = periodsArray;
                
                // Save to localStorage
                saveBillingPeriods();
                
                // Reload the billing periods
                renderBillingPeriods();
                
                // Recreate financial chart
                createFinancialChart();
                
                showSnackbar('Data imported successfully!');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
    
    // Clear the file input so the same file can be selected again
    event.target.value = '';
}

// Show a temporary snackbar message
function showSnackbar(message) {
    // Get snackbar element
    let snackbar = document.getElementById('snackbar');
    
    // Set message and show
    snackbar.textContent = message;
    snackbar.classList.remove('hidden');
    snackbar.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(function() {
        snackbar.classList.remove('show');
        setTimeout(() => {
            snackbar.classList.add('hidden');
        }, 500);
    }, 3000);
}

// Set up event listeners for import/export functionality
function setupImportExportListeners() {
    const exportBtn = document.getElementById('exportDataBtn');
    const importBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (importBtn) importBtn.addEventListener('click', triggerImportDialog);
    if (importFileInput) importFileInput.addEventListener('change', importData);
}


// PART 2: Date and Calculation Utilities

/**
 * Normalizes a date by removing time components
 * @param {Date} date - The date to normalize
 * @returns {Date} - Normalized date set to 12:00:00
 */
function normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(12, 0, 0, 0);
    return normalized;
}

/**
 * Calculates the remaining days in an interest-free period
 * @param {Object} period - The billing period object
 * @returns {number} - Remaining interest-free days
 */
function calculateRemainingDays(period) {
    const startDate = new Date(period.startDate);
    const interestFreeEndDate = new Date(period.interestFreeEndDate);
    const today = new Date();
    
    // Normalize dates to compare only date parts
    const normalizedToday = normalizeDate(today);
    const normalizedInterestFreeEnd = normalizeDate(interestFreeEndDate);
    
    // Calculate days remaining
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysRemaining = Math.ceil((normalizedInterestFreeEnd - normalizedToday) / millisecondsPerDay);
    
    return Math.max(0, daysRemaining);
}

/**
 * Calculates total transactions for a billing period
 * @param {Object} period - The billing period object
 * @returns {number} - Total transaction amount
 */
function calculateTotalTransactions(period) {
    if (!period.transactions || period.transactions.length === 0) return 0;
    
    return period.transactions.reduce((total, transaction) => {
        return transaction.type === 'expense' 
            ? total + parseFloat(transaction.amount) 
            : total - parseFloat(transaction.amount);
    }, 0);
}

/**
 * Formats a date to a human-readable string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Validates if a date is within a billing period
 * @param {Date} date - The date to check
 * @param {Object} period - The billing period object
 * @returns {boolean} - True if date is within the period
 */
function isDateInPeriod(date, period) {
    const normalizedDate = normalizeDate(date);
    const periodStart = normalizeDate(new Date(period.startDate));
    const periodEnd = normalizeDate(new Date(period.endDate));
    
    return normalizedDate >= periodStart && normalizedDate <= periodEnd;
}

/**
 * Generates a unique identifier for billing periods and transactions
 * @returns {string} - Unique identifier
 */
function generateUniqueId() {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculates the financial status of a billing period
 * @param {Object} period - The billing period object
 * @returns {Object} - Financial status details
 */
function calculatePeriodFinancials(period) {
    const remainingDays = calculateRemainingDays(period);
    const totalTransactions = calculateTotalTransactions(period);
    
    return {
        remainingDays,
        totalTransactions,
        status: remainingDays > 0 ? 'Active' : 'Expired'
    };
}

// PART 3: UI Interaction and Rendering

/**
 * Format date to match the specific design requirements
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatPeriodDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Render transactions for a specific billing period
 * @param {Array} transactions - List of transactions
 * @returns {string} HTML string of transactions
 */
function renderTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
        return `
            <tr>
                <td colspan="4" class="text-center text-light-textSecondary dark:text-dark-textSecondary py-4">
                    No transactions
                </td>
            </tr>
        `;
    }

    return transactions.map(transaction => {
        const transactionDate = new Date(transaction.date);
        const formattedDate = transactionDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Determine color and sign based on transaction type
        const isRepayment = transaction.type === 'repayment';
        const amountClass = isRepayment ? 'text-accent-green' : 'text-accent-red';
        const amountSign = isRepayment ? '-' : '';

        return `
            <tr class="hover:bg-light-background/30 dark:hover:bg-dark-background/30 transition-colors">
                <td class="p-3">${formattedDate}</td>
                <td class="p-3">${transaction.description}</td>
                <td class="p-3 ${amountClass} text-right whitespace-nowrap">
                    ${isRepayment ? '-' : ''}$${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                </td>
                <td class="p-3 text-center">
                    <button class="delete-transaction w-10 h-10 flex items-center justify-center rounded-full bg-accent-red/10 text-accent-red dark:bg-accent-red/20 dark:text-accent-red hover:bg-accent-red/20 transition-colors mx-auto">
                        <span class="material-icons-round">delete</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Render billing periods to the UI
 */
function renderBillingPeriods() {
    const container = document.getElementById('billingPeriodsList');
    container.innerHTML = ''; // Clear existing content
    
    // Load the latest billing periods
    billingPeriods = loadBillingPeriods();
    
    // Sort periods by start date (newest first)
    const sortedPeriods = billingPeriods.sort((a, b) => 
        new Date(b.startDate) - new Date(a.startDate)
    );
    
    sortedPeriods.forEach((period, index) => {
        // Calculate financial details
        const startDate = new Date(period.startDate);
        const endDate = new Date(period.endDate);
        const interestFreeEndDate = new Date(period.interestFreeEndDate);
        const remainingDays = calculateRemainingDays(period);
        const totalOwing = calculateTotalTransactions(period);
        
        const periodElement = document.createElement('div');
        periodElement.classList.add(
            'bg-light-surface', 
            'dark:bg-dark-surface', 
            'rounded-xl', 
            'p-6', 
            'shadow-md',
            'dark:shadow-lg',
            'mb-6'
        );
        
        periodElement.innerHTML = `
	    <div class="flex justify-between items-center mb-4">
	        <h2 class="text-xl font-semibold">
	            Billing Period ${index + 1}: 
	            ${formatPeriodDate(startDate)} - ${formatPeriodDate(endDate)}
	            <button class="ml-2 edit-period hover:bg-ui-input dark:hover:bg-dark-card rounded-full p-1">
	                <span class="material-icons-round text-base">edit</span>
	            </button>
	        </h2>
	        <span class="text-sm font-medium px-3 py-1 rounded-full ${remainingDays > 0 ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}">
	            ${remainingDays > 0 ? 'Active' : 'Expired'}
	        </span>
	    </div>
	    
	    <div class="bg-light-surface/50 dark:bg-dark-surface/50 rounded-lg p-4 mb-4 border border-ui-divider dark:border-dark-card">
	        <p class="text-light-textSecondary dark:text-dark-textSecondary font-medium">
	            Interest-free until: ${formatPeriodDate(interestFreeEndDate)} 
				(${period.interestFreePeriodDays || 'undefined'} days)
	        </p>
	    </div>
	    
	    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
	        <div class="bg-light-surface/80 dark:bg-dark-card/80 p-4 rounded-lg border border-ui-divider dark:border-dark-card shadow-sm">
	            <p class="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">Days Remaining</p>
	            <p class="text-lg font-semibold">${remainingDays}</p>
	        </div>
	        <div class="bg-light-surface/80 dark:bg-dark-card/80 p-4 rounded-lg border border-ui-divider dark:border-dark-card shadow-sm">
	            <p class="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">Interest-Free Period</p>
	            <p class="text-lg font-semibold">${period.interestFreePeriodDays || 'undefined'} days</p>
	        </div>
	        <div class="bg-light-surface/80 dark:bg-dark-card/80 p-4 rounded-lg border border-ui-divider dark:border-dark-card shadow-sm">
	            <p class="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">Total Owing</p>
	            <p class="text-lg font-semibold ${totalOwing >= 0 ? 'text-accent-green' : 'text-accent-red'}">
	                $${Math.abs(totalOwing).toFixed(2)}
	            </p>
	        </div>
	        <div class="bg-light-surface/80 dark:bg-dark-card/80 p-4 rounded-lg border border-ui-divider dark:border-dark-card shadow-sm">
	            <p class="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">Status</p>
	            <p class="text-lg font-semibold ${remainingDays > 0 ? 'text-accent-green' : 'text-accent-red'}">
	                ${remainingDays > 0 ? 'Active' : 'Expired'}
	            </p>
	        </div>
	    </div>
	    
	    <div class="flex space-x-4 mb-4">
	        <button onclick="openTransactionModal('${period.id}', 'expense')" class="h-10 px-4 rounded-xl bg-primary text-white font-medium flex items-center justify-center transition-all hover:scale-105 ease-in-out">
	            <span class="material-icons-round mr-1 text-sm">add</span> Add Transaction
	        </button>
	        <button onclick="openTransactionModal('${period.id}', 'repayment')" class="h-10 px-4 rounded-xl bg-ui-input dark:bg-dark-card text-light-text dark:text-dark-text font-medium flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-dark-surface ease-in-out">
	            <span class="material-icons-round mr-1 text-sm">payments</span> Add Repayment
	        </button>
	    </div>
	    
	    <div class="overflow-x-auto bg-light-surface/80 dark:bg-dark-card/80 rounded-lg border border-ui-divider dark:border-dark-card p-2">
	        <table class="w-full text-sm">
	            <thead>
				    <tr class="bg-light-surface/90 dark:bg-dark-surface/90 rounded-lg">
				        <th class="p-3 text-left font-medium">DATE</th>
				        <th class="p-3 text-left font-medium">DESCRIPTION</th>
				        <th class="p-3 text-right font-medium">AMOUNT</th>
				        <th class="p-3 text-center font-medium">ACTIONS</th>
				    </tr>
				</thead>
	            <tbody class="divide-y divide-ui-divider dark:divide-dark-card">
	                ${renderTransactions(period.transactions)}
	            </tbody>
	        </table>
	    </div>
	`;
        
        container.appendChild(periodElement);
    });
}

// PART 4: Initialization and Theme Management

// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update toggle button text and icon
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (theme === 'dark') {
        themeIcon.textContent = 'light_mode';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = 'dark_mode';
        themeText.textContent = 'Dark Mode';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Recreate financial chart with new theme
    createFinancialChart();
}

/**
 * Create the financial overview chart
 */
function createFinancialChart() {
    const chartElement = document.getElementById('financialChart');
    if (!chartElement) return null;
    
    const ctx = chartElement.getContext('2d');
    
    // Check if billing periods exist
    if (!billingPeriods || billingPeriods.length === 0) {
        return null;
    }
    
    // Extract data from billing periods
    const labels = billingPeriods.slice(0, 12).map((period, index) => `Period ${index + 1}`);
    const incomeData = billingPeriods.slice(0, 12).map(period => 
        period.transactions
            .filter(t => t.type === 'repayment')
            .reduce((sum, t) => sum + t.amount, 0)
    );
    const expensesData = billingPeriods.slice(0, 12).map(period => 
        period.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
    );
    const balanceData = billingPeriods.slice(0, 12).map((period, index) => 
        incomeData[index] - expensesData[index]
    );
    
    // Create chart with new color palette
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(107, 76, 230, 0.7)', // Primary purple
                    borderColor: 'rgb(107, 76, 230)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    backgroundColor: 'rgba(255, 59, 48, 0.7)', // Accent red
                    borderColor: 'rgb(255, 59, 48)',
                    borderWidth: 1
                },
                {
                    label: 'Balance',
                    data: balanceData,
                    type: 'line',
                    fill: false,
                    backgroundColor: 'rgba(52, 199, 89, 0.7)', // Accent green
                    borderColor: 'rgb(52, 199, 89)',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Billing Periods'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Financial Overview Across Billing Periods',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: 'USD' 
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    
    return chart;
}

// Main initialization function
function initializeApp() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Load billing periods
    billingPeriods = loadBillingPeriods();

    // Render billing periods
    renderBillingPeriods();

    // Set up event listeners
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    // Set up import/export listeners
	setupImportExportListeners();

    // Add default button handlers
	const addDefaultBtn = document.getElementById('addDefaultPeriodBtn');
	if (addDefaultBtn) {
	    addDefaultBtn.addEventListener('click', () => {
	        const startDate = document.getElementById('startDate').value;
	        const endDate = document.getElementById('endDate').value;
	        const interestFreeDays = parseInt(document.getElementById('interestFreeDays').value);
	        
	        if (startDate && endDate && interestFreeDays) {
	            addBillingPeriod(startDate, endDate, interestFreeDays);
	        } else {
	            showSnackbar('Please fill in all fields');
	        }
	    });
	}

    // Create initial financial chart
    createFinancialChart();
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);