'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Clock, 
  Send, 
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Type
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
  
  // Estados para o editor de mensagem
  const [editingConsulta, setEditingConsulta] = useState<ConsultaHoje | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  
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

  const openEditor = (consulta: ConsultaHoje) => {
    if (!consulta.telefone) {
      alert('Paciente sem telefone cadastrado.');
      return;
    }
    const doctorName = user?.nome || 'Médico';
    const initialMessage = `Olá! Tudo bem, *${consulta.paciente}*? Falamos em nome da equipe de *Dr(a). ${doctorName}*. Gostaríamos de confirmar a consulta agendada para hoje às *${consulta.horario}*. Podemos confirmar?`;
    
    setEditingConsulta(consulta);
    setEditedMessage(initialMessage);
  };

  const confirmSend = () => {
    if (!editingConsulta || !editingConsulta.telefone) return;

    let cleanPhone = editingConsulta.telefone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);

    if (cleanPhone.length <= 11) {
      if (cleanPhone.length === 10) {
        cleanPhone = cleanPhone.slice(0, 2) + '9' + cleanPhone.slice(2);
      }
      cleanPhone = `55${cleanPhone}`;
    }
    
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(editedMessage)}`;
    window.open(waUrl, '_blank');
    setEditingConsulta(null);
  };

  const consultasFiltradas = consultas.filter(c =>
    c.paciente.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
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
                      onClick={() => openEditor(c)}
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
            Ao clicar em <strong>Confirmar</strong>, um editor será aberto para você revisar a mensagem. 
            Você pode personalizar o texto antes de abrir o WhatsApp. 
            Isso garante total controle sobre o que é enviado ao paciente!
          </p>
        </div>
      </div>

      {/* Modal de Edição de Mensagem */}
      {editingConsulta && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Type size={18} />
                </div>
                <div>
                  <h3 className="font-bold">Editar Mensagem</h3>
                  <p className="text-xs text-emerald-100">Paciente: {editingConsulta.paciente}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingConsulta(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Corpo da Mensagem</label>
                <textarea 
                  className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-gray-700 leading-relaxed"
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  placeholder="Escreva sua mensagem aqui..."
                />
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <p>O texto entre asteriscos (*texto*) ficará em <strong>negrito</strong> no WhatsApp.</p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setEditingConsulta(null)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmSend}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                <Send size={18} />
                Enviar via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MensagensPage;
