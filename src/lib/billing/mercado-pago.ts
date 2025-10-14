import {MercadoPagoConfig, Preference} from 'mercadopago';

const clientMercadoPago = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACESS_TOKEN || '',
})

export const preference = new Preference(clientMercadoPago);

// preference.create({
//   body: {
//     items: [
//       {
//           title: 'Meu produto',
//           quantity: 1,
//           unit_price: 2000,
//           id: ''
//       }
//     ],
//   }
// })
// .then((data) => {

//     console.log('data')
//     console.log(data)

// })
// .catch(console.log);

