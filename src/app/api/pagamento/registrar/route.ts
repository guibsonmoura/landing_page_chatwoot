import {NextRequest} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {getDb} from '@/lib/sqlite';


export async function POST(request: NextRequest){
    try{
        const db = getDb();
        const requestJson:any = request.json();
        const select = db.prepare(`
            SELECT * FROM transacao WHERE idtransacao = ?
            `).get(requestJson['merchantOrderId']);
        console.log('select')
        console.log(select)
        const supabase = await createClient();
        const {data: {user}, error} = await supabase.auth.getUser();
        if(user){
            const {data: tenantData, error: tenantError} = await supabase
                .from('tenant')
                .select('*')
                .eq('user_id', user.id)
                .single()
                
            
            const {data: payment, error: paymentError} = await supabase
                .from('payments')
                .insert({
                    tenant_id: tenantData.id,
                    amount: 0,
                    payment_method: "",
                    status: "",
                    colection_id: "",
                    payment_id: "",
                    merchant_order_id: ""
                } )
                .select()
                .single();

            if(paymentError){
                console.error("Erro ao salvar registro: ", paymentError)
            }
        }
    }catch(error){
        console.error(`error: ${error}`);
    }
    

}