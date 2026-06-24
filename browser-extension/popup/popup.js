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

    function updateUI(data) {
        if (balanceEl) balanceEl.textContent = `$${(data.balance || 0).toFixed(4)}`;
        if (teasersViewedEl) teasersViewedEl.textContent = data.adsViewed || 0;
        if (popupsViewedEl) popupsViewedEl.textContent = data.popupsViewed || 0;

        if (nameEl) {
            nameEl.textContent = data.uid ? (data.displayName || 'Usuario') : 'Sin sesión activa';
        }

        if (avatarEl) {
            if (data.uid && data.photoURL) {
                avatarEl.src = data.photoURL;
            } else if (data.uid && data.displayName) {
                avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName)}&background=00a0e9&color=fff`;
            } else {
                avatarEl.src = `https://ui-avatars.com/api/?name=?&background=64748b&color=fff`;
            }
        }
    }

    // Read uid + all fields on popup open
    const loadFromStorage = () => {
        chrome.storage.local.get(['uid', 'balance', 'adsViewed', 'enabled', 'displayName', 'photoURL', 'popupsViewed'], (data) => {
            updateUI(data);
            const isEnabled = data.enabled !== false;
            if (adToggle) adToggle.checked = isEnabled;
            updateToggleText(isEnabled);
        });
    };
    loadFromStorage();

    // Poll every second so popup refreshes as soon as background receives sync from web
    const storagePoller = setInterval(loadFromStorage, 1000);
    window.addEventListener('unload', () => clearInterval(storagePoller));

    // Reactively update whenever background fires UPDATE_UI
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'UPDATE_UI') {
            updateUI(message.data);
            const isEnabled = message.data.enabled !== false;
            if (adToggle) adToggle.checked = isEnabled;
            updateToggleText(isEnabled);
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
