import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, XCircle, ExternalLink, Clock, DollarSign, CreditCard, ArrowUpRight } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, orderBy, runTransaction, increment, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const cardStyle = {
    background: '#fff',
    borderRadius: '2rem',
    padding: '2rem',
    border: '1px solid #e6e9ed',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const tableHeadCell = {
    padding: '1.25rem 1.5rem',
    fontSize: '10px', fontWeight: 900,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--text-dim)',
    background: '#fafbfc',
    borderBottom: '1px solid #f0f2f5',
};

export default function AdminWithdrawals() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                // Since this is a new setup we might not have createdAt indexed yet, 
                // so we just get docs and sort in JS
                const snap = await getDocs(collection(db, 'withdrawals'));
                const list = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().createdAt?.toDate().toLocaleString('es-ES') || 'Desconocida'
                })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

                setRequests(list);
            } catch (error) {
                console.error("Error fetching withdrawals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWithdrawals();
    }, []);

    const handleAction = async (id, newStatus) => {
        const req = requests.find(r => r.id === id);
        if (!req) return;

        if (!window.confirm(`¿Estás seguro de marcar esto como ${newStatus}?`)) return;

        try {
            await runTransaction(db, async (transaction) => {
                const withdrawalRef = doc(db, 'withdrawals', id);

                // 1. Update status
                transaction.update(withdrawalRef, { status: newStatus });

                // 2. If Rejected, return money to user
                if (newStatus === 'Rejected') {
                    const userRef = doc(db, 'users', req.userId);
                    transaction.update(userRef, {
                        balance: increment(req.amount)
                    });

                    // Log the refund
                    const transRef = doc(collection(db, 'transactions'));
                    transaction.set(transRef, {
                        userId: req.userId,
                        type: 'refund',
                        amount: req.amount,
                        description: 'Reembolso por retiro rechazado',
                        platform: 'ADMIN_SYSTEM',
                        createdAt: serverTimestamp()
                    });
                }
            });

            setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
            alert(`Solicitud ${newStatus === 'Approved' ? 'aprobada' : 'rechazada'} correctamente.`);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar la solicitud.");
        }
    };

    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const totalPaid = requests.filter(r => r.status === 'Approved').reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Aprobación de Retiros</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        Filtra y procesa las solicitudes de retiro de fondos de manera segura.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ ...cardStyle, padding: '1rem 2rem', border: '1px solid #f59e0b' }}>
                        <p style={{ fontSize: '9px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '4px' }}>Pendientes</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>{loading ? '...' : `${pendingCount} SOLICITUD`}</p>
                    </div>
                    <div style={{ ...cardStyle, padding: '1rem 2rem', border: '1px solid var(--accent-primary)' }}>
                        <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Pagado</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>{loading ? '...' : `$${totalPaid.toFixed(2)}`}</p>
                    </div>
                </div>
            </div>

            {/* Withdrawals Table */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', borderRadius: '2.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={tableHeadCell}>Usuario / Solicitado</th>
                                <th style={tableHeadCell}>Método / Cuenta</th>
                                <th style={tableHeadCell}>Monto Neto</th>
                                <th style={tableHeadCell}>Estado</th>
                                <th style={{ ...tableHeadCell, textAlign: 'right' }}>Acciones Ejecutivas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando solicitudes...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No hay solicitudes registradas en la base de datos.</td></tr>
                            ) : requests.map((req, i) => (
                                <tr key={req.id} style={{ borderBottom: i === requests.length - 1 ? 'none' : '1px solid #f9fafb' }}>
                                    <td style={{ padding: '1.5rem' }}>
                                        <p style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '4px' }}>{req.userEmail || req.userId || 'Usuario'}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> {req.date}</p>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                                            <div style={{ width: '2rem', height: '2rem', borderRadius: '8px', background: 'rgba(0,160,233,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CreditCard size={14} color="var(--accent-secondary)" />
                                            </div>
                                            <p style={{ fontWeight: 900, fontSize: '0.875rem' }}>{req.method || 'Criptomonedas'}</p>
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace', fontWeight: 700 }}>{req.walletAddress || req.account || 'Sin cuenta'}</p>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <p className="font-digital" style={{ fontSize: '1.15rem' }}>$ {req.amount}</p>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <span style={{
                                            padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: req.status === 'Approved' ? '#f0fdf4' : req.status === 'Rejected' ? '#fee2e2' : '#fff7ed',
                                            color: req.status === 'Approved' ? '#16a34a' : req.status === 'Rejected' ? '#ef4444' : '#ea580c',
                                            border: `1px solid ${req.status === 'Approved' ? '#bbf7d0' : req.status === 'Rejected' ? '#fecaca' : '#ffedd5'}`,
                                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: req.status === 'Approved' ? '#22c55e' : req.status === 'Rejected' ? '#ef4444' : '#f97316' }}></div>
                                            {req.status === 'Approved' ? 'APROBADO' : req.status === 'Rejected' ? 'RECHAZADO' : 'PENDIENTE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        {req.status === 'Pending' ? (
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleAction(req.id, 'Approved')} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CheckCircle size={16} /> APROBAR
                                                </button>
                                                <button onClick={() => handleAction(req.id, 'Rejected')} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#fee2e2', border: '1px solid #fecaca', color: '#ef4444', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <XCircle size={16} /> RECHAZAR
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900 }}>PROCESADA</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
