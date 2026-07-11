const fs = require('fs');

// Configuración: cada par define cómo se calcula su precio final
const pares = [
  { nombre: "btc",  tipo: "directo", id: "bitcoin",     moneda: "usd" },
  { nombre: "bnb",  tipo: "directo", id: "binancecoin", moneda: "usd" },
  { nombre: "paxg", tipo: "directo", id: "pax-gold",    moneda: "usd" },
  { nombre: "sol",  tipo: "directo", id: "solana",      moneda: "usd" },
  { nombre: "peso:mxn",  tipo: "directo", id: "tether",      moneda: "mxn" },
  { nombre: "bnb/btc",   tipo: "cruzado", idA: "binancecoin", idB: "bitcoin", moneda: "usd" },
];

// Junta automáticamente todos los IDs únicos que hace falta consultar
function obtenerIdsNecesarios() {
  const ids = new Set();
  pares.forEach(p => {
    if (p.tipo === "directo") ids.add(p.id);
    if (p.tipo === "cruzado") { ids.add(p.idA); ids.add(p.idB); }
  });
  return Array.from(ids);
}

async function obtenerPrecios() {
  const ids = obtenerIdsNecesarios().join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,mxn`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return await respuesta.json();
}

function calcularPrecio(par, datos) {
  if (par.tipo === "directo") {
    return datos[par.id] && datos[par.id][par.moneda] !== undefined
      ? datos[par.id][par.moneda]
      : "No encontrado";
  }
  if (par.tipo === "cruzado") {
    const a = datos[par.idA] && datos[par.idA][par.moneda];
    const b = datos[par.idB] && datos[par.idB][par.moneda];
    return (a !== undefined && b !== undefined) ? a / b : "No encontrado";
  }
  return "Tipo desconocido";
}

async function main() {
  let csv = "par,precio,fecha\n";
  const fecha = new Date().toISOString();

  try {
    const datos = await obtenerPrecios();
    pares.forEach(par => {
      const precio = calcularPrecio(par, datos);
      csv += `${par.nombre},${precio},${fecha}\n`;
      console.log(par.nombre, '→', precio);
    });
  } catch (error) {
    console.error('Error general:', error.message);
    pares.forEach(par => {
      csv += `${par.nombre},"${error.message}",${fecha}\n`;
    });
  }

  fs.writeFileSync('precios.csv', csv);
  console.log('Archivo precios.csv actualizado.');
}

main();

