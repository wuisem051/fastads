import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function EmbedBannerAd({ adData, onClose, onComplete }) {
    const { currentUser } = useAuth();
    const [timeLeft, setTimeLeft] = useState(adData?.timer || 20);
    const [status, setStatus] = useState('viewing'); // viewing => success
    const [error, setError] = useState('');

    // Impression tracking
    useEffect(() => {
        if (adData?.id) {
            const adRef = doc(db, 'banner_ads', adData.id);
            updateDoc(adRef, {
                views: increment(1)
            }).catch(err => console.error("Error tracking banner impression:", err));
        }
    }, [adData?.id]);

    // Countdown timer
    useEffect(() => {
        if (status !== 'viewing') return;

        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            handleComplete();
        }
    }, [timeLeft, status]);

    const handleComplete = async () => {
        setStatus('processing');
        setError('');
        try {
            if (!currentUser) throw new Error("Debes estar logueado.");

            const userRef = doc(db, 'users', currentUser.uid);
            const reward = parseFloat(adData?.reward || 0.002);

            await updateDoc(userRef, {
                balance: increment(reward),
                totalEarnings: increment(reward),
                adsWatched: increment(1)
            });

            // Update banner ad click counter
            if (adData?.id) {
                const adRef = doc(db, 'banner_ads', adData.id);
                updateDoc(adRef, { clicks: increment(1) }).catch(e => console.warn("Error tracking banner click", e));
            }

            // Handle Referral commission
            try {
                const userSnap = await getDoc(userRef);
                const sponsorId = userSnap.data()?.referredBy;
                if (sponsorId) {
                    const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
                    const p = settingsSnap.data()?.referralPercent || 10;
                    const commission = reward * (p / 100);
                    if (commission > 0) {
                        await updateDoc(doc(db, 'users', sponsorId), {
                            balance: increment(commission),
                            totalEarnings: increment(commission)
                        });
                        await addDoc(collection(db, 'transactions'), {
                            userId: sponsorId,
                            referredUserId: currentUser.uid,
                            type: 'referral_comm',
                            amount: commission,
                            description: `Comisión por banner de referido`,
                            createdAt: serverTimestamp()
                        });
                    }
                }
            } catch (e) { console.error("Referral Pay Error:", e); }

            // Register transaction
            await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid,
                adId: adData?.id || 'banner',
                type: 'banner_view',
                amount: reward,
                description: adData?.title || 'Visualización de Banner',
                platform: 'BANNER 300x250',
                createdAt: serverTimestamp()
            });

            setStatus('success');
            setTimeout(() => {
                if (onComplete) onComplete();
                if (onClose) onClose();
            }, 4000);

        } catch (err) {
            console.error("Error en acreditación banner:", err);
            setError(`Error: ${err.code || err.message}`);
            setStatus('viewing');
        }
    };

    if (!adData) return null;

    const progress = ((adData.timer - timeLeft) / adData.timer) * 100;
    const isComplete = status === 'success';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 100, y: 100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 100, y: 100 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 10001,
                    width: '380px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div style={{
                    background: '#fff',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    width: '100%',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                    border: isComplete ? '4px solid #22c55e' : '1px solid #e1e4e8',
                    transition: 'all 0.5s ease',
                    position: 'relative'
                }}>
                    {/* Header */}
                    <div style={{
                        background: isComplete ? '#22c55e' : '#f59e0b',
                        padding: '0.875rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background 0.5s ease',
                        color: '#fff'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {status === 'viewing' && (
                                <>
                                    <Clock size={16} />
                                    <span style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        Espera... {timeLeft} seg.
                                    </span>
                                </>
                            )}
                            {status === 'processing' && (
                                <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>Verificando...</span>
                            )}
                            {status === 'success' && (
                                <>
                                    <CheckCircle size={16} />
                                    <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>¡COMPLETADO!</span>
                                </>
                            )}
                        </div>
                        {isComplete && (
                            <button
                                onClick={onClose}
                                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: '4px', background: '#e5e7eb' }}>
                        <div style={{
                            height: '100%',
                            width: `${isComplete ? 100 : progress}%`,
                            background: isComplete ? '#22c55e' : '#f59e0b',
                            transition: 'width 1s linear, background 0.5s ease',
                        }} />
                    </div>

                    {/* Banner area */}
                    <div style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        background: isComplete ? 'rgba(34,197,94,0.05)' : '#fff',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '4px' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1f2937' }}>{adData.title || 'Anuncio'}</p>
                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#22c55e' }}>
                                +${parseFloat(adData.reward).toFixed(4)} USD
                            </span>
                        </div>

                        {/* Banner embed */}
                        <div
                            style={{
                                width: '300px',
                                height: '250px',
                                borderRadius: '0.5rem',
                                overflow: 'hidden',
                                border: isComplete ? '3px solid #22c55e' : '1px solid #f0f2f5',
                                background: '#f9fafb',
                                boxShadow: isComplete ? '0 0 15px rgba(34,197,94,0.2)' : 'none'
                            }}
                            dangerouslySetInnerHTML={{ __html: adData.bannerCode || '' }}
                        />

                        {isComplete && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 900, textAlign: 'center' }}
                            >
                                ¡Gracias por tu visita! Se ha acreditado la recompensa.
                            </motion.p>
                        )}

                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>⚠️ {error}</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
