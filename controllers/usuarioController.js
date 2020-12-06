const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.crearUsuario = async (req, res) => {

    // revisar si hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    // extraer email y password
    const {email, password} = req.body;

    try {
        // Revisar que el usuario registrado sea unico
        let usuario = await Usuario.findOne({ email });

        if(usuario){
            return res.status(400).json({ msg: "El usuario ya existe"});
        }
        // crea el nuevo usuario
        usuario = new Usuario(req.body);
        
        //hashear el password
        const salt = await bcryptjs.genSalt(10);
        usuario.password = await bcryptjs.hash(password, salt);
        
        // guardar usuario
        await usuario.save();

        // crear y firmar el JWT
        const payload = {
            usuario:{
                id: usuario._id
            }
        };

        // firmar el JWT
        jwt.sign(payload, process.env.SECRETA, {
            expiresIn: 60 * 60 * 24// 1 dia
        }, (error, token) => {
            if(error) throw error;

            // Mensaje de confirmacion
            res.json({token: token});
        });

    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}