// Offline.js - Handles offline functionality and installation

let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const offlineNotification = document.getElementById('offlineNotification');

// Check if the app is already installed
window.addEventListener('load', () => {
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    console.log('App is running in standalone mode (installed)');
  } else {
    // Show install prompt for iOS only after a short delay
    if (isIOS()) {
      setTimeout(() => {
        showInstallPrompt();
      }, 3000);
    }
  }
  
  // Register service worker update handlers
  registerServiceWorkerUpdateHandlers();
});

// Listen for beforeinstallprompt event to handle PWA installation
// This works on Android and some desktop browsers, not iOS
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default browser install prompt
  e.preventDefault();
  // Save the event for later use
  deferredPrompt = e;
  
  // Show custom install button/prompt for non-iOS
  if (!isIOS()) {
    showInstallPrompt();
  }
});

// Function to show installation prompt
function showInstallPrompt() {
  if (installPrompt) {
    installPrompt.style.display = 'flex';
  }
}

// Function to hide installation prompt
function hideInstallPrompt() {
  if (installPrompt) {
    installPrompt.style.display = 'none';
    // Save user's choice to not show again in this session
    localStorage.setItem('installPromptDismissed', 'true');
  }
}

// Function to check if the device is running iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Listen for online/offline events
window.addEventListener('online', handleOnlineStatus);
window.addEventListener('offline', handleOnlineStatus);

// Function to handle changes in online/offline status
function handleOnlineStatus() {
  if (navigator.onLine) {
    hideOfflineNotification();
    console.log('App is online');
    
    // Sync any pending changes with the server here
    // (if you have a backend)
  } else {
    showOfflineNotification();
    console.log('App is offline');
  }
}

// Show offline notification
function showOfflineNotification() {
  if (offlineNotification) {
    offlineNotification.style.display = 'block';
  }
}

// Hide offline notification
function hideOfflineNotification() {
  if (offlineNotification) {
    offlineNotification.style.display = 'none';
  }
}

// Initial check for online status
handleOnlineStatus();

// Function to handle service worker updates
function registerServiceWorkerUpdateHandlers() {
  if ('serviceWorker' in navigator) {
    // Listen for new service worker installation
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker activated');
      
      // You could show a notification about the update here
      // or reload the page if desired
    });
    
    // Check for service worker updates periodically
    setInterval(() => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    }, 60 * 60 * 1000); // Check every hour
  }
}

// Create a custom prompt for iOS users with specific instructions
function createIOSInstallPrompt() {
  const iosPrompt = document.createElement('div');
  iosPrompt.className = 'ios-install-prompt';
  iosPrompt.innerHTML = `
    <div class="ios-prompt-content">
      <h3>Install this App</h3>
      <p>Install this application on your home screen for quick and easy access when you're on the go.</p>
      <div class="ios-instructions">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">Tap the 'Share' button on the browser's toolbar</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">Tap 'Add to Home Screen'</div>
        </div>
      </div>
      <button class="ios-prompt-close" onclick="this.parentNode.parentNode.remove()">Got it</button>
    </div>
  `;
  
  document.body.appendChild(iosPrompt);
}