'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

interface PacienteData {
  id: number;
  nome: string;
  cpf: string;
  email: string | null;
  telefone: string | null;
  ultima_consulta: string | null;
  total_consultas: number;
}

const PacientesPage = () => {
  const [pacientes, setPacientes] = useState<PacienteData[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados da Paginação
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  async function fetchPacientes() {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/dashboard/pacientes?page=${page}&per_page=${perPage}`, {
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        setPacientes(data.pacientes);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPacientes();
  }, [page, perPage]);

  const pacientesFiltrados = pacientes.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.cpf.includes(filtro)
  );

  function formatCPF(cpf: string) {
    if (cpf.length === 11) {
      return `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9)}`;
    }
    return cpf;
  }

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pacientes</h1>
          <p className="text-gray-500 mt-1">Gerencie a base de dados de pacientes sincronizados.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Paciente</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Contato / CPF</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Consultas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(perPage).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-8 py-6 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : pacientesFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {p.nome.charAt(0)}
                      </div>
                      <div className="font-bold text-gray-900">{p.nome}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-gray-600">{p.email || 'Sem e-mail'}</div>
                    <div className="text-xs text-gray-400 font-mono">{formatCPF(p.cpf)}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                      {p.total_consultas} {p.total_consultas === 1 ? 'consulta' : 'consultas'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && pacientesFiltrados.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold">Nenhum paciente encontrado</h3>
              <p className="text-gray-500 text-sm mt-1">Tente ajustar sua busca ou sincronize novos pacientes.</p>
            </div>
          )}
        </div>

        {/* PAGINAÇÃO ESTILO MEMED */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
            <span>Exibindo</span>
            <select 
              value={perPage} 
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>de <span className="font-bold text-gray-900">{total}</span> pacientes</span>
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
                // Mostrar apenas as primeiras 3 páginas, a atual e as últimas
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
    </div>
  );
};

export default PacientesPage;
