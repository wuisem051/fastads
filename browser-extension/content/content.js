// FastAds Official Content Script
// This script handles the display of ad invitations and synchronization with the main dashboard.

function showAdInvitation(adData) {
    if (document.getElementById('fastads-invite-modal')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'fastads-invite-modal';

    const styles = `
        #fastads-invite-modal {
            position: fixed;
            top: 24px;
            right: 24px;
            width: 360px;
            background: #ffffff;
            color: #1e293b;
            padding: 24px;
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
            z-index: 2147483647;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: fastadsSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes fastadsSlideIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .fastads-header { 
            font-weight: 800; 
            font-size: 16px; 
            margin-bottom: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            color: #0f172a; 
        }
        
        .fastads-tag {
            background: #f1f5f9;
            color: #64748b;
            padding: 4px 10px;
            border-radius: 99px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }

        .fastads-body { 
            font-size: 14px; 
            line-height: 1.5; 
            color: #475569; 
            margin-bottom: 24px; 
        }

        .fastads-reward-pill {
            display: inline-block;
            background: #f0fdf4;
            color: #16a34a;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 700;
        }

        .fastads-footer { display: flex; gap: 12px; justify-content: flex-end; }
        
        .fastads-btn { 
            padding: 10px 20px; 
            border-radius: 12px; 
            font-weight: 700; 
            font-size: 13px; 
            cursor: pointer; 
            border: none; 
            transition: all 0.2s;
        }

        .fastads-btn-accept { 
            background: #00a0e9; 
            color: #ffffff; 
            box-shadow: 0 4px 12px rgba(0,160,233,0.2);
        }
        
        .fastads-btn-accept:hover {
            background: #008ecc;
            transform: translateY(-1px);
        }

        .fastads-btn-cancel { 
            background: #f1f5f9; 
            color: #64748b; 
        }

        .fastads-btn-cancel:hover {
            background: #e2e8f0;
        }

        /* Top Progress Bar */
        #fastads-progress-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(0,0,0,0.05);
            z-index: 2147483647;
            display: none;
        }
        #fastads-progress-bar {
            height: 100%;
            width: 0%;
            background: #00a0e9;
            transition: width 1s linear;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    backdrop.innerHTML = `
        <div class="fastads-header">
            <span>FastAds Official</span>
            <span class="fastads-tag">NUEVA OFERTA</span>
        </div>
        <div class="fastads-body">
            Gana <span class="fastads-reward-pill">$${adData.reward.toFixed(4)}</span> visualizando este sitio durante <b>${adData.duration} segundos</b>.
        </div>
        <div class="fastads-footer">
            <button class="fastads-btn fastads-btn-cancel" id="fastads-cancel">Descartar</button>
            <button class="fastads-btn fastads-btn-accept" id="fastads-accept">Continuar</button>
        </div>
    `;

    document.body.appendChild(backdrop);

    const progressContainer = document.createElement('div');
    progressContainer.id = 'fastads-progress-container';
    progressContainer.innerHTML = '<div id="fastads-progress-bar"></div>';
    document.body.appendChild(progressContainer);

    document.getElementById('fastads-cancel').onclick = () => backdrop.remove();

    document.getElementById('fastads-accept').onclick = () => {
        chrome.runtime.sendMessage({
            type: 'AD_ACCEPTED',
            adId: adData.id,
            duration: adData.duration,
            reward: adData.reward
        });

        backdrop.remove();
        startLocalProgressBar(adData.duration);
        window.open(adData.url, '_blank');
    };
}

function startLocalProgressBar(duration) {
    const container = document.getElementById('fastads-progress-container');
    const bar = document.getElementById('fastads-progress-bar');
    if (!container || !bar) return;

    container.style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
        progress += (100 / duration);
        bar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => { if (container) container.style.display = 'none'; }, 1000);
        }
    }, 1000);
}

// Listen for messages from the website (Dashboard)
window.addEventListener('message', (event) => {
    if (event.data.type === 'AD_START') {
        const payload = event.data.payload;

        chrome.runtime.sendMessage({
            type: 'AD_ACCEPTED',
            adId: payload.id,
            adTitle: payload.title,
            duration: parseInt(payload.duration),
            reward: parseFloat(payload.reward),
            url: payload.url
        });

        startLocalProgressBar(parseInt(payload.duration));
    }

    if (event.data.type === 'USER_DATA_SYNC') {
        chrome.runtime.sendMessage({
            type: 'SYNC_USER_DATA',
            payload: event.data.payload
        });
    }

    if (event.data.type === 'LOGOUT_USER') {
        chrome.runtime.sendMessage({ type: 'LOGOUT_USER' });
    }
});

// Notify the web app that the extension is ready
function notifyReady() {
    try {
        chrome.storage.local.get(['balance', 'adsViewed'], (state) => {
            if (chrome.runtime.lastError) return;
            window.postMessage({
                type: 'EXTENSION_READY',
                version: '1.0.1',
                localBalance: state.balance || 0,
                localAds: state.adsViewed || 0,
                official: true
            }, '*');
        });
    } catch (e) { }
}
notifyReady();
setInterval(notifyReady, 5000);

// Listen for a ping from the web app
window.addEventListener('message', (e) => {
    if (e.data.type === 'PING_EXT') notifyReady();
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SHOW_AD_INVITATION') {
        const adData = {
            id: message.payload.id,
            duration: message.payload.timer,
            reward: message.payload.reward,
            url: message.payload.url
        };
        showAdInvitation(adData);
    }

    if (message.type === 'AD_COMPLETED_SUCCESS' || message.type === 'AD_CANCELLED') {
        window.postMessage({
            type: message.type,
            payload: message.payload
        }, '*');
    }
});
