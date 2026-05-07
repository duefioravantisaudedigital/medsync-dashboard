'use client';

import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, History, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Estados da Paginação
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  async function fetchLogs() {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/dashboard/historico?page=${page}&per_page=${perPage}`, {
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        setLogs(data.historico);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [page, perPage]);

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

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Histórico de Atividade</h1>
          <p className="text-gray-500 mt-1">Últimas sincronizações do seu robô.</p>
        </div>
        <button 
          onClick={fetchLogs}
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
        <div className="space-y-4">
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

          {/* PAGINAÇÃO ESTILO MEMED */}
          <div className="px-2 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
              <span>Exibindo</span>
              <select 
                value={perPage} 
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>de <span className="font-bold text-gray-900">{total}</span> atividades</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-gray-500 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
              >
                <ChevronLeft size={16} /> Anterior
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (totalPages > 5 && (p > 3 && p < totalPages - 1 && Math.abs(p - page) > 1)) {
                    if (p === 4 || p === totalPages - 2) return <span key={`dots-${p}`} className="px-2 text-gray-400">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                        page === p 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || total === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-gray-500 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
              >
                Próximo <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoPage;
