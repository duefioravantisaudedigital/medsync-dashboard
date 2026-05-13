'use client';

import React, { useState } from 'react';
import { LifeBuoy, Send, MessageCircle, Phone, MessageSquare } from 'lucide-react';

const SuportePage = () => {
  const [mensagem, setMensagem] = useState('');
  const [metodoContato, setMetodoContato] = useState('Whatsapp');
  const [numero, setNumero] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Por enquanto apenas visual, não adicionamos nenhum número ou envio real
    alert('Mensagem enviada com sucesso! (Demonstração)');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
          <LifeBuoy size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Suporte ao Cliente</h1>
          <p className="text-gray-500 mt-1">Como podemos ajudar você hoje?</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-600" />
              Sua Mensagem
            </label>
            <textarea 
              required
              placeholder="Descreva o problema ou dúvida detalhadamente..."
              className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none text-gray-700 leading-relaxed"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <MessageCircle size={16} className="text-emerald-600" />
                Forma preferida de contato
              </label>
              <select 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none text-gray-700 font-medium"
                value={metodoContato}
                onChange={(e) => setMetodoContato(e.target.value)}
              >
                <option value="Whatsapp">WhatsApp</option>
                <option value="Celular">Celular (Ligação)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Phone size={16} className="text-emerald-600" />
                Número para contato
              </label>
              <input 
                required
                type="text" 
                placeholder="(00) 00000-0000"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-gray-700 font-medium"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-[0.98]"
            >
              <Send size={20} />
              Enviar Solicitação
            </button>
          </div>
        </form>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
        <h4 className="font-bold text-emerald-900 mb-2">Central de Ajuda</h4>
        <p className="text-sm text-emerald-700 leading-relaxed">
          Nosso time de suporte está disponível de segunda a sexta, das 09h às 18h. 
          O tempo médio de resposta é de até 2 horas.
        </p>
      </div>
    </div>
  );
};

export default SuportePage;
