import { WizardData } from '@/types/wizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ReviewStepProps {
  data: WizardData;
}

const ReviewSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="py-4">
    <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">{title}</h4>
    <div className="text-sm text-muted-foreground space-y-2">{children}</div>
  </div>
);

export function ReviewStep({ data }: ReviewStepProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo da Configuração</CardTitle>
        <p className="text-sm text-muted-foreground">
          Confira as escolhas feitas para o seu agente antes de prosseguir.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReviewSection title="Seu Negócio">
          <p className="italic">{data.businessDescription || 'Nenhuma descrição fornecida.'}</p>
        </ReviewSection>

        <Separator />

        <ReviewSection title="Arquétipo">
          <p><b>{data.archetype?.name || 'Nenhum arquétipo selecionado.'}</b></p>
          <p>{data.archetype?.description}</p>
        </ReviewSection>

        <Separator />

        <ReviewSection title="Traços de Personalidade">
          {data.personality_traits.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {data.personality_traits.map(trait => (
                <li key={trait.id}><b>{trait.name}:</b> {trait.description}</li>
              ))}
            </ul>
          ) : (
            <p>Nenhum traço de personalidade selecionado.</p>
          )}
        </ReviewSection>

        <Separator />

        <ReviewSection title="Fluxo de Conversa">
          {data.conversation_flow ? (
            <div>
              <p><b>{data.conversation_flow.name}:</b> {data.conversation_flow.description}</p>
            </div>
          ) : (
            <p>Nenhum fluxo de conversa selecionado.</p>
          )}
        </ReviewSection>
      </CardContent>
    </Card>
  );
}
