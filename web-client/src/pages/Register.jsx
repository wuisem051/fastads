import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const errorMessages = {
        'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email': 'El correo electrónico no es válido.',
        'auth/network-request-failed': 'Sin conexión a internet.',
    };

    const passwordStrength = () => {
        const p = form.password;
        if (!p) return 0;
        let score = 0;
        if (p.length >= 6) score++;
        if (p.length >= 10) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };

    const strengthColors = ['', '#ff4757', '#ff6b35', '#ffa502', '#2ed573', '#4cd137'];
    const strengthLabels = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
    const strength = passwordStrength();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) {
            return setError('Las contraseñas no coinciden.');
        }
        if (form.password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres.');
        }
        setLoading(true);
        try {
            await register(form.email, form.password, form.name);
            navigate('/dashboard');
        } catch (err) {
            setError(errorMessages[err.code] || 'Error al registrarse. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', paddingLeft: '2.8rem', paddingRight: '1rem',
        paddingTop: '0.85rem', paddingBottom: '0.85rem',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.85rem', color: 'white', fontSize: '0.9rem',
        outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
        transition: 'border-color 0.2s'
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(76,209,55,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,160,233,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ width: '100%', maxWidth: '460px', position: 'relative' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #00a0e9, #4cd137)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={26} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>
                            AD<span style={{ background: 'linear-gradient(135deg, #00a0e9, #4cd137)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SHARE</span>
                        </span>
                    </Link>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 600 }}>
                        Crea tu cuenta gratis hoy
                    </p>
                </div>

                {/* Card */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2rem', padding: '2.5rem', backdropFilter: 'blur(20px)' }}>
                    <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                        Crear cuenta
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 500 }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" style={{ color: '#4cd137', fontWeight: 700, textDecoration: 'none' }}>
                            Inicia sesión
                        </Link>
                    </p>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '0.85rem', padding: '0.85rem 1rem', color: '#ff6b6b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {/* Name */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nombre completo</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input id="reg-name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Tu nombre" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#4cd137'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Correo electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input id="reg-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="tucorreo@ejemplo.com" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#4cd137'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input id="reg-password" name="password" type={showPass ? 'text' : 'password'} required value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres"
                                    style={{ ...inputStyle, paddingRight: '3rem' }}
                                    onFocus={e => e.target.style.borderColor = '#4cd137'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0 }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {form.password && (
                                <div style={{ marginTop: '0.6rem' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', transition: 'background 0.3s', background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }} />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.72rem', color: strengthColors[strength], fontWeight: 700, marginTop: '0.3rem' }}>{strengthLabels[strength]}</p>
                                </div>
                            )}
                        </div>

                        {/* Confirm */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Confirmar contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input id="reg-confirm" name="confirm" type={showPass ? 'text' : 'password'} required value={form.confirm} onChange={handleChange} placeholder="Repite tu contraseña"
                                    style={{ ...inputStyle, paddingRight: '3rem', borderColor: form.confirm && form.confirm === form.password ? 'rgba(76,209,55,0.5)' : undefined }}
                                    onFocus={e => e.target.style.borderColor = '#4cd137'}
                                    onBlur={e => e.target.style.borderColor = form.confirm === form.password ? 'rgba(76,209,55,0.5)' : 'rgba(255,255,255,0.1)'} />
                                {form.confirm && form.confirm === form.password && (
                                    <CheckCircle2 size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4cd137' }} />
                                )}
                            </div>
                        </div>

                        {/* Bono badge */}
                        <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(76,209,55,0.08)', border: '1px solid rgba(76,209,55,0.2)', borderRadius: '0.85rem' }}>
                            <p style={{ color: '#4cd137', fontSize: '0.8rem', fontWeight: 700 }}>
                                🎁 Bono de bienvenida: +5% en tus primeras 100 vistas
                            </p>
                        </div>

                        <button id="reg-submit" type="submit" disabled={loading}
                            style={{
                                width: '100%', padding: '1rem',
                                background: loading ? 'rgba(76,209,55,0.4)' : 'linear-gradient(135deg, #4cd137, #2ecc71)',
                                border: 'none', borderRadius: '0.85rem', color: 'white', fontSize: '0.95rem', fontWeight: 800,
                                cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.05em', fontFamily: 'inherit',
                                boxShadow: '0 8px 25px rgba(76,209,55,0.25)', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { if (!loading) e.target.style.transform = 'scale(1.02)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
                        >
                            {loading ? 'Creando cuenta...' : 'CREAR MI CUENTA GRATIS'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '1.5rem', fontWeight: 600 }}>
                    © 2026 ADSHARE FAST. Todos los derechos reservados.
                </p>
            </motion.div>
        </div>
    );
}
