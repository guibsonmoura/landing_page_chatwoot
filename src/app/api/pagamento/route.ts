import { NextRequest, NextResponse } from "next/server";
import {preference} from '@/lib/billing/mercado-pago';
import {createClient} from '@/lib/supabase/server';
import {getDb} from '@/lib/sqlite';

export const runtime = 'nodejs';



export async function POST(request: NextRequest) {
  
  const supabase = await createClient();
  const { id_produto } = await request.json();

  const { data, error } = await supabase
    .from("planos")
    .select("*")
    .eq("uuid", id_produto)
    .single();
    const precoFormatado = (data.price / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
    const preco:number = parseFloat(precoFormatado.replace(',', '.'))
    const id_transacao = await preference.create({
        body: {
            items: [
                {
                    title: data.name,
                    quantity: 1,
                    
                    unit_price: data.price / 100,
                    id: data.uuid
                }
            ],
        back_urls: {
                success: "https://app.365ia.com.br/dashboard/plano",
                failure: "https://app.365ia.com.br/dashboard/plano",
                pending: "https://app.365ia.com.br/dashboard/plano"
            },
            auto_return: "approved",
        }

        })
    console.log(`id transacao: ${id_transacao}`)
    console.log(id_transacao['id']);
    const db = getDb();
    const insert = db.prepare(`
        INSERT INTO transacao(titulo, quantidade, preco, idproduto, idtransacao) VALUES(?, ?, ?, ?, ?);
      `).run(`${data.name}`, 1, data.price, data.uuid, id_transacao['id']);
    
    console.log('inserido: ', insert);
    console.log(insert);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ 
    message: `ok: ${id_produto}`,  
    transacao: id_transacao
});
}
