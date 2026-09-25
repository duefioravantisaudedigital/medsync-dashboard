'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Pin,
  KeyRound,
  MonitorCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Info,
  CalendarClock
} from 'lucide-react';
import { getUser } from '@/lib/api';

const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/automa%C3%A7%C3%A3o-medprev-%3E-memed/cpooajjnmoeckdagjcifefncnebeffko?hl=pt-BR';

const steps = [
  {
    icon: <Download size={22} />,
    title: 'Instale a extensão no Chrome',
    description:
      'Clique no botão abaixo para abrir a Chrome Web Store e depois em "Usar no Chrome". A instalação leva menos de 1 minuto.',
    action: (
      <a
        href={CHROME_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-4 px-5 py-3 bg-[#064e3b] text-white rounded-xl text-sm font-bold hover:bg-[#065f46] transition-all"
      >
        Abrir na Chrome Web Store
        <ExternalLink size={16} />
      </a>
    )
  },
  {
    icon: <Pin size={22} />,
    title: 'Fixe o MedSync na barra do navegador',
    description:
      'Clique no ícone de quebra-cabeça no canto superior direito do Chrome e no alfinete ao lado do MedSync. Assim ele fica sempre à vista.'
  },
  {
    icon: <KeyRound size={22} />,
    title: 'Entre com a mesma conta do dashboard',
    description:
      'Clique no ícone do MedSync e faça login com o mesmo e-mail e senha que você acabou de cadastrar.'
  },
  {
    icon: <MonitorCheck size={22} />,
    title: 'Deixe o Medprev e o Memed abertos',
    description:
      'Mantenha o Medprev e o Memed abertos e logados no mesmo Chrome durante o atendimento. A automação só funciona com os dois abertos.'
  },
  {
    icon: <RefreshCw size={22} />,
    title: 'Pronto, o robô assume daqui',
    description:
      'A cada minuto o MedSync verifica os agendamentos do Medprev e cadastra os pacientes no Memed automaticamente. Você acompanha tudo pelo Histórico aqui no dashboard.'
  }
];

const InstalacaoPage = () => {
  const user = getUser();
  const primeiroNome = user?.nome ? String(user.nome).split(' ')[0] : '';
  const [novoCadastro, setNovoCadastro] = useState(false);

  // ?novo=1 vem do redirecionamento pós-cadastro; pelo menu, a página vira guia
  useEffect(() => {
    setNovoCadastro(new URLSearchParams(window.location.search).get('novo') === '1');
  }, []);

  const dataExpiracao = user?.expires_at
    ? new Date(user.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  const passoPlano = {
    icon: <CalendarClock size={22} />,
    title: 'Seu teste grátis vale por 7 dias',
    description: dataExpiracao
      ? `Seu plano de teste expira em ${dataExpiracao}. Para continuar usando o MedSync sem interrupção, escolha um plano na página Planos.`
      : 'Seu plano de teste expira 7 dias após o cadastro. Para continuar usando o MedSync sem interrupção, escolha um plano na página Planos.',
    action: (
      <Link
        href="/assinatura"
        className="inline-flex items-center gap-2 mt-4 px-5 py-3 bg-[#064e3b] text-white rounded-xl text-sm font-bold hover:bg-[#065f46] transition-all"
      >
        Ver planos
        <ArrowRight size={16} />
      </Link>
    )
  };

  const passos = novoCadastro ? [...steps, passoPlano] : steps;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {novoCadastro
              ? (primeiroNome ? `Bem-vindo(a), ${primeiroNome}!` : 'Bem-vindo(a) ao MedSync!')
              : 'Guia de instalação'}
          </h1>
          <p className="text-gray-500 mt-1">
            {novoCadastro
              ? 'Sua conta está ativa com 7 dias de teste grátis. Siga os passos abaixo para começar.'
              : 'Veja como instalar e usar o MedSync no seu dia a dia.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
        <ol className="space-y-8">
          {passos.map((step, index) => (
            <li key={index} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  {step.icon}
                </div>
                {index < passos.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-2" />}
              </div>
              <div className="pb-2">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Passo {index + 1}</p>
                <h2 className="text-lg font-bold text-gray-900 mt-1">{step.title}</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                {step.action}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex gap-3 text-sm text-emerald-800">
        <Info size={20} className="shrink-0 mt-0.5" />
        <p>
          Se algum paciente não aparecer no Memed, confira se as duas abas continuam abertas e logadas.
          Qualquer dúvida, fale com a gente pela página de{' '}
          <Link href="/suporte" className="font-bold underline">Suporte</Link>.
        </p>
      </div>

      <div className="flex justify-end">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#064e3b] text-white rounded-xl text-sm font-bold hover:bg-[#065f46] transition-all"
        >
          Ir para o dashboard
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default InstalacaoPage;
