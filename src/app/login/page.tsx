'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, User, IdCard, MapPin, MessageCircle, X, Send } from 'lucide-react';
import Cookies from 'js-cookie';

// URL da sua API na Vercel (ou localhost se estiver rodando local)
const API_BASE_URL = 'https://medsycn.vercel.app'; // Ajuste se necessário

const MEDSYNC_SITE_URL = 'https://www.duefioravanti-saudedigital.com.br/MedSync';

const SUPORTE_WHATSAPP = '5511925489393';
const SUPORTE_WHATSAPP_LABEL = '(11) 92548-9393';
const SUPORTE_MENSAGEM_PADRAO =
  'Olá! Preciso de ajuda com o MedSync.\n\nO que está acontecendo: ';

const NAV_LINKS = [
  { label: 'Conheça o MedSync', href: MEDSYNC_SITE_URL },
  { label: 'Como funciona', href: `${MEDSYNC_SITE_URL}#como-funciona` },
  { label: 'Planos', href: `${MEDSYNC_SITE_URL}#planos` },
  { label: 'Dúvidas frequentes', href: `${MEDSYNC_SITE_URL}#faq` },
];

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const inputClass = "appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [success, setSuccess] = useState('');
  const [nome, setNome] = useState('');
  const [crm, setCrm] = useState('');
  const [ufCrm, setUfCrm] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [suporteAberto, setSuporteAberto] = useState(false);
  const [suporteMensagem, setSuporteMensagem] = useState(SUPORTE_MENSAGEM_PADRAO);

  const abrirSuporte = () => {
    setSuporteMensagem(SUPORTE_MENSAGEM_PADRAO);
    setSuporteAberto(true);
  };

  const enviarSuporte = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = email ? `${suporteMensagem}\n\nE-mail: ${email}` : suporteMensagem;
    window.open(
      `https://wa.me/${SUPORTE_WHATSAPP}?text=${encodeURIComponent(texto)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setSuporteAberto(false);
  };

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  // Se já estiver logado, vai direto para o Dashboard
  useEffect(() => {
    const token = Cookies.get('medsync_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password, crm, uf_crm: ufCrm })
      });

      const data = await resp.json();

      if (resp.ok) {
        // Conta já nasce ativa (trial 7 dias): faz login automático e leva para a instalação
        const loginResp = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginResp.json();

        if (loginResp.ok) {
          Cookies.set('medsync_token', loginData.token, { expires: 7 });
          Cookies.set('medsync_user', JSON.stringify(loginData.medico), { expires: 7 });
          router.push('/instalacao?novo=1');
          return;
        }

        switchMode('login');
        setSuccess('Cadastro realizado! Faça login para continuar.');
        setNome('');
        setCrm('');
        setUfCrm('');
      } else {
        setError(data.error || 'Erro ao realizar cadastro. Tente novamente.');
      }
    } catch (err) {
      setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await resp.json();

      if (resp.ok) {
        // Salva o token por 7 dias
        Cookies.set('medsync_token', data.token, { expires: 7 });
        Cookies.set('medsync_user', JSON.stringify(data.medico), { expires: 7 });
        
        router.push('/');
      } else {
        setError(data.error || 'Erro ao realizar login. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href={MEDSYNC_SITE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-[#064e3b] p-1.5 rounded-lg">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#064e3b] rounded-sm rotate-45" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">MedSync</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-500 hover:text-[#064e3b] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href={MEDSYNC_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden text-sm font-bold text-[#064e3b]"
          >
            Conheça o MedSync
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-[#064e3b] p-3 rounded-2xl">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-[#064e3b] rounded-sm rotate-45" />
            </div>
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          MedSync Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {mode === 'login' ? 'Acesse a central de comando da sua clínica' : 'Crie sua conta para começar'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm animate-shake">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-sm">
                <CheckCircle2 size={18} />
                {success}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={inputClass}
                    placeholder="Dr(a). Nome Sobrenome"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  placeholder="medico@exemplo.com"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">CRM</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <IdCard size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      className={inputClass}
                      placeholder="123456"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">UF</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <MapPin size={18} />
                    </div>
                    <select
                      required
                      value={ufCrm}
                      onChange={(e) => setUfCrm(e.target.value)}
                      className={`${inputClass} bg-white`}
                    >
                      <option value="" disabled>UF</option>
                      {UFS.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar senha</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#064e3b] hover:bg-[#065f46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (mode === 'login' ? 'Validando...' : 'Cadastrando...')
                  : (mode === 'login' ? 'Entrar no Dashboard' : 'Criar conta')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>

          <p className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            {mode === 'login' ? (
              <>
                Não possui conta?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-bold text-[#064e3b] hover:underline">
                  Cadastre-se aqui
                </button>
              </>
            ) : (
              <>
                Já possui conta?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-bold text-[#064e3b] hover:underline">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-gray-500">
          Precisa de ajuda?{' '}
          <button type="button" onClick={abrirSuporte} className="font-bold text-[#064e3b] hover:underline">
            Fale com o suporte
          </button>
        </p>
      </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            <p className="text-sm font-bold text-gray-900">
              MedSync é um produto da Due Fioravanti Saúde Digital
            </p>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
              A Due Fioravanti é uma healthtech brasileira que integra tecnologia, gestão e governança
              para sustentar operações de saúde digital com eficiência, segurança de dados e
              conformidade jurídica. O MedSync nasce dessa base: automação que elimina a burocracia
              do cadastro para que o médico foque no que importa, o paciente.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Segurança de dados', 'Conformidade com a LGPD', 'Eficiência operacional'].map((pilar) => (
                <span
                  key={pilar}
                  className="text-xs font-medium text-[#064e3b] bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full"
                >
                  {pilar}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-bold text-gray-900">Contato</p>
            <a
              href="mailto:contato@duefioravanti-saudedigital.com.br"
              className="block text-gray-500 hover:text-[#064e3b] transition-colors break-all"
            >
              contato@duefioravanti-saudedigital.com.br
            </a>
            <a
              href={`https://wa.me/${SUPORTE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-500 hover:text-[#064e3b] transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp {SUPORTE_WHATSAPP_LABEL}
            </a>
            <a
              href="https://www.duefioravanti-saudedigital.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-500 hover:text-[#064e3b] transition-colors"
            >
              duefioravanti-saudedigital.com.br
            </a>
          </div>
        </div>
        <div className="border-t border-gray-100">
          <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-gray-400">
            © {new Date().getFullYear()} Due Fioravanti Saúde Digital LTDA · CNPJ 43.924.357/0001-79 · Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {suporteAberto && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSuporteAberto(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Fale com o suporte</h3>
                  <p className="text-xs text-gray-500">Atendimento pelo WhatsApp {SUPORTE_WHATSAPP_LABEL}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuporteAberto(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={enviarSuporte} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conte o que está acontecendo
                </label>
                <textarea
                  required
                  value={suporteMensagem}
                  onChange={(e) => setSuporteMensagem(e.target.value)}
                  className="w-full h-36 p-3 border border-gray-200 rounded-xl text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#064e3b] hover:bg-[#065f46] transition-all"
              >
                Enviar pelo WhatsApp
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
