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
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
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
    const [showDemoAd, setShowDemoAd] = useState(false);

    const demoAdData = {
        title: "Gana dinero sin inversión 🤑",
        description: "Haz crecer tu red y únete a la planta de procesamiento. Compra, vende y genera ingresos reales directos a tu billetera.",
        targetUrl: "https://ejemplo.com",
        duration: 15,
        reward: 0.015,
        imageUrl: "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=100&h=100&fit=crop"
    };

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
                <button
                    onClick={() => setShowDemoAd(true)}
                    className="gradient-btn"
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer' }}
                >
                    <Plus size={20} /> Probar Anuncio (Teaser)
                </button>
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

                {/* Extension Promo Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #00a0e9 0%, #4cd137 100%)',
                    borderRadius: '2rem', padding: '2rem',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    minHeight: '320px', color: '#fff'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '1rem' }}>
                            ✦ Extensión Chrome ✦
                        </p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.3, marginBottom: '1rem' }}>
                            ¡Activa y gana en segundo plano!
                        </h3>
                        <p style={{ fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.6, marginBottom: '2rem' }}>
                            La extensión monitorea anuncios automáticamente y acredita el pago en tiempo real.
                        </p>
                    </div>
                    <button style={{
                        background: 'rgba(0,0,0,0.85)', color: '#fff',
                        padding: '1rem 1.5rem', borderRadius: '1rem',
                        fontWeight: 900, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                        zIndex: 1, position: 'relative', width: 'fit-content'
                    }}>
                        <Download size={20} /> Instalar Extensión
                    </button>
                    <div style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', opacity: 0.1 }}>
                        <MousePointer2 size={200} />
                    </div>
                </div>
            </div>

            {/* Injected Ad Banner */}
            {showDemoAd && (
                <BannerAd
                    adData={demoAdData}
                    onClose={() => setShowDemoAd(false)}
                    onComplete={() => {
                        // Trigger a small local refresh so they see the balance change without reloading
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
