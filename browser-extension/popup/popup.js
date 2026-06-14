// AdShare Popup Logic - Updated for Replicated UI

document.addEventListener('DOMContentLoaded', () => {
    const balanceEl = document.getElementById('balance');
    const todayEarnedEl = document.getElementById('today-earned');
    const teasersViewedEl = document.getElementById('teasers-viewed');
    const popupsViewedEl = document.getElementById('popups-viewed');
    const adToggle = document.getElementById('ad-toggle');
    const toggleText = document.getElementById('toggle-text');
    const dashboardBtn = document.getElementById('go-to-dashboard');

    // Load state from extension storage
    chrome.storage.local.get(['balance', 'todayEarned', 'adsViewed', 'enabled'], (data) => {
        balanceEl.textContent = `${(data.balance || 0).toFixed(2)} USD`;
        todayEarnedEl.textContent = `${(data.todayEarned || 0).toFixed(3)} USD`;
        teasersViewedEl.textContent = data.adsViewed || 0;
        popupsViewedEl.textContent = data.popupsViewed || 0;

        const isEnabled = data.enabled !== false;
        adToggle.checked = isEnabled;
        updateToggleText(isEnabled);
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
        chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
    });

    // Test simulation
    const simulateBtn = document.getElementById('simulate-ad');
    if (simulateBtn) {
        simulateBtn.addEventListener('click', () => {
            chrome.runtime.sendMessage({
                type: 'SIMULATE_AD',
                payload: {
                    id: 'test-' + Date.now(),
                    title: 'Blog de Prueba (Simulación)',
                    url: 'https://www.google.com',
                    reward: 0.005,
                    timer: 15
                }
            });
        });
    }
});
