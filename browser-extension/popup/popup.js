// FastAds Official Popup Logic
document.addEventListener('DOMContentLoaded', () => {
    const balanceEl = document.getElementById('balance');
    const teasersViewedEl = document.getElementById('teasers-viewed');
    const popupsViewedEl = document.getElementById('popups-viewed');
    const adToggle = document.getElementById('ad-toggle');
    const toggleText = document.getElementById('toggle-text');
    const dashboardBtn = document.getElementById('go-to-dashboard');
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');

    // Load state from extension storage
    function updateUI(data) {
        if (balanceEl) balanceEl.textContent = `$${(data.balance || 0).toFixed(4)}`;
        if (teasersViewedEl) teasersViewedEl.textContent = data.adsViewed || 0;
        if (popupsViewedEl) popupsViewedEl.textContent = data.popupsViewed || 0;
        if (data.displayName && nameEl) nameEl.textContent = data.displayName;
        if (data.photoURL && avatarEl) avatarEl.src = data.photoURL;
    }

    chrome.storage.local.get(['balance', 'adsViewed', 'enabled', 'displayName', 'photoURL', 'popupsViewed'], (data) => {
        updateUI(data);
        const isEnabled = data.enabled !== false;
        if (adToggle) adToggle.checked = isEnabled;
        updateToggleText(isEnabled);
    });

    // Listen for updates from background
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'UPDATE_UI') {
            updateUI(message.data);
        }
    });

    // Toggle logic
    if (adToggle) {
        adToggle.addEventListener('change', () => {
            const isEnabled = adToggle.checked;
            chrome.storage.local.set({ enabled: isEnabled });
            updateToggleText(isEnabled);
            chrome.runtime.sendMessage({ type: 'TOGGLE_ADS', enabled: isEnabled });
        });
    }

    function updateToggleText(enabled) {
        if (!toggleText) return;
        toggleText.textContent = enabled ? 'Protección Activa' : 'Protección Inactiva';
        toggleText.className = enabled ? 'status-text active' : 'status-text';
    }

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            // Updated to the official dashboard URL
            chrome.tabs.create({ url: 'https://fastadst.netlify.app/dashboard' });
        });
    }
});
