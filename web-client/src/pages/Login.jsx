import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const errorMessages = {
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/user-not-found': 'No existe una cuenta con ese correo.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
        'auth/network-request-failed': 'Sin conexión a internet.',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(errorMessages[err.code] || 'Error al iniciar sesión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background blobs */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-10%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(0,160,233,0.12) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-10%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(76,209,55,0.10) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ width: '100%', maxWidth: '440px', position: 'relative' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            background: 'linear-gradient(135deg, #00a0e9, #4cd137)',
                            borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Zap size={26} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>
                            AD<span style={{ background: 'linear-gradient(135deg, #00a0e9, #4cd137)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SHARE</span>
                        </span>
                    </Link>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 600 }}>
                        Bienvenido de vuelta
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '2rem',
                    padding: '2.5rem',
                    backdropFilter: 'blur(20px)'
                }}>
                    <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                        Iniciar sesión
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 500 }}>
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" style={{ color: '#00a0e9', fontWeight: 700, textDecoration: 'none' }}>
                            Regístrate gratis
                        </Link>
                    </p>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.3)',
                                borderRadius: '0.85rem', padding: '0.85rem 1rem',
                                color: '#ff6b6b', fontSize: '0.85rem', fontWeight: 600,
                                marginBottom: '1.5rem'
                            }}
                        >
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Correo electrónico
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tucorreo@ejemplo.com"
                                    style={{
                                        width: '100%', paddingLeft: '2.8rem', paddingRight: '1rem',
                                        paddingTop: '0.85rem', paddingBottom: '0.85rem',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.85rem', color: 'white', fontSize: '0.9rem',
                                        outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#00a0e9'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    id="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', paddingLeft: '2.8rem', paddingRight: '3rem',
                                        paddingTop: '0.85rem', paddingBottom: '0.85rem',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.85rem', color: 'white', fontSize: '0.9rem',
                                        outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#00a0e9'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0 }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                width: '100%', padding: '1rem',
                                background: loading ? 'rgba(0,160,233,0.5)' : 'linear-gradient(135deg, #00a0e9, #0087c7)',
                                border: 'none', borderRadius: '0.85rem',
                                color: 'white', fontSize: '0.95rem', fontWeight: 800,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.05em', fontFamily: 'inherit',
                                boxShadow: '0 8px 25px rgba(0,160,233,0.3)',
                                transition: 'all 0.2s', transform: 'scale(1)'
                            }}
                            onMouseEnter={e => { if (!loading) e.target.style.transform = 'scale(1.02)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
                        >
                            {loading ? 'Ingresando...' : 'INICIAR SESIÓN'}
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
