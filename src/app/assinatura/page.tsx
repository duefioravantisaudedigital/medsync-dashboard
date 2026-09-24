'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Check, CreditCard, Lock, AlertCircle, ArrowRight, Loader2, Star } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders, getUser } from '@/lib/api';

type PlanoId = 'MENSAL' | 'SEMESTRAL' | 'ANUAL';

// Só exibição: o valor cobrado é decidido pelo servidor
const PLANOS: {
  id: PlanoId;
  nome: string;
  precoMes: string;
  detalhe: string;
  parcelas: string;
  economia?: string;
  popular?: boolean;
  beneficios: string[];
}[] = [
  {
    id: 'MENSAL',
    nome: 'Mensal',
    precoMes: '179',
    detalhe: 'cobrado todo mês',
    parcelas: 'à vista',
    beneficios: ['Automação Medprev → Memed', 'Cadastros ilimitados', 'Suporte básico por e-mail', 'Atualizações inclusas'],
  },
  {
    id: 'SEMESTRAL',
    nome: 'Semestral',
    precoMes: '149',
    detalhe: 'cobrado R$ 894 por semestre',
    parcelas: 'em até 6x',
    economia: 'Economia de 16%',
    popular: true,
    beneficios: ['Tudo do plano Mensal', 'Suporte prioritário', 'Onboarding guiado incluso', 'Relatório de tempo economizado'],
  },
  {
    id: 'ANUAL',
    nome: 'Anual',
    precoMes: '119',
    detalhe: 'cobrado R$ 1.428 por ano',
    parcelas: 'em até 12x',
    economia: 'Economia de 33%',
    beneficios: ['Tudo do plano Semestral', 'Suporte 24/7', 'Treinamento da equipe incluso', 'Acesso antecipado a novas integrações'],
  },
];

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

type Form = {
  nome: string; taxId: string; email: string; telefone: string;
  cep: string; rua: string; numero: string; complemento: string; cidade: string; uf: string;
};

const digitos = (v: string) => v.replace(/\D/g, '');

