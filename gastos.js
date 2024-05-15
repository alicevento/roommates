//gastos.js
const fs = require('fs');
const uuid = require('uuid');
const dataGastos = __dirname + '/data/gastos.json';

const consultarGastos = async () => {
    const gastosJSON = JSON.parse(fs.readFileSync(dataGastos, "utf8"));
    return gastosJSON;
}

const agregarGasto = async ( roommate, descripcion, monto) => {
    try{
    //Redondear el monto al número entero 
    monto = Math.round(monto);
    const nuevogasto = { id: uuid.v4().slice(30), roommate, descripcion, monto };
    const gastosJSON = JSON.parse(fs.readFileSync(dataGastos, "utf8"));
    gastosJSON.gastos.push(nuevogasto);
    // Escribir el archivo JSON con la agregacion realizada
    fs.writeFileSync(dataGastos, JSON.stringify(gastosJSON));
    console.log("Gasto agregado correctamente: ", nuevogasto);
    return nuevogasto;
} catch (e) {
    console.error("error al agregar el gasto: ", error.message)
}
}

module.exports = { consultarGastos, agregarGasto };