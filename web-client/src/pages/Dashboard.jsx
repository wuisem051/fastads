import React from 'react';
import {
    DollarSign,
    Eye,
    MousePointer2,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    TrendingUp,
    Download
} from 'lucide-react';

const StatCard = ({ title, value, change, icon, positive }) => (
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
            <span style={{
                display: 'flex', alignItems: 'center', gap: '2px',
                fontSize: '11px', fontWeight: 900,
                color: positive ? '#22c55e' : '#ef4444'
            }}>
                {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}%
            </span>
        </div>
        <div>
            <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>{title}</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{value}</h3>
        </div>
    </div>
);

export default function Dashboard() {
    const activityItems = [
        { time: 'Hace 05 min', platform: 'BLOG LINK' },
        { time: 'Hace 12 min', platform: 'DIRECT ADS' },
        { time: 'Hace 28 min', platform: 'BLOG LINK' },
        { time: 'Hace 47 min', platform: 'REDIRECT' },
        { time: 'Hace 1h 10m', platform: 'DIRECT ADS' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        Bienvenido, <span style={{ color: 'var(--accent-secondary)' }}>Wuisem</span>
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Resumen de actividad del día de hoy
                    </p>
                </div>
                <button className="gradient-btn" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 900 }}>
                    <Plus size={20} /> Nueva Tarea
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <StatCard title="Balance Total" value="$1,240.50" change="12.5" icon={<DollarSign size={24} />} positive={true} />
                <StatCard title="Anuncios Vistos" value="48" change="5.2" icon={<Eye size={24} />} positive={true} />
                <StatCard title="Clics Generados" value="214" change="2.4" icon={<MousePointer2 size={24} />} positive={false} />
                <StatCard title="Red de Referidos" value="12" change="8.1" icon={<Users size={24} />} positive={true} />
            </div>

            {/* Activity Feed + Promo Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Activity Feed */}
                <div style={{ background: '#fff', borderRadius: '2rem', padding: '2rem', border: '1px solid #e6e9ed', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <TrendingUp size={22} color="var(--accent-secondary)" /> Actividad Reciente
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {activityItems.map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem 1.25rem', background: '#f8f9fa', borderRadius: '1rem',
                                border: '1px solid #f0f2f5', transition: 'background 0.2s'
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
                                        <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '2px' }}>Visualización de anuncio</p>
                                        <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                                            {item.time} • {item.platform}
                                        </p>
                                    </div>
                                </div>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '1px' }}>
                                    +$0.0050
                                </span>
                            </div>
                        ))}
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
                        zIndex: 1, position: 'relative', width: 'fit-content',
                        transition: 'opacity 0.2s'
                    }}>
                        <Download size={20} /> Instalar Extensión
                    </button>
                    <div style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', opacity: 0.1 }}>
                        <MousePointer2 size={200} />
                    </div>
                </div>
            </div>
        </div>
    );
}
