// AdShare Background Service Worker - Countdown & Badge Update

let userState = {
    balance: 0.0,
    points: 0,
    adsViewed: 0,
    enabled: true
};

// Initial setup for the badge
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeBackgroundColor({ color: '#1a1e27' }); // Dark/Black background as in screenshot
    chrome.action.setBadgeTextColor({ color: '#ffffff' }); // White text
});

// Load initial state from storage
chrome.storage.local.get(['balance', 'points', 'adsViewed', 'enabled'], (data) => {
    userState = { ...userState, ...data };
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AD_ACCEPTED') {
        console.log(`Iniciando flujo de anuncio: ${message.url} - ${message.duration}s`);

        // Abrir la URL del anuncio en una nueva pestaña
        chrome.tabs.create({ url: message.url, active: false }, (newTab) => {
            // Pasamos sender.tab.id como sourceTabId para saber a quién avisar cuando termine
            startAdTimer(message.duration, message.reward, newTab.id, message.adId, sender.tab.id, message.adTitle);
        });
    }

    if (message.type === 'TOGGLE_ADS') {
        userState.enabled = message.enabled;
        chrome.storage.local.set({ enabled: message.enabled });
    }

    if (message.type === 'SIMULATE_AD') {
        // Send notification to current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'SHOW_AD_INVITATION',
                    payload: message.payload
                });
            }
        });
    }
});

/**
 * Handles the countdown logic and updates the extension icon badge
 */
function startAdTimer(duration, reward, tabId, adId, sourceTabId, adTitle) {
    let timeLeft = duration;
    let isTabClosed = false;

    // Monitor if the tab is closed
    const checkTabRemoved = (removedTabId) => {
        if (removedTabId === tabId) {
            isTabClosed = true;
        }
    };
    chrome.tabs.onRemoved.addListener(checkTabRemoved);

    // Set initial badge
    chrome.action.setBadgeText({ text: timeLeft.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#1a1e27' });

    const interval = setInterval(() => {
        if (isTabClosed) {
            clearInterval(interval);
            chrome.tabs.onRemoved.removeListener(checkTabRemoved);
            chrome.action.setBadgeText({ text: '!' }); // Error/Cancelled
            chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });

            // Notify the Dashboard that the ad was cancelled
            if (sourceTabId) {
                chrome.tabs.sendMessage(sourceTabId, { type: 'AD_CANCELLED' });
            }

            setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);
            return;
        }

        timeLeft--;

        if (timeLeft > 0) {
            // Update the badge with current seconds
            chrome.action.setBadgeText({ text: timeLeft.toString() });
        } else {
            // Timer finished
            clearInterval(interval);
            chrome.tabs.onRemoved.removeListener(checkTabRemoved);
            chrome.action.setBadgeText({ text: '✓' }); // Show checkmark for success
            chrome.action.setBadgeBackgroundColor({ color: '#00ff88' }); // Change to green on finish

            rewardUser(reward, adId);

            // Notify the Dashboard that the ad was successful
            if (sourceTabId) {
                chrome.tabs.sendMessage(sourceTabId, {
                    type: 'AD_COMPLETED_SUCCESS',
                    payload: { adId, reward, title: adTitle }
                });
            }

            // Clear badge after 5 seconds
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '' });
                chrome.action.setBadgeBackgroundColor({ color: '#1a1e27' });
            }, 5000);
        }
    }, 1000);
}

function rewardUser(amount, adId) {
    userState.balance += amount;
    userState.adsViewed += 1;

    chrome.storage.local.set(userState, () => {
        chrome.runtime.sendMessage({ type: 'UPDATE_UI', data: userState });

        // System notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: '¡Pago Acreditado!',
            message: `Has recibido $${amount.toFixed(4)} correctamente.`,
            priority: 2
        });

        // Opcional: Aquí se debería llamar a una API o a Firebase directamente 
        // para persistir el cambio en la base de datos central.
        console.log(`Lograr acreditación en Firestore para ad: ${adId}`);
    });
}
