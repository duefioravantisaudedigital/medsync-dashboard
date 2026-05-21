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
  Type,
  Settings2,
  Save,
  Info
} from 'lucide-react';
import { API_BASE_URL, getAuthHeaders, getUser } from '@/lib/api';

interface ConsultaHoje {
  id: number;
  paciente: string;
  telefone: string | null;
  horario: string;
}

const DEFAULT_TEMPLATE = "Olá! Tudo bem, {{paciente}}? Falamos em nome da equipe de Dr(a). {{medico}}. Gostaríamos de confirmar a consulta agendada para hoje às {{horario}}. Podemos confirmar?";

const MensagensPage = () => {
  const [consultas, setConsultas] = useState<ConsultaHoje[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  
  // Estados para o Template Global
  const [globalTemplate, setGlobalTemplate] = useState(DEFAULT_TEMPLATE);
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  
  // Estados para o editor de mensagem individual (Modal)
  const [editingConsulta, setEditingConsulta] = useState<ConsultaHoje | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  
  const user = getUser();

  async function fetchInitialData() {
    setLoading(true);
    try {
      const [consultasResp, statsResp] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/consultas/hoje`, { headers: getAuthHeaders(), cache: 'no-store' }),
        fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getAuthHeaders(), cache: 'no-store' })
      ]);

      if (consultasResp.ok) {
        setConsultas(await consultasResp.json());
      }

      if (statsResp.ok) {
        const stats = await statsResp.json();
        if (stats.whatsapp_template) {
          setGlobalTemplate(stats.whatsapp_template);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  const saveGlobalTemplate = async () => {
    setSavingTemplate(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/dashboard/template`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: globalTemplate })
      });
      if (resp.ok) {
        setShowTemplateSettings(false);
      } else {
        alert('Erro ao salvar template.');
      }
    } catch (err) {
      console.error('Erro ao salvar template:', err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const processTemplate = (template: string, consulta: ConsultaHoje) => {
    let msg = template;
    msg = msg.replace(/{{paciente}}/g, `*${consulta.paciente}*`);
    msg = msg.replace(/{{horario}}/g, `*${consulta.horario}*`);
    msg = msg.replace(/{{medico}}/g, `*${user?.nome || 'Médico'}*`);
    return msg;
  };

  const openEditor = (consulta: ConsultaHoje) => {
    if (!consulta.telefone) {
      alert('Paciente sem telefone cadastrado.');
      return;
    }
    const message = processTemplate(globalTemplate, consulta);
    setEditingConsulta(consulta);
    setEditedMessage(message);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-emerald-600" size={32} />
            Mensagens de Confirmação
          </h1>
          <p className="text-gray-500 mt-1">Gerencie e envie confirmações via WhatsApp.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowTemplateSettings(!showTemplateSettings)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              showTemplateSettings 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings2 size={18} />
            Configurar Template
          </button>
          
          <div className="relative w-full md:w-64">
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
      </div>

      {/* Template Settings Panel */}
      {showTemplateSettings && (
        <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Settings2 className="text-emerald-600" size={20} />
                  Modelo de Mensagem Padrão
                </h3>
                <p className="text-sm text-gray-500">Este texto será usado como base para todas as mensagens de confirmação.</p>
              </div>
              <button 
                onClick={() => setShowTemplateSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="relative">
                  <textarea 
                    className="w-full h-48 p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none text-gray-700 leading-relaxed font-medium"
                    value={globalTemplate}
                    onChange={(e) => setGlobalTemplate(e.target.value)}
                    placeholder="Escreva seu template aqui..."
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button 
                      onClick={saveGlobalTemplate}
                      disabled={savingTemplate}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                    >
                      {savingTemplate ? 'Salvando...' : (
                        <>
                          <Save size={18} />
                          Salvar Template
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                  <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-3">
                    <Info size={16} />
                    Regras Importantes
                  </h4>
                  <ul className="space-y-3">
                    <li className="text-xs text-emerald-800 leading-relaxed">
                      Use as palavras entre chaves exatamente como abaixo para que o sistema troque pelos dados reais:
                    </li>
                    <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100 text-xs font-mono font-bold text-emerald-700">
                      <span>{"{{paciente}}"}</span>
                      <span className="text-[10px] text-emerald-400 font-sans uppercase">Nome Paciente</span>
                    </li>
                    <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100 text-xs font-mono font-bold text-emerald-700">
                      <span>{"{{horario}}"}</span>
                      <span className="text-[10px] text-emerald-400 font-sans uppercase">Hora Consulta</span>
                    </li>
                    <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100 text-xs font-mono font-bold text-emerald-700">
                      <span>{"{{medico}}"}</span>
                      <span className="text-[10px] text-emerald-400 font-sans uppercase">Seu Nome</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[11px] text-gray-500 leading-relaxed italic">
                    Dica: Você pode usar asteriscos para deixar palavras em negrito, ex: *Olá*.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main List */}
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
            Configure seu <strong>Template</strong> uma vez e ele será usado para todos os pacientes. 
            Ao clicar em <strong>Confirmar</strong>, você ainda poderá revisar e fazer ajustes finais antes de enviar para o WhatsApp.
          </p>
        </div>
      </div>

      {/* Modal de Edição de Mensagem Individual */}
      {editingConsulta && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Type size={18} />
                </div>
                <div>
                  <h3 className="font-bold">Revisar Mensagem</h3>
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
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mensagem Final</label>
                <textarea 
                  className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-gray-700 leading-relaxed"
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  placeholder="Escreva sua mensagem aqui..."
                />
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
