const axios = require('axios');
const https = require('https');
const accountSid = 'AC189bd5405b8894786c84d4dc4142b930';
const authToken = 'f02db8c4855d9686dffe5fcdd5c5e272';
const client = require('twilio')(accountSid, authToken);

async function getDistanceFromLatLonInKm(position1, position2) {
  "use strict";
  var deg2rad = function (deg) { return deg * (Math.PI / 180); },
      R = 6371,
      dLat = deg2rad(position2.lat - position1.lat),
      dLng = deg2rad(position2.lng - position1.lng),
      a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
          + Math.cos(deg2rad(position1.lat))
          * Math.cos(deg2rad(position1.lat))
          * Math.sin(dLng / 2) * Math.sin(dLng / 2),
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return ((R * c *1000).toFixed());
}

async function getLineDetails(bus){

    const agent = new https.Agent({ rejectUnauthorized: false });
    const user = "laurencio.arkauss", password = "laurencio.arkauss@123456";
    const tudo = "Basic "+ Buffer.from(user+":"+password).toString('base64');

    const response = await axios.get(`https://rest-emtu.noxxonsat.com.br/rest/lineDetails?linha=${bus}`, { httpsAgent: agent,headers: { Authorization: tudo, 'Content-Type':"application/json", 'Accept':"application/json" } })

    return response.data;
}

async function main(){
  
  msg("Server On PC");  

  setInterval(async () => {
    // if(new Date().getHours() >= 20 ){
    // }
    await getMagic();
 

  }, 60000);

}

main();


async function getMagic(){
  let pontoCerto = { lat: -23.910938734782782, lng: -46.422183853174886 };
  let metros;
  let onibusCerto = await getBusao();
  if(onibusCerto.length == 0){
    console.log('Sem Busão')
    return false 
  }
  for(let x of onibusCerto){
      
      let distancia = await getDistanceFromLatLonInKm(pontoCerto,x);
          
      if(metros == undefined){
        metros = distancia;
      }      
      metros = (distancia > metros) ? distancia : metros;  
  }

  console.log(`${metros}M ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`)
    
  if(metros <= 1500){
    
    msg("Vá para o ponto !!! PC");
      
  }
}

async function getBusao(){
  let onibusCerto = [];
  const result = await getLineDetails("945");
  for(let onibus of result.linhas[0].veiculos){
    if(onibus.sentidoLinha == 'volta' && onibus.codigoLinha == 945){
        onibusCerto.push({lat:onibus.latitude,lng:onibus.longitude});
    }
  }
  return onibusCerto;
}


function msg(msg){
  client.messages
  .create({
     body: `${msg}`,
     from: 'whatsapp:+14155238886',
     to: 'whatsapp:+5513997767932'
   })
  .then(message => console.log(message.sid));

  // client.messages
  // .create({
  //    body: `${msg}`,
  //    from: 'whatsapp:+14155238886',
  //    to: 'whatsapp:+5513981171166'
  //  })
  // .then(message => console.log(message.sid));
  // //.catch(error => console.log(error) );
}

