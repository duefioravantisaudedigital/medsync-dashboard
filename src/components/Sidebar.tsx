'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Settings, 
  LifeBuoy,
  LogOut,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import Cookies from 'js-cookie';

import { API_BASE_URL, getAuthHeaders, getUser } from '@/lib/api';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(getUser);

  // Atualiza os dados do médico (plano e validade) a partir da API, não só do cookie do login
  useEffect(() => {
    let cancelado = false;
    fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() })
      .then((resp) => (resp.ok ? resp.json() : null))
      .then((data) => {
        if (!data || cancelado) return;
        Cookies.set('medsync_user', JSON.stringify(data), { expires: 7 });
        setUser(data);
      })
      .catch(() => {
        // Sem conexão: mantém o que está no cookie
      });
    return () => { cancelado = true; };
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove('medsync_token');
    Cookies.remove('medsync_user');
    router.push('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Início', href: '/' },
    { icon: <Users size={20} />, label: 'Pacientes', href: '/pacientes' },
    { icon: <MessageSquare size={20} />, label: 'Mensagens', href: '/mensagens' },
    { icon: <History size={20} />, label: 'Histórico', href: '/historico' },
    { icon: <CreditCard size={20} />, label: 'Assinatura', href: '/assinatura' },
  ];

  if (user?.is_admin) {
    menuItems.push({ icon: <Settings size={20} />, label: 'Painel Admin', href: '/admin' });
  }

  const secondaryItems = [
    { icon: <LifeBuoy size={20} />, label: 'Suporte', href: '/suporte' },
  ];

  const expirationDate = user?.expires_at
    ? new Date(user.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';

  const planoLabel = user?.plan_type === 'trial' ? 'Teste grátis' : 'Plano Pro';
  const expirado = user?.expires_at ? new Date(user.expires_at) < new Date() : false;

  return (
    <div className="w-64 bg-[#064e3b] h-screen flex flex-col text-white p-6 fixed left-0 top-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity">
        <div className="bg-white/20 p-2 rounded-lg">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-[#064e3b] rounded-sm rotate-45" />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight">MedSync</h1>
      </Link>

      {/* Main Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-white/10 text-white font-medium shadow-inner' 
                  : 'text-emerald-100/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="pt-6 border-t border-white/10 space-y-2">
        {secondaryItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100/60 hover:bg-white/5 hover:text-white transition-all"
          >
            {item.icon}
            <span className="text-left">{item.label}</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300/60 hover:bg-red-500/10 hover:text-red-400 transition-all mt-2"
        >
          <LogOut size={20} />
          <span className="text-left font-medium">Sair da Conta</span>
        </button>

        {/* Subscription Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] text-emerald-100/50 uppercase tracking-wider font-bold">
                {planoLabel} - {expirado ? 'expirado' : 'ativo'}
              </p>
              <p className="text-sm font-semibold">{expirado ? 'Expirou' : 'Expira'} {expirationDate}</p>
            </div>
          </div>
          <Link
            href="/assinatura"
            className="mt-2 block w-full text-center bg-white text-[#064e3b] py-2 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors"
          >
            {user?.plan_type === 'trial' || expirado ? 'Assinar' : 'Gerenciar'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;