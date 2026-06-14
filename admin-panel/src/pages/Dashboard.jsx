import React from 'react';
import { Users, Megaphone, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const cardStyle = {
    background: '#fff',
    borderRadius: '2rem',
    padding: '2rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s ease',
};

const AdminStat = ({ label, value, trend, trendValue, icon: Icon, color }) => (
    <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                background: color === 'blue' ? 'rgba(0,160,233,0.06)' :
                    color === 'purple' ? 'rgba(139,92,246,0.06)' :
                        color === 'yellow' ? 'rgba(245,158,11,0.06)' : 'rgba(76,209,55,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color === 'blue' ? 'var(--accent-secondary)' :
                    color === 'purple' ? '#8b5cf6' :
                        color === 'yellow' ? '#f59e0b' : 'var(--accent-primary)',
                border: '1px solid rgba(0,0,0,0.03)'
            }}>
                <Icon size={24} />
            </div>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 900,
                color: trend === 'up' ? 'var(--accent-primary)' : '#ef4444',
                background: trend === 'up' ? 'rgba(76,209,55,0.08)' : 'rgba(239,68,68,0.08)',
                padding: '4px 8px', borderRadius: '8px'
            }}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trendValue}
            </div>
        </div>
        <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '4px' }}>{label}</p>
        <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{value}</h3>
    </div>
);

export default function Dashboard() {
    const stats = [
        { label: 'Usuarios Totales', value: '12,482', trend: 'up', trendValue: '+12%', icon: Users, color: 'blue' },
        { label: 'Anuncios Activos', value: '148', trend: 'up', trendValue: '+5%', icon: Megaphone, color: 'purple' },
        { label: 'Retiros Pendientes', value: '$2,840', trend: 'down', trendValue: '-2%', icon: Wallet, color: 'yellow' },
        { label: 'Ingresos Mensuales', value: '$45,210', trend: 'up', trendValue: '+18%', icon: TrendingUp, color: 'green' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Monitor Maestro</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        Estado en tiempo real de la red AdShare Fast
                    </p>
                </div>
                <div style={{ ...cardStyle, padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--accent-primary)' }}>
                    <div style={{ width: '10px', height: '10px', background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-primary)' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sistema Operativo</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                {stats.map((stat, i) => (
                    <AdminStat key={i} {...stat} />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Visual Chart Placeholder */}
                <div style={{ ...cardStyle, height: '450px', background: 'linear-gradient(135deg, #fff 0%, #fafbfc 100%)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Activity size={24} color="var(--accent-secondary)" /> Flujo de Tráfico Global
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['7D', '1M', '1A'].map(opt => (
                                <button key={opt} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e6e9ed', fontSize: '10px', fontWeight: 900, background: opt === '1M' ? '#f0f2f5' : '#fff' }}>{opt}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, border: '2px dashed #f0f2f5', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.875rem', fontWeight: 700 }}>
                        Engine de Gráficas en Construcción...
                    </div>
                </div>

                {/* Audit Logs */}
                <div style={{ ...cardStyle, height: '450px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        Registro de Auditoría
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { msg: 'NUEVO RETIRO PAYEER: $45.00', user: 'crypto_lover', time: 'hace 2 min', color: '#f59e0b' },
                            { msg: 'CAMPANA ADS APROBADA', user: 'ad_network_pro', time: 'hace 15 min', color: 'var(--accent-primary)' },
                            { msg: 'NUEVO USUARIO VERIFICADO', user: 'zen_master', time: 'hace 25 min', color: 'var(--accent-secondary)' },
                            { msg: 'AJUSTE DE CPM GLOBAL', user: 'admin_sys', time: 'hace 1h', color: '#8b5cf6' },
                            { msg: 'SISTEMA REINICIADO', user: 'system', time: 'hace 3h', color: '#ef4444' },
                        ].map((log, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: '1rem', background: '#f8f9fa' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.color, flexShrink: 0 }}></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2px' }}>{log.msg}</p>
                                    <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                                        {log.user} • {log.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
