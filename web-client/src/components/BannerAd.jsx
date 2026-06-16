import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function BannerAd({ adData, onClose, onComplete }) {
    const { currentUser } = useAuth();
    const [timeLeft, setTimeLeft] = useState(adData?.duration || 15);
    const [status, setStatus] = useState('waiting'); // waiting => success
    const [error, setError] = useState('');

    // Countdown timer logic
    useEffect(() => {
        if (status !== 'waiting') return;

        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            handleComplete();
        }
    }, [timeLeft, status]);

    const handleComplete = async () => {
        setStatus('processing');
        try {
            if (!currentUser) throw new Error("No autenticado");

            const userRef = doc(db, 'users', currentUser.uid);
            const reward = adData?.reward || 0.005;

            // Update user balances
            await updateDoc(userRef, {
                balance: increment(reward),
                totalEarnings: increment(reward),
                adsWatched: increment(1)
            });

            // Update ad click counter (if it's a real ad from Firestore)
            if (adData?.id) {
                const adRef = doc(db, 'ads', adData.id);
                await updateDoc(adRef, {
                    clicks: increment(1)
                });
            }

            // Register transaction in activity feed
            await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid,
                adId: adData?.id || 'demo',
                type: 'ad_view',
                amount: reward,
                description: adData?.title || 'Visualización de Teaser',
                platform: 'BANNER TEASER',
                createdAt: serverTimestamp()
            });

            setStatus('success');
            setTimeout(() => {
                if (onClose) onClose();
                if (onComplete) onComplete();
            }, 3000); // Close automatically after 3 seconds of success

        } catch (err) {
            console.error(err);
            setError("Error acreditando. Intenta de nuevo.");
            setStatus('waiting');
        }
    };

    if (!adData) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '380px',
                    background: '#fff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    border: '1px solid #e1e4e8',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
            >
                {/* Top Header Bar */}
                <div style={{
                    background: status === 'success' ? '#10b981' : '#f59e0b', // Orange when waiting, Green on success
                    color: '#fff',
                    padding: '0.6rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.3s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                        {status === 'waiting' && (
                            <>
                                <Clock size={16} />
                                <span>Por favor espera... Quedan {timeLeft} seg.</span>
                            </>
                        )}
                        {status === 'processing' && <span>Procesando pago...</span>}
                        {status === 'success' && (
                            <>
                                <CheckCircle size={16} />
                                <span>¡Pago acreditado con éxito!</span>
                            </>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.1rem', display: 'flex' }}
                        title="Cerrar (Cancelará la recompensa si no ha terminado)"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content Body */}
                <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', background: '#fafafa' }}>
                    {/* Thumbnail Image */}
                    {adData.imageUrl && (
                        <div style={{ flexShrink: 0 }}>
                            <img
                                src={adData.imageUrl}
                                alt="Ad thumbnail"
                                style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e1e4e8' }}
                            />
                        </div>
                    )}

                    {/* Ad Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                        <a
                            href={adData.targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563eb', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', lineHeight: 1.2 }}
                        >
                            {adData.title}
                        </a>

                        <p style={{ color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                            {adData.description}
                        </p>

                        <a
                            href={adData.targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                marginTop: 'auto',
                                alignSelf: 'flex-start',
                                background: '#f59e0b',
                                color: '#fff',
                                padding: '0.4rem 1rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#d97706'}
                            onMouseLeave={(e) => e.target.style.background = '#f59e0b'}
                        >
                            Visitar <ExternalLink size={14} />
                        </a>
                    </div>
                </div>

            </motion.div>
        </AnimatePresence>
    );
}
