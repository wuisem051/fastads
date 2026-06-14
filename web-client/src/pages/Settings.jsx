import React from 'react';
import { Camera, Mail, User, Lock, CreditCard, Save, ShieldCheck } from 'lucide-react';

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
    const focusInput = e => { e.target.style.borderColor = 'var(--accent-secondary)'; e.target.style.background = '#fff'; };
    const blurInput = e => { e.target.style.borderColor = '#e6e9ed'; e.target.style.background = '#f8f9fa'; };

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                {/* Profile Sidebar */}
                <div>
                    <div style={{ ...card, textAlign: 'center', position: 'sticky', top: '7rem' }}>
                        <div style={{ position: 'relative', width: '9rem', height: '9rem', margin: '0 auto 1.5rem' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '3px' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>W</div>
                            </div>
                            <button className="gradient-btn" style={{ position: 'absolute', bottom: '2px', right: '2px', width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', border: '3px solid #fff', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.25rem' }}>Wuisem</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>Miembro desde Junio 2026</p>
                        <div style={{ background: '#f8f9fa', borderRadius: '1rem', padding: '1rem' }}>
                            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '4px' }}>Tu Rango</p>
                            <p style={{ fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>PRO MEMBER</p>
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
                                    <input type="text" style={iconInputStyle} defaultValue="Wuisem" onFocus={focusInput} onBlur={blurInput} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>E-mail</label>
                                <div style={{ position: 'relative' }}>
                                    <IconWrap><Mail size={20} /></IconWrap>
                                    <input type="email" style={iconInputStyle} defaultValue="wuisem051@gmail.com" onFocus={focusInput} onBlur={blurInput} />
                                </div>
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
                                <input type="text" style={inputStyle} placeholder="TXxx..." onFocus={focusInput} onBlur={blurInput} />
                            </div>
                            <div>
                                <label style={labelStyle}>Dirección Litecoin (LTC)</label>
                                <input type="text" style={inputStyle} placeholder="L..." onFocus={focusInput} onBlur={blurInput} />
                            </div>
                            <div>
                                <label style={labelStyle}>Dirección Dogecoin (DOGE)</label>
                                <input type="text" style={inputStyle} placeholder="D..." onFocus={focusInput} onBlur={blurInput} />
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div style={card}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Lock size={22} color="var(--accent-secondary)" /> Seguridad de Cuenta
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Nueva Contraseña</label>
                                <input type="password" style={inputStyle} placeholder="••••••••" onFocus={focusInput} onBlur={blurInput} />
                            </div>
                            <div>
                                <label style={labelStyle}>Repetir Contraseña</label>
                                <input type="password" style={inputStyle} placeholder="••••••••" onFocus={focusInput} onBlur={blurInput} />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="gradient-btn" style={{ padding: '1.25rem 3rem', borderRadius: '1.25rem', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 24px rgba(0,160,233,0.25)' }}>
                            <Save size={22} /> Guardar Configuración
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
