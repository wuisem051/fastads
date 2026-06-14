import React, { useState } from 'react';
import { History, AlertCircle, CheckCircle2, ChevronRight, Coins, Wallet } from 'lucide-react';

const PLATFORM_COLORS = {
    'USDT (TRC20)': '#26A17B',
    Litecoin: '#546E7A',
    Dogecoin: '#C2A633',
};

export default function Withdrawals() {
    const [selectedPlatform, setSelectedPlatform] = useState(null);

    const platforms = [
        { name: 'USDT (TRC20)', icon: '₮', min: '5.00' },
        { name: 'Litecoin', icon: 'Ł', min: '1.00' },
        { name: 'Dogecoin', icon: 'Ð', min: '10.00' },
    ];

    const recentWithdrawals = [
        { method: 'USDT (TRC20)', amount: '15.00', date: '12 Jun 2026', time: '15:30', status: 'Completado' },
        { method: 'Litecoin', amount: '22.45', date: '10 Jun 2026', time: '09:12', status: 'Completado' },
    ];

    const card = {
        background: '#fff',
        borderRadius: '2rem',
        padding: '2.5rem',
        border: '1px solid #e6e9ed',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Retirar Fondos</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Convierte tu saldo acumulado en dinero real.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Withdrawal Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
                        {/* Step 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '3rem', height: '3rem', borderRadius: '1rem',
                                background: 'rgba(0,160,233,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent-secondary)',
                                border: '1px solid rgba(0,160,233,0.12)', fontStyle: 'italic'
                            }}>1</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Especifique la cantidad a retirar</h3>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', maxWidth: '24rem', marginBottom: '2.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                                    Monto (USD)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    style={{
                                        width: '100%', background: '#f8f9fa', border: '1px solid #e6e9ed',
                                        borderRadius: '1rem', padding: '1.25rem 1.5rem',
                                        fontSize: '2rem', fontWeight: 900, color: 'var(--accent-secondary)',
                                        outline: 'none', transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent-secondary)'}
                                    onBlur={e => e.target.style.borderColor = '#e6e9ed'}
                                />
                            </div>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>USD</p>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: '#f0f2f5', margin: '0 0 2rem 0' }}></div>

                        {/* Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '3rem', height: '3rem', borderRadius: '1rem',
                                background: 'rgba(76,209,55,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent-primary)',
                                border: '1px solid rgba(76,209,55,0.12)', fontStyle: 'italic'
                            }}>2</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Método de recepción de fondos</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '2.5rem' }}>
                            {platforms.map(p => (
                                <button
                                    key={p.name}
                                    onClick={() => setSelectedPlatform(p.name)}
                                    style={{
                                        background: selectedPlatform === p.name ? '#f0f8ff' : '#fafbfc',
                                        border: `1px solid ${selectedPlatform === p.name ? 'var(--accent-secondary)' : '#e6e9ed'}`,
                                        borderRadius: '1rem', padding: '1rem 0.5rem',
                                        cursor: 'pointer', textAlign: 'center',
                                        position: 'relative', transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    {p.extra && (
                                        <span style={{
                                            position: 'absolute', top: '-8px', right: '-8px',
                                            background: 'var(--accent-primary)', color: '#000',
                                            fontSize: '9px', fontWeight: 900, padding: '3px 6px',
                                            borderRadius: '8px', border: '2px solid #fff',
                                            lineHeight: 1, whiteSpace: 'nowrap'
                                        }}>{p.extra}</span>
                                    )}
                                    <div style={{
                                        width: '3rem', height: '3rem', borderRadius: '0.875rem',
                                        background: PLATFORM_COLORS[p.name],
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.1rem', fontWeight: 900, color: '#fff',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                    }}>{p.icon}</div>
                                    <p style={{ fontWeight: 900, fontSize: '0.75rem', color: 'var(--text-primary)' }}>{p.name}</p>
                                    <p style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700 }}>mín. ${p.min}</p>
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="gradient-btn" style={{ padding: '1.25rem 2.5rem', borderRadius: '1rem', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Confirmar Retiro <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Warning */}
                    <div style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <AlertCircle color="#F59E0B" size={22} style={{ flexShrink: 0 }} />
                        <div>
                            <p style={{ color: '#D97706', fontWeight: 900, fontSize: '0.8rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Información Importante</p>
                            <p style={{ color: '#B45309', fontSize: '0.8rem', lineHeight: 1.6 }}>
                                Los retiros son procesados manualmente en un plazo de 2 a 24 horas hábiles para garantizar la seguridad de tu cuenta.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Balance */}
                    <div style={{ ...card, background: 'linear-gradient(135deg, #f0f8ff 0%, #fff 100%)' }}>
                        <h3 style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Coins size={18} color="var(--accent-secondary)" /> Tu Balance
                        </h3>
                        <p style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>$1,240.50</p>
                        <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>Listo para ser transferido</p>
                        <div style={{ borderTop: '1px solid #f0f2f5', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>Comisión de red</span>
                                <span style={{ fontWeight: 900 }}>0.00%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>Total a recibir</span>
                                <span style={{ fontWeight: 900, color: 'var(--accent-primary)' }}>$1,240.50</span>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div style={card}>
                        <h3 style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <History size={18} color="var(--text-dim)" /> Historial
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentWithdrawals.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: '#f8f9fa', borderRadius: '0.875rem' }}>
                                    <div>
                                        <p style={{ fontWeight: 900, fontSize: '0.875rem', marginBottom: '2px' }}>{item.method}</p>
                                        <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>{item.date} • {item.time}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 900, fontSize: '0.875rem' }}>${item.amount}</p>
                                        <p style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            <CheckCircle2 size={10} /> {item.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button style={{ width: '100%', marginTop: '1.25rem', padding: '0.875rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', background: 'none', border: '1px solid #f0f2f5', borderRadius: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                            Ver todo el historial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
