import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {getDb} from '@/lib/sqlite';


export async function POST(request: NextRequest){
    try{
        const db = getDb();
        const respostaJson:any = request.json();
        const data = await respostaJson
        
        const select:any = db.prepare(`
            SELECT * FROM transacao WHERE idtransacao = ?
            `).get(data['preferenceId']);
        
        const supabase = await createClient();
        const {data: {user}, error} = await supabase.auth.getUser();
        if(user){
            console.log('entrou no user')
            const {data: tenantData, error: tenantError} = await supabase
                .from('tenant')
                .select('*')
                .eq('user_id', user.id)
                .single()
                
            console.log('=====tenantdata========')
            console.log(tenantData)
            const {data: payment, error: paymentError} = await supabase
                .from('payments')
                .insert({
                    tenant_id: tenantData.id,
                    amount: select['preco'],
                    payment_method: data['paymentType'],
                    status: data['status'],
                    colection_id: data['collectionId'],
                    payment_id: data['paymentId'],
                    merchant_order_id: data['merchantOrderId']
                } )
                .select()
                .single();
            
            if(paymentError){
                console.error("Erro ao salvar registro: ", paymentError)
                return NextResponse.json({ error: paymentError }, { status: 400 });
            }
        }
        return NextResponse.json({ message: "tudo certo"});
            
    }catch(error){
        return NextResponse.json({ error: error }, { status: 400 });
    }
    

}