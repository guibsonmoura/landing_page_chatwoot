"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPlanos } from "@/lib/actions/planos.actions";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loading } from '@/components/layout/loading';

type Plan = {
    uuid: string;
    name: string;
    price: number;
    period: string;
    description: string;
    features: { features: string[]; };
    cta: string;
};

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default  function ConfigPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState<boolean>(true)
  const [loadingAnimation, setLoadingAnimation] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  const producao = process.env.NEXT_PUBLIC_PRODUCTION;  
  
  useEffect(() => {
    
    const fetchPlans = async () => {  
      setIsLoading2(true);
      const planos = await getPlanos();
      setPlans(planos);
      setCurrentPlan("Starter");
      setIsLoading2(false);
    };

    fetchPlans();
    
  }, []);

  
  useEffect(() => {
    fetch('/lottie/Sandy Loading.json')
      .then(res => res.json())
      .then(data => setLoadingAnimation(data))
      .catch(err => console.error('Erro ao carregar animação:', err));
  },[]);

  const changePlan = async (target: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      let url: string;
      if(producao === 'true'){
        url = 'https://app.365ia.com.br'
      } else{
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
        
        if(data.transacao && data.transacao.init_point){
            window.location.href = data.transacao.sandbox_init_point;
        }
      });      
    } catch (err) {
      setMessage("Erro ao alterar plano");
    }
  };
 
  return (
    <div className="h-full bg-gradient-to-b from-[#06060a] via-[#081229] to-[#071028]  sm:p-12 rounded-2xl overflow-hidden flex ">
    
      {isLoading && loadingAnimation && (<Loading loadingAnimation={loadingAnimation} Lottie={Lottie} message="Selecionando plano..."/>)}
        {isLoading2 && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          </div>
        )}
      <div className="relative w-full flex flex-col lg:flex-row gap-2">
        <div className="rounded-3xl p-6 bg-white/3 backdrop-blur border border-white/6">
          <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <h1 className="text-3xl font-bold text-white">Tem um plano feito sob medida pra você — escolha o seu!</h1>
            
          </motion.header>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            
            {plans.map((p) => {
              
              const precoFormatado = (p.price / 100).toLocaleString('pt-BR', {
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
