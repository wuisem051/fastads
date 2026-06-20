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
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [showInvitation, setShowInvitation] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const fetchAdsData = async () => {
            try {
                // 1. Fetch active ads (fetching all for robustness, then filtering in JS)
                const adsSnap = await getDocs(collection(db, 'ads'));
                const allAds = adsSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(ad => ad.status === 'Active' || ad.status === 'active');

                // 2. Fetch user's recent ad history
                // Simplify query to avoid composite index requirements
                const transSnap = await getDocs(query(
                    collection(db, 'transactions'),
                    where('userId', '==', currentUser.uid),
                    where('type', '==', 'ad_view')
                ));

                const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
                const userHistory = transSnap.docs
                    .map(d => d.data())
                    .filter(h => h.createdAt?.toMillis() > twoDaysAgo);

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
            } catch (error) {
                console.error("Error loading ads:", error);
            } finally {
                setLoadingAds(false);
            }
        };

        fetchAdsData();
    }, [currentUser]);

    // Logic for random invitation
    useEffect(() => {
        if (availableAds.length === 0 || showInvitation || showAd) return;

        // Set a random timer between 15 and 60 seconds
        const randomTime = Math.floor(Math.random() * (60000 - 15000 + 1)) + 15000;

        const timer = setTimeout(() => {
            setShowInvitation(availableAds[0]);
        }, randomTime);

        return () => clearTimeout(timer);
    }, [availableAds, showInvitation, showAd]);

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
    // Fallback for older accounts that might not have totalEarnings field yet
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <StatCard title="Balance Total" value={formatCurrency(balance)} icon={<DollarSign size={24} />} />
                <StatCard title="Anuncios Vistos" value={adsWatched} icon={<Eye size={24} />} />
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
                            {availableAds.length > 0 && !showAd && !showInvitation && (
                                <button
                                    onClick={() => setShowInvitation(availableAds[0])}
                                    style={{
                                        marginTop: '1rem',
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

            {/* BannerAd modal */}
            {showAd && (
                <BannerAd
                    adData={showAd}
                    onClose={() => setShowAd(null)}
                    onComplete={() => {
                        setShowAd(null);
                        // Optional: refresh data or show success
                    }}
                />
            )}
        </div>
    );
}
