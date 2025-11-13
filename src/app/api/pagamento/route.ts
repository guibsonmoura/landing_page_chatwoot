import { NextRequest, NextResponse } from "next/server";
import {preference} from '@/lib/billing/mercado-pago';
import {createClient} from '@/lib/supabase/server';
import {getDb} from '@/lib/sqlite';
export const runtime = 'nodejs';

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // ou "http://localhost:3000"
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ✅ Trata a requisição preflight (OPTIONS)
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}


export async function POST(request: NextRequest, res) {

  console.log('comecou')
  const supabase = await createClient();
  
  const { id_produto, account_id, at } = await request.json();
  console.log('account_id: ', account_id)
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
                success: `https://p.365ia.com.br/app/accounts/${account_id}/dashboard`,
                failure: `https://p.365ia.com.br/app/accounts/${account_id}/dashboard`,
                pending: `https://p.365ia.com.br/app/accounts/${account_id}/dashboard`
            },
            auto_return: "approved",
        }

        })

    const db = getDb();
    const insert = db.prepare(`
        INSERT INTO transacao(titulo, quantidade, preco, idproduto, idtransacao) VALUES(?, ?, ?, ?, ?);
      `).run(`${data.name}`, 1, data.price, data.uuid, id_transacao['id']);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ 
    message: `ok: ${id_produto}`,  
    transacao: id_transacao
}, { headers: corsHeaders()});
}
