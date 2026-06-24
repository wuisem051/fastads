import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Droplet, ExternalLink, Clock, CheckCircle2, Lock, Sparkles, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Faucet() {
    const { currentUser, userProfile } = useAuth();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'faucet'), (snap) => {
            if (snap.exists()) {
                setConfig(snap.data());
            }
            setChecking(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!config || !userProfile) return;

        const updateTimer = () => {
            if (userProfile.lastFaucetClaim) {
                const lastClaimTime = userProfile.lastFaucetClaim.toMillis ? userProfile.lastFaucetClaim.toMillis() : userProfile.lastFaucetClaim;
                const cooldownMs = (config.cooldownMinutes || 5) * 60 * 1000;
                const nextClaimTime = lastClaimTime + cooldownMs;
                const now = Date.now();

                if (now < nextClaimTime) {
                    setTimeRemaining(Math.ceil((nextClaimTime - now) / 1000));
                } else {
                    setTimeRemaining(0);
                }
            } else {
                setTimeRemaining(0);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [config, userProfile?.lastFaucetClaim]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleClaim = async () => {
        if (!config || !config.url || timeRemaining > 0) return;
        setLoading(true);
        try {
            const reward = parseFloat(config.reward) || 0;
            window.open(config.url, '_blank');

            await updateDoc(doc(db, 'users', currentUser.uid), {
                balance: increment(reward),
                totalEarnings: increment(reward),
                lastFaucetClaim: serverTimestamp()
            });

            await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid,
                type: 'faucet_claim',
                amount: reward,
                description: 'Reclamo de Grifo (Faucet)',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al reclamar el grifo:", error);
            alert("Hubo un error al procesar tu reclamo. Inténtalo de nuevo.");
        }
        setLoading(false);
    };

    if (checking) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
            <div className="shimmer" style={{ width: '60px', height: '60px', borderRadius: '1.5rem', background: '#e2e8f0' }}></div>
            <div className="shimmer" style={{ width: '200px', height: '24px', borderRadius: '0.5rem', background: '#e2e8f0' }}></div>
        </div>
    );

    if (!config || config.isActive === false) return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                maxWidth: '500px', margin: '4rem auto', textAlign: 'center',
                background: '#fff', padding: '4rem 2rem', borderRadius: '2.5rem',
                border: '1px solid #e6e9ed', boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
            }}
        >
            <div style={{ width: '5rem', height: '5rem', background: '#f8fafc', color: '#64748b', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                <Lock size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Grifo No Disponible</h2>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                Actualmente no hay recompensas disponibles en el grifo. Vuelve más tarde o completa otras tareas para seguir ganando.
            </p>
            <button
                onClick={() => window.location.href = '/dashboard'}
                className="gradient-btn"
                style={{ padding: '1rem 2.5rem', borderRadius: '1rem', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase' }}
            >
                Volver al Panel
            </button>
        </motion.div>
    );

    const isReady = timeRemaining <= 0;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
                        Grifo de <span style={{ color: 'var(--accent-secondary)' }}>Energía</span>
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', fontWeight: 600 }}>
                        Recoge ganancias gratuitas cada {config.cooldownMinutes} minutos.
                    </p>
                </div>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', background: '#fff', border: '1px solid #e6e9ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <Droplet size={28} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Main Action Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        background: '#fff', borderRadius: '2.5rem', padding: '3rem',
                        border: '1px solid #e6e9ed', boxShadow: '0 15px 50px rgba(0,0,0,0.05)',
                        position: 'relative', overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.05, pointerEvents: 'none' }}>
                        <Droplet size={120} />
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent-secondary)', letterSpacing: '0.1em', background: 'rgba(0,160,233,0.05)', padding: '4px 12px', borderRadius: '99px' }}>
                            Recompensa por Reclamo
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '1rem' }}>
                            <span style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--text-primary)' }}>${config.reward}</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dim)' }}>USD</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <AnimatePresence mode="wait">
                            {isReady ? (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#16a34a' }}
                                >
                                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Sparkles size={18} />
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>¡Todo listo para reclamar!</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="waiting"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-dim)' }}
                                >
                                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Timer size={18} />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Vuelve en {formatTime(timeRemaining)}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleClaim}
                        disabled={!isReady || loading}
                        className={isReady ? "gradient-btn" : ""}
                        style={{
                            width: '100%', padding: '1.5rem', borderRadius: '1.5rem',
                            fontSize: '1.1rem', fontWeight: 900,
                            background: isReady ? '' : '#f1f5f9',
                            color: isReady ? '#fff' : '#94a3b8',
                            border: 'none', cursor: isReady ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                            transition: 'all 0.3s',
                            boxShadow: isReady ? '0 10px 30px rgba(0,160,233,0.3)' : 'none'
                        }}
                    >
                        {loading ? 'Sincronizando...' : (
                            <>
                                {isReady ? 'RECLAMAR AHORA' : 'BLOQUEADO'}
                                {isReady ? <ExternalLink size={20} /> : <Lock size={18} />}
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Info Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            borderRadius: '2rem',
                            padding: '2.5rem',
                            color: '#fff',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <h4 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2.5rem', opacity: 0.6 }}>Información</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <li style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                <CheckCircle2 size={24} color="#00a0e9" style={{ flexShrink: 0 }} />
                                <span style={{ opacity: 0.9 }}>Reclama ilimitadamente siempre que el contador llegue a cero.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                <CheckCircle2 size={24} color="#00a0e9" style={{ flexShrink: 0 }} />
                                <span style={{ opacity: 0.9 }}>El saldo se acredita instantáneamente a tu cuenta principal.</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                        style={{ background: '#fff', borderRadius: '2rem', padding: '2rem', border: '1px solid #e6e9ed' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(76,209,55,0.1)', color: '#4cd137', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)' }}>Siguiente Reclamo</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 900 }}>{isReady ? '¡DISPONIBLE!' : formatTime(timeRemaining)}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .shimmer {
                    animation: shimmer 1.5s infinite linear;
                    background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
                    background-size: 200% 100%;
                }
                @keyframes shimmer {
                    from { background-position: -100% 0; }
                    to { background-position: 100% 0; }
                }
            `}</style>
        </div>
    );
}
