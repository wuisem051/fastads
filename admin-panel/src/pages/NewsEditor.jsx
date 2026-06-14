import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Trash2, Edit3, Save, X, Megaphone, Bell, Info } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
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
    background: '#fafbfc'
};

export default function NewsEditor() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreating, setIsCreating] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', category: 'Anuncio', content: '' });

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const snap = await getDocs(collection(db, 'news'));
                const list = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().createdAt?.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) || new Date().toLocaleDateString('es-ES')
                })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                setNews(list);
            } catch (error) {
                console.error("Error al obtener noticias:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const handleCreate = async () => {
        try {
            const docRef = await addDoc(collection(db, 'news'), {
                ...newPost,
                createdAt: serverTimestamp()
            });
            const post = {
                id: docRef.id,
                ...newPost,
                date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            };
            setNews([post, ...news]);
            setIsCreating(false);
            setNewPost({ title: '', category: 'Anuncio', content: '' });
        } catch (error) {
            console.error("Error al publicar noticia:", error);
            alert("Error al publicar. Revisa permisos.");
        }
    };

    const deleteNews = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta noticia?")) return;
        try {
            await deleteDoc(doc(db, 'news', id));
            setNews(news.filter(n => n.id !== id));
        } catch (error) {
            alert('Error al eliminar');
            console.error(error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Gestión de Noticias</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        Mantén a la comunidad informada sobre actualizaciones y cambios.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    style={{ background: 'var(--accent-secondary)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '1.25rem', fontWeight: 900, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,160,233,0.2)' }}
                >
                    <Plus size={18} strokeWidth={3} /> PUBLICAR NOTICIA
                </button>
            </div>

            {isCreating && (
                <div style={{ ...cardStyle }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 900, fontSize: '1.25rem' }}>Nueva Publicación</h2>
                        <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)' }}>TÍTULO DE LA NOTICIA</label>
                            <input
                                style={inputStyle}
                                placeholder="Ej: Nueva actualización de seguridad..."
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)' }}>CATEGORÍA</label>
                            <select
                                style={inputStyle}
                                value={newPost.category}
                                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                            >
                                <option value="Anuncio">Anuncio</option>
                                <option value="Actualización">Actualización</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                        <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)' }}>CONTENIDO</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                            placeholder="Escribe el cuerpo de la noticia aquí..."
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            onClick={() => setIsCreating(false)}
                            style={{ padding: '0.875rem 2rem', borderRadius: '1rem', background: '#fff', border: '1px solid #e6e9ed', fontWeight: 900, fontSize: '11px', color: 'var(--text-dim)', cursor: 'pointer' }}
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={handleCreate}
                            style={{ padding: '0.875rem 3rem', borderRadius: '1rem', background: 'var(--accent-primary)', border: 'none', color: '#fff', fontWeight: 900, fontSize: '11px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(76,209,55,0.2)' }}
                        >
                            PUBLICAR AHORA
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>Cargando noticias desde la base de datos...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {news.map((item) => (
                        <div key={item.id} style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <span style={{
                                    padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                                    background: item.category === 'Urgente' ? '#fee2e2' : item.category === 'Mantenimiento' ? '#fef3c7' : '#f0fdf4',
                                    color: item.category === 'Urgente' ? '#ef4444' : item.category === 'Mantenimiento' ? '#d97706' : '#16a34a',
                                    border: `1px solid ${item.category === 'Urgente' ? '#fecaca' : item.category === 'Mantenimiento' ? '#fde68a' : '#bbf7d0'}`,
                                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                                }}>
                                    {item.category === 'Mantenimiento' ? <Info size={12} /> : <Newspaper size={12} />}
                                    {item.category}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => deleteNews(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <h3 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{item.content}</p>
                            <div style={{ borderTop: '1px solid #f0f2f5', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 900 }}>{item.date}</p>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Bell size={12} /> Notificación enviada
                                </span>
                            </div>
                        </div>
                    ))}
                    {news.length === 0 && <p style={{ color: 'var(--text-dim)' }}>No hay noticias publicadas.</p>}
                </div>
            )}
        </div>
    );
}
