import React, { useState, useEffect } from 'react';
import { User, Users, Shield, ShieldAlert, History, Mail, DollarSign, Ban, Search, CheckCircle2, Globe } from 'lucide-react';
import { collection, getDocs, updateDoc, doc, increment, writeBatch } from 'firebase/firestore';
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

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [bonusAmount, setBonusAmount] = useState(5.00); // Default bonus
    const [bonusEnabled, setBonusEnabled] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            console.log("Total users in DB:", querySnapshot.size);
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                joined: doc.data().createdAt ? new Date(doc.data().createdAt.toMillis()).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'
            }));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users: ", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchUsers();
    }, []);

    const resetAllUsers = async () => {
        if (!confirm("¿ESTÁS SEGURO? Esto pondrá TODO a 0 para TODOS los usuarios. Esta acción es irreversible.")) return;
        setIsResetting(true);
        try {
            const batch = writeBatch(db);
            let count = 0;

            users.forEach(user => {
                const userRef = doc(db, 'users', user.id);
                batch.update(userRef, {
                    balance: 0,
                    totalEarnings: 0,
                    adsWatched: 0,
                    faucetClaims: 0,
                    lastFaucetClaim: null,
                    lastAdView: null
                });
                count++;
            });

            await batch.commit();
            alert(`Sistema reiniciado con éxito. Usuarios procesados: ${count}`);
            await fetchUsers();
        } catch (error) {
            console.error("Error resetting system:", error);
            alert("Error al reiniciar. Revisa la consola.");
        } finally {
            setIsResetting(false);
        }
    };

    const addBonus = async (userId) => {
        if (!bonusEnabled) {
            alert("La opción de bonificación está desactivada.");
            return;
        }
        try {
            const amount = parseFloat(bonusAmount);
            await updateDoc(doc(db, 'users', userId), {
                balance: increment(amount),
                totalEarnings: increment(amount)
            });
            alert(`Bonificación de $${amount} aplicada.`);
            fetchUsers();
        } catch (error) {
            console.error("Error adding bonus:", error);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Banned' ? 'Active' : 'Banned';
        try {
            await updateDoc(doc(db, 'users', userId), { status: newStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("Error al cambiar estado. Verifica los permisos.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Gestión de Usuarios</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        Supervisa, verifica y controla el acceso de los miembros de la red.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.5rem', borderRadius: '1rem', background: bonusEnabled ? '#f0fdf4' : '#f8f9fa', border: `1px solid ${bonusEnabled ? '#bbf7d0' : '#e6e9ed'}` }}>
                        <DollarSign size={16} color={bonusEnabled ? '#16a34a' : '#7f8c8d'} />
                        <input
                            type="number"
                            step="0.1"
                            value={bonusAmount}
                            onChange={(e) => setBonusAmount(e.target.value)}
                            style={{ width: '60px', background: 'transparent', border: 'none', fontWeight: 900, outline: 'none', fontSize: '12px' }}
                        />
                        <button
                            onClick={() => setBonusEnabled(!bonusEnabled)}
                            style={{
                                padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                                background: bonusEnabled ? '#16a34a' : '#7f8c8d', color: '#fff', border: 'none'
                            }}
                        >
                            {bonusEnabled ? 'BONO ACTIVADO' : 'BONO DESACTIVADO'}
                        </button>
                    </div>

                    <button
                        onClick={resetAllUsers}
                        disabled={isResetting}
                        style={{ padding: '0 1.5rem', borderRadius: '1rem', background: '#fee2e2', border: '1px solid #fecaca', color: '#ef4444', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                        {isResetting ? 'RESETEANDO...' : 'RESETEAR TODO'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', borderRadius: '1rem', background: '#f8f9fa', border: '1px solid #e6e9ed', color: 'var(--text-dim)' }}>
                        <Users size={18} />
                        <span style={{ fontSize: '11px', fontWeight: 900 }}>{loading ? '...' : users.length} TOTALES</span>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', borderRadius: '2.5rem' }}>
                <div style={{ padding: '2rem', display: 'flex', gap: '1.5rem', borderBottom: '1px solid #f0f2f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', border: '1px solid #e6e9ed', padding: '0.75rem 1.25rem', borderRadius: '1rem', flex: 1 }}>
                        <Search size={18} color="var(--text-dim)" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o ID de usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', fontWeight: 600 }}
                        />
                    </div>
                    <button onClick={fetchUsers} style={{ padding: '0 2rem', borderRadius: '1rem', background: '#fff', border: '1px solid #e6e9ed', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', cursor: 'pointer' }}>Actualizar Lista</button>
                    <button style={{ padding: '0 2rem', borderRadius: '1rem', background: '#fff', border: '1px solid #e6e9ed', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', cursor: 'pointer' }}>Exportar CSV</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={tableHeadCell}>Usuario / Email</th>
                                <th style={tableHeadCell}>País</th>
                                <th style={tableHeadCell}>Balance & Actividad</th>
                                <th style={tableHeadCell}>Fecha Registro</th>
                                <th style={tableHeadCell}>Estado</th>
                                <th style={{ ...tableHeadCell, textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>Cargando usuarios reales...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>No se encontraron usuarios para tu búsqueda</td></tr>
                            ) : filteredUsers.map((user, i) => (
                                <tr key={user.id} style={{ borderBottom: i === users.length - 1 ? 'none' : '1px solid #f9fafb' }}>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{
                                                width: '3rem', height: '3rem', borderRadius: '14px',
                                                background: user.status === 'Banned' ? '#fee2e2' : 'rgba(0,160,233,0.08)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: user.status === 'Banned' ? '#ef4444' : 'var(--accent-secondary)',
                                                fontWeight: 900, fontSize: '1.25rem'
                                            }}>{(user.name || user.displayName || 'U').charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '4px' }}>{user.name || user.displayName || 'Usuario'}</p>
                                                <p style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {user.email}</p>
                                                {user.referredBy && <p style={{ fontSize: '9px', color: '#16a34a', fontWeight: 900 }}>SPONSOR: {user.referredBy.substring(0, 8)}...</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        {user.country ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', background: '#f8f9fa', border: '1px solid #e6e9ed', borderRadius: '8px', padding: '4px 10px' }}>
                                                <Globe size={11} /> {user.country}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.25)', fontStyle: 'italic' }}>N/A</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <p style={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                                            <DollarSign size={16} /> {Number(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
                                                {users.filter(u => u.referredBy === user.id).length} REFERIDOS • {user.faucetClaims || 0} RECLAMOS GRIFO
                                            </p>
                                            <span style={{ fontSize: '9px', padding: '2px 6px', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontWeight: 900 }}>CODE: {user.referralCode}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{user.joined}</p>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <span style={{
                                            padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: (!user.status || user.status === 'Active') ? '#f0fdf4' : '#fee2e2',
                                            color: (!user.status || user.status === 'Active') ? '#16a34a' : '#ef4444',
                                            border: `1px solid ${(!user.status || user.status === 'Active') ? '#bbf7d0' : '#fecaca'}`,
                                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            {(!user.status || user.status === 'Active') ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                                            {(!user.status || user.status === 'Active') ? 'ACTIVO' : 'BANEADO'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            {bonusEnabled && (
                                                <button
                                                    onClick={() => addBonus(user.id)}
                                                    style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #bbf7d0', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: '#16a34a' }}
                                                    title={`Regalar $${bonusAmount}`}
                                                >
                                                    <DollarSign size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`¿Resetear saldo de ${user.name || user.email}?`)) return;
                                                    try {
                                                        const userRef = doc(db, 'users', user.id);
                                                        console.log("Resetting single user:", user.id);
                                                        await updateDoc(userRef, {
                                                            balance: 0,
                                                            totalEarnings: 0,
                                                            adsWatched: 0,
                                                            faucetClaims: 0,
                                                            lastFaucetClaim: null,
                                                            lastAdView: null
                                                        });
                                                        alert("Usuario reseteado.");
                                                        fetchUsers();
                                                    } catch (e) { console.error(e); alert("Error al resetear individualmente."); }
                                                }}
                                                style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: '1px solid #f0f2f5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: '#6366f1' }}
                                                title="Resetear Balance Individual"
                                            >
                                                <History size={18} />
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(user.id, user.status || 'Active')}
                                                style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', border: user.status === 'Banned' ? '1px solid #bbf7d0' : '1px solid #fecaca', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: user.status === 'Banned' ? '#16a34a' : '#ef4444' }}
                                                title={user.status === 'Banned' ? 'Restaurar' : 'Banear'}
                                            >
                                                {user.status === 'Banned' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                            </button>
                                        </div>
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
