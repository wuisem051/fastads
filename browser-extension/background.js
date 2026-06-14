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
        console.log(`Iniciando contador: ${message.duration}s`);
        startAdTimer(message.duration, message.reward, sender.tab.id);
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
function startAdTimer(duration, reward, tabId) {
    let timeLeft = duration;

    // Set initial badge
    chrome.action.setBadgeText({ text: timeLeft.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#1a1e27' });

    const interval = setInterval(() => {
        timeLeft--;

        if (timeLeft > 0) {
            // Update the badge with current seconds
            chrome.action.setBadgeText({ text: timeLeft.toString() });
        } else {
            // Timer finished
            clearInterval(interval);
            chrome.action.setBadgeText({ text: '✓' }); // Show checkmark for success
            chrome.action.setBadgeBackgroundColor({ color: '#00ff88' }); // Change to green on finish

            rewardUser(reward);

            // Clear badge after 5 seconds
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '' });
                chrome.action.setBadgeBackgroundColor({ color: '#1a1e27' });
            }, 5000);
        }
    }, 1000);
}

function rewardUser(amount) {
    userState.balance += amount;
    userState.adsViewed += 1;

    chrome.storage.local.set(userState, () => {
        chrome.runtime.sendMessage({ type: 'UPDATE_UI', data: userState });

        // System notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Pago Procesado',
            message: `Has recibido $${amount.toFixed(4)} correctamente.`,
            priority: 2
        });
    });
}