function mascaraTaxId(v: string) {
  const d = digitos(v).slice(0, 14);
  if (d.length <= 11) {
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}

function mascaraTelefone(v: string) {
  const d = digitos(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function mascaraCep(v: string) {
  return digitos(v).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}

function cpfValido(cpf: string) {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (base: number) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(cpf[i]) * (base + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

function cnpjValido(cnpj: string) {
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (tam: number) => {
    const pesos = tam === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const soma = pesos.reduce((acc, p, i) => acc + Number(cnpj[i]) * p, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

function validar(f: Form): Partial<Record<keyof Form, string>> {
  const erros: Partial<Record<keyof Form, string>> = {};
  const doc = digitos(f.taxId);
  if (!f.nome.trim()) erros.nome = 'Informe o nome';
  if (!(doc.length === 11 ? cpfValido(doc) : doc.length === 14 ? cnpjValido(doc) : false)) erros.taxId = 'CPF ou CNPJ inválido';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) erros.email = 'E-mail inválido';
  if (digitos(f.telefone).length < 10) erros.telefone = 'Telefone inválido';
  if (digitos(f.cep).length !== 8) erros.cep = 'CEP inválido';
  if (!f.rua.trim()) erros.rua = 'Informe a rua';
  if (!digitos(f.numero)) erros.numero = 'Informe o número';
  if (!f.cidade.trim()) erros.cidade = 'Informe a cidade';
  if (!UFS.includes(f.uf)) erros.uf = 'Selecione a UF';
  return erros;
}

function Erro({ mensagem }: { mensagem?: string }) {
  return mensagem ? <p className="mt-1 text-xs text-red-600">{mensagem}</p> : null;
}

// Pré-preenche com os dados do login (a página só renderiza no cliente, depois do NavigationWrapper)
function formInicial(): Form {
  const user = getUser();
  return {
    nome: user?.nome || '', taxId: '', email: user?.email || '', telefone: '',
    cep: '', rua: '', numero: '', complemento: '', cidade: '', uf: '',
  };
}

export default function AssinaturaPage() {
  const router = useRouter();
  const [plano, setPlano] = useState<PlanoId | null>(null);
  const [form, setForm] = useState<Form>(formInicial);
  const [erros, setErros] = useState<Partial<Record<keyof Form, string>>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [podeTentarDeNovo, setPodeTentarDeNovo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const set = (campo: keyof Form, valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  // Preenche endereço pelo CEP
  const buscarCep = async (cep: string) => {
    const d = digitos(cep);
    if (d.length !== 8) return;
    setBuscandoCep(true);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const data = await resp.json();
      if (data.erro) {
        setErros((e) => ({ ...e, cep: 'CEP não encontrado' }));
        return;
      }
      setForm((f) => ({
        ...f,
        rua: data.logradouro || f.rua,
        cidade: data.localidade || f.cidade,
        uf: data.uf || f.uf,
      }));
    } catch {
      // Sem ViaCEP o médico preenche à mão
    } finally {
      setBuscandoCep(false);
    }
  };

  const irParaPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroGeral('');
    setPodeTentarDeNovo(false);

    const encontrados = validar(form);
    setErros(encontrados);
    if (!plano || Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/assinaturas/checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          plano,
          nome: form.nome.trim(),
          taxId: digitos(form.taxId),
          email: form.email.trim().toLowerCase(),
          telefone: digitos(form.telefone),
          rua: form.rua.trim(),
          numero: digitos(form.numero),
          complemento: form.complemento.trim(),
          cidade: form.cidade.trim(),
          uf: form.uf,
          cep: digitos(form.cep),
        }),
      });
      const data = await resp.json().catch(() => ({}));

      if (resp.status === 201 && data.url) {
        window.location.href = data.url;
        return;
      }
      if (resp.status === 401) {
        Cookies.remove('medsync_token');
        Cookies.remove('medsync_user');
        router.push('/login');
        return;
      }
      if (resp.status === 409) {
        setErroGeral('Você já possui uma assinatura ativa.');
      } else if (resp.status === 400) {
        setErroGeral(data.error || 'Confira os dados informados.');
      } else {
        setErroGeral(data.error || 'Não foi possível gerar o pagamento.');
        setPodeTentarDeNovo(true);
      }
    } catch {
      setErroGeral('Não foi possível conectar ao servidor.');
      setPodeTentarDeNovo(true);
    } finally {
      setEnviando(false);
    }
  };

  const planoSelecionado = PLANOS.find((p) => p.id === plano);

  const input = (campo: keyof Form) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
      erros[campo] ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-sm text-gray-500 mt-1">Escolha o plano que faz mais sentido para a sua rotina.</p>
      </div>

      {/* Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANOS.map((p) => {
          const ativo = plano === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlano(p.id)}
              className={`relative text-left bg-white rounded-2xl border p-6 flex flex-col transition-all ${
                ativo ? 'border-[#064e3b] ring-2 ring-[#064e3b]/20' : 'border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#064e3b] text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Star size={12} /> Mais popular
                </span>
              )}
              <h2 className="text-lg font-bold text-gray-900">{p.nome}</h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900">R$ {p.precoMes}</span>
                <span className="text-sm text-gray-500 mb-1">/mês</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{p.detalhe} · {p.parcelas}</p>
              {p.economia && (
                <span className="mt-3 self-start bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {p.economia}
                </span>
              )}
              <ul className="mt-5 space-y-2 flex-1">
                {p.beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
              <span
                className={`mt-6 w-full text-center py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  ativo ? 'bg-[#064e3b] text-white' : 'bg-gray-50 text-[#064e3b]'
                }`}
              >
                {ativo ? 'Selecionado' : 'Escolher plano'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dados do pagador */}
      {planoSelecionado && (
        <form onSubmit={irParaPagamento} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Dados de cobrança</h2>
              <p className="text-sm text-gray-500">Plano {planoSelecionado.nome} · {planoSelecionado.detalhe}</p>
            </div>
          </div>

          {erroGeral && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle size={18} />
              <span className="flex-1">{erroGeral}</span>
              {podeTentarDeNovo && (
                <button type="submit" className="font-bold underline">Tentar de novo</button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome ou razão social</label>
              <input className={input('nome')} value={form.nome} onChange={(e) => set('nome', e.target.value)} maxLength={100} />
              <Erro mensagem={erros.nome} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ</label>
              <input className={input('taxId')} value={form.taxId} inputMode="numeric"
                onChange={(e) => set('taxId', mascaraTaxId(e.target.value))} placeholder="000.000.000-00" />
              <Erro mensagem={erros.taxId} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input className={input('telefone')} value={form.telefone} inputMode="numeric"
                onChange={(e) => set('telefone', mascaraTelefone(e.target.value))} placeholder="(11) 99999-9999" />
              <Erro mensagem={erros.telefone} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input className={input('email')} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} maxLength={150} />
              <Erro mensagem={erros.email} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <div className="relative">
                <input className={input('cep')} value={form.cep} inputMode="numeric"
                  onChange={(e) => { const v = mascaraCep(e.target.value); set('cep', v); buscarCep(v); }}
                  placeholder="00000-000" />
                {buscandoCep && <Loader2 size={16} className="absolute right-3 top-3.5 animate-spin text-gray-400" />}
              </div>
              <Erro mensagem={erros.cep} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input className={input('numero')} value={form.numero} inputMode="numeric"
                onChange={(e) => set('numero', digitos(e.target.value).slice(0, 6))} />
              <Erro mensagem={erros.numero} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
              <input className={input('rua')} value={form.rua} onChange={(e) => set('rua', e.target.value)} maxLength={200} />
              <Erro mensagem={erros.rua} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento <span className="text-gray-400">(opcional)</span></label>
              <input className={input('complemento')} value={form.complemento} onChange={(e) => set('complemento', e.target.value)} maxLength={150} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input className={input('cidade')} value={form.cidade} onChange={(e) => set('cidade', e.target.value)} maxLength={60} />
              <Erro mensagem={erros.cidade} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
              <select className={input('uf')} value={form.uf} onChange={(e) => set('uf', e.target.value)}>
                <option value="">Selecione</option>
                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              <Erro mensagem={erros.uf} />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 text-sm text-gray-600">
            <Lock size={18} className="text-[#064e3b] mt-0.5 shrink-0" />
            <p>
              O pagamento é feito somente com <strong>cartão de crédito</strong>, em uma página segura do C6 Bank.
              {planoSelecionado.id !== 'MENSAL' && ' O parcelamento tem juros do cartão.'} A renovação é automática no mesmo cartão e você pode cancelar quando quiser.
            </p>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#064e3b] hover:bg-[#065f46] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? <><Loader2 size={18} className="animate-spin" /> Gerando pagamento...</> : <><CreditCard size={18} /> Ir para pagamento <ArrowRight size={18} /></>}
          </button>
        </form>
      )}
    </div>
  );
}