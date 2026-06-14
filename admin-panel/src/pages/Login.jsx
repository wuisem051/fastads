import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, logout } = useAuth();

    const ADMIN_UID = 'MGJvxAVghfZZpaiz2ElhDq6dTXp1';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const userCredential = await login(email, password);

            if (userCredential.user.uid !== ADMIN_UID) {
                await logout();
                throw new Error('NO_ADMIN');
            }

            // Wait a moment for context to update
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } catch (err) {
            if (err.message === 'NO_ADMIN') {
                setError('Esta cuenta no tiene privilegios de administrador.');
            } else {
                setError('Credenciales incorrectas.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: '#1e293b',
                    padding: '3rem',
                    borderRadius: '1.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    maxWidth: '400px',
                    width: '100%',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: '#fff',
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)'
                    }}>
                        <Shield size={32} />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>ACCESO ADMIN</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Autenticación requerida</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Correo de Administrador
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '1rem 1rem 1rem 3rem',
                                    background: '#0f172a', border: '1px solid #334155',
                                    borderRadius: '0.75rem', color: '#fff', fontSize: '0.9rem',
                                    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#334155'}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '1rem 1rem 1rem 3rem',
                                    background: '#0f172a', border: '1px solid #334155',
                                    borderRadius: '0.75rem', color: '#fff', fontSize: '0.9rem',
                                    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#334155'}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            width: '100%', padding: '1rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            color: '#fff', border: 'none', borderRadius: '0.75rem',
                            fontSize: '0.9rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            opacity: loading ? 0.7 : 1, transition: 'transform 0.1s'
                        }}
                        onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
                        onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                        onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                    >
                        {loading ? 'VERIFICANDO...' : 'ENTRAR AL PANEL'} <ArrowRight size={18} />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
