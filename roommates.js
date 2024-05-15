//roommates.js
const fs = require('fs');
const uuid = require('uuid');
const axios = require('axios');

const dataRoommates = __dirname + '/data/roommates.json';
const dataGastos = __dirname + '/data/gastos.json';

const obtenerRoommate = async () => {
    try {
        const respuesta = await axios.get('https://randomuser.me/api/');
        const randomUser = respuesta.data.results[0];
        const nombre = randomUser.name.first + ' ' + randomUser.name.last;
        return nombre;
    } catch (error) {
        return "Error al obtener el usuario de la api: " + error.message;
    }
}

const agregarRoommates = async () => {
    const roommate = await obtenerRoommate();
    let debe = 0;
    let recibe = 0;
    let total = 0;
    const nuevoRoommate = { id: uuid.v4().slice(30), nombre: roommate, debe, recibe, total };
    const roommatesJSON = JSON.parse(fs.readFileSync(dataRoommates, "utf8"));
    roommatesJSON.roommates.push(nuevoRoommate);
    // Escribir el archivo JSON con la agregacion realizada
    fs.writeFileSync(dataRoommates, JSON.stringify(roommatesJSON));
    return roommatesJSON;
}

const consultarRommates = async () => {
    const roommatesJSON = JSON.parse(fs.readFileSync(dataRoommates, "utf8"));
    return roommatesJSON;
}

const editarCuentas = async () => {
    try {
        // Obtener roommates y gastos
        const roommatesJSON = JSON.parse(fs.readFileSync(dataRoommates, "utf8"));
        const gastosJSON = JSON.parse(fs.readFileSync(dataGastos, "utf8"));
        const roommates = roommatesJSON.roommates;
        const gastos = gastosJSON.gastos;

        // Reiniciar las cuentas
        roommates.forEach(roommate => {
            roommate.debe = 0;
            roommate.recibe = 0;
        });

        // Calcular nuevas cuentas
        gastos.forEach(gasto => {
            const montoPorRoommate = gasto.monto / roommates.length;
            roommates.forEach(roommate => {
                if (roommate.nombre === gasto.roommate) {
                    roommate.recibe += montoPorRoommate;
                } else {
                    roommate.debe += montoPorRoommate;
                }
            });
        });

        // Calcular total de cada roommate
        roommates.forEach(roommate => {
            roommate.total = roommate.recibe - roommate.debe;
        });

        // Actualizar el archivo roommates.json
        fs.writeFileSync(dataRoommates, JSON.stringify(roommatesJSON));
    } catch (error) {
        console.log("Error al actualizar cuentas: ", error.message);
    }
}


module.exports = { agregarRoommates, consultarRommates, editarCuentas };