// FastAds Main Layout - v1.0.1 (Force Redeploy)
import React, { useState, useEffect } from 'react';
import {
    Home,
    Wallet,
    TrendingUp,
    Settings as SettingsIcon,
    Bell,
    LogOut,
    Users,
    ChevronDown,
    PlusCircle,
    History,
    LogOut as LogoutIcon,
    Plus,
    Eye,
    Droplet
} from 'lucide-react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { doc, updateDoc, increment, addDoc, serverTimestamp, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <TrendingUp size={20} />, label: 'Ganancias', path: '/earnings' },
    { icon: <Wallet size={20} />, label: 'Retiros', path: '/withdrawals' },
    { icon: <Users size={20} />, label: 'Referidos', path: '/referrals' },
    { icon: <Droplet size={20} />, label: 'Grifo', path: '/faucet' },
    { icon: <Bell size={20} />, label: 'Noticias', path: '/news' },
    { icon: <SettingsIcon size={20} />, label: 'Ajustes', path: '/settings' },
];

const Sidebar = ({ brand }) => {
    return (
        <aside style={{
            width: '16rem',
            background: '#222d32',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            color: '#fff',
            overflowY: 'auto',
        }}>
            {/* Logo */}
            <Link to="/dashboard" style={{
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
            }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
                <img src={brand.logo} alt="logo" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,160,233,0.35)' }} />
                <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                    {brand.name}
                </span>
            </Link>

            {/* Nav */}
            <nav style={{ flex: 1, paddingTop: '1rem' }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.875rem 2rem',
                            color: isActive ? '#ffffff' : '#b2bec3',
                            textDecoration: 'none',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            borderLeft: isActive ? '3px solid var(--accent-secondary)' : '3px solid transparent',
                            background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                            transition: 'all 0.2s ease',
                        })}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Balance removed per user request */}
        </aside>
    );
};

