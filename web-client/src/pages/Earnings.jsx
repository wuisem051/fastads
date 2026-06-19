import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calendar, Filter, ArrowUpRight, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const card = {
    background: '#fff',
    borderRadius: '2rem',
    padding: '2rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

export default function Earnings() {
    const { currentUser, userProfile } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetchHistory = async () => {
            try {
                const q = query(
                    collection(db, 'transactions'),
                    where('userId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );
                const snap = await getDocs(q);
                setActivities(snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    dateLabel: doc.data().createdAt?.toDate().toLocaleDateString('es-ES') || 'Reciente'
                })));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [currentUser]);

    const stats = [
        { label: 'Hoy', value: '$0.00', icon: <TrendingUp size={22} />, color: 'var(--accent-primary)' },
        { label: 'Esta Semana', value: '$0.00', icon: <BarChart3 size={22} />, color: 'var(--accent-secondary)' },
        { label: 'Este Mes', value: '$0.00', icon: <Calendar size={22} />, color: '#a855f7' },
    ];

    const totalVitalicio = userProfile?.totalEarnings || 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Mis Ganancias</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Detalle histórico de tus ingresos acumulados.
                    </p>
                </div>
                <div style={{ ...card, padding: '1rem 1.5rem', borderRadius: '1.25rem' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '4px' }}>Total Vitalicio</p>
                    <p className="font-digital" style={{ fontSize: '1.1rem' }}>${totalVitalicio.toLocaleString('en-US', { minimumFractionDigits: 4 })}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ ...card, borderRadius: '2.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '6px' }}>{stat.label}</p>
                            <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity Table */}
            <div style={{ ...card, borderRadius: '2.5rem', padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>Detalle de Actividad</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Cargando actividad...</p>
                    ) : activities.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                            <Inbox size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 700 }}>No hay actividad registrada</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
                                    {['Fecha', 'Plataforma', 'Descripción', 'Recompensa', 'Estado'].map(h => (
                                        <th key={h} style={{ padding: '0 1.5rem 1.25rem 1.5rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontFamily: 'inherit' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((item, i) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: 700 }}>{item.dateLabel}</td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ padding: '4px 12px', background: 'rgba(0,160,233,0.06)', color: 'var(--accent-secondary)', borderRadius: '0.75rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', border: '1px solid rgba(0,160,233,0.1)' }}>
                                                {item.platform || 'System'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.description || 'Visualización de anuncio'}</td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1rem', letterSpacing: '1px' }}>+${(item.amount || 0).toFixed(4)}</span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '0.75rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid #bbf7d0' }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                                                Completado
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
