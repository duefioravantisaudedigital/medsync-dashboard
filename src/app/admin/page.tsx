'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL, getAuthHeaders, getUser } from '@/lib/api';
import { 
  Users, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert,
  Zap,
  RefreshCw,
  Power
} from 'lucide-react';

interface AdminUser {
  id: number;
  nome: string;
  email: string;
  crm: string;
  uf_crm: string;
  is_active: boolean;
  is_admin: boolean;
  expires_at: string | null;
  plan_type: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const user = getUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        setUsers(await resp.json());
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRenew(userId: number) {
    if (!confirm('Deseja renovar a licença por +30 dias? (Isso mudará o plano para PRO)')) return;
    
    setActionId(userId);
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users/${userId}/renew`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        await fetchUsers();
      }
    } catch (err) {
      alert('Erro ao renovar licença');
    } finally {
      setActionId(null);
    }
  }

  async function handleToggleStatus(userId: number) {
    setActionId(userId);
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        await fetchUsers();
      }
    } catch (err) {
      alert('Erro ao alterar status');
    } finally {
      setActionId(null);
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500 font-bold">Acesso negado.</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Painel Administrativo</h1>
          <p className="text-gray-500 mt-1">Gerenciamento central de médicos e licenças MedSync.</p>
        </div>
        <button 
          onClick={fetchUsers} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar Lista
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Médico</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Acesso / Licença</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Gestão de Licença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const isExpired = u.expires_at && new Date(u.expires_at) < new Date();
                const isTrial = u.plan_type === 'trial';
                const isProcessing = actionId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isTrial ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{u.nome}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            {u.email} • CRM {u.crm}/{u.uf_crm}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {isTrial ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                              <Zap size={12} /> PERÍODO DE TESTE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <ShieldCheck size={12} /> PLANO PRO
                            </span>
                          )}
                          {!u.is_active && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
                              <ShieldAlert size={12} /> CONTA SUSPENSA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={14} />
                          Expira em: <span className={isExpired ? 'text-red-500 font-bold' : 'font-medium'}>
                            {u.expires_at ? new Date(u.expires_at).toLocaleDateString('pt-BR') : 'Sem data'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleRenew(u.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                        >
                          {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                          Renovar +30 dias
                        </button>
                        
                        <button 
                          onClick={() => handleToggleStatus(u.id)}
                          disabled={isProcessing}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${
                            u.is_active 
                              ? 'bg-white text-red-600 border-red-100 hover:bg-red-50' 
                              : 'bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-lg shadow-blue-200'
                          }`}
                        >
                          <Power size={14} />
                          {u.is_active ? 'Suspender Acesso' : 'Reativar Conta'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {users.length === 0 && !loading && (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold">Nenhum médico encontrado</h3>
              <p className="text-gray-500 text-sm mt-1">Os médicos aparecerão aqui assim que se cadastrarem na extensão.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
