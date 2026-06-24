import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Droplet, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Faucet() {
    const { currentUser, userProfile } = useAuth();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'faucet'), (snap) => {
            if (snap.exists()) {
                setConfig(snap.data());
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!config || !userProfile) return;

        const updateTimer = () => {
            if (userProfile.lastFaucetClaim) {
                // Determine if it is a firestore timestamp or raw ms
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
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleClaim = async () => {
        if (!config || !config.url || timeRemaining > 0) return;
        setLoading(true);
        try {
            const reward = parseFloat(config.reward) || 0;

            // Open the URL first so it won't be blocked as strongly by pop-up blockers natively
            window.open(config.url, '_blank');

            // Update user balance and last claim time
            await updateDoc(doc(db, 'users', currentUser.uid), {
                balance: increment(reward),
                totalEarnings: increment(reward),
                lastFaucetClaim: serverTimestamp()
            });

            // Record transaction
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

    if (!config) return <div className="p-8 text-center" style={{ color: 'var(--text-dim)' }}>Cargando grifo...</div>;

    if (config.isActive === false) return (
        <div className="fade-in max-w-2xl mx-auto text-center" style={{ padding: '4rem 2rem' }}>
            <Droplet size={48} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
            <h2 className="text-2xl font-bold mb-2">Grifo Desactivado</h2>
            <p style={{ color: 'var(--text-dim)' }}>El grifo se encuentra temporalmente fuera de servicio.</p>
        </div>
    );

    const isReady = timeRemaining <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fade-in max-w-2xl mx-auto"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: 'rgba(0,160,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                    <Droplet size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, m: 0 }}>Grifo de Ganancias</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Reclama recompensas cada {config.cooldownMinutes} minutos</p>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '3rem 2rem', textAlign: 'center', border: '1px solid #e6e9ed', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Recompensa Actual</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(76,209,55,0.1)', color: '#4cd137', padding: '0.75rem 1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900 }}>${config.reward}</span>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    {isReady ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#4cd137' }}>
                            <CheckCircle2 size={32} />
                            <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>¡Tu recompensa está lista!</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Al reclamar, se abrirá un anuncio patrocinado.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)' }}>
                                <Clock size={24} />
                                <span className="font-digital" style={{ fontSize: '2.5rem', lineHeight: 1 }}>{formatTime(timeRemaining)}</span>
                            </div>
                            <p style={{ fontWeight: 700, color: 'var(--text-dim)', fontSize: '0.9rem' }}>Para tu próximo reclamo</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleClaim}
                    disabled={!isReady || loading}
                    style={{
                        padding: '1.25rem 3rem', borderRadius: '1rem',
                        fontSize: '1.1rem', fontWeight: 900,
                        background: (isReady && !loading) ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : '#e6e9ed',
                        color: (isReady && !loading) ? '#fff' : '#9ca3af',
                        border: 'none', cursor: (isReady && !loading) ? 'pointer' : 'not-allowed',
                        display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                        transition: 'all 0.3s',
                        boxShadow: (isReady && !loading) ? '0 10px 25px rgba(0,160,233,0.3)' : 'none',
                        transform: (isReady && !loading) ? 'scale(1)' : 'scale(0.98)'
                    }}
                    onMouseEnter={e => { if (isReady && !loading) e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseLeave={e => { if (isReady && !loading) e.currentTarget.style.transform = 'scale(1)' }}
                >
                    {loading ? 'Procesando...' : (
                        <>
                            Reclamar Recompensa <ExternalLink size={20} />
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
