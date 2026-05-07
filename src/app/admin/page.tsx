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
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (!confirm('Deseja renovar a licença por +30 dias?')) return;
    
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users/${userId}/renew`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        fetchUsers();
      }
    } catch (err) {
      alert('Erro ao renovar licença');
    }
  }

  async function handleToggleStatus(userId: number) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        fetchUsers();
      }
    } catch (err) {
      alert('Erro ao alterar status');
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
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Painel Administrativo</h1>
        <p className="text-gray-500 mt-1">Gerencie médicos, licenças e acessos da plataforma.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Médico</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Contato</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Licença</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const isExpired = u.expires_at && new Date(u.expires_at) < new Date();
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{u.nome}</div>
                      <div className="text-xs text-gray-500">CRM {u.crm}/{u.uf_crm}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className={isExpired ? 'text-red-500' : 'text-gray-400'} />
                        <span className={`text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {u.expires_at ? new Date(u.expires_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          <ShieldCheck size={12} /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <ShieldAlert size={12} /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleRenew(u.id)}
                          title="Renovar +30 dias"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Zap size={18} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(u.id)}
                          title={u.is_active ? "Desativar" : "Ativar"}
                          className={`p-2 rounded-lg transition-colors ${u.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-blue-600 hover:bg-blue-50'}`}
                        >
                          <Power size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {users.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-400">Nenhum médico cadastrado no sistema.</div>
          )}
        </div>
      </div>
    </div>
  );
}
