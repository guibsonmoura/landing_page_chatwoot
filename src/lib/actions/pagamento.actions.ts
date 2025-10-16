'use server';


export async function inserirPagamento(){
    const producao = process.env.NEXT_PUBLIC_PRODUCTION;  
    let url:string;
    if(producao === 'true'){
        console.log('producao')
        console.log(producao);
        url = 'https://app.365ia.com.br'
      } else{
        console.log('producao')
        console.log(producao);
        url = 'http://localhost:3000'
      }
    var resposta;
    const response = await fetch(`${url}/api/pagamento/registrar`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

        })
    })
    response.json()
    .then(
        (data) => {
            console.log('data json pagamento actions');
            console.log(data);
            resposta=data;
        }
    )
    .catch((error)=> console.error('error pagamento actions: ', error))
    return resposta;
}