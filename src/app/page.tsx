'use client';

import React, { useEffect, useState } from 'react';
import MetricCard from '@/components/MetricCard';
import SyncChart from '@/components/SyncChart';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Calendar,
  CheckCircle2,
  Zap,
  CalendarCheck
} from 'lucide-react';

interface DashboardStats {
  processados: number;
  processados_mes: number;
  consultas_hoje: number;
  periodo: string;
  label_periodo: string;
  total_pacientes: number;
  tempo_economizado_minutos: number;
  total_erros: number;
  nome: string;
  crm: string;
  uf_crm: string;
  subscription_expires_at: string | null;
}

type Periodo = 'dia' | 'semana' | 'mes' | 'ano';

const periodoLabels: Record<Periodo, string> = {
  dia: 'Hoje',
  semana: 'Semana',
  mes: 'Mês',
  ano: 'Ano',
};

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('mes');

  async function fetchStats(p: Periodo) {
    try {
      const resp = await fetch(`${API_BASE_URL}/dashboard/stats?periodo=${p}`, { headers: getAuthHeaders() });
      if (resp.ok) setStats(await resp.json());
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsResp, chartResp] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/stats?periodo=${periodo}`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/dashboard/grafico`, { headers: getAuthHeaders() })
        ]);
        
        if (statsResp.ok) setStats(await statsResp.json());
        if (chartResp.ok) setChartData(await chartResp.json());
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePeriodoChange = (p: Periodo) => {
    setPeriodo(p);
    fetchStats(p);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
        <div className="text-gray-400 text-lg animate-pulse">Carregando dados reais...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Visão geral</h1>
          <p className="text-gray-500 mt-1">
            {stats?.nome ? `Dr(a). ${stats.nome}` : 'Dashboard'} · {stats?.crm ? `CRM ${stats.crm}/${stats.uf_crm}` : ''}
          </p>
        </div>
      </div>

      {/* Filtro de Período */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 font-medium mr-1">Período:</span>
        {(Object.keys(periodoLabels) as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodoChange(p)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              periodo === p
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {periodoLabels[p]}
          </button>
        ))}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard 
          title={`Processados (${periodoLabels[periodo].toLowerCase()})`}
          value={String(stats?.processados ?? 0)} 
          subValue={`sincronizações ${stats?.label_periodo ?? 'neste mês'}`}
          isPositive={true}
          icon={<Users size={20} />}
        />
        <MetricCard 
          title="Consultas Hoje" 
          value={String(stats?.consultas_hoje ?? 0)} 
          subValue="agendadas para hoje" 
          isPositive={true}
          icon={<CalendarCheck size={20} />}
        />
        <MetricCard 
          title="Pacientes Únicos" 
          value={String(stats?.total_pacientes ?? 0)} 
          subValue="pacientes no total" 
          isPositive={true}
          icon={<UserPlus size={20} />}
        />
        <MetricCard 
          title="Tempo Economizado" 
          value={formatTime(stats?.tempo_economizado_minutos ?? 0)} 
          subValue="total de tempo poupado" 
          isPositive={true}
          icon={<Clock size={20} />}
        />
        <MetricCard 
          title="Assinatura" 
          value={stats?.subscription_expires_at 
            ? new Date(stats.subscription_expires_at).toLocaleDateString('pt-BR') 
            : 'Sem data'} 
          subValue="data de expiração" 
          isPositive={true}
          icon={<Calendar size={20} />}
        />
      </div>

      {/* Chart + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SyncChart data={chartData} />
        </div>

        {/* Highlights Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col justify-between">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo</h3>
            
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{stats?.processados ?? 0} sincronizações</p>
                  <p className="text-xs text-gray-500">processadas {stats?.label_periodo ?? 'neste mês'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{stats?.consultas_hoje ?? 0} consultas hoje</p>
                  <p className="text-xs text-gray-500">agendadas para hoje</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{formatTime(stats?.tempo_economizado_minutos ?? 0)} economizados</p>
                  <p className="text-xs text-gray-500">pelo assistente MedSync</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{stats?.total_pacientes ?? 0} pacientes</p>
                  <p className="text-xs text-gray-500">cadastrados na plataforma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
