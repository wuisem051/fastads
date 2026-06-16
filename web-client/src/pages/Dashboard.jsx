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
    Inbox
} from 'lucide-react';
import { doc, updateDoc, increment, addDoc, serverTimestamp, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import BannerAd from '../components/BannerAd';

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

export default function Dashboard() {
    const { currentUser, userProfile } = useAuth();
    const [activity, setActivity] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [availableAds, setAvailableAds] = useState([]);
    const [loadingAds, setLoadingAds] = useState(true);
    const [showAdConfirmation, setShowAdConfirmation] = useState(null);
    const [showAd, setShowAd] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const fetchAdsData = async () => {
            try {
                // 1. Fetch active ads
                const adsSnap = await getDocs(query(collection(db, 'ads'), where('status', '==', 'Active')));
                const allAds = adsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // 2. Fetch user's recent ad history to check cooldowns
                // We'll look at transactions from the last 48h to be safe
                const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
                const transSnap = await getDocs(query(
                    collection(db, 'transactions'),
                    where('userId', '==', currentUser.uid),
                    where('type', '==', 'ad_view'),
                    where('createdAt', '>=', twoDaysAgo)
                ));
                const userHistory = transSnap.docs.map(d => d.data());

                // 3. Filter ads
                const filtered = allAds.filter(ad => {
                    // Check total limit
                    if (ad.maxViews && (ad.clicks || 0) >= ad.maxViews) return false;

                    // Check user cooldown
                    const lastView = userHistory
                        .filter(h => h.adId === ad.id)
                        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))[0];

                    if (lastView && lastView.createdAt) {
                        const hoursSince = (Date.now() - lastView.createdAt.toMillis()) / (1000 * 60 * 60);
                        if (hoursSince < (ad.cooldown || 24)) return false;
                    }

                    return true;
                });

                setAvailableAds(filtered);

                // Automatically show confirmation for the first available ad if none is showing
                if (filtered.length > 0 && !showAd && !showAdConfirmation) {
                    setShowAdConfirmation(filtered[0]);
                }
            } catch (error) {
                console.error("Error loading ads:", error);
            } finally {
                setLoadingAds(false);
            }
        };

        fetchAdsData();
    }, [currentUser]);

    useEffect(() => {
        const handleExtensionMessage = async (event) => {
            if (event.data.type === 'AD_COMPLETED_SUCCESS') {
                const { adId, reward, title } = event.data.payload;
                console.log('AdShare: Acreditando recompensa confirmada por extensión');

                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const adRef = doc(db, 'ads', adId);

                    // 1. Update user
                    await updateDoc(userRef, {
                        balance: increment(reward),
                        totalEarnings: increment(reward),
                        adsWatched: increment(1)
                    });

                    // 2. Update ad clicks
                    await updateDoc(adRef, {
                        clicks: increment(1)
                    });

                    // 3. Register transaction
                    await addDoc(collection(db, 'transactions'), {
                        userId: currentUser.uid,
                        adId: adId,
                        type: 'ad_view',
                        amount: reward,
                        description: title || 'Visualización de Teaser (Extensión)',
                        platform: 'EXTENSION_POP',
                        createdAt: serverTimestamp()
                    });

                    // Refresh
                    window.location.reload();
                } catch (err) {
                    console.error("Error al acreditar recompensa:", err);
                }
            }

            if (event.data.type === 'AD_CANCELLED') {
                alert("Anuncio cancelado. Debes mantener la pestaña abierta para recibir la recompensa.");
            }
        };

        window.addEventListener('message', handleExtensionMessage);
        return () => window.removeEventListener('message', handleExtensionMessage);
    }, [currentUser]);

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
    const totalEarnings = userProfile?.totalEarnings ?? 0;
    const referrals = userProfile?.referrals ?? 0;

    const formatCurrency = (val) =>
        `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const timeAgo = (ts) => {
        if (!ts) return '';
        const secs = Math.floor((Date.now() - ts.toMillis()) / 1000);
        if (secs < 60) return `Hace ${secs}s`;
        if (secs < 3600) return `Hace ${Math.floor(secs / 60)}min`;
        return `Hace ${Math.floor(secs / 3600)}h`;
    };

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
                        <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)' }}>{loadingAds ? '...' : availableAds.length} ANUNCIOS DISPONIBLES</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards — datos reales de Firestore */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <StatCard title="Balance Total" value={formatCurrency(balance)} icon={<DollarSign size={24} />} />
                <StatCard title="Anuncios Vistos" value={adsWatched} icon={<Eye size={24} />} />
                <StatCard title="Total Ganado" value={formatCurrency(totalEarnings)} icon={<TrendingUp size={24} />} />
                <StatCard title="Red de Referidos" value={referrals} icon={<Users size={24} />} />
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
                                            background: 'rgba(76,209,55,0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--accent-primary)', flexShrink: 0
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
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '1px' }}>
                                        +{formatCurrency(item.amount || 0)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Extension Promo Banner Removed/Moved and Replaced by Ads Grid if desired, but let's keep UI mostly same */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ borderRadius: '2rem', padding: '2.5rem', background: 'linear-gradient(135deg, #00a0e9 0%, #4cd137 100%)', border: '1px solid #e1e4e8', color: '#fff', minHeight: 'auto' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem' }}>Gana más con la Extensión</h3>
                        <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1.5rem' }}>Instala nuestra herramienta oficial para automatizar tus ganancias.</p>
                        <button style={{ background: '#000', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem' }}>DESCARGAR AHORA</button>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '2rem', padding: '2rem', border: '1px solid #e6e9ed', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', textAlign: 'center' }}>
                        <div>
                            <TrendingUp size={40} color="var(--accent-secondary)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                                {loadingAds ? 'Buscando tareas...' : availableAds.length > 0 ? '¡Un anuncio está activo!' : 'No hay tareas disponibles por ahora.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog (Image 3 style) */}
            {showAdConfirmation && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: '1.25rem', width: '100%', maxWidth: '400px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                        <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'rgba(0,160,233,0.1)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <TrendingUp size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.75rem' }}>Nueva Tarea Disponible</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            Ver el sitio <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{showAdConfirmation.title}</span> durante {showAdConfirmation.timer} seg y ganar <span style={{ color: 'var(--accent-primary)', fontWeight: 900 }}>${showAdConfirmation.reward}</span>?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowAdConfirmation(null)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #e1e4e8', background: 'none', fontWeight: 700, cursor: 'pointer', color: 'var(--text-dim)' }}>CANCELAR</button>
                            <button onClick={() => {
                                // Notify extension if present (via window message)
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

                                // Open Target URL is now handled by the extension to monitor the tabId effectively
                                // window.open(showAdConfirmation.url, '_blank');

                                setShowAdConfirmation(null);
                            }} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent-secondary)', color: '#fff', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 15px rgba(0,160,233,0.2)' }}>ACEPTAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* BannerAd removed from here as per user request to use Extension counter */}
        </div>
    );
}
