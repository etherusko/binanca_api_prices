const { error } = require('console');
const fs =  require('fs');

const LISTA_DE_PARES = [
    "BTCUSDT",
    "BNBUSDT",
    "PAXGUSDT",
    "PAITAXOS",
    "USDTMXN",
    "BNBBTC",
    "SOLUSDT",
]

main();

async function main() {
    console.log("Iniciando comnado:")
    console.log("Búscando precios...")

    let csv_file = "moneda, precio, fecha \n";
    const fecha = new Date().toISOString();

    for(const symbol of LISTA_DE_PARES) {
        try{
            const price = await getPrice(symbol);
            csv_file+= `${symbol}, ${price}, ${fecha}\n`
            console.log(`${symbol} →  ${price}`);
        }
        catch(error){
            csv_file+= `${symbol}, Error, ${fecha}\n`
            console.error(symbol, '→', error.message);
        }
    }
    fs.writeFileSync('precios.csv', csv_file);
    console.log('Archivo precios.csv actualizado.');
}

async function getPrice(symbol){
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await fetch(url);
    
    if(!res.ok){
        throw new Error(`Error: ${res.status} en el para: ${symbol}`);
    }
    const data = await res.json();
    return data.price;
}