import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Edit3, Globe, Eye, MousePointer2, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

const cardStyle = {
    background: '#fff',
    borderRadius: '2rem',
    padding: '2.5rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const tableHeadCell = {
    padding: '0 1.5rem 1.25rem 1.5rem',
    fontSize: '10px', fontWeight: 900,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--text-dim)',
};

export default function AdsManagement() {
    const [showModal, setShowModal] = useState(false);

    const ads = [
        { id: 1, title: 'Blog Direct Link #1', url: 'https://mi-blog.com/link-1', views: 5420, clicks: 840, status: 'Active', reward: '0.005', timer: '15s' },
        { id: 2, title: 'Oferta Especial Blog', url: 'https://mi-blog.com/promo', views: 1200, clicks: 150, status: 'Paused', reward: '0.010', timer: '30s' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Gestión de Publicidad</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        Crea y administra las campañas de enlaces para tus usuarios.
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="gradient-btn" style={{ padding: '1.25rem 2.5rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <Plus size={22} /> CREAR CAMPAÑA
                </button>
            </div>

            {/* Filters Bar */}
            <div style={{ ...cardStyle, padding: '1.25rem 2rem', borderRadius: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {['Todos', 'Activos', 'Pausados', 'Finalizados'].map(f => (
                        <button key={f} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', background: f === 'Todos' ? 'var(--accent-secondary)' : '#f8f9fa', color: f === 'Todos' ? '#fff' : 'var(--text-dim)', border: 'none', cursor: 'pointer' }}>{f}</button>
                    ))}
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Filter size={18} /> MÁS FILTROS
                </button>
            </div>

            {/* Ads Table */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', borderRadius: '2.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#fafbfc', borderBottom: '1px solid #f0f2f5' }}>
                            <tr>
                                <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Campaña / Destino</th>
                                <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Estadísticas de Tráfico</th>
                                <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Recompensa & Tiempo</th>
                                <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Estado</th>
                                <th style={{ ...tableHeadCell, paddingTop: '1.5rem', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map((ad, i) => (
                                <tr key={ad.id} style={{ borderBottom: i === ads.length - 1 ? 'none' : '1px solid #f9fafb' }}>
                                    <td style={{ padding: '1.5rem', maxWidth: '300px' }}>
                                        <p style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{ad.title}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <Globe size={12} /> {ad.url}
                                        </p>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            <div>
                                                <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Impresiones</p>
                                                <p style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={16} color="var(--accent-primary)" /> {ad.views.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Clics Únicos</p>
                                                <p style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}><MousePointer2 size={16} color="var(--accent-secondary)" /> {ad.clicks.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>${ad.reward}</span>
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> {ad.timer} Timer
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <span style={{
                                            padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: ad.status === 'Active' ? '#f0fdf4' : '#fff7ed',
                                            color: ad.status === 'Active' ? '#16a34a' : '#ea580c',
                                            border: `1px solid ${ad.status === 'Active' ? '#bbf7d0' : '#ffedd5'}`,
                                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ad.status === 'Active' ? '#22c55e' : '#f97316' }}></div>
                                            {ad.status === 'Active' ? 'Activo' : 'Pausado'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            <button style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #f0f2f5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-dim)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-secondary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                                <Edit3 size={18} />
                                            </button>
                                            <button style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #f0f2f5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-dim)' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '2rem' }}>
                    <div style={{ ...cardStyle, width: '100%', maxWidth: '600px', padding: '3rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2.5rem' }}>Configurar Nueva Campaña</h2>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Nombre Público de la Campaña</label>
                                <input type="text" placeholder="Ej: Video Tutorial AdShare" style={{ width: '100%', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e6e9ed', background: '#f8f9fa', fontSize: '1rem', fontWeight: 700, outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Enlace de Destino (URL)</label>
                                <input type="url" placeholder="https://youtube.com/..." style={{ width: '100%', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e6e9ed', background: '#f8f9fa', fontSize: '1rem', fontWeight: 700, outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Recompensa por Clic ($)</label>
                                    <input type="number" step="0.001" placeholder="0.005" style={{ width: '100%', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e6e9ed', background: '#f8f9fa', fontSize: '1rem', fontWeight: 700, outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Duración Obligatoria (Seg)</label>
                                    <input type="number" placeholder="15" style={{ width: '100%', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e6e9ed', background: '#f8f9fa', fontSize: '1rem', fontWeight: 700, outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e6e9ed', background: 'none', fontWeight: 900, cursor: 'pointer', color: 'var(--text-dim)' }}>CANCELAR</button>
                                <button type="submit" className="gradient-btn" style={{ flex: 2, padding: '1.25rem', borderRadius: '1.25rem', fontSize: '1rem', fontWeight: 900 }}>GUARDAR Y ACTIVAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
