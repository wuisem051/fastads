import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    Eye,
    MousePointer2,
    Users,
    ArrowUpRight,
    Plus,
    TrendingUp,
    Download,
    Inbox,
    Bell,
    ShieldCheck,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, increment, addDoc, serverTimestamp, getDocs, collection, query, where, orderBy, limit, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import BannerAd from '../components/BannerAd';
import EmbedBannerAd from '../components/EmbedBannerAd';

const StatCard = ({ title, value, icon, subtitle }) => (
    <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        border: '1px solid #e6e9ed',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'box-shadow 0.2s ease',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
                width: '3rem', height: '3rem', borderRadius: '0.875rem',
                background: 'rgba(0,160,233,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-secondary)'
            }}>
                {icon}
            </div>
            {subtitle && (
                <span style={{
                    display: 'flex', alignItems: 'center', gap: '2px',
                    fontSize: '11px', fontWeight: 900, color: '#22c55e'
                }}>
                    <ArrowUpRight size={14} />
                    {subtitle}
                </span>
            )}
        </div>
        <div>
            <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>{title}</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{value}</h3>
        </div>
    </div>
);

export default function Dashboard({ extensionUrl }) {
    const { currentUser, userProfile } = useAuth();
    const [activity, setActivity] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [availableAds, setAvailableAds] = useState([]);
    const [loadingAds, setLoadingAds] = useState(true);
    const [showAdConfirmation, setShowAdConfirmation] = useState(null);
    const [showAd, setShowAd] = useState(null);
    const [showInvitation, setShowInvitation] = useState(null);

    // Banner ad states
    const [availableBannerAds, setAvailableBannerAds] = useState([]);
    const [showBannerAd, setShowBannerAd] = useState(null);

    // Extension URL from settings (fallback if not passed as prop)
    const [localExtUrl, setLocalExtUrl] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const fetchAdsData = async () => {
            try {
                // 1. Fetch active URL ads
                const adsSnap = await getDocs(collection(db, 'ads'));
                const allAds = adsSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(ad => ad.status === 'Active' || ad.status === 'active');

                // 2. Fetch active banner ads
                const bannerSnap = await getDocs(collection(db, 'banner_ads'));
                const allBannerAds = bannerSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(ad => ad.status === 'Active' || ad.status === 'active');

                // 3. Fetch user's recent ad history
                const transSnap = await getDocs(query(
                    collection(db, 'transactions'),
                    where('userId', '==', currentUser.uid),
                    where('type', 'in', ['ad_view', 'banner_view'])
                ));

                const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
                const userHistory = transSnap.docs
                    .map(d => d.data())
                    .filter(h => h.createdAt?.toMillis() > twoDaysAgo);

                // 4. Filter URL ads
                const filteredAds = allAds.filter(ad => {
                    if (ad.maxViews && (ad.clicks || 0) >= ad.maxViews) return false;
                    const lastView = userHistory
                        .filter(h => h.adId === ad.id)
                        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))[0];
                    if (lastView && lastView.createdAt) {
                        const hoursSince = (Date.now() - lastView.createdAt.toMillis()) / (1000 * 60 * 60);
                        if (hoursSince < (ad.cooldown || 24)) return false;
                    }
                    return true;
                });

                // 5. Filter banner ads
                const filteredBannerAds = allBannerAds.filter(ad => {
                    if (ad.maxViews && (ad.clicks || 0) >= ad.maxViews) return false;
                    const lastView = userHistory
                        .filter(h => h.adId === ad.id)
                        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))[0];
                    if (lastView && lastView.createdAt) {
                        const hoursSince = (Date.now() - lastView.createdAt.toMillis()) / (1000 * 60 * 60);
                        if (hoursSince < (ad.cooldown || 24)) return false;
                    }
                    return true;
                });

                setAvailableAds(filteredAds);
                setAvailableBannerAds(filteredBannerAds);
            } catch (error) {
                console.error("Error loading ads:", error);
            } finally {
                setLoadingAds(false);
            }
        };

        fetchAdsData();
    }, [currentUser]);

    // Fetch extension URL from settings as fallback
    useEffect(() => {
        const fetchExtUrl = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'general'));
                if (snap.exists()) {
                    setLocalExtUrl(snap.data().extensionUrl || '');
                }
            } catch (e) { console.error(e); }
        };
        if (!extensionUrl) fetchExtUrl();
    }, [extensionUrl]);

    const effectiveExtUrl = extensionUrl || localExtUrl;

    // Logic for random URL popup invitation
    useEffect(() => {
        if (availableAds.length === 0 || showInvitation || showAd || showBannerAd) return;

        const randomTime = Math.floor(Math.random() * (60000 - 15000 + 1)) + 15000;

        const timer = setTimeout(() => {
            setShowInvitation(availableAds[0]);
        }, randomTime);

        return () => clearTimeout(timer);
    }, [availableAds, showInvitation, showAd, showBannerAd]);

    // Logic for random banner ad popup (separate timer, separate from URL ads)
    useEffect(() => {
        if (availableBannerAds.length === 0 || showBannerAd || showAd || showInvitation) return;

        // Banner ads appear between 30-90 seconds (different interval from URL ads)
        const randomTime = Math.floor(Math.random() * (90000 - 30000 + 1)) + 30000;

        const timer = setTimeout(() => {
            setShowBannerAd(availableBannerAds[0]);
        }, randomTime);

        return () => clearTimeout(timer);
    }, [availableBannerAds, showBannerAd, showAd, showInvitation]);

    useEffect(() => {
        if (!currentUser) return;
        const fetchActivity = async () => {
            try {
                const q = query(
                    collection(db, 'transactions'),
                    where('userId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const snap = await getDocs(q);
                setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch {
                setActivity([]);
            } finally {
                setLoadingActivity(false);
            }
        };
        fetchActivity();
    }, [currentUser]);

    const displayName = userProfile?.displayName || currentUser?.displayName || 'Usuario';
    const balance = userProfile?.balance ?? 0;
    const adsWatched = userProfile?.adsWatched ?? 0;
    const totalEarnings = Math.max(userProfile?.totalEarnings || 0, userProfile?.balance || 0);
    const referrals = userProfile?.referrals ?? 0;

    const formatCurrency = (val) =>
        `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;

    const timeAgo = (ts) => {
        if (!ts) return '';
        const secs = Math.floor((Date.now() - ts.toMillis()) / 1000);
        if (secs < 60) return `Hace ${secs}s`;
        if (secs < 3600) return `Hace ${Math.floor(secs / 60)}min`;
        return `Hace ${Math.floor(secs / 3600)}h`;
    };

    const totalAvailable = availableAds.length + availableBannerAds.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        Bienvenido, <span style={{ color: 'var(--accent-secondary)' }}>{displayName}</span>
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Resumen de actividad del día de hoy
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: '#fff', padding: '0.75rem 1.5rem', borderRadius: '1rem', border: '1px solid #e6e9ed', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px #22c55e' }}></div>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)' }}>{loadingAds ? '...' : totalAvailable} ANUNCIOS DISPONIBLES</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards — datos reales de Firestore */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <StatCard title="Balance Total" value={formatCurrency(balance)} icon={<DollarSign size={24} />} />
                <StatCard title="Anuncios Vistos" value={adsWatched} icon={<Eye size={24} />} />
                <StatCard title="Red de Referidos" value={referrals} icon={<Users size={24} />} />
            </div>

            {/* Extension Control Bar */}
            <div style={{
                background: '#f8fafc',
                borderRadius: '1.5rem',
                padding: '1.25rem 2.5rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        padding: '0.875rem',
                        borderRadius: '1.25rem',
                        background: userProfile?.extensionEarningsEnabled !== false ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                        color: userProfile?.extensionEarningsEnabled !== false ? '#22c55e' : '#94a3b8'
                    }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2px' }}>Protección y Ganancias Automáticas</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>
                            {userProfile?.extensionEarningsEnabled !== false
                                ? 'La extensión está autorizada para generar ingresos pasivos.'
                                : 'Las ganancias por extensión están pausadas actualmente.'}
                        </p>
                    </div>
                </div>
                <div
                    onClick={async () => {
                        const state = userProfile?.extensionEarningsEnabled !== false;
                        await updateDoc(doc(db, 'users', currentUser.uid), {
                            extensionEarningsEnabled: !state
                        });
                    }}
                    style={{
                        cursor: 'pointer',
                        color: userProfile?.extensionEarningsEnabled !== false ? '#22c55e' : '#cbd5e1',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: 'scale(1.1)'
                    }}
                >
                    {userProfile?.extensionEarningsEnabled !== false ? <ToggleRight size={52} /> : <ToggleLeft size={52} />}
                </div>
            </div>

            {/* Activity Feed + Promo Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Activity Feed */}
                <div style={{ background: '#fff', borderRadius: '2rem', padding: '2rem', border: '1px solid #e6e9ed', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <TrendingUp size={22} color="var(--accent-secondary)" /> Actividad Reciente
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {loadingActivity ? (
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Cargando...</p>
                        ) : activity.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                                <Inbox size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                                <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>Sin actividad aún</p>
                                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Tus visualizaciones de anuncios aparecerán aquí</p>
                            </div>
                        ) : (
                            activity.map((item) => (
                                <div key={item.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem 1.25rem', background: '#f8f9fa', borderRadius: '1rem',
                                    border: '1px solid #f0f2f5'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '2.75rem', height: '2.75rem', borderRadius: '50%',
                                            background: item.type === 'banner_view' ? 'rgba(99,102,241,0.08)' : 'rgba(76,209,55,0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: item.type === 'banner_view' ? '#6366f1' : 'var(--accent-primary)', flexShrink: 0
                                        }}>
                                            <Eye size={18} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '2px' }}>{item.description || 'Visualización de anuncio'}</p>
                                            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                                                {timeAgo(item.createdAt)} • {item.platform || 'PLATFORM'}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{ color: item.type === 'banner_view' ? '#6366f1' : 'var(--accent-primary)', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '1px' }}>
                                        +{formatCurrency(item.amount || 0)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Extension Promo + Ad Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ borderRadius: '2rem', padding: '2.5rem', background: 'linear-gradient(135deg, #00a0e9 0%, #4cd137 100%)', border: '1px solid #e1e4e8', color: '#fff', minHeight: 'auto' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem' }}>Gana más con la Extensión</h3>
                        <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1.5rem' }}>Instala nuestra herramienta oficial para automatizar tus ganancias.</p>
                        <a
                            href={effectiveExtUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-block',
                                background: '#000', color: '#fff', border: 'none',
                                padding: '0.75rem 1.5rem', borderRadius: '1rem',
                                fontWeight: 900, cursor: effectiveExtUrl ? 'pointer' : 'not-allowed',
                                fontSize: '0.8rem', textDecoration: 'none',
                                opacity: effectiveExtUrl ? 1 : 0.6,
                                pointerEvents: effectiveExtUrl ? 'auto' : 'none'
                            }}
                        >
                            DESCARGAR AHORA
                        </a>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '2rem', padding: '2rem', border: '1px solid #e6e9ed', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', textAlign: 'center' }}>
                        <div>
                            <TrendingUp size={40} color="var(--accent-secondary)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                                {loadingAds ? 'Buscando tareas...' : totalAvailable > 0 ? `¡${totalAvailable} anuncio(s) activo(s)!` : 'No hay tareas disponibles por ahora.'}
                            </p>
                            {availableAds.length > 0 && !showAd && !showInvitation && (
                                <button
                                    onClick={() => setShowInvitation(availableAds[0])}
                                    style={{
                                        marginTop: '0.75rem',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '1rem',
                                        background: 'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        fontWeight: 900,
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,160,233,0.2)'
                                    }}
                                >
                                    VER ANUNCIO
                                </button>
                            )}
                            {availableBannerAds.length > 0 && !showBannerAd && !showAd && (
                                <button
                                    onClick={() => setShowBannerAd(availableBannerAds[0])}
                                    style={{
                                        marginTop: '0.5rem',
                                        padding: '0.65rem 1.25rem',
                                        borderRadius: '1rem',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff',
                                        border: 'none',
                                        fontWeight: 900,
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                                        display: 'block',
                                        width: '100%'
                                    }}
                                >
                                    VER BANNER
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* Invitation Popup */}
            <AnimatePresence>
                {showInvitation && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            zIndex: 10000,
                            width: '320px',
                            background: '#fff',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                            border: '1px solid #e1e4e8',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'rgba(0,160,233,0.1)', color: 'var(--accent-secondary)' }}>
                                <Bell size={20} />
                            </div>
                            <h4 style={{ fontWeight: 900, fontSize: '0.9rem', margin: 0 }}>¡Nueva Tarea Disponible!</h4>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
                            Hay una campaña activa: <b>"{showInvitation.title}"</b>. Mírala ahora para ganar tu recompensa.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowInvitation(null)}
                                style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid #e1e4e8', background: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Ignorar
                            </button>
                            <button
                                onClick={() => {
                                    setShowAd(showInvitation);
                                    setShowInvitation(null);
                                }}
                                style={{ flex: 2, padding: '0.625rem', borderRadius: '0.75rem', background: 'var(--accent-secondary)', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}
                            >
                                VER AHORA
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BannerAd modal (URL popup type) */}
            {showAd && (
                <BannerAd
                    adData={showAd}
                    onClose={() => setShowAd(null)}
                    onComplete={() => {
                        setShowAd(null);
                    }}
                />
            )}

            {/* EmbedBannerAd modal (300x250 banner type) */}
            {showBannerAd && (
                <EmbedBannerAd
                    adData={showBannerAd}
                    onClose={() => setShowBannerAd(null)}
                    onComplete={() => {
                        setShowBannerAd(null);
                        // Remove from available list
                        setAvailableBannerAds(prev => prev.filter(a => a.id !== showBannerAd.id));
                    }}
                />
            )}
        </div>
    );
}
