'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, Copy, X } from 'lucide-react';
import { getUser } from '@/lib/api';

// Aviso da versão 1.3 da extensão. Para um próximo aviso, troque a versão,
// a data de início e os textos abaixo.
const VERSAO = '1.3';
// Só aparece a partir desta data (horário de Brasília)
const INICIO = new Date('2026-10-10T00:00:00-03:00');
const ENDERECO_EXTENSOES = 'chrome://extensions';

const passos = [
  <>
    Copie o endereço{' '}
    <code className="px-1.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[13px] text-gray-900">
      {ENDERECO_EXTENSOES}
    </code>{' '}
    e cole na barra do Chrome.
  </>,
  <>
    Ative o <strong className="text-gray-900">Modo do desenvolvedor</strong>, no canto superior direito.
  </>,
  <>
    Clique em <strong className="text-gray-900">Atualizar</strong> e confira se aparece{' '}
    <strong className="text-gray-900">{VERSAO}</strong> ao lado do nome da extensão.
  </>,
];

const novidades = [
  {
    titulo: 'Conexão com o Memed corrigida.',
    texto: 'Resolvemos o problema que deixava o token como "Pendente" em algumas contas novas.',
  },
  {
    titulo: 'Novo botão "Capturar token do Memed".',
    texto: 'Se o token ficar pendente, um clique no MedSync resolve.',
  },
  {
    titulo: 'Mais segurança e estabilidade',
    texto: 'no funcionamento em segundo plano.',
  },
];

function chaveDoAviso() {
  const user = getUser();
  const dono = user?.id ?? user?.email ?? 'anon';
  return `medsync_aviso_${VERSAO}_${dono}`;
}

// localStorage/sessionStorage podem falhar (aba anônima, bloqueio do navegador)
function ler(storage: 'local' | 'session', chave: string) {
  try {
    return (storage === 'local' ? localStorage : sessionStorage).getItem(chave);
  } catch {
    return null;
  }
}

function gravar(storage: 'local' | 'session', chave: string) {
  try {
    (storage === 'local' ? localStorage : sessionStorage).setItem(chave, '1');
  } catch {
    // sem storage o aviso só volta a aparecer, não quebra nada
  }
}

function deveAbrir() {
  if (typeof window === 'undefined') return false;
  // ?aviso=1 na URL força a abertura, para conferir o aviso antes da data
  if (new URLSearchParams(window.location.search).has('aviso')) return true;
  if (Date.now() < INICIO.getTime()) return false;
  const chave = chaveDoAviso();
  return !ler('local', chave) && !ler('session', chave);
}

export default function AvisoAtualizacao() {
  // O NavigationWrapper só monta este componente no navegador, depois de
  // validar a sessão, então a checagem pode rodar já no estado inicial.
  const [aberto, setAberto] = useState(deveAbrir);
  const [copiado, setCopiado] = useState(false);

  // "Lembrar depois": some até o navegador ser fechado e aberto de novo
  const lembrarDepois = useCallback(() => {
    gravar('session', chaveDoAviso());
    setAberto(false);
  }, []);

  // "Já atualizei": não aparece mais para esta conta neste navegador
  const jaAtualizei = () => {
    gravar('local', chaveDoAviso());
    setAberto(false);
  };

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lembrarDepois();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, lembrarDepois]);

  const copiarEndereco = async () => {
    try {
      await navigator.clipboard.writeText(ENDERECO_EXTENSOES);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão de área de transferência: o endereço continua visível para copiar à mão
    }
  };

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={lembrarDepois}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="aviso-atualizacao-titulo"
        className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-7 py-5 bg-[#064e3b] text-white">
          <div>
            <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold tracking-wider">
              NOVA VERSÃO
            </span>
            <h2 id="aviso-atualizacao-titulo" className="text-xl font-bold">
              MedSync {VERSAO} disponível
            </h2>
            <p className="mt-1 text-sm text-emerald-200">
              Atualize a extensão para manter a sincronização funcionando. Leva menos de 1 minuto.
            </p>
          </div>
          <button
            type="button"
            onClick={lembrarDepois}
            className="text-emerald-200 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-7 py-6 overflow-y-auto">
          <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Como atualizar</h3>
          <ol className="space-y-2.5 mb-4">
            {passos.map((passo, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
                <span className="flex-none flex items-center justify-center w-[22px] h-[22px] mt-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                  {i + 1}
                </span>
                <span>
                  {passo}
                  {i === 0 && (
                    <button
                      type="button"
                      onClick={copiarEndereco}
                      className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-[#064e3b] hover:bg-emerald-100 transition-colors"
                    >
                      {copiado ? <Check size={13} /> : <Copy size={13} />}
                      {copiado ? 'Copiado' : 'Copiar endereço'}
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ol>

          <Image
            src="/atualizacao/medsync-1-3-atualizar.webp"
            alt='Tela de extensões do Chrome com o "Modo do desenvolvedor" ativado e o botão "Atualizar" em destaque'
            width={1400}
            height={469}
            unoptimized
            className="w-full h-auto rounded-xl border border-gray-200"
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-6">
            <div className="flex-1">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">O que mudou</h3>
              <ul className="space-y-2.5">
                {novidades.map((item) => (
                  <li key={item.titulo} className="text-sm leading-relaxed text-gray-700">
                    <strong className="text-gray-900">{item.titulo}</strong> {item.texto}
                  </li>
                ))}
              </ul>
            </div>
            <Image
              src="/atualizacao/medsync-1-3-popup.webp"
              alt='Janela do MedSync com o novo botão "Capturar token do Memed" em destaque'
              width={480}
              height={625}
              unoptimized
              className="flex-none w-40 h-auto mx-auto rounded-xl border border-gray-200"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-7 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={lembrarDepois}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Lembrar depois
          </button>
          <button
            type="button"
            onClick={jaAtualizei}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#064e3b] hover:bg-[#065f46] transition-all"
          >
            Já atualizei
          </button>
        </div>
      </div>
    </div>
  );
}
