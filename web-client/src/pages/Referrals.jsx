import React, { useState, useEffect } from 'react';
import { Users, Share2, Copy, Layers, BarChart2, ExternalLink, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const card = {
    background: '#fff',
    borderRadius: '2rem',
    padding: '2rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};
const tableHeadCell = {
    padding: '0 2rem 1.25rem 2rem',
    fontSize: '10px', fontWeight: 900,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-dim)', fontFamily: 'inherit',
};
const tableCell = { padding: '1.25rem 2rem' };

export default function Referrals() {
    const { currentUser, userProfile } = useAuth();
    const [referralList, setReferralList] = useState([]);
    const [totalReferralProfit, setTotalReferralProfit] = useState(0);
    const [loading, setLoading] = useState(true);

    const referralLink = `${window.location.origin}/register?ref=${userProfile?.referralCode || ''}`;

    useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            try {
                // 1. Fetch direct referrals
                const q = query(
                    collection(db, 'users'),
                    where('referredBy', '==', currentUser.uid)
                );
                const snap = await getDocs(q);
                setReferralList(snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    joinDate: doc.data().createdAt?.toDate().toLocaleDateString('es-ES') || 'Reciente'
                })));

                // 2. Fetch total profits from referrals
                const tq = query(
                    collection(db, 'transactions'),
                    where('userId', '==', currentUser.uid),
                    where('type', '==', 'referral_comm')
                );
                const tSnap = await getDocs(tq);
                const total = tSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
                setTotalReferralProfit(total);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const levels = [
        { level: 1, count: referralList.length, earn: '10%' },
        { level: 2, count: 0, earn: '10%' },
        { level: 3, count: 0, earn: '10%' },
        { level: 4, count: 0, earn: '10%' },
        { level: 5, count: 0, earn: '10%' },
    ];

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        alert("¡Enlace copiado!");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Programa de Afiliados</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Expande tu red y maximiza tus ingresos pasivos.
                    </p>
                </div>
                <div style={{ ...card, padding: '1rem 1.5rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '4px' }}>Ganancia Red</p>
                        <p className="font-digital" style={{ color: 'var(--accent-primary)', fontSize: '1.25rem' }}>${totalReferralProfit.toFixed(4)}</p>
                    </div>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.875rem', background: 'rgba(76,209,55,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                        <BarChart2 size={24} />
                    </div>
                </div>
            </div>

            {/* Link + Benefits */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ ...card, borderRadius: '2.5rem', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', width: '8rem', height: '8rem', background: 'rgba(0,160,233,0.04)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Share2 size={22} color="var(--accent-secondary)" /> Mi Código: <span style={{ color: 'var(--accent-secondary)' }}>{userProfile?.referralCode}</span>
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                        Comparte este enlace y recibe comisiones automáticas por la actividad de tu red.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input readOnly value={referralLink} style={{ flex: 1, background: '#f8f9fa', border: '1px solid #e6e9ed', borderRadius: '1rem', padding: '0.875rem 1.25rem', fontSize: '0.875rem', fontWeight: 700, outline: 'none' }} />
                        <button onClick={copyLink} className="gradient-btn" style={{ padding: '0.875rem 1.25rem', borderRadius: '1rem', flexShrink: 0, cursor: 'pointer', border: 'none', color: '#fff', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}>
                            <Copy size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ ...card, borderRadius: '2.5rem', padding: '2.5rem', background: 'rgba(76,209,55,0.02)', borderColor: 'rgba(76,209,55,0.1)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--accent-primary)' }}>💎 Estrategia de Ganancias</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { n: '01', text: '<b>Nivel 1:</b> 10% de comisión directa de cada anuncio visto por tus invitados.' },
                            { n: '02', text: '<b>Niveles 2-5:</b> Comisiones indirectas de toda tu estructura descendente.' },
                        ].map(item => (
                            <div key={item.n} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(76,209,55,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '10px', color: 'var(--accent-primary)', flexShrink: 0 }}>{item.n}</div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: item.text }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Level Structure */}
            <div style={{ ...card, borderRadius: '2.5rem', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f2f5', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Layers size={22} color="var(--accent-secondary)" />
                    <h3 style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', fontSize: '0.95rem' }}>Estructura de Red</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
                                <th style={tableHeadCell}>Nivel</th>
                                <th style={tableHeadCell}>Usuarios</th>
                                <th style={tableHeadCell}>Comisión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levels.map(item => (
                                <tr key={item.level} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.2s' }}>
                                    <td style={{ ...tableCell, fontWeight: 900, fontSize: '1rem' }}>Nivel {item.level}</td>
                                    <td style={tableCell}><span className="font-digital" style={{ color: 'var(--accent-secondary)', fontSize: '1.1rem' }}>{item.count}</span></td>
                                    <td style={tableCell}>
                                        <span style={{ padding: '4px 12px', background: 'rgba(76,209,55,0.06)', color: 'var(--accent-primary)', borderRadius: '0.75rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.earn} GANANCIA</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Referral List */}
            <div style={{ ...card, borderRadius: '3rem', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f2f5', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BarChart2 size={22} color="var(--accent-secondary)" />
                        <h3 style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', fontSize: '0.95rem' }}>Lista de Invitados</h3>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Cargando red...</p>
                    ) : referralList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                            <Inbox size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 700 }}>No tienes invitados registrados aún</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
                                    {['Invitado', 'Nivel', 'Registro', 'Tu Beneficio'].map(h => (
                                        <th key={h} style={tableHeadCell}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {referralList.map((user, i) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.2s' }}>
                                        <td style={tableCell}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                                    {(user.displayName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 900 }}>{user.displayName || user.email?.split('@')[0] || 'Usuario'}</span>
                                            </div>
                                        </td>
                                        <td style={tableCell}><span className="font-digital" style={{ fontSize: '1rem' }}>1</span></td>
                                        <td style={{ ...tableCell, color: 'var(--text-dim)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user.joinDate}</td>
                                        <td style={{ ...tableCell, textAlign: 'right' }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1rem', letterSpacing: '1px' }}>+$0.0000</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
