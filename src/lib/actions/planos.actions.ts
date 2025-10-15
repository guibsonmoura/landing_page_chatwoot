'use server';

import {createClient} from '@/lib/supabase/server';

const producao = process.env.NEXT_PUBLIC_PRODUCTION;  

export async function getPlanos(): Promise<Array<{ 
    uuid: string; 
    name: string; 
    price: number; 
    description: string; 
    features: string[]; 
    cta: string; 
    period: string; }> | any> {
    try{
        const supabase = await createClient();
        const {data, error} = await supabase
            .from('planos')
            .select('*');
        console.log('response planos');
        console.log(data);
        
        // if(fetchError){
        //     console.error('Erro ao buscar planos:', fetchError);
        //     return [];
        // };
        return data; 
    }catch(erro){
        console.error(erro);
        return [];
    }
}