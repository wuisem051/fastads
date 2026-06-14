// AdShare Content Script - Ad Notification & Progress Bar

console.log('AdShare Extension Active');

function showAdInvitation(adData) {
    if (document.getElementById('adshare-invite-modal')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'adshare-invite-modal';

    const styles = `
        #adshare-invite-modal {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 380px;
            background: #ffffff;
            color: #1a1e27;
            padding: 24px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            z-index: 2147483647;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            border: 1px solid rgba(0,0,0,0.05);
            animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .adshare-header { font-weight: 700; font-size: 18px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: #000; }
        .adshare-body { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
        .adshare-footer { display: flex; gap: 12px; justify-content: flex-end; }
        .adshare-btn { padding: 10px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; }
        .adshare-btn-accept { background: #00ff88; color: #052e16; }
        .adshare-btn-cancel { background: #f3f4f6; color: #4b5563; }
        .adshare-reward { color: #059669; font-weight: 700; }

        /* Top Progress Bar */
        #adshare-progress-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(0,0,0,0.1);
            z-index: 2147483647;
            display: none;
        }
        #adshare-progress-bar {
            height: 100%;
            width: 0%;
            background: #00ff88;
            transition: width 1s linear;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    backdrop.innerHTML = `
        <div class="adshare-header">
            <span style="color: #00ff88">⚡</span> Anuncio Disponible
        </div>
        <div class="adshare-body">
            ¿Deseas ver este sitio durante <b>${adData.duration} segundos</b> para ganar <span class="adshare-reward">$${adData.reward.toFixed(4)}</span>?
        </div>
        <div class="adshare-footer">
            <button class="adshare-btn adshare-btn-cancel" id="adshare-cancel">Cancelar</button>
            <button class="adshare-btn adshare-btn-accept" id="adshare-accept">Aceptar</button>
        </div>
    `;

    document.body.appendChild(backdrop);

    const progressContainer = document.createElement('div');
    progressContainer.id = 'adshare-progress-container';
    progressContainer.innerHTML = '<div id="adshare-progress-bar"></div>';
    document.body.appendChild(progressContainer);

    document.getElementById('adshare-cancel').onclick = () => backdrop.remove();

    document.getElementById('adshare-accept').onclick = () => {
        // Enviar mensaje al background para iniciar el contador en el icono (Badge)
        chrome.runtime.sendMessage({
            type: 'AD_ACCEPTED',
            adId: adData.id,
            duration: adData.duration,
            reward: adData.reward
        });

        backdrop.remove();

        // Simular barra de progreso en la página actual
        startLocalProgressBar(adData.duration);

        // Abrir el link directo en una nueva pestaña (opcional, algunos prefieren que sea la misma)
        window.open(adData.url, '_blank');
    };
}

function startLocalProgressBar(duration) {
    const container = document.getElementById('adshare-progress-container');
    const bar = document.getElementById('adshare-progress-bar');
    if (!container || !bar) return;

    container.style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
        progress += (100 / duration);
        bar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => container.style.display = 'none', 1000);
        }
    }, 1000);
}

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
});
