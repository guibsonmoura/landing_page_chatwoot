'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AgentContextType {
  agentName: string;
  setAgentName: (name: string) => void;
  agentId: string | null;
  setAgentId: (id: string | null) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agentName, setAgentName] = useState<string>('');
  const [agentId, setAgentId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');

  return (
    <AgentContext.Provider
      value={{
        agentName,
        setAgentName,
        agentId,
        setAgentId,
        systemPrompt,
        setSystemPrompt,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent deve ser usado dentro de um AgentProvider');
  }
  return context;
}
