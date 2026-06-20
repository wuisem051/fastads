import React from 'react';
import {
    LayoutDashboard,
    Megaphone,
    Users,
    Wallet,
    FileText,
    Settings,
    LogOut,
    Bell,
    Search,
    TrendingUp,
    Home
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import logoImg from '../assets/logo.png';

const getBrand = () => ({
    name: localStorage.getItem('brand_name') || 'FASTADS',
    logo: localStorage.getItem('brand_logo') || logoImg,
});

const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Panel General', path: '/dashboard' },
    { icon: <Megaphone size={20} />, label: 'Anuncios', path: '/ads' },
    { icon: <Users size={20} />, label: 'Usuarios', path: '/users' },
    { icon: <Wallet size={20} />, label: 'Pagos / Retiros', path: '/withdrawals' },
    { icon: <FileText size={20} />, label: 'Noticias', path: '/news' },
    { icon: <Home size={20} />, label: 'Editor Home', path: '/landing' },
    { icon: <Settings size={20} />, label: 'Ajustes App', path: '/settings' },
];

const Sidebar = () => {
    const brand = getBrand();
    return (
        <aside style={{
            width: '18rem',
            background: '#222d32',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            color: '#fff',
            overflowY: 'auto',
        }}>
            {/* Logo */}
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <img src={brand.logo} alt="logo" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,160,233,0.35)' }} />
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {brand.name}
                    </h2>
                    <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7f8c8d', marginTop: '4px' }}>Admin Panel</p>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, paddingTop: '1.5rem' }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 2rem',
                            color: isActive ? '#ffffff' : '#b2bec3',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
                            background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                            transition: 'all 0.2s ease',
                        })}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div style={{ padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b2bec3', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', width: '100%', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#b2bec3'}
                >
                    <LogOut size={18} /> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default function AdminLayout({ children }) {
    const [pendingWithdrawals, setPendingWithdrawals] = React.useState([]);
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const q = query(collection(db, 'withdrawals'), where('status', '==', 'Pending'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setPendingWithdrawals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6f7' }}>
            <Sidebar />

            <main style={{ marginLeft: '18rem', minHeight: '100vh' }}>
                {/* Header */}
                <header style={{
                    height: '80px',
                    background: '#ffffff',
                    borderBottom: '1px solid #e6e9ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 3rem',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    left: '18rem',
                    zIndex: 40,
                    boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', border: '1px solid #e6e9ed', padding: '0.75rem 1.5rem', borderRadius: '1rem', width: '400px' }}>
                        <Search size={18} color="var(--text-dim)" />
                        <input type="text" placeholder="Buscar usuario, pago o anuncio..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', fontWeight: 500 }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0.5rem', borderRadius: '0.75rem', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                                onMouseLeave={e => !isNotifOpen && (e.currentTarget.style.background = 'transparent')}
                            >
                                <Bell size={24} />
                                {pendingWithdrawals.length > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '4px', right: '4px',
                                        width: '16px', height: '16px', background: '#ef4444',
                                        borderRadius: '50%', border: '2px solid #fff',
                                        fontSize: '9px', color: '#fff', fontWeight: 900,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {pendingWithdrawals.length}
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setIsNotifOpen(false)}></div>
                                    <div style={{
                                        position: 'absolute', top: '120%', right: 0, width: '320px',
                                        background: '#fff', borderRadius: '1.25rem', border: '1px solid #e6e9ed',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
                                        animation: 'dropdown-in 0.2s ease-out'
                                    }}>
                                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 900 }}>Alertas de Sistema</h4>
                                        </div>
                                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            {pendingWithdrawals.length === 0 ? (
                                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                                    <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>No hay retiros pendientes</p>
                                                </div>
                                            ) : (
                                                pendingWithdrawals.map(req => (
                                                    <div
                                                        key={req.id}
                                                        onClick={() => {
                                                            navigate('/withdrawals');
                                                            setIsNotifOpen(false);
                                                        }}
                                                        style={{ padding: '1rem', borderBottom: '1px solid #f9fafb', cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#fcfdfe'}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                            <p style={{ fontSize: '0.8rem', fontWeight: 900 }}>Solicitud de Retiro</p>
                                                            <p style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-primary)' }}>${req.amount}</p>
                                                        </div>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>{req.userEmail}</p>
                                                        <p style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 900 }}>Vía {req.method}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {pendingWithdrawals.length > 0 && (
                                            <div
                                                onClick={() => { navigate('/withdrawals'); setIsNotifOpen(false); }}
                                                style={{ padding: '1rem', background: '#f8f9fa', textAlign: 'center', fontSize: '10px', fontWeight: 900, cursor: 'pointer', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                            >
                                                Ver todas las solicitudes
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '2rem', borderLeft: '1px solid #f0f2f5' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 900 }}>Admin Master</p>
                                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>Online Now</p>
                            </div>
                            <div style={{
                                width: '3rem', height: '3rem', borderRadius: '1rem',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 900, fontSize: '1.25rem',
                                border: '2px solid rgba(255,255,255,0.8)',
                                boxShadow: '0 4px 12px rgba(0,160,233,0.2)'
                            }}>A</div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <section style={{ paddingTop: 'calc(80px + 3rem)', paddingLeft: '3rem', paddingRight: '3rem', paddingBottom: '3rem' }}>
                    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                        {children}
                    </div>
                </section>
            </main>
            <style>{`
                @keyframes dropdown-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
