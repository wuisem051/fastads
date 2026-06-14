import React, { useState, useEffect } from 'react';
import { Newspaper, Bell, Calendar, ArrowRight, Info, AlertTriangle, Zap, Inbox } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const cardStyle = {
    background: '#fff',
    borderRadius: '2rem',
    padding: '2rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
};

export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                setNews(snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    dateLabel: doc.data().createdAt?.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Reciente'
                })));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Noticias y Actualizaciones</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', fontWeight: 600 }}>Mantente al día con las últimas novedades de la plataforma AdShare.</p>
                </div>
                <div style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', background: 'rgba(0,160,233,0.05)', border: '1px solid rgba(0,160,233,0.1)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={18} />
                    <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notificaciones Activas</span>
                </div>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>Cargando noticias...</p>
            ) : news.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '2rem' }}>
                    <Inbox size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                    <h3 style={{ fontWeight: 900 }}>No hay noticias publicadas aún</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Vuelve pronto para enterarte de las novedades.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))', gap: '2rem' }}>
                    {news.map((item) => (
                        <div key={item.id} className="news-card" style={cardStyle}>
                            <div style={{ display: 'flex', gap: '2.5rem' }}>
                                <div style={{
                                    width: '5rem', height: '5rem', borderRadius: '22px', flexShrink: 0,
                                    background: item.category === 'Actualización' ? '#f0fdf4' : item.category === 'Mantenimiento' ? '#fffbeb' : '#f0f9ff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: item.category === 'Actualización' ? '#16a34a' : item.category === 'Mantenimiento' ? '#d97706' : '#0284c7'
                                }}>
                                    {item.category === 'Actualización' ? <Zap size={32} /> : item.category === 'Mantenimiento' ? <AlertTriangle size={32} /> : <Newspaper size={32} />}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em',
                                            background: item.category === 'Actualización' ? '#f0fdf4' : item.category === 'Mantenimiento' ? '#fffbeb' : '#f0f9ff',
                                            color: item.category === 'Actualización' ? '#16a34a' : item.category === 'Mantenimiento' ? '#d97706' : '#0284c7',
                                            border: `1px solid ${item.category === 'Actualización' ? '#bbf7d0' : item.category === 'Mantenimiento' ? '#fef3c7' : '#bae6fd'}`
                                        }}>
                                            {item.category}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>
                                            <Calendar size={14} /> {item.dateLabel}
                                        </div>
                                    </div>

                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', color: '#2d3436' }}>{item.title}</h2>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: '800px' }}>{item.content}</p>

                                    <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', padding: 0 }}>
                                        Leer artículo completo <ArrowRight size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
