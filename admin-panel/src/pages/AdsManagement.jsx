import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Edit3, Globe, Eye, MousePointer2, Clock, CheckCircle, XCircle, Search, Filter, Image, Code } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

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

const inputModalStyle = {
    width: '100%',
    padding: '1.25rem',
    borderRadius: '1.25rem',
    border: '1px solid #e6e9ed',
    background: '#f8f9fa',
    fontSize: '1rem',
    fontWeight: 700,
    outline: 'none'
};

export default function AdsManagement() {
    // Tab state: 'url' or 'banner'
    const [activeTab, setActiveTab] = useState('url');

    // URL Campaigns
    const [showModal, setShowModal] = useState(false);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        description: 'Ver el sitio para recibir tu recompensa',
        logoUrl: '',
        url: '',
        reward: '',
        timer: '',
        maxViews: '',
        cooldown: '24',
        clicksPerPeriod: '1'
    });

    // Banner Campaigns
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [bannerAds, setBannerAds] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(true);
    const [editingBannerId, setEditingBannerId] = useState(null);
    const [bannerForm, setBannerForm] = useState({
        title: '',
        bannerCode: '',
        reward: '',
        timer: '',
        maxViews: '',
        cooldown: '24'
    });

    // Click History Modal
    const [showClicksModal, setShowClicksModal] = useState(false);
    const [clickLogs, setClickLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [selectedAdTitle, setSelectedAdTitle] = useState('');

    // Fetch URL ads
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const snap = await getDocs(collection(db, 'ads'));
                const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAds(list);
            } catch (error) {
                console.error("Error al obtener ads:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAds();
    }, []);

    // Fetch Banner ads
    useEffect(() => {
        const fetchBannerAds = async () => {
            try {
                const snap = await getDocs(collection(db, 'banner_ads'));
                const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBannerAds(list);
            } catch (error) {
                console.error("Error al obtener banner ads:", error);
            } finally {
                setLoadingBanners(false);
            }
        };
        fetchBannerAds();
    }, []);

    // Fetch Clicks
    const fetchClickLogs = async (adId, title) => {
        setLoadingLogs(true);
        setSelectedAdTitle(title);
        setShowClicksModal(true);
        try {
            const q = query(collection(db, 'transactions'), where('adId', '==', adId), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setClickLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error al obtener logs:", error);
        } finally {
            setLoadingLogs(false);
        }
    };

    // ======= URL Campaigns CRUD =======
    const resetForm = () => {
        setForm({ title: '', description: 'Ver el sitio para recibir tu recompensa', logoUrl: '', url: '', reward: '', timer: '', maxViews: '', cooldown: '24' });
        setEditingId(null);
    };

    const handleEdit = (ad) => {
        setForm({
            title: ad.title || '',
            description: ad.description || 'Ver el sitio para recibir tu recompensa',
            logoUrl: ad.logoUrl || '',
            url: ad.url || '',
            reward: ad.reward || '',
            timer: ad.timer || '',
            maxViews: ad.maxViews || '',
            cooldown: ad.cooldown || '24',
            clicksPerPeriod: ad.clicksPerPeriod || '1'
        });
        setEditingId(ad.id);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const adData = {
                title: form.title,
                description: form.description,
                logoUrl: form.logoUrl,
                url: form.url,
                reward: parseFloat(form.reward),
                timer: parseInt(form.timer),
                maxViews: parseInt(form.maxViews) || 1000,
                cooldown: parseInt(form.cooldown) || 24,
                clicksPerPeriod: parseInt(form.clicksPerPeriod) || 1,
            };

            if (editingId) {
                const adRef = doc(db, 'ads', editingId);
                await updateDoc(adRef, adData);
                setAds(ads.map(ad => ad.id === editingId ? { ...ad, ...adData } : ad));
            } else {
                const docRef = await addDoc(collection(db, 'ads'), {
                    ...adData,
                    views: 0,
                    clicks: 0,
                    status: 'Active',
                    createdAt: serverTimestamp()
                });
                setAds([{
                    id: docRef.id,
                    ...adData,
                    views: 0, clicks: 0, status: 'Active'
                }, ...ads]);
            }

            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error al guardar campaña:", error);
            alert(`Error: ${error.message}`);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        try {
            await updateDoc(doc(db, 'ads', id), { status: newStatus });
            setAds(ads.map(ad => ad.id === id ? { ...ad, status: newStatus } : ad));
        } catch (error) {
            alert('Error');
        }
    };

    const deleteAd = async (id) => {
        if (!window.confirm("¿Eliminar campaña?")) return;
        try {
            await deleteDoc(doc(db, 'ads', id));
            setAds(ads.filter(ad => ad.id !== id));
        } catch (error) {
            alert('Error');
        }
    };

    // ======= Banner Campaigns CRUD =======
    const resetBannerForm = () => {
        setBannerForm({ title: '', bannerCode: '', reward: '', timer: '', maxViews: '', cooldown: '24' });
        setEditingBannerId(null);
    };

    const handleEditBanner = (ad) => {
        setBannerForm({
            title: ad.title || '',
            bannerCode: ad.bannerCode || '',
            reward: ad.reward || '',
            timer: ad.timer || '',
            maxViews: ad.maxViews || '',
            cooldown: ad.cooldown || '24'
        });
        setEditingBannerId(ad.id);
        setShowBannerModal(true);
    };

    const handleSaveBanner = async (e) => {
        e.preventDefault();
        try {
            const bannerData = {
                title: bannerForm.title,
                bannerCode: bannerForm.bannerCode,
                reward: parseFloat(bannerForm.reward),
                timer: parseInt(bannerForm.timer),
                maxViews: parseInt(bannerForm.maxViews) || 1000,
                cooldown: parseInt(bannerForm.cooldown) || 24,
            };

            if (editingBannerId) {
                await updateDoc(doc(db, 'banner_ads', editingBannerId), bannerData);
                setBannerAds(bannerAds.map(ad => ad.id === editingBannerId ? { ...ad, ...bannerData } : ad));
            } else {
                const docRef = await addDoc(collection(db, 'banner_ads'), {
                    ...bannerData,
                    views: 0,
                    clicks: 0,
                    status: 'Active',
                    createdAt: serverTimestamp()
                });
                setBannerAds([{
                    id: docRef.id,
                    ...bannerData,
                    views: 0, clicks: 0, status: 'Active'
                }, ...bannerAds]);
            }

            setShowBannerModal(false);
            resetBannerForm();
        } catch (error) {
            console.error("Error al guardar banner:", error);
            alert(`Error: ${error.message}`);
        }
    };

    const toggleBannerStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        try {
            await updateDoc(doc(db, 'banner_ads', id), { status: newStatus });
            setBannerAds(bannerAds.map(ad => ad.id === id ? { ...ad, status: newStatus } : ad));
        } catch (error) {
            alert('Error');
        }
    };

    const deleteBannerAd = async (id) => {
        if (!window.confirm("¿Eliminar campaña de banner?")) return;
        try {
            await deleteDoc(doc(db, 'banner_ads', id));
            setBannerAds(bannerAds.filter(ad => ad.id !== id));
        } catch (error) {
            alert('Error');
        }
    };

    const tabBtnStyle = (isActive) => ({
        padding: '10px 24px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        background: isActive ? 'var(--accent-secondary)' : '#f8f9fa',
        color: isActive ? '#fff' : 'var(--text-dim)',
        border: isActive ? 'none' : '1px solid #e6e9ed',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Gestión de Publicidad</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        Crea y administra las campañas de enlaces y banners para tus usuarios.
                    </p>
                </div>
                <button
                    onClick={() => activeTab === 'url' ? setShowModal(true) : setShowBannerModal(true)}
                    className="gradient-btn"
                    style={{
                        padding: '1.25rem 2.5rem', borderRadius: '1.25rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        fontSize: '0.9rem', cursor: 'pointer', border: 'none', color: '#fff',
                        background: activeTab === 'url'
                            ? 'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)'
                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    }}
                >
                    <Plus size={22} /> {activeTab === 'url' ? 'CREAR CAMPAÑA URL' : 'CREAR CAMPAÑA BANNER'}
                </button>
            </div>

            {/* Tab Switcher */}
            <div style={{ ...cardStyle, padding: '1.25rem 2rem', borderRadius: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setActiveTab('url')} style={tabBtnStyle(activeTab === 'url')}>
                        <Globe size={14} /> Campañas URL ({ads.length})
                    </button>
                    <button onClick={() => setActiveTab('banner')} style={tabBtnStyle(activeTab === 'banner')}>
                        <Image size={14} /> Campañas Banner 300x250 ({bannerAds.length})
                    </button>
                </div>
            </div>

            {/* ===== URL CAMPAIGNS TABLE ===== */}
            {activeTab === 'url' && (
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', borderRadius: '2.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#fafbfc', borderBottom: '1px solid #f0f2f5' }}>
                                <tr>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Campaña / Destino</th>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Estadísticas de Tráfico</th>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Capacidad & Intervalo</th>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Estado</th>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem', textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr>
                                ) : ads.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No hay campañas URL creadas.</td></tr>
                                ) : ads.map((ad, i) => (
                                    <tr key={ad.id} style={{ borderBottom: i === ads.length - 1 ? 'none' : '1px solid #f9fafb' }}>
                                        <td style={{ padding: '1.5rem', maxWidth: '300px' }}>
                                            <p style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{ad.title}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <Globe size={12} /> <a href={ad.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{ad.url}</a>
                                            </p>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '2rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Impresiones</p>
                                                    <p style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={16} color="var(--accent-primary)" /> {(ad.views || 0).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Clics Únicos</p>
                                                    <p style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}><MousePointer2 size={16} color="var(--accent-secondary)" /> {(ad.clicks || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>${Number(ad.reward || 0).toFixed(4)}</span>
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', background: '#f8f9fa', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e6e9ed' }}>{ad.timer}s</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Límite: <span style={{ color: 'var(--text-primary)' }}>{ad.maxViews || '∞'} clics</span></p>
                                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Reset: <span style={{ color: 'var(--text-primary)' }}>Cada {ad.cooldown || 24}h</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <button onClick={() => toggleStatus(ad.id, ad.status)} style={{
                                                padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                                                background: ad.status === 'Active' ? '#f0fdf4' : '#fff7ed',
                                                color: ad.status === 'Active' ? '#16a34a' : '#ea580c',
                                                border: `1px solid ${ad.status === 'Active' ? '#bbf7d0' : '#ffedd5'}`,
                                                display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ad.status === 'Active' ? '#22c55e' : '#f97316' }}></div>
                                                {ad.status === 'Active' ? 'Activo' : 'Pausado'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => fetchClickLogs(ad.id, ad.title)} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #f0f2f5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-dim)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-secondary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                                    <MousePointer2 size={18} />
                                                </button>
                                                <button onClick={() => handleEdit(ad)} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #f0f2f5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-dim)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-secondary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                                    <Edit3 size={18} />
                                                </button>
                                                <button onClick={() => deleteAd(ad.id)} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #f0f2f5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-dim)' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
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
            )}

            {/* ===== BANNER CAMPAIGNS TABLE ===== */}
            {activeTab === 'banner' && (
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', borderRadius: '2.5rem' }}>
                    {/* Info banner */}
                    <div style={{ padding: '1.25rem 2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Code size={18} color="#6366f1" />
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1' }}>
                            Los banners 300x250 usan código HTML/iframe de redes como Adsterra. Pega el código del anuncio en el campo "Código del Banner".
                        </p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#fafbfc', borderBottom: '1px solid #f0f2f5' }}>
                                <tr>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Campaña</th>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Estadísticas</th>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Recompensa & Timer</th>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem' }}>Estado</th>
                                    <th style={{ ...tableHeadCell, paddingTop: '1.5rem', textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingBanners ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr>
                                ) : bannerAds.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No hay campañas de banner creadas.</td></tr>
                                ) : bannerAds.map((ad, i) => (
                                    <tr key={ad.id} style={{ borderBottom: i === bannerAds.length - 1 ? 'none' : '1px solid #f9fafb' }}>
                                        <td style={{ padding: '1.5rem', maxWidth: '300px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0 }}>
                                                    <Image size={18} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '4px' }}>{ad.title}</p>
                                                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>BANNER 300x250</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '2rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Impresiones</p>
                                                    <p style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={16} color="#6366f1" /> {(ad.views || 0).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Completados</p>
                                                    <p style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} color="#22c55e" /> {(ad.clicks || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#6366f1', fontFamily: 'monospace' }}>${Number(ad.reward || 0).toFixed(4)}</span>
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', background: '#f8f9fa', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e6e9ed' }}>{ad.timer}s</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Límite: <span style={{ color: 'var(--text-primary)' }}>{ad.maxViews || '∞'}</span></p>
                                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Reset: <span style={{ color: 'var(--text-primary)' }}>Cada {ad.cooldown || 24}h</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <button onClick={() => toggleBannerStatus(ad.id, ad.status)} style={{
                                                padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                                                background: ad.status === 'Active' ? '#f0fdf4' : '#fff7ed',
                                                color: ad.status === 'Active' ? '#16a34a' : '#ea580c',
                                                border: `1px solid ${ad.status === 'Active' ? '#bbf7d0' : '#ffedd5'}`,
                                                display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ad.status === 'Active' ? '#22c55e' : '#f97316' }}></div>
                                                {ad.status === 'Active' ? 'Activo' : 'Pausado'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleEditBanner(ad)} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #f0f2f5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-dim)' }} onMouseEnter={e => e.currentTarget.style.color = '#6366f1'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                                    <Edit3 size={18} />
                                                </button>
                                                <button onClick={() => deleteBannerAd(ad.id)} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #f0f2f5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-dim)' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
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
            )}

            {/* ===== URL Campaign Modal ===== */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '2rem' }}>
                    <div style={{ ...cardStyle, width: '100%', maxWidth: '600px', padding: '3rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2.5rem' }}>{editingId ? 'Editar Campaña URL' : 'Configurar Nueva Campaña URL'}</h2>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Nombre Público</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required type="text" placeholder="Ej: Video Tutorial" style={inputModalStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>URL del Logo (Opcional)</label>
                                    <input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} type="text" placeholder="https://..." style={inputModalStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Texto de la Notificación</label>
                                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required type="text" placeholder="¿Ver sitio y ganar recompensa?" style={inputModalStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Enlace de Destino (URL)</label>
                                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required type="url" placeholder="https://youtube.com/..." style={inputModalStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Recompensa por Clic ($)</label>
                                    <input value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })} required type="number" step="0.0001" placeholder="0.005" style={inputModalStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Duración Obligatoria (Seg)</label>
                                    <input value={form.timer} onChange={e => setForm({ ...form, timer: e.target.value })} required type="number" placeholder="15" style={inputModalStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Límite Total</label>
                                    <input value={form.maxViews} onChange={e => setForm({ ...form, maxViews: e.target.value })} required type="number" placeholder="Ej: 1000" style={inputModalStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Periodo (Horas)</label>
                                    <input value={form.cooldown} onChange={e => setForm({ ...form, cooldown: e.target.value })} required type="number" placeholder="Ej: 24" style={inputModalStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Clics en Periodo</label>
                                    <input value={form.clicksPerPeriod} onChange={e => setForm({ ...form, clicksPerPeriod: e.target.value })} required type="number" placeholder="Ej: 5" style={inputModalStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e6e9ed', background: 'none', fontWeight: 900, cursor: 'pointer', color: 'var(--text-dim)' }}>CANCELAR</button>
                                <button type="submit" style={{ flex: 2, padding: '1.25rem', borderRadius: '1.25rem', fontSize: '1rem', fontWeight: 900, cursor: 'pointer', border: 'none', color: '#fff', background: 'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)' }}>
                                    {editingId ? 'GUARDAR CAMBIOS' : 'GUARDAR Y ACTIVAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Banner Campaign Modal ===== */}
            {showBannerModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '2rem' }}>
                    <div style={{ ...cardStyle, width: '100%', maxWidth: '650px', padding: '3rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>{editingBannerId ? 'Editar Campaña Banner' : 'Nueva Campaña Banner 300x250'}</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>Este tipo de anuncio muestra un banner embed (Adsterra, etc.) dentro de un modal con temporizador.</p>
                        <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Nombre de la Campaña</label>
                                <input value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} required type="text" placeholder="Ej: Banner Adsterra #1" style={inputModalStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Code size={14} /> Código del Banner (HTML/iframe)
                                </label>
                                <textarea
                                    value={bannerForm.bannerCode}
                                    onChange={e => setBannerForm({ ...bannerForm, bannerCode: e.target.value })}
                                    required
                                    placeholder='<iframe src="..." width="300" height="250"></iframe>'
                                    style={{ ...inputModalStyle, minHeight: '120px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                                />
                                <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>Pega aquí el código HTML/iframe que te da tu red publicitaria (Adsterra, PropellerAds, etc.)</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Recompensa por Vista ($)</label>
                                    <input value={bannerForm.reward} onChange={e => setBannerForm({ ...bannerForm, reward: e.target.value })} required type="number" step="0.0001" placeholder="0.002" style={inputModalStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Duración del Timer (Seg)</label>
                                    <input value={bannerForm.timer} onChange={e => setBannerForm({ ...bannerForm, timer: e.target.value })} required type="number" placeholder="20" style={inputModalStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Límite de Vistas Totales</label>
                                    <input value={bannerForm.maxViews} onChange={e => setBannerForm({ ...bannerForm, maxViews: e.target.value })} required type="number" placeholder="Ej: 5000" style={inputModalStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>Frecuencia (Horas)</label>
                                    <input value={bannerForm.cooldown} onChange={e => setBannerForm({ ...bannerForm, cooldown: e.target.value })} required type="number" placeholder="Ej: 24" style={inputModalStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => { setShowBannerModal(false); resetBannerForm(); }} style={{ flex: 1, padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e6e9ed', background: 'none', fontWeight: 900, cursor: 'pointer', color: 'var(--text-dim)' }}>CANCELAR</button>
                                <button type="submit" style={{ flex: 2, padding: '1.25rem', borderRadius: '1.25rem', fontSize: '1rem', fontWeight: 900, cursor: 'pointer', border: 'none', color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                    {editingBannerId ? 'GUARDAR CAMBIOS' : 'GUARDAR Y ACTIVAR BANNER'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Click History Modal */}
            {showClicksModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: '2.5rem', width: '100%', maxWidth: '600px', padding: '2.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Registro de Clics</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>Campaña: {selectedAdTitle}</p>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '2rem' }}>
                            {loadingLogs ? (
                                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Cargando...</p>
                            ) : clickLogs.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No hay clics registrados aún.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#fff' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)' }}>USUARIO</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)' }}>RECOMPENSA</th>
                                            <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)' }}>FECHA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clickLogs.map(log => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                                                <td style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>{log.userEmail || log.userId}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 900, color: '#22c55e' }}>${log.amount}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                                                    {log.createdAt?.toMillis() ? new Date(log.createdAt.toMillis()).toLocaleString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <button
                            onClick={() => setShowClicksModal(false)}
                            style={{ width: '100%', padding: '1.25rem', borderRadius: '1.25rem', background: '#f8f9fa', border: '1px solid #e6e9ed', fontWeight: 900, fontSize: '11px', cursor: 'pointer' }}
                        >
                            CERRAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
