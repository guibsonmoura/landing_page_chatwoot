"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

export default function ConfigPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<{ last4: string } | null>(null);
  const [cardInput, setCardInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Carrega planos diretamente do componente de pricing ou API (mock)
    const fetchPlans = async () => {
      // Em produção, troque por uma chamada real: /api/plans
      const mockPlans: Plan[] = [
        {
      "cta": "Começar Grátis",
      "name": "Básico",
      "price": "R$99",
      "period": "/mês",
      "popular": false,
      "features": [
        "2 agentes de IA",
        "Integração com WhatsApp",
        "Base de conhecimento RAG (5 documentos)",
        "Histórico de conversas (30 dias)",
        "Suporte por email"
      ],
      "description": "Ideal para pequenas empresas iniciando com IA"
    },
    {
      "cta": "Escolher Pro",
      "name": "Pro",
      "price": "R$299",
      "period": "/mês",
      "popular": true,
      "features": [
        "5 agentes de IA",
        "Integração com WhatsApp e Instagram",
        "Base de conhecimento RAG (20 documentos)",
        "Histórico de conversas (90 dias)",
        "Perfis de clientes",
        "Análise de desempenho",
        "Suporte prioritário"
      ],
      "description": "Para empresas em crescimento que precisam de mais recursos"
    },
    {
      "cta": "Falar com Vendas",
      "name": "Enterprise",
      "price": "R$999",
      "period": "/mês",
      "popular": false,
      "features": [
        "Agentes ilimitados",
        "Todos os canais disponíveis",
        "Base de conhecimento RAG ilimitada",
        "Histórico de conversas ilimitado",
        "Perfis de clientes avançados",
        "Análise de desempenho detalhada",
        "Suporte dedicado 24/7",
        "API personalizada",
        "Treinamento da equipe"
      ],
      "description": "Solução completa para grandes empresas"
    },
      ];
      setPlans(mockPlans);
      // carregar estado da assinatura e cartão do usuário (simulado)
      setCurrentPlan("Starter");
      setCard({ last4: "4242" });
    };

    fetchPlans();
  }, []);

  const changePlan = async (target: string) => {
    setLoading(true);
    setMessage(null);
    try {
      // Simula chamada para backend
      await new Promise((r) => setTimeout(r, 900));
      setCurrentPlan(target);
      setMessage(`Plano alterado para ${target}`);
    } catch (err) {
      setMessage("Erro ao alterar plano");
    } finally {
      setLoading(false);
    }
  };

  const cancelPlan = async () => {
    setLoading(true);
    setMessage(null);
    await new Promise((r) => setTimeout(r, 900));
    setCurrentPlan(null);
    setLoading(false);
    setMessage("Assinatura cancelada");
  };

  const addCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardInput.replace(/\s/g, "").match(/^\d{12,19}$/)) {
      setMessage("Número de cartão inválido (somente dígitos)");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setCard({ last4: cardInput.replace(/\s/g, "").slice(-4) });
    setCardInput("");
    setMessage("Cartão adicionado com sucesso");
    setLoading(false);
  };

  const removeCard = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setCard(null);
    setLoading(false);
    setMessage("Cartão removido");
  };

  const [flipped, setFlipped] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06060a] via-[#081229] to-[#071028] p-6 sm:p-12 flex rounded-2xl items-center justify-center overflow-hidden">
      {/* animated background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div animate={{ x: [ -80, 80, -80 ], y: [ -10, 10, -10 ] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute left-0 top-8 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <motion.div animate={{ x: [ 80, -80, 80 ], y: [ 10, -10, 10 ] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }} className="absolute right-0 top-28 w-64 h-64 bg-green-400/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 rounded-3xl p-6 bg-white/3 backdrop-blur border border-white/6">
          <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <h1 className="text-3xl font-bold text-white">Planos — escolha com leveza</h1>
            <p className="text-sm text-gray-300 mt-1">Toque nas bolhas para experimentar cada plano.</p>
          </motion.header>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }} className="flex flex-wrap gap-4 items-center">
            {plans.map((p, i) => {
              const active = currentPlan === p.name;
              const px = active ? 20 : 14;
              return (
                <motion.button key={p.name} onClick={() => changePlan(p.name)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-3 ${active ? 'bg-gradient-to-br from-green-400 to-blue-500 text-black shadow-2xl' : 'bg-white/5 text-white'}`} style={{ minWidth: 150 }}>
                  <div style={{ width: px * 2, height: px * 2 }} className={`rounded-full flex items-center justify-center ${active ? 'bg-white/90' : 'bg-white/8'}`}>
                    <div className="text-sm font-semibold">{p.name}</div>
                  </div>
                  <div className="text-xs text-gray-200">{p.price}{p.period}</div>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((p) => (
              <motion.article key={p.name} whileHover={{ y: -6 }} className="p-4 rounded-xl bg-white/2 border border-white/6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    <p className="text-xs text-gray-300 mt-1">{p.description}</p>
                    <div className="text-xs text-gray-400 mt-2">{p.features.slice(0, 3).join(' • ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{p.price}</div>
                    <div className="text-xs text-gray-400">{p.period}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  {currentPlan === p.name ? <Button disabled>Ativo</Button> : <Button onClick={() => changePlan(p.name)}>Selecionar</Button>}
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <aside className="lg:w-1/3 flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="relative perspective">
            <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.8 }} style={{ transformStyle: 'preserve-3d' }} className="relative">
              {/* front */}
              <div style={{ backfaceVisibility: 'hidden' }} className="rounded-2xl p-6 bg-gradient-to-br from-white/3 to-white/2 border border-white/6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">Pagamento</h4>
                    <p className="text-xs text-gray-300 mt-1">{card ? `Cartão •••• ${card.last4}` : 'Nenhum cartão cadastrado'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {card ? <Button variant="ghost" onClick={removeCard} disabled={loading}>Remover</Button> : null}
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => setFlipped(true)} className="w-full">Adicionar / Editar cartão</Button>
                </div>
              </div>

              {/* back */}
              <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 rounded-2xl p-6 bg-gradient-to-br from-white/3 to-white/2 border border-white/6">
                <form onSubmit={async (e) => { await addCard(e); setFlipped(false); }} className="space-y-3">
                  <label className="text-xs text-gray-300">Número do cartão</label>
                  <input value={cardInput} onChange={(e) => setCardInput(e.target.value)} placeholder="0000 0000 0000 0000" className="w-full p-2 rounded-md bg-transparent border border-white/8 text-sm text-white" />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Salvar</Button>
                    <Button type="button" variant="ghost" onClick={() => setFlipped(false)}>Cancelar</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 bg-white/3 border border-white/6">
            <h5 className="text-sm font-medium text-white">Ações rápidas</h5>
            <div className="mt-3 flex flex-col gap-3">
              <Button onClick={() => changePlan(plans[1]?.name || '')} className="w-full">Upgrade para Pro</Button>
              <Button variant="destructive" onClick={cancelPlan} className="w-full">Cancelar assinatura</Button>
            </div>
          </motion.div>
        </aside>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 right-6 bg-white/6 border border-gray-700 text-sm text-white px-4 py-2 rounded-md">{message}</motion.div>
      )}
    </div>
  );
}
