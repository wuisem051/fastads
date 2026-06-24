import React, { useState, useEffect } from 'react';
import { Camera, Mail, User, Lock, CreditCard, Save, ShieldCheck, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const card = {
    background: '#fff',
    borderRadius: '2.5rem',
    padding: '2.5rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const labelStyle = {
    display: 'block',
    fontSize: '10px', fontWeight: 900,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-dim)', marginBottom: '0.5rem', paddingLeft: '0.5rem',
};

const inputStyle = {
    width: '100%', background: '#f8f9fa',
    border: '1px solid #e6e9ed', borderRadius: '1rem',
    padding: '1rem 1.25rem', fontSize: '0.875rem',
    fontWeight: 700, color: 'var(--text-primary)',
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    fontFamily: 'inherit',
};

const iconInputStyle = {
    ...inputStyle,
    paddingLeft: '3.25rem',
};

const IconWrap = ({ children }) => (
    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
        {children}
    </div>
);

export default function Settings() {
    const { currentUser, userProfile, fetchProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        usdt_address: '',
        ltc_address: '',
        doge_address: '',
        extensionEarningsEnabled: true
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                displayName: userProfile.displayName || '',
                email: userProfile.email || '',
                usdt_address: userProfile.usdt_address || '',
                ltc_address: userProfile.ltc_address || '',
                doge_address: userProfile.doge_address || '',
                extensionEarningsEnabled: userProfile.extensionEarningsEnabled !== false
            });
        }
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, extensionEarningsEnabled: !prev.extensionEarningsEnabled }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                displayName: formData.displayName,
                usdt_address: formData.usdt_address,
                ltc_address: formData.ltc_address,
                doge_address: formData.doge_address,
                extensionEarningsEnabled: formData.extensionEarningsEnabled
            });
            await fetchProfile(currentUser.uid, currentUser);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al actualizar el perfil.");
        } finally {
            setLoading(false);
        }
    };

    const focusInput = e => { e.target.style.borderColor = 'var(--accent-secondary)'; e.target.style.background = '#fff'; };
    const blurInput = e => { e.target.style.borderColor = '#e6e9ed'; e.target.style.background = '#f8f9fa'; };

    const firstLetter = (formData.displayName || 'U').charAt(0).toUpperCase();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Ajustes del Perfil</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Gestiona tu seguridad, pagos e información personal.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '0.875rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                    <ShieldCheck size={18} />
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado: Protegido</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                {/* Profile Sidebar */}
                <div>
                    <div style={{ ...card, textAlign: 'center', position: 'sticky', top: '7rem' }}>
                        <div style={{ position: 'relative', width: '9rem', height: '9rem', margin: '0 auto 1.5rem' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '3px' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', overflow: 'hidden' }}>
                                    {userProfile?.photoURL ? (
                                        <img src={userProfile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        firstLetter
                                    )}
                                </div>
                            </div>
                            <button type="button" className="gradient-btn" style={{ position: 'absolute', bottom: '2px', right: '2px', width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', border: '3px solid #fff', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.25rem' }}>{formData.displayName}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>
                            Miembro desde {userProfile?.createdAt ? new Date(userProfile.createdAt.toMillis()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Junio 2026'}
                        </p>
                        <div style={{ background: '#f8f9fa', borderRadius: '1rem', padding: '1rem' }}>
                            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '4px' }}>Tu Rango</p>
                            <p style={{ fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
                                {userProfile?.role === 'admin' ? 'ADMIN MASTER' : 'PRO MEMBER'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Personal Info */}
                    <div style={card}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <User size={22} color="var(--accent-secondary)" /> Datos Personales
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Nombre de Usuario</label>
                                <div style={{ position: 'relative' }}>
                                    <IconWrap><User size={20} /></IconWrap>
                                    <input
                                        type="text"
                                        name="displayName"
                                        style={iconInputStyle}
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        onFocus={focusInput}
                                        onBlur={blurInput}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>E-mail</label>
                                <div style={{ position: 'relative' }}>
                                    <IconWrap><Mail size={20} /></IconWrap>
                                    <input
                                        type="email"
                                        style={{ ...iconInputStyle, opacity: 0.7, cursor: 'not-allowed' }}
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Earnings Preferences */}
                    <div style={{ ...card, border: '2px solid rgba(0,160,233,0.1)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <SettingsIcon size={22} color="var(--accent-secondary)" /> Preferencias de Ganancias
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8f9fa', padding: '1.5rem', borderRadius: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '4px' }}>Extensión de FastAds</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                                    Activa esta opción para recibir anuncios automáticos y ganar dinero mientras navegas.
                                </p>
                            </div>
                            <div
                                onClick={handleToggle}
                                style={{
                                    cursor: 'pointer',
                                    color: formData.extensionEarningsEnabled ? 'var(--accent-secondary)' : 'var(--text-dim)',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {formData.extensionEarningsEnabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div style={{ ...card, background: '#fafbfc' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CreditCard size={22} color="var(--accent-secondary)" /> Métodos de Pago
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>USDT — Dirección TRC20</label>
                                <input
                                    type="text"
                                    name="usdt_address"
                                    style={inputStyle}
                                    placeholder="TXxx..."
                                    value={formData.usdt_address}
                                    onChange={handleChange}
                                    onFocus={focusInput}
                                    onBlur={blurInput}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Dirección Litecoin (LTC)</label>
                                <input
                                    type="text"
                                    name="ltc_address"
                                    style={inputStyle}
                                    placeholder="L..."
                                    value={formData.ltc_address}
                                    onChange={handleChange}
                                    onFocus={focusInput}
                                    onBlur={blurInput}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Dirección Dogecoin (DOGE)</label>
                                <input
                                    type="text"
                                    name="doge_address"
                                    style={inputStyle}
                                    placeholder="D..."
                                    value={formData.doge_address}
                                    onChange={handleChange}
                                    onFocus={focusInput}
                                    onBlur={blurInput}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
                        {success && (
                            <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle2 size={18} /> ¡Cambios guardados con éxito!
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="gradient-btn"
                            style={{
                                padding: '1.25rem 3rem',
                                borderRadius: '1.25rem',
                                fontSize: '1rem',
                                fontWeight: 900,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 8px 24px rgba(0,160,233,0.25)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            <Save size={22} /> {loading ? 'Guardando...' : 'Guardar Configuración'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
