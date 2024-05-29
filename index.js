//index.js
const express = require('express');
const fs = require('fs');
const { agregarRoommates, consultarRommates, editarCuentas } = require('./roommates.js');
const { consultarGastos, agregarGasto } = require('./gastos.js');
const cors = require('cors');

const app = express();
const PORT = 3000;
const dataGastos = __dirname + '/data/gastos.json';

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));
app.use(express.json());
// app.use(cors());

// Función para manejar errores
const handleError = (res, error) => {
    console.log("Error interno del servidor: ", error.message);
    res.status(500).send("Error interno del servidor: " + error.message);
};

// Ruta GET /
// app.get("/", (req, res) => {
//     res.sendFile(__dirname + '/index.html', (error) => {
//         if (error) {
//             console.log("Error del servidor: ", error.message);
//             res.status(500).send("Error del servidor: " + error.message);
//         }
//     });
// });

// Ruta GET /roommates
app.get('/roommates', async (req, res) => {
    try {
        const roommates = await consultarRommates();
        //Redondear los montos en la respuestas
        roommates.roommates.forEach(roommate => {
            roommate.debe = Math.round(roommate.debe);
            roommate.recibe = Math.round(roommate.recibe);
            roommate.total = Math.round(roommate.total);
        });
        res.status(200).send(roommates); // Envía la respuesta después de redondear los montos
    } catch (error) {
        handleError(res, error);
    }
});

// Ruta POST /roommate
app.post('/roommate', async (req, res) => {
    try {
        const respuesta = await agregarRoommates();
        await editarCuentas();
        res.status(201).send(respuesta);
    } catch (error) {
        handleError(res, error);
    }
});

// Ruta GET /gastos
app.get('/gastos', async (req, res) => {
    try {
        res.status(200).send(await consultarGastos());
    } catch (error) {
        handleError(res, error);
    }
});

// Ruta POST /gasto
app.post('/gasto', async (req, res) => {
    try {
        const { roommate, descripcion, monto } = req.body;
        if (!roommate || !descripcion || !monto) {
            res.status(400).send("Debe proporcionar el roommate, la descripcion y el monto");
            return;
        }
        const respuesta = await agregarGasto(roommate, descripcion, monto);
        await editarCuentas();
        res.status(201).send(respuesta);
    } catch (error) {
        handleError(res, error);
    }
});

// Ruta PUT /gasto
app.put('/gasto', async (req, res) => {
    try {
        const { id } = req.query;
        const { roommate, descripcion, monto } = req.body;
        if (!id || !roommate || !descripcion || !monto) {
            res.status(400).send("Debe proporcionar un ID, roommate, descripción y monto");
            return;
        }
        const gastosJSON = JSON.parse(fs.readFileSync(dataGastos, "utf8"));
        const gastos = gastosJSON.gastos;
        const buscarId = gastos.findIndex(g => g.id == id);
        if (buscarId == -1) {
            res.status(404).send("Gasto no encontrado");
            return;
        }
        gastos[buscarId] = { id, roommate, descripcion, monto };
        fs.writeFileSync(dataGastos, JSON.stringify(gastosJSON));
        //Llamar cuentas para actualizar el gasto
        await editarCuentas();
        res.status(200).send(gastosJSON);
    } catch (error) {
        handleError(res, error);
    }
});

// Ruta DELETE /gasto
app.delete('/gasto', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            res.status(400).send("Debe proporcionar un ID");
            return;
        }
        const gastosJSON = JSON.parse(fs.readFileSync(dataGastos, "utf8"));
        const gastos = gastosJSON.gastos;
        const buscarId = gastos.findIndex(g => g.id == id);
        if (buscarId == -1) {
            res.status(404).send("El gasto con el ID proporcionado no existe");
            return;
        }
        gastosJSON.gastos = gastos.filter((g) => g.id !== id);
        fs.writeFileSync(dataGastos, JSON.stringify(gastosJSON));
        //Llamar cuentas para actualizar cuando se elimina
        await editarCuentas();
        res.status(200).send(gastosJSON);
    } catch (error) {
        handleError(res, error);
    }
});

// Ruta genérica
app.get("*", (req, res) => res.status(404).send("Esta página no existe..."));
