// AdShare Popup Logic - Updated for Replicated UI

document.addEventListener('DOMContentLoaded', () => {
    const balanceEl = document.getElementById('balance');
    const todayEarnedEl = document.getElementById('today-earned');
    const teasersViewedEl = document.getElementById('teasers-viewed');
    const popupsViewedEl = document.getElementById('popups-viewed');
    const adToggle = document.getElementById('ad-toggle');
    const toggleText = document.getElementById('toggle-text');
    const dashboardBtn = document.getElementById('go-to-dashboard');

    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');

    // Load state from extension storage
    function updateUI(data) {
        if (balanceEl) balanceEl.textContent = `${(data.balance || 0).toFixed(4)} USD`;
        if (teasersViewedEl) teasersViewedEl.textContent = data.adsViewed || 0;
        if (popupsViewedEl) popupsViewedEl.textContent = data.popupsViewed || 0;
        if (data.displayName && nameEl) nameEl.textContent = data.displayName;
        if (data.photoURL && avatarEl) avatarEl.src = data.photoURL;
    }

    chrome.storage.local.get(['balance', 'adsViewed', 'enabled', 'displayName', 'photoURL', 'popupsViewed'], (data) => {
        updateUI(data);
        const isEnabled = data.enabled !== false;
        adToggle.checked = isEnabled;
        updateToggleText(isEnabled);
    });

    // Listen for updates from background
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'UPDATE_UI') {
            updateUI(message.data);
        }
    });

    // Toggle ad display
    adToggle.addEventListener('change', () => {
        const isEnabled = adToggle.checked;
        chrome.storage.local.set({ enabled: isEnabled });
        updateToggleText(isEnabled);

        // Notify background script
        chrome.runtime.sendMessage({ type: 'TOGGLE_ADS', enabled: isEnabled });
    });

    function updateToggleText(enabled) {
        toggleText.textContent = enabled ? 'Anuncios activados' : 'Anuncios desactivados';
        toggleText.style.color = enabled ? '#4cd137' : '#7f8c8d';
    }

    dashboardBtn.addEventListener('click', () => {
        // Replace with your actual dashboard URL
        chrome.tabs.create({ url: 'https://fastadst.netlify.app/dashboard' });
    });


});
