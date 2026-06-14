import React from 'react';
import { Wallet, CheckCircle, XCircle, ExternalLink, Clock, DollarSign, CreditCard, ArrowUpRight } from 'lucide-react';

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
    const requests = [
        { id: 1, user: 'Wuisem', method: 'Payeer', account: 'P12345678', amount: '15.00', date: 'Hace 10 min', status: 'Pending' },
        { id: 2, user: 'CryptoTrader', method: 'Tron (USDT)', account: 'TRX789...xyz', amount: '45.20', date: 'Ayer', status: 'Approved' },
    ];

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
                        <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>1 SOLICITUD</p>
                    </div>
                    <div style={{ ...cardStyle, padding: '1rem 2rem', border: '1px solid var(--accent-primary)' }}>
                        <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Pagado</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>$12,450.00</p>
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
                            {requests.map((req, i) => (
                                <tr key={req.id} style={{ borderBottom: i === requests.length - 1 ? 'none' : '1px solid #f9fafb' }}>
                                    <td style={{ padding: '1.5rem' }}>
                                        <p style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '4px' }}>{req.user}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> {req.date}</p>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                                            <div style={{ width: '2rem', height: '2rem', borderRadius: '8px', background: 'rgba(0,160,233,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CreditCard size={14} color="var(--accent-secondary)" />
                                            </div>
                                            <p style={{ fontWeight: 900, fontSize: '0.875rem' }}>{req.method}</p>
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace', fontWeight: 700 }}>{req.account}</p>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <p className="font-digital" style={{ fontSize: '1.15rem' }}>$ {req.amount}</p>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <span style={{
                                            padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: req.status === 'Approved' ? '#f0fdf4' : '#fff7ed',
                                            color: req.status === 'Approved' ? '#16a34a' : '#ea580c',
                                            border: `1px solid ${req.status === 'Approved' ? '#bbf7d0' : '#ffedd5'}`,
                                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: req.status === 'Approved' ? '#22c55e' : '#f97316' }}></div>
                                            {req.status === 'Approved' ? 'APROBADO' : 'PENDIENTE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        {req.status === 'Pending' ? (
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CheckCircle size={16} /> APROBAR
                                                </button>
                                                <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#fee2e2', border: '1px solid #fecaca', color: '#ef4444', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <XCircle size={16} /> RECHAZAR
                                                </button>
                                            </div>
                                        ) : (
                                            <button style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                                                <ExternalLink size={16} /> Ver Comprobante
                                            </button>
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
