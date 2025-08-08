"use client";

import { 
  Bot, 
  BrainCircuit, 
  Database, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Zap,
  Check
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Bot className="h-8 w-8 text-[#00e980]" />,
      title: "Agentes de IA Personalizados",
      description: "Configure agentes com personalidades e conhecimentos específicos para diferentes funções no seu negócio.",
      benefits: [
        "Personalidade customizável",
        "Conhecimento específico",
        "Adaptável a diferentes funções"
      ]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-[#00e980]" />,
      title: "Múltiplos Canais",
      description: "Conecte seus agentes ao WhatsApp, Instagram e outros canais para atender seus clientes onde eles estiverem.",
      benefits: [
        "Integração com WhatsApp",
        "Suporte a Instagram",
        "API aberta para novos canais"
      ]
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-[#00e980]" />,
      title: "Base de Conhecimento RAG",
      description: "Alimente seus agentes com documentos específicos para que respondam com precisão sobre seu negócio.",
      benefits: [
        "Upload de documentos",
        "Indexação automática",
        "Respostas contextualizadas"
      ]
    },
    {
      icon: <Database className="h-8 w-8 text-[#00e980]" />,
      title: "Isolamento de Dados",
      description: "Cada agente possui sua própria base de conhecimento, garantindo respostas contextualizadas e seguras.",
      benefits: [
        "Segurança de dados",
        "Respostas específicas",
        "Sem vazamento de contexto"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: <FileText className="h-8 w-8 text-[#00e980]" />,
      title: "Histórico de Conversas",
      description: "Acesse e analise o histórico completo de interações entre seus agentes e clientes."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-[#00e980]" />,
      title: "Perfis de Clientes",
      description: "Obtenha insights valiosos sobre preferências e comportamentos dos seus clientes."
    },
    {
      icon: <Shield className="h-8 w-8 text-[#00e980]" />,
      title: "Segurança Avançada",
      description: "Proteção de dados com Row Level Security e isolamento completo entre tenants."
    },
    {
      icon: <Zap className="h-8 w-8 text-[#00e980]" />,
      title: "Fácil Integração",
      description: "Configure e implante seus agentes em minutos, sem conhecimento técnico avançado."
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#0d0d17]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Recursos <span className="text-[#00e980]">Poderosos</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Tudo o que você precisa para criar, gerenciar e otimizar seus agentes de IA em uma única plataforma.
          </p>
        </div>

        {/* Principais recursos com detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-[#151522] p-8 rounded-xl border border-gray-800 hover:border-[#00e980]/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-[#1e1e2d] flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3 pl-16">
                {feature.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-[#00e980]" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recursos adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="bg-[#151522] p-6 rounded-xl border border-gray-800 hover:border-[#00e980]/30 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1e1e2d] flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
