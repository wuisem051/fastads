import React, { useState } from 'react';
import {
    Home,
    Wallet,
    TrendingUp,
    Settings as SettingsIcon,
    Bell,
    LogOut,
    Users,
    ChevronDown,
    PlusCircle,
    History,
    LogOut as LogoutIcon
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

// Read branding from localStorage (set by Admin panel)
const getBrand = () => ({
    name: localStorage.getItem('brand_name') || 'FASTADS',
    logo: localStorage.getItem('brand_logo') || logoImg,
});

const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <TrendingUp size={20} />, label: 'Ganancias', path: '/earnings' },
    { icon: <Wallet size={20} />, label: 'Retiros', path: '/withdrawals' },
    { icon: <Users size={20} />, label: 'Referidos', path: '/referrals' },
    { icon: <Bell size={20} />, label: 'Noticias', path: '/news' },
    { icon: <SettingsIcon size={20} />, label: 'Ajustes', path: '/settings' },
];

const Sidebar = () => {
    const brand = getBrand();
    return (
        <aside style={{
            width: '16rem',
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
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <img src={brand.logo} alt="logo" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,160,233,0.35)' }} />
                <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                    {brand.name}
                </span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, paddingTop: '1rem' }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.875rem 2rem',
                            color: isActive ? '#ffffff' : '#b2bec3',
                            textDecoration: 'none',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            borderLeft: isActive ? '3px solid var(--accent-secondary)' : '3px solid transparent',
                            background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                            transition: 'all 0.2s ease',
                        })}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Balance removed per user request */}
        </aside>
    );
};

export default function MainLayout({ children }) {
    const { logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    const dropdownItems = [
        { icon: <PlusCircle size={16} />, label: 'Ordenar publicidad', path: '/ads' },
        { icon: <TrendingUp size={16} />, label: 'Ganancias', path: '/earnings' },
        { icon: <History size={16} />, label: 'Recarga tu saldo', path: '/withdrawals' },
        { icon: <Wallet size={16} />, label: 'Retirar fondos', path: '/withdrawals' },
        { icon: <SettingsIcon size={16} />, label: 'Ajustes', path: '/settings' },
        { icon: <LogoutIcon size={16} />, label: 'Salida', path: '/', isLogout: true },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6f7' }}>
            <Sidebar />

            <main style={{ marginLeft: '16rem', minHeight: '100vh' }}>
                {/* Header */}
                <header style={{
                    height: '70px',
                    background: '#ffffff',
                    borderBottom: '1px solid #e6e9ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 3rem',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    left: '16rem',
                    zIndex: 40,
                    boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                }}>
                    <h2 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
                        Panel de Usuario
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {/* Balances */}
                        <div style={{ display: 'flex', gap: '1.5rem', paddingRight: '2rem', borderRight: '1px solid #f0f2f5' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '3px' }}>BALANCE</p>
                                <p className="font-digital" style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>$ {Number(useAuth().userProfile?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        {/* User Profile with Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '1rem', transition: 'background 0.2s', background: isProfileOpen ? '#f8f9fa' : 'transparent' }}
                                onMouseEnter={e => !isProfileOpen && (e.currentTarget.style.background = '#fcfdfe')}
                                onMouseLeave={e => !isProfileOpen && (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>Wuisem <ChevronDown size={14} style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} /></p>
                                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>Pro Member</p>
                                </div>
                                <div style={{
                                    width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                                    background: 'var(--accent-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 900, fontSize: '1rem',
                                    border: '2px solid rgba(0,160,233,0.1)',
                                }}>W</div>
                            </div>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <>
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '120%',
                                        right: 0,
                                        width: '240px',
                                        background: '#ffffff',
                                        borderRadius: '1.25rem',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        border: '1px solid #e6e9ed',
                                        overflow: 'hidden',
                                        zIndex: 100,
                                        animation: 'dropdown-in 0.2s ease-out'
                                    }}>
                                        <div style={{ padding: '0.5rem' }}>
                                            {dropdownItems.map((item, index) => (
                                                <div
                                                    key={index}
                                                    onClick={async () => {
                                                        if (item.isLogout) {
                                                            await logout();
                                                            navigate('/login');
                                                        } else {
                                                            navigate(item.path);
                                                        }
                                                        setIsProfileOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '0.875rem 1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        cursor: 'pointer',
                                                        borderRadius: '0.75rem',
                                                        transition: 'all 0.2s',
                                                        borderTop: item.isLogout ? '1px solid #f0f2f5' : 'none',
                                                        marginTop: item.isLogout ? '0.5rem' : '0',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = item.isLogout ? '#fff1f1' : '#f8f9fa';
                                                        e.currentTarget.style.color = item.isLogout ? '#ef4444' : 'var(--accent-secondary)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = 'inherit';
                                                    }}
                                                >
                                                    <span style={{ opacity: 0.8 }}>{item.icon}</span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, flex: 1 }}>{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <section style={{ paddingTop: 'calc(70px + 3rem)', paddingLeft: '3rem', paddingRight: '3rem', paddingBottom: '3rem' }}>
                    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
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
