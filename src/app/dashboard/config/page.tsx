"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPlanos } from "@/lib/actions/planos.actions";
import { Button } from "@/components/ui/button";



type Plan = {
    uuid: string;
    name: string;
    price: number;
    period: string;
    description: string;
    features: { features: string[]; };
    cta: string;
    
};

export default  function ConfigPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<{ last4: string } | null>(null);
  const [cardInput, setCardInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const producao = process.env.NEXT_PUBLIC_PRODUCTION;  
  useEffect(() => {
    
    
    const fetchPlans = async () => {
        console.log('entrou no planos');
        const planos = await getPlanos();
        console.log('planos');
        console.log(planos); 

        
      setPlans(planos);
      
      setCurrentPlan("Starter");
      setCard({ last4: "4242" });
    };

    fetchPlans();
  }, []);

  const changePlan = async (target: string) => {
    setLoading(true);
    setMessage(null);
    try {
      let url: string;
      if(producao === 'true'){
        console.log('producao')
        console.log(producao);
        url = 'https://app.365ia.com.br'
      }else{
        console.log('producao')
        console.log(producao);
        url = 'http://localhost:3000'
      }
      const response = await fetch(`${url}/api/pagamento`, {
        method: 'POST',
        credentials: 'include',

        headers: { 'Content-Type': 'application/json'
         },
        
        
        body: JSON.stringify({ id_produto: target })
      })
      response.json().then(
        (data) => {
        console.log('data');
        console.log(data);
        //redirecione para o link de pagamento do mercado pago
        if(data.transacao && data.transacao.init_point){
            window.location.href = data.transacao.sandbox_init_point;
        }
      });      
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
    <div className="min-h-screen bg-gradient-to-b from-[#06060a] via-[#081229] to-[#071028]  sm:p-12 rounded-2xl  overflow-hidden">
      
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div animate={{ x: [ -80, 80, -80 ], y: [ -10, 10, -10 ] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute left-0 top-8 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <motion.div animate={{ x: [ 80, -80, 80 ], y: [ 10, -10, 10 ] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }} className="absolute right-0 top-28 w-64 h-64 bg-green-400/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 rounded-3xl p-6 bg-white/3 backdrop-blur border border-white/6">
          <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <h1 className="text-3xl font-bold text-white">Planos - Tem um plano feito sob medida pra você — escolha o seu!</h1>
            
          </motion.header>

          

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((p) => {
              const precoFormatado = (p.price / 100).    toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
              return (
              <motion.article key={p.name} whileHover={{ y: -6 }} className="p-4 rounded-xl bg-white/2 border border-white/6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    <p className="text-xs text-gray-300 mt-1">{p.description}</p>
                    <div className="text-xs text-gray-400 mt-2">{p.features.features.slice(0, 3).join(' • ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{precoFormatado}</div>
                    <div className="text-xs text-gray-400">{p.period}</div>
                  </div>
                </div>
                <div className="mt-3 flex  items-center justify-end">
                  {currentPlan === p.name ? <Button disabled>Ativo</Button> : <Button onClick={() => changePlan(p.uuid)}>Selecionar</Button>}
                </div>
              </motion.article>
            )})}
          </div>
        </div>

        
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 right-6 bg-white/6 border border-gray-700 text-sm text-white px-4 py-2 rounded-md">{message}</motion.div>
      )}
    </div>
  );
}
