'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {useRouter} from 'next/navigation';
import { motion } from 'framer-motion';


const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Custom404() {
    const [error404Animation, setError404Animation] = useState<any>(null);
    const [loadingAnimation, setLoadingAnimation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter(); 
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  
    useEffect(() => {
        fetch('/lottie/404 error lost in space astronaut.json')
         .then((res) => res.json())
         .then((data) => setError404Animation(data))
         .catch((err) => {
         console.debug('Erro ao carregar animação (404):', err);
         setError404Animation(null);
      });
    }, []);

  useEffect(() => {
    fetch('/lottie/Sandy Loading.json')
      .then(res => res.json())
      .then(data => setLoadingAnimation(data))
      .catch(err => console.error('Erro ao carregar animação:', err));
  },[]);


  return (
    <div className="relative flex items-center justify-center h-screen bg-gradient-to-b from-[#0b1020] via-[#0f1724] to-[#071027] text-gray-100 overflow-hidden">
        {isLoading && loadingAnimation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#13131f] rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-2xl max-w-sm w-full">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                <Lottie
                  animationData={loadingAnimation}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full"
                />
              </div>
              <p className="text-center text-white mt-4 font-medium text-sm">Carregando...</p>
            </div>
          </div>
        )}
      {/* soft glowing orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="hidden sm:block absolute -left-32 -top-32 w-80 h-80 bg-purple-700 opacity-20 rounded-full blur-3xl animate-blob-delay" />
        <div className="hidden sm:block absolute right-[-120px] top-[-40px] w-64 h-64 bg-indigo-600 opacity-20 rounded-full blur-2xl animate-blob" />
      </div>

      <div className="z-10 max-w-4xl w-full px-4 sm:px-6 py-8 sm:py-12 text-center">
        <div className="mx-auto w-44 h-44 sm:w-56 sm:h-56">
          {error404Animation ? (
            <div className="w-full h-full">
              <Lottie animationData={error404Animation} loop autoplay className="w-full h-full" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-300 opacity-80">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="mt-6 sm:mt-8 text-2xl sm:text-4xl font-semibold">Ops — Página não encontrada</h1>
        <p className="mt-2 sm:mt-3 text-gray-300 max-w-lg mx-auto text-sm sm:text-base">A rota que você tentou acessar não existe.</p>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <motion.a
            onClick={async ()=> {
                setIsLoading(true);
                await sleep(1200);
                window.location.href = '/';
            }}
            initial={{ y: 0 }}
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative inline-flex w-full sm:w-auto justify-center items-center gap-3 px-5 py-3 bg-gradient-to-r from-indigo-500 via-blue-600 to-teal-400 text-white font-medium rounded-full shadow-lg hover:shadow-2xl ring-1 ring-white/10 hover:cursor-pointer"
          >
            <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse-slow" />
            <span>Voltar à página inicial</span>
            <span className="ml-2 inline-block transform translate-x-0 motion-reduce:transform-none">
              {/* subtle arrow animation */}
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ x: 0 }}
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="text-white/90"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </motion.svg>
            </span>
          </motion.a>

          <motion.button
            onClick={async () => {
                setIsLoading(true);
                await sleep(1200);
                window.location.href = '/dashboard';
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-4 py-2 text-sm rounded-md bg-transparent border border-gray-600 text-gray-200 hover:border-gray-400 hover:cursor-pointer"
          >
            Ir para o painel
          </motion.button>
        </div>

        <p className="mt-4 text-xs text-gray-400">Se o problema persistir, entre em contato com o suporte.</p>
      </div>

      {/* tiny CSS-in-JS fallback animations (Tailwind classes assumed available) */}
      <style>{`
        @keyframes blob { 0%{transform:translate(0px,0px) scale(1)}33%{transform:translate(20px,-10px) scale(1.1)}66%{transform:translate(-10px,20px) scale(0.9)}100%{transform:translate(0px,0px) scale(1)} }
        .animate-blob{ animation: blob 8s infinite; }
        .animate-blob-delay{ animation: blob 10s infinite; animation-delay: 1.5s }
        .animate-pulse-slow{ animation: pulse 2.5s infinite; }
      `}</style>
    </div>
  );
}
