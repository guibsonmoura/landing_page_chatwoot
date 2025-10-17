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
      const planos = await getPlanos();
      setPlans(planos);
      setCurrentPlan("Starter");
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
      } else{
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06060a] via-[#081229] to-[#071028]  sm:p-12 rounded-2xl overflow-hidden">

      <div className="relative w-full flex flex-col lg:flex-row gap-2">
        <div className="rounded-3xl p-6 bg-white/3 backdrop-blur border border-white/6">
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
