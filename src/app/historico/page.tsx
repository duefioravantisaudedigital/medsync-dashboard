'use client';

import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, History } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

interface LogData {
  id: number;
  status: string;
  data: string | null;
  paciente: string;
}

const HistoricoPage = () => {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const resp = await fetch(`${API_BASE_URL}/dashboard/historico`, {
          headers: getAuthHeaders()
        });
        if (resp.ok) {
          const data = await resp.json();
          setLogs(data.historico);
        }
      } catch (err) {
        console.error('Erro ao buscar histórico:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  function formatDate(iso: string | null) {
    if (!iso) return '-';
    const d = new Date(iso);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    if (d.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
    if (d.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
    return d.toLocaleDateString('pt-BR') + `, ${hora}`;
  }

  function isSuccess(status: string) {
    return status.startsWith('SUCESSO');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Histórico de Atividade</h1>
          <p className="text-gray-500 mt-1">Últimas 50 sincronizações do seu robô.</p>
        </div>
        <button 
          onClick={fetchHistorico}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar Lista
        </button>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <RefreshCw size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium">Buscando atividades recentes...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-400">Nenhuma atividade registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isSuccess(log.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {isSuccess(log.status) ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sincronização</p>
                  <p className="text-sm text-gray-500">Paciente: {log.paciente}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                  isSuccess(log.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {log.status}
                </span>
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-1">
                  <Clock size={12} />
                  {formatDate(log.data)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricoPage;
