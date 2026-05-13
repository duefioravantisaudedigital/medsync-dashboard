'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Clock, 
  Send, 
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL, getAuthHeaders, getUser } from '@/lib/api';

interface ConsultaHoje {
  id: number;
  paciente: string;
  telefone: string | null;
  horario: string;
}

const MensagensPage = () => {
  const [consultas, setConsultas] = useState<ConsultaHoje[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const user = getUser();

  async function fetchConsultas() {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/dashboard/consultas/hoje`, {
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        setConsultas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar consultas de hoje:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConsultas();
  }, []);

  const handleSendWhatsApp = (consulta: ConsultaHoje) => {
    if (!consulta.telefone) {
      alert('Paciente sem telefone cadastrado.');
      return;
    }

    const doctorName = user?.nome || 'Médico';
    let cleanPhone = consulta.telefone.replace(/\D/g, '');
    
    // Se o número começa com 0, remove
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);

    // Se o número já tem o 55 do país (12 ou 13 dígitos), não mexe
    // Se tem apenas 10 ou 11 dígitos, adiciona o 55
    if (cleanPhone.length <= 11) {
      // Se tem 10 dígitos (DDD + 8), adiciona o 9 antes de colocar o 55
      if (cleanPhone.length === 10) {
        cleanPhone = cleanPhone.slice(0, 2) + '9' + cleanPhone.slice(2);
      }
      cleanPhone = `55${cleanPhone}`;
    }
    
    const message = `Olá, *${consulta.paciente}*! Tudo bem? Aqui é da clínica do *Dr(a). ${doctorName}*. Confirmamos sua consulta hoje às *${consulta.horario}*? Aguardamos sua resposta!`;
    
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const consultasFiltradas = consultas.filter(c =>
    c.paciente.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-emerald-600" size={32} />
            Mensagens de Confirmação
          </h1>
          <p className="text-gray-500 mt-1">Confirme as consultas agendadas para hoje via WhatsApp.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar paciente..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="px-8 py-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-800 font-semibold">
            <Calendar size={20} />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </div>
          <div className="text-sm font-medium text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
            {consultasFiltradas.length} {consultasFiltradas.length === 1 ? 'consulta' : 'consultas'} para hoje
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Horário</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Paciente</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Contato</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-6 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : consultasFiltradas.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-bold text-emerald-700">
                      <Clock size={16} />
                      {c.horario}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-900">{c.paciente}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-gray-600 font-mono">
                      {c.telefone ? c.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : 'Sem telefone'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleSendWhatsApp(c)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 hover:shadow-emerald-200 active:scale-95"
                    >
                      <Send size={16} />
                      Confirmar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && consultasFiltradas.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} className="text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold">Tudo em dia!</h3>
              <p className="text-gray-500 text-sm mt-1">Nenhuma consulta pendente de confirmação para hoje.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">Como funciona?</h4>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed">
            Ao clicar em <strong>Confirmar</strong>, uma nova aba do WhatsApp será aberta com a mensagem pronta. 
            Basta conferir e apertar o botão de enviar no próprio WhatsApp. 
            Isso garante a segurança da sua conta e agiliza o atendimento!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MensagensPage;
