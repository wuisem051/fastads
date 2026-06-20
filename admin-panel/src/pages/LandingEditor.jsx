import React, { useState, useEffect } from 'react';
import { Layout, Save, CheckCircle, Globe, LayoutDashboard, Type, MessageSquare, BarChart3, ListChecks } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const cardStyle = {
    background: '#fff',
    borderRadius: '2rem',
    padding: '2rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const inputStyle = {
    padding: '1rem 1.25rem',
    borderRadius: '1rem',
    border: '1px solid #f0f2f5',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    background: '#fafbfc',
    fontWeight: 700,
};

export default function LandingEditor() {
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [content, setContent] = useState({
        heroTitle: 'Transforma tu tiempo online en ingresos reales',
        heroSubtitle: 'Únete a la red publicitaria más transparente. Visualiza anuncios, visita sitios seleccionados y gana dinero directamente en tu billetera digital.',
        heroCta: 'COMENZAR GRATIS',
        statsUsers: '12K+',
        statsAds: '4M+',
        statsPaid: '$250K',
        statsUptime: '99%',
        dashboardTitle: 'Dashboard en vivo',
        dashboardCardLabel: 'Balance de Red',
        dashboardCardValue: '$1,240.50',
        dashboardCardPercent: '+12.5%'
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'landing'));
                if (snap.exists()) {
                    setContent(prev => ({ ...prev, ...snap.data() }));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchContent();
    }, []);

    const handleSave = async () => {
        try {
            await setDoc(doc(db, 'settings', 'landing'), {
                ...content,
                updatedAt: serverTimestamp()
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', fontWeight: 900 }}>Cargando editor...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Editor de Landing Page</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        Personaliza los textos y estadísticas de la página de inicio.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    style={{
                        padding: '1rem 2rem', borderRadius: '1.25rem',
                        background: saved ? '#4cd137' : 'var(--accent-secondary)',
                        color: '#fff', border: 'none', fontWeight: 900, fontSize: '0.9rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        transition: 'all 0.3s', boxShadow: '0 8px 25px rgba(0,160,233,0.2)'
                    }}
                >
                    {saved ? <><CheckCircle size={18} /> ¡PUBLICADO!</> : <><Save size={18} /> PUBLICAR CAMBIOS</>}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* HERO SECTION */}
                    <div style={cardStyle}>
                        <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Layout size={22} color="var(--accent-secondary)" /> Sección Hero (Principal)
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Título Principal</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
                                    value={content.heroTitle}
                                    onChange={e => setContent({ ...content, heroTitle: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Subtítulo / Descripción</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: '100px', resize: 'none' }}
                                    value={content.heroSubtitle}
                                    onChange={e => setContent({ ...content, heroSubtitle: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Texto del Botón (CTA)</label>
                                <input
                                    style={inputStyle}
                                    value={content.heroCta}
                                    onChange={e => setContent({ ...content, heroCta: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LIVE DASHBOARD SECTION */}
                    <div style={cardStyle}>
                        <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <LayoutDashboard size={22} color="#f1c40f" /> Dashboard de Vista Previa
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Título del Panel</label>
                                <input
                                    style={inputStyle}
                                    value={content.dashboardTitle}
                                    onChange={e => setContent({ ...content, dashboardTitle: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Etiqueta de Tarjeta (Anunciantes)</label>
                                <input
                                    style={inputStyle}
                                    value={content.dashboardCardLabel}
                                    onChange={e => setContent({ ...content, dashboardCardLabel: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Valor de Tarjeta (Monto)</label>
                                <input
                                    style={inputStyle}
                                    value={content.dashboardCardValue}
                                    onChange={e => setContent({ ...content, dashboardCardValue: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Porcentaje (+/-)</label>
                                <input
                                    style={inputStyle}
                                    value={content.dashboardCardPercent}
                                    onChange={e => setContent({ ...content, dashboardCardPercent: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* STATS SECTION */}
                    <div style={cardStyle}>
                        <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BarChart3 size={22} color="#4cd137" /> Estadísticas Reales
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700 }}>Usuarios</span>
                                <input style={{ ...inputStyle, width: '100px', padding: '0.5rem' }} value={content.statsUsers} onChange={e => setContent({ ...content, statsUsers: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700 }}>Anuncios</span>
                                <input style={{ ...inputStyle, width: '100px', padding: '0.5rem' }} value={content.statsAds} onChange={e => setContent({ ...content, statsAds: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700 }}>Pagado</span>
                                <input style={{ ...inputStyle, width: '100px', padding: '0.5rem' }} value={content.statsPaid} onChange={e => setContent({ ...content, statsPaid: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700 }}>Uptime</span>
                                <input style={{ ...inputStyle, width: '100px', padding: '0.5rem' }} value={content.statsUptime} onChange={e => setContent({ ...content, statsUptime: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, background: 'var(--bg-sidebar)', color: '#fff' }}>
                        <p style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.8 }}>
                            Cualquier cambio realizado aquí se reflejará instantáneamente en la página pública para todos los visitantes no registrados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
