import React, { useState, useRef, useEffect } from 'react';
import { Settings, Shield, Globe, Bell, Zap, Database, Lock, UserPlus, Image, Type, Save, CheckCircle, Percent } from 'lucide-react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import logoImg from '../assets/logo.png';

const cardStyle = {
    background: '#fff',
    borderRadius: '2rem',
    padding: '2rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const settingItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    background: '#fafbfc',
    borderRadius: '1.5rem',
    border: '1px solid #f0f2f5',
    transition: 'all 0.2s',
};

const toggleStyle = (active) => ({
    width: '3.5rem',
    height: '1.75rem',
    borderRadius: '2rem',
    background: active ? 'rgba(76,209,55,0.15)' : 'rgba(0,0,0,0.05)',
    border: active ? '1px solid #4cd137' : '1px solid #e6e9ed',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
});

const handleStyle = (active) => ({
    position: 'absolute',
    left: active ? 'calc(100% - 1.5rem - 4px)' : '4px',
    top: '4px',
    width: '1.25rem',
    height: '1.25rem',
    borderRadius: '50%',
    background: active ? '#4cd137' : '#ced6e0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? '0 2px 8px rgba(76,209,55,0.4)' : 'none',
});

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

const SettingRow = ({ icon: Icon, title, desc, active }) => (
    <div style={settingItemStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '14px', background: '#fff', border: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'var(--accent-secondary)' : 'var(--text-dim)' }}>
                <Icon size={20} />
            </div>
            <div>
                <p style={{ fontWeight: 900, fontSize: '0.925rem', marginBottom: '4px' }}>{title}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{desc}</p>
            </div>
        </div>
        <div style={toggleStyle(active)}>
            <div style={handleStyle(active)}></div>
        </div>
    </div>
);

export default function AdminSettings() {
    const [brandName, setBrandName] = useState(localStorage.getItem('brand_name') || 'FASTADS');
    const [previewLogo, setPreviewLogo] = useState(localStorage.getItem('brand_logo') || logoImg);
    const [referralPercent, setReferralPercent] = useState(10);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileRef = useRef();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'general'));
                if (snap.exists()) {
                    const data = snap.data();
                    setBrandName(data.brandName || 'FASTADS');
                    setPreviewLogo(data.brandLogo || logoImg);
                    setReferralPercent(data.referralPercent || 10);
                    localStorage.setItem('brand_name', data.brandName || 'FASTADS');
                    localStorage.setItem('brand_logo', data.brandLogo || logoImg);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchSettings();
    }, []);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreviewLogo(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveGlobal = async () => {
        try {
            await setDoc(doc(db, 'settings', 'general'), {
                brandName,
                brandLogo: previewLogo,
                referralPercent: parseFloat(referralPercent),
                updatedAt: serverTimestamp()
            });
            localStorage.setItem('brand_name', brandName);
            localStorage.setItem('brand_logo', previewLogo);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert("Error guardando ajustes: " + e.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Ajustes Globales</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Configura el comportamiento, identidad y seguridad de toda la red.
                </p>
            </div>

            {/* BRAND IDENTITY SECTION */}
            <div style={cardStyle}>
                <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Image size={22} color="var(--accent-secondary)" /> Identidad de Marca
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'center' }}>
                    {/* Logo Preview & Upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={previewLogo}
                                alt="logo preview"
                                style={{ width: '100px', height: '100px', borderRadius: '22px', objectFit: 'cover', border: '3px solid #e6e9ed', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                            />
                            <button
                                onClick={() => fileRef.current.click()}
                                style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--accent-secondary)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', boxShadow: '0 4px 12px rgba(0,160,233,0.3)' }}
                            >
                                <Image size={16} />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 900, textAlign: 'center' }}>Haz clic en el icono para cambiar el logo</p>
                    </div>

                    {/* Name Field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Type size={14} /> Nombre de la Plataforma
                            </label>
                            <input
                                style={inputStyle}
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                placeholder="Ej: FASTADS"
                            />
                        </div>
                        <div style={{ padding: '1.25rem', background: '#f8f9fa', borderRadius: '1rem', border: '1px solid #f0f2f5' }}>
                            <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>VISTA PREVIA DEL SIDEBAR</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#222d32', padding: '0.875rem 1rem', borderRadius: '0.875rem' }}>
                                <img src={previewLogo} alt="preview" style={{ width: '2rem', height: '2rem', borderRadius: '8px', objectFit: 'cover' }} />
                                <span style={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>{brandName}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveGlobal}
                            style={{ padding: '1rem 2rem', borderRadius: '1rem', background: saved ? '#4cd137' : 'var(--accent-secondary)', border: 'none', color: '#fff', fontWeight: 900, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'flex-start', transition: 'all 0.3s', boxShadow: saved ? '0 4px 15px rgba(76,209,55,0.3)' : '0 4px 15px rgba(0,160,233,0.2)' }}
                        >
                            {saved ? <><CheckCircle size={18} /> ¡Guardado!</> : <><Save size={18} /> Guardar Identidad</>}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={cardStyle}>
                        <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={22} color="var(--accent-secondary)" /> Control de Sistema
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <SettingRow icon={Zap} title="Mantenimiento Global" desc="Desactivar todas las operaciones" active={false} />
                            <SettingRow icon={UserPlus} title="Registro de Usuarios" desc="Permitir nuevas cuentas" active={true} />
                            <SettingRow icon={Lock} title="Verificación 2FA Forzosa" desc="Requerir para todos los usuarios" active={false} />
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserPlus size={22} color="#f1c40f" /> Sistema de Referidos
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={settingItemStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '3rem', height: '3rem', borderRadius: '14px', background: '#fff', border: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f1c40f' }}>
                                        <Percent size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 900, fontSize: '0.925rem', marginBottom: '4px' }}>Comisión por Visita</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>% que gana el patrocinador</p>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    style={{ ...inputStyle, width: '80px', textAlign: 'center' }}
                                    value={referralPercent}
                                    onChange={(e) => setReferralPercent(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Globe size={22} color="var(--accent-primary)" /> Configuración de Red
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <SettingRow icon={Bell} title="Notificaciones Push" desc="Alertas de navegador activas" active={true} />
                            <SettingRow icon={Database} title="Copia de Seguridad" desc="Automatizada cada 24 horas" active={true} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ ...cardStyle, background: 'var(--bg-sidebar)', color: '#fff' }}>
                        <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Guardar Cambios</h2>
                        <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '2rem' }}>Asegúrate de revisar todos los ajustes antes de guardar ya que se aplicarán en tiempo real a todos los usuarios.</p>
                        <button
                            onClick={handleSaveGlobal}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '1rem',
                                background: saved ? '#4cd137' : 'var(--accent-primary)',
                                border: 'none', color: '#fff', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer',
                                transition: 'all 0.3s', boxShadow: saved ? '0 8px 24px rgba(76,209,55,0.4)' : '0 8px 24px rgba(0,160,233,0.3)'
                            }}
                        >
                            {saved ? '¡TODO GUARDADO!' : 'GUARDAR AJUSTES GLOBALES'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