export default function MainLayout({ children }) {
    const { currentUser, userProfile, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifsRead, setNotifsRead] = useState(() => localStorage.getItem('notifs_read') === 'true');
    const [showAdConfirmation, setShowAdConfirmation] = useState(null);
    const [isExtensionActive, setIsExtensionActive] = useState(false);
    const [lastExtensionPing, setLastExtensionPing] = useState(0);
    const [showExtMissingMessage, setShowExtMissingMessage] = useState(false);

    // Sync branding + SEO with Firestore (real-time)
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                // Update branding
                setBrand({
                    name: data.brandName || 'FASTADS',
                    logo: data.brandLogo || logoImg
                });
                setExtensionUrl(data.extensionUrl || '');
                // Update SEO title
                if (data.seoTitle) document.title = data.seoTitle;
                // Update SEO meta description
                if (data.seoDescription) {
                    let metaDesc = document.querySelector('meta[name="description"]');
                    if (!metaDesc) {
                        metaDesc = document.createElement('meta');
                        metaDesc.name = 'description';
                        document.head.appendChild(metaDesc);
                    }
                    metaDesc.content = data.seoDescription;
                }
            }
        });
        return () => unsub();
    }, []);

    // Check extension activity periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const isActive = Date.now() - lastExtensionPing < 5000;
            setIsExtensionActive(isActive);
        }, 2000);
        return () => clearInterval(interval);
    }, [lastExtensionPing]);

    // Sync balance with Extension
    useEffect(() => {
        const sync = () => {
            if (userProfile && currentUser) {
                window.postMessage({
                    type: 'USER_DATA_SYNC',
                    payload: {
                        uid: currentUser.uid,
                        balance: userProfile.balance || 0,
                        totalEarnings: userProfile.totalEarnings || 0,
                        displayName: userProfile.displayName || currentUser?.displayName || 'Usuario',
                        photoURL: userProfile.photoURL || `https://ui-avatars.com/api/?name=${userProfile.displayName || currentUser?.displayName || 'User'}&background=0D8ABC&color=fff`,
                        adsViewed: userProfile.adsWatched || 0
                    }
                }, '*');
                // Active ping to content script
                window.postMessage({ type: 'PING_EXT' }, '*');
            }
        };
        sync();
        const interval = setInterval(sync, 4000);
        return () => clearInterval(interval);
    }, [userProfile, currentUser]);

    // Global Ad Checker
    useEffect(() => {
        if (!currentUser) return;
        // Check if extension earnings are enabled in user profile (default true)
        if (userProfile?.extensionEarningsEnabled === false) return;

        const checkAds = async () => {
            try {
                // Using the robust query logic from Dashboard
                const adsSnap = await getDocs(collection(db, 'ads'));
                const allAds = adsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                    .filter(ad => ad.status === 'Active' || ad.status === 'active');

                const transSnap = await getDocs(query(
                    collection(db, 'transactions'),
                    where('userId', '==', currentUser.uid),
                    where('type', '==', 'ad_view')
                ));

                const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
                const userHistory = transSnap.docs.map(d => d.data())
                    .filter(h => h.createdAt?.toMillis() > twoDaysAgo);

                const filtered = allAds.filter(ad => {
                    if (ad.maxViews && (ad.clicks || 0) >= ad.maxViews) return false;
                    const lastView = userHistory.filter(h => h.adId === ad.id).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))[0];
                    if (lastView && lastView.createdAt) {
                        const hoursSince = (Date.now() - lastView.createdAt.toMillis()) / (1000 * 60 * 60);
                        if (hoursSince < (ad.cooldown || 24)) return false;
                    }
                    return true;
                });

                if (filtered.length > 0 && !showAdConfirmation) {
                    setShowAdConfirmation(filtered[0]);
                }
            } catch (error) { console.error("Error checkAds:", error); }
        };

        const interval = setInterval(checkAds, 60000); // Check every minute
        checkAds();
        return () => clearInterval(interval);
    }, [currentUser, userProfile, showAdConfirmation]);

    // Dynamic SEO Implementation
    useEffect(() => {
        const fetchSEO = async () => {
            try {
                const snap = await getDocs(query(collection(db, 'settings')));
                const settings = snap.docs.find(d => d.id === 'general')?.data();
                if (settings) {
                    if (settings.seoTitle) document.title = settings.seoTitle;
                    if (settings.seoDescription) {
                        let metaDesc = document.querySelector('meta[name="description"]');
                        if (!metaDesc) {
                            metaDesc = document.createElement('meta');
                            metaDesc.name = 'description';
                            document.head.appendChild(metaDesc);
                        }
                        metaDesc.content = settings.seoDescription;
                    }
                }
            } catch (e) { console.error("SEO Error:", e); }
        };
        fetchSEO();
    }, []);

    // Global Extension Listener
    useEffect(() => {
        const handleExtensionMessage = async (event) => {
            // Extension says it's ready, so we send our current user data
            if (event.data.type === 'EXTENSION_READY' || event.data.type === 'PONG_EXT') {
                setLastExtensionPing(Date.now());
                setIsExtensionActive(true);

                if (event.data.type === 'EXTENSION_READY' && userProfile && currentUser) {
                    // Sync our truth to extension
                    window.postMessage({
                        type: 'USER_DATA_SYNC',
                        payload: {
                            uid: currentUser.uid,
                            balance: userProfile.balance || 0,
                            totalEarnings: userProfile.totalEarnings || 0,
                            displayName: userProfile.displayName || currentUser?.displayName || 'Usuario',
                            photoURL: userProfile.photoURL || `https://ui-avatars.com/api/?name=${userProfile.displayName || currentUser?.displayName || 'User'}&background=0D8ABC&color=fff`,
                            adsViewed: userProfile.adsWatched || 0
                        }
                    }, '*');

                    // If extension has MORE balance than us, it means some ads were watched while offline/background
                    // We reconcile if the difference is positive.
                    const extBalance = parseFloat(event.data.localBalance || 0);
                    const dbBalance = parseFloat(userProfile.balance || 0);

                    if (extBalance > dbBalance + 0.00001) { // Use epsilon for float comparison
                        const diff = extBalance - dbBalance;
                        console.log(`Reconciliando saldo: Extensión tiene $${extBalance}, DB tiene $${dbBalance}. Diferencia: $${diff}`);
                        try {
                            const userRef = doc(db, 'users', currentUser.uid);
                            await updateDoc(userRef, {
                                balance: increment(diff),
                                totalEarnings: increment(diff)
                            });
                            await addDoc(collection(db, 'transactions'), {
                                userId: currentUser.uid,
                                type: 'ad_view',
                                amount: diff,
                                description: 'Sincronización de ganancias (Extensión)',
                                platform: 'EXTENSION_SYNC',
                                createdAt: serverTimestamp()
                            });
                            // No reload here to avoid loops, just let the snapshot update or reload once
                            window.location.reload();
                        } catch (e) {
                            console.error("Error síncrono:", e);
                            if (e.code === 'permission-denied') {
                                alert("Error perm: No tienes permisos para actualizar tu saldo en Firebase.");
                            }
                        }
                    }
                }
            }

            if (event.data.type === 'AD_COMPLETED_SUCCESS') {
                const { adId, reward, title } = event.data.payload;
                const floatReward = parseFloat(reward);
                try {
                    await updateDoc(doc(db, 'users', currentUser.uid), {
                        balance: increment(floatReward),
                        totalEarnings: increment(floatReward),
                        adsWatched: increment(1)
                    });
                    if (adId && adId !== 'demo') {
                        await updateDoc(doc(db, 'ads', adId), { clicks: increment(1) }).catch(() => { });
                    }
                    await addDoc(collection(db, 'transactions'), {
                        userId: currentUser.uid, adId: adId || 'ext_auto', type: 'ad_view', amount: floatReward,
                        description: title || 'Anuncio completado (Ext)', platform: 'EXTENSION',
                        createdAt: serverTimestamp()
                    });
                    window.location.reload();
                } catch (err) { console.error("Error en AD_COMPLETED:", err); }
            }
            if (event.data.type === 'AD_CANCELLED') {
                // Silent
            }
        };
        window.addEventListener('message', handleExtensionMessage);
        return () => window.removeEventListener('message', handleExtensionMessage);
    }, [currentUser, userProfile]);

    const dropdownItems = [
        { icon: <TrendingUp size={16} />, label: 'Ganancias', path: '/earnings' },
        { icon: <Wallet size={16} />, label: 'Retirar fondos', path: '/withdrawals' },
        { icon: <SettingsIcon size={16} />, label: 'Ajustes', path: '/settings' },
        { icon: <LogoutIcon size={16} />, label: 'Salida', path: '/', isLogout: true },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6f7' }}>
            <Sidebar brand={brand} />

            <main style={{ marginLeft: '16rem', minHeight: '100vh' }}>
                {/* Header */}
                <header style={{
                    height: '70px',
                    background: '#ffffff',
                    borderBottom: '1px solid #e6e9ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 3rem',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    left: '16rem',
                    zIndex: 40,
                    boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                }}>
                    <h2 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
                        Panel de Usuario
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {/* Balances */}
                        <div style={{ display: 'flex', gap: '1.5rem', paddingRight: '2rem', borderRight: '1px solid #f0f2f5' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '3px' }}>BALANCE</p>
                                <p className="font-digital" style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>$ {Number(useAuth().userProfile?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 4 })}</p>
                            </div>
                        </div>

                        {/* Notifications Bell */}
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                style={{
                                    width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem',
                                    border: '1px solid #e6e9ed', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer',
                                    transition: 'all 0.2s', position: 'relative',
                                    background: isNotifOpen ? '#f8f9fa' : 'transparent'
                                }}
                                onMouseEnter={e => !isNotifOpen && (e.currentTarget.style.background = '#fcfdfe')}
                                onMouseLeave={e => !isNotifOpen && (e.currentTarget.style.background = 'transparent')}
                            >
                                <Bell size={18} />
                                {!notifsRead && (
                                    <div style={{
                                        position: 'absolute', top: '-4px', right: '-4px',
                                        width: '14px', height: '14px', background: '#ef4444',
                                        borderRadius: '50%', border: '2px solid #fff',
                                        fontSize: '8px', color: '#fff', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontWeight: 900
                                    }}>1</div>
                                )}
                            </div>

                            {isNotifOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setIsNotifOpen(false)}></div>
                                    <div style={{
                                        position: 'absolute', top: '120%', right: 0, width: '320px',
                                        background: '#fff', borderRadius: '1.25rem', border: '1px solid #e6e9ed',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
                                        animation: 'dropdown-in 0.2s ease-out'
                                    }}>
                                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 900 }}>Notificaciones</h4>
                                            <span
                                                onClick={() => {
                                                    setNotifsRead(true);
                                                    localStorage.setItem('notifs_read', 'true');
                                                }}
                                                style={{ fontSize: '10px', color: notifsRead ? '#9ca3af' : 'var(--accent-secondary)', fontWeight: 700, cursor: notifsRead ? 'default' : 'pointer' }}
                                            >
                                                {notifsRead ? '✓ Leídas' : 'Marcar como leídas'}
                                            </span>
                                        </div>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {notifsRead ? (
                                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                                    <p style={{ fontSize: '0.8rem' }}>No tienes notificaciones pendientes</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ padding: '1rem', borderBottom: '1px solid #f9fafb', background: 'rgba(0,160,233,0.02)', cursor: 'pointer' }}>
                                                        <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>¡Bienvenido a FastAds!</p>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>Empieza a ver anuncios y ganar recompensas hoy mismo.</p>
                                                        <p style={{ fontSize: '9px', color: 'var(--accent-secondary)', fontWeight: 700, marginTop: '8px' }}>Hace 5 minutos</p>
                                                    </div>
                                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                                        <p style={{ fontSize: '0.8rem' }}>No tienes más notificaciones</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Profile with Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '1rem', transition: 'background 0.2s', background: isProfileOpen ? '#f8f9fa' : 'transparent' }}
                                onMouseEnter={e => !isProfileOpen && (e.currentTarget.style.background = '#fcfdfe')}
                                onMouseLeave={e => !isProfileOpen && (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                                        {userProfile?.displayName || currentUser?.displayName || 'Usuario'}
                                        <ChevronDown size={14} style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </p>
                                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                                        {userProfile?.role === 'admin' ? 'Admin Master' : 'Pro Member'}
                                    </p>
                                </div>
                                <div style={{
                                    width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                                    background: 'var(--accent-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 900, fontSize: '1rem',
                                    border: '2px solid rgba(0,160,233,0.1)',
                                    overflow: 'hidden'
                                }}>
                                    {userProfile?.photoURL || currentUser?.photoURL ? (
                                        <img src={userProfile?.photoURL || currentUser?.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (userProfile?.displayName || currentUser?.displayName || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <>
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '120%',
                                        right: 0,
                                        width: '240px',
                                        background: '#ffffff',
                                        borderRadius: '1.25rem',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        border: '1px solid #e6e9ed',
                                        overflow: 'hidden',
                                        zIndex: 100,
                                        animation: 'dropdown-in 0.2s ease-out'
                                    }}>
                                        <div style={{ padding: '0.5rem' }}>
                                            {dropdownItems.map((item, index) => (
                                                <div
                                                    key={index}
                                                    onClick={async () => {
                                                        if (item.isLogout) {
                                                            await logout();
                                                            navigate('/login');
                                                        } else {
                                                            navigate(item.path);
                                                        }
                                                        setIsProfileOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '0.875rem 1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        cursor: 'pointer',
                                                        borderRadius: '0.75rem',
                                                        transition: 'all 0.2s',
                                                        borderTop: item.isLogout ? '1px solid #f0f2f5' : 'none',
                                                        marginTop: item.isLogout ? '0.5rem' : '0',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = item.isLogout ? '#fff1f1' : '#f8f9fa';
                                                        e.currentTarget.style.color = item.isLogout ? '#ef4444' : 'var(--accent-secondary)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = 'inherit';
                                                    }}
                                                >
                                                    <span style={{ opacity: 0.8 }}>{item.icon}</span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, flex: 1 }}>{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <section style={{ paddingTop: 'calc(70px + 3rem)', paddingLeft: '3rem', paddingRight: '3rem', paddingBottom: '3rem' }}>
                    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
                        {React.Children.map(children, child =>
                            React.isValidElement(child)
                                ? React.cloneElement(child, { extensionUrl })
                                : child
                        )}
                    </div>
                </section>

                {/* Global Confirmation Popup */}
                {showAdConfirmation && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <div style={{ background: '#fff', borderRadius: '1.25rem', width: '100%', maxWidth: '400px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                            {showExtMissingMessage ? (
                                <>
                                    <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <Plus size={32} style={{ transform: 'rotate(45deg)' }} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.75rem' }}>Extensión necesaria</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                        Instala la extensión para disfrutar de estos ingresos. Es necesaria para validar tus visualizaciones correctamente.
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <a
                                            href={extensionUrl || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'var(--accent-secondary)', color: '#fff', fontWeight: 900, textDecoration: 'none', fontSize: '0.875rem' }}
                                        >
                                            DESCARGAR EXTENSIÓN
                                        </a>
                                        <button onClick={() => { setShowAdConfirmation(null); setShowExtMissingMessage(false); }} style={{ padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #e1e4e8', background: 'none', fontWeight: 700, cursor: 'pointer', color: 'var(--text-dim)' }}>Cerrar</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'rgba(0,160,233,0.1)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', overflow: 'hidden' }}>
                                        {showAdConfirmation.logoUrl ? (
                                            <img src={showAdConfirmation.logoUrl} alt="Ad Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Plus size={32} />
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.75rem' }}>{showAdConfirmation.title}</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                        {showAdConfirmation.description || `Ver el sitio durante ${showAdConfirmation.timer} seg y ganar $${showAdConfirmation.reward}.`}
                                        <br />
                                        <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 900, marginTop: '8px', display: 'block' }}>
                                            ¡Gana {showAdConfirmation.reward} USD ahora!
                                        </span>
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setShowAdConfirmation(null)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #e1e4e8', background: 'none', fontWeight: 700, cursor: 'pointer', color: 'var(--text-dim)' }}>CANCELAR</button>
                                        <button onClick={() => {
                                            if (!isExtensionActive) {
                                                setShowExtMissingMessage(true);
                                                return;
                                            }
                                            window.postMessage({
                                                type: 'AD_START',
                                                payload: {
                                                    id: showAdConfirmation.id,
                                                    duration: showAdConfirmation.timer,
                                                    reward: showAdConfirmation.reward,
                                                    url: showAdConfirmation.url,
                                                    title: showAdConfirmation.title
                                                }
                                            }, '*');
                                            setShowAdConfirmation(null);
                                        }} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent-secondary)', color: '#fff', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 15px rgba(0,160,233,0.2)' }}>ACEPTAR</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

            </main>
            <style>{`
                @keyframes dropdown-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
