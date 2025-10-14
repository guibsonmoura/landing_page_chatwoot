import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BusinessStepProps {
  description: string;
  onChange: (description: string) => void;
}

export function BusinessStep({ description, onChange }: BusinessStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Descreva seu negócio</h3>
        <p className="text-sm text-muted-foreground">
          Forneça um resumo claro e conciso sobre sua empresa. Isso nos ajudará a personalizar o tom e o conhecimento do seu agente.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="business-description">Descrição do Negócio</Label>
        <Textarea
          id="business-description"
          placeholder="Ex: Somos uma agência de marketing digital especializada em SEO para e-commerce de moda..."
          value={description}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
}
