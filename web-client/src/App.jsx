import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Shield,
  MousePointer2,
  Clock,
  TrendingUp,
  Globe,
  Monitor,
  Download,
  CheckCircle2,
  Users,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

// Layouts & Pages
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Earnings from './pages/Earnings';
import Withdrawals from './pages/Withdrawals';
import Referrals from './pages/Referrals';
import News from './pages/News';
import Settings from './pages/Settings';

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 py-6 border-b border-white/5 bg-primary">
    <div className="container flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="gradient-btn p-2 rounded-xl flex items-center justify-center" style={{ width: '42px', height: '42px' }}>
          <Zap size={24} fill="currentColor" />
        </div>
        <span className="text-2xl font-black tracking-tighter">AD<span className="gradient-text">SHARE</span></span>
      </div>

      <div className="hidden md:flex items-center gap-10" style={{ display: 'flex', gap: '2.5rem' }}>
        <a href="#features" className="text-sm font-bold text-dim hover:text-white transition-all hover:tracking-widest" style={{ textDecoration: 'none' }}>FUNCIONALIDADES</a>
        <a href="#how-it-works" className="text-sm font-bold text-dim hover:text-white transition-all hover:tracking-widest" style={{ textDecoration: 'none' }}>CÓMO FUNCIONA</a>
        <a href="#stats" className="text-sm font-bold text-dim hover:text-white transition-all hover:tracking-widest" style={{ textDecoration: 'none' }}>ESTADÍSTICAS</a>
      </div>

      <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center' }}>
        <button className="px-6 py-2 rounded-lg text-sm font-bold text-white/70 hover:text-white transition-all">Acceso</button>
        <a href="/dashboard" className="px-8 py-2.5 rounded-lg text-sm font-black transition-all" style={{ background: 'var(--accent-secondary)', color: 'white', boxShadow: '0 4px 15px rgba(0,160,233,0.3)', textDecoration: 'none' }}>
          COMENZAR GRATIS
        </a>
      </div>
    </div>
  </nav>
);

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8 }}
    className="glass-dark p-10 rounded-[2.5rem] border-white/5 hover:border-accent-primary/50 transition-all group"
  >
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-accent-primary">
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-dim leading-relaxed">{desc}</p>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="bg-primary text-white selection:bg-accent-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-52 pb-32 overflow-hidden">
        {/* Background Decorative Blurs Removed */}

        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 0.8fr', gap: '5rem', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping"></span>
              <span className="text-xs font-bold tracking-widest text-accent-primary uppercase">Nueva Actualización 2.0</span>
            </div>
            <h1 className="text-7xl font-black leading-[1.1] mb-8 tracking-tighter">
              Transforma tu <br />
              <span className="gradient-text italic">tiempo online</span> <br />
              en ingresos reales
            </h1>
            <p className="text-dim text-xl mb-12 max-w-xl leading-relaxed font-medium">
              Únete a la red publicitaria más transparente. Visualiza anuncios, visita sitios seleccionados y gana dinero directamente en tu billetera digital. Sin trucos, solo resultados.
            </p>
            <div className="flex items-center gap-6" style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/dashboard" className="px-10 py-4 rounded-xl flex items-center gap-3 text-lg font-black transition-all hover:scale-105" style={{ background: 'var(--accent-secondary)', color: 'white', textDecoration: 'none', boxShadow: '0 8px 25px rgba(0,160,233,0.3)' }}>
                CREAR MI CUENTA <ArrowRight size={24} />
              </a>
              <div className="flex flex-col">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-white/10 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-dim mt-1">+12,000 USUARIOS</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 blur-2xl -z-10 rounded-[3rem]"></div>
            <div className="glass-dark p-1 rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl relative">
              <div className="bg-bg-secondary/80 backdrop-blur-md rounded-[2.3rem] p-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-primary"></div>
                    <p className="text-[10px] font-black text-dim uppercase tracking-widest">Dashboard en vivo</p>
                  </div>
                  <div className="w-10 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <div className="w-4 h-1.5 bg-accent-primary rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Real-time Balance Card */}
                  <div className="p-8 rounded-[2rem]" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>Balance de Red</p>
                        <h3 className="font-digital" style={{ fontSize: '2.5rem', color: '#fff' }}>$1,240.50</h3>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(76,209,55,0.1)', color: '#4cd137', fontSize: '10px', fontWeight: 900 }}>+12.5%</div>
                    </div>
                    {/* Micro chart placeholder */}
                    <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                      {[40, 60, 30, 80, 50, 90, 70, 100, 85].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: '#4cd137', opacity: 0.3 + (i * 0.08), borderRadius: '2px' }}></div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                      <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '8px' }}>VISTAS HOY</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black">542</span>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                          <div style={{ width: '65%', height: '100%', background: 'var(--accent-secondary)', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                      <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '8px' }}>BONO DIARIO</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-accent-primary">+$15.2</span>
                        <Zap size={14} className="text-accent-primary animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="container grid grid-cols-2 lg:grid-cols-4 gap-12" style={{ display: 'grid' }}>
          <div className="text-center group">
            <h3 className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform inline-block">12K+</h3>
            <p className="text-dim font-bold text-xs uppercase tracking-widest">Usuarios Activos</p>
          </div>
          <div className="text-center group">
            <h3 className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform inline-block">4M+</h3>
            <p className="text-dim font-bold text-xs uppercase tracking-widest">Anuncios Vistos</p>
          </div>
          <div className="text-center group">
            <h3 className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform inline-block">$250K</h3>
            <p className="text-dim font-bold text-xs uppercase tracking-widest">Pagado a Usuarios</p>
          </div>
          <div className="text-center group">
            <h3 className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform inline-block">99%</h3>
            <p className="text-dim font-bold text-xs uppercase tracking-widest">Uptime Plataforma</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 tracking-tighter">¿Por qué elegir <span className="gradient-text">AdShare</span>?</h2>
            <p className="text-dim text-lg max-w-2xl mx-auto font-medium">Diseñado para ser la plataforma más eficiente y sencilla del mercado P2P.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ display: 'grid' }}>
            <FeatureCard
              icon={Download}
              title="Instalación Simple"
              desc="Nuestra extensión se integra perfectamente en segundos. Solo instala, inicia sesión y estarás listo para ganar."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Transparencia Total"
              desc="Sin pagos ocultos ni retenciones injustas. Cada céntimo ganado está disponible para retiro inmediato."
              delay={0.2}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Ganancia Pasiva"
              desc="Diferentes tipos de publicidad adaptadas a tu navegación. Gana mientras haces lo que ya ibas a hacer."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 bg-white/[0.01]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center" style={{ display: 'grid' }}>
            <div className="space-y-12">
              <h2 className="text-5xl font-black tracking-tighter leading-tight">Gana en <span className="gradient-text">3 pasos reales</span></h2>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-accent-primary rounded-2xl flex items-center justify-center font-black text-xl shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Descarga la Extensión</h4>
                    <p className="text-dim leading-relaxed">Carga nuestra extensión de forma gratuita desde la tienda oficial o repositorio.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-accent-primary rounded-2xl flex items-center justify-center font-black text-xl shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Navega y Activa</h4>
                    <p className="text-dim leading-relaxed">Mantén el interruptor encendido. Te avisaremos cuando un anuncio valga la pena.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-accent-primary rounded-2xl flex items-center justify-center font-black text-xl shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Recibe tus Pagos</h4>
                    <p className="text-dim leading-relaxed">Una vez alcances el mínimo de retiro, solicita tus fondos por USDT (TRC20), Litecoin o Dogecoin.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-dark p-12 rounded-[3rem] border-white/5 relative overflow-hidden group">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent-primary/20 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
              <Monitor size={100} className="text-accent-primary/30 mb-8" />
              <p className="text-2xl font-bold leading-relaxed mb-10">"La mejor decisión que tomé para rentabilizar mi tiempo libre. Pagos instantáneos y soporte increíble."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 p-0.5">
                  <div className="w-full h-full rounded-full bg-accent-secondary/50"></div>
                </div>
                <div>
                  <p className="font-bold">Alex Thompson</p>
                  <p className="text-xs text-dim">Usuario Pro • Gana +$200/mes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-40">
        <div className="container">
          <div className="text-center relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent-primary/10 blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-secondary/10 blur-[100px] -z-10"></div>

            <h2 className="text-6xl font-black mb-8 tracking-tighter leading-tight">¿Listo para maximizar <br /> tus <span className="gradient-text">ingresos diarios</span>?</h2>
            <p className="text-xl text-dim mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Únete hoy y obtén un bono de bienvenida del 5% adicional en tus primeras 100 vistas. Sin límites de retiro, sin complicaciones.
            </p>
            <a href="/dashboard" className="px-16 py-6 rounded-2xl text-2xl font-black hover:scale-105 transition-all inline-flex"
              style={{
                background: 'var(--accent-secondary)',
                color: 'white',
                textDecoration: 'none',
                boxShadow: '0 15px 40px rgba(0,160,233,0.25)'
              }}>
              REGISTRARSE AHORA
            </a>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5">
        <div className="container flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
            <div className="gradient-btn p-2 rounded-xl" style={{ width: '40px', height: '40px' }}>
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tighter">ADSHARE</span>
          </div>
          <p className="text-xs text-dim font-bold tracking-widest">© 2026 ADSHARE FAST. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/earnings" element={<MainLayout><Earnings /></MainLayout>} />
        <Route path="/withdrawals" element={<MainLayout><Withdrawals /></MainLayout>} />
        <Route path="/referrals" element={<MainLayout><Referrals /></MainLayout>} />
        <Route path="/news" element={<MainLayout><News /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
