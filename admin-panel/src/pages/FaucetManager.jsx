import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, Droplet } from 'lucide-react';

export default function FaucetManager() {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        url: '',
        reward: 0.05,
        isActive: true,
        cooldownMinutes: 5
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'faucet'));
                if (snap.exists()) {
                    setConfig(snap.data());
                }
            } catch (error) {
                console.error("Error fetching faucet config:", error);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await setDoc(doc(db, 'settings', 'faucet'), {
                ...config,
                reward: parseFloat(config.reward) || 0,
                cooldownMinutes: parseInt(config.cooldownMinutes) || 5
            });
            alert('Configuración del Grifo guardada correctamente.');
        } catch (error) {
            console.error("Error saving faucet config:", error);
            alert('Error al guardar.');
        }
        setLoading(false);
    };

    return (
        <div className="fade-in max-w-4xl mx-auto">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Droplet className="text-accent-primary" /> Administrar Grifo (Faucet)
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Configura la url de publicidad y la recompensa del grifo de 5 minutos.</p>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e6e9ed', padding: '2rem' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8f9fa', borderRadius: '0.75rem', border: '1px solid #e6e9ed' }}>
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={config.isActive}
                            onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                            style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-primary)' }}
                        />
                        <label htmlFor="isActive" style={{ fontWeight: 700, cursor: 'pointer' }}>Activar Grifo en la plataforma</label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>URL de Publicidad</label>
                            <input
                                type="url"
                                required
                                value={config.url}
                                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                                placeholder="https://ejemplo.com/publicidad"
                                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '2px solid #e6e9ed', outline: 'none', background: '#f8f9fa' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Esta URL se abrirá cuando el usuario reclame.</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Recompensa por Reclamo (USD)</label>
                            <input
                                type="number"
                                required
                                min="0.0001"
                                step="0.0001"
                                value={config.reward}
                                onChange={(e) => setConfig({ ...config, reward: e.target.value })}
                                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '2px solid #e6e9ed', outline: 'none', background: '#f8f9fa' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tiempo de Espera (Minutos)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            step="1"
                            value={config.cooldownMinutes}
                            onChange={(e) => setConfig({ ...config, cooldownMinutes: e.target.value })}
                            style={{ width: '50%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '2px solid #e6e9ed', outline: 'none', background: '#f8f9fa' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e6e9ed' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.875rem 2rem', borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                color: '#fff', fontWeight: 900, border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
                                boxShadow: '0 4px 15px rgba(0,160,233,0.3)'
                            }}
                        >
                            <Save size={18} />
                            {loading ? 'Guardando...' : 'Guardar Configuración'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
