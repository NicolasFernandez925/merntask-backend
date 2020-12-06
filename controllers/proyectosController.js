const Proyecto = require('../models/proyecto');
const { validationResult } = require('express-validator');

exports.crearProyecto = async (req,res) => {

    // revisar si hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {

        // crear un nuevo proyecto
        const proyecto = new Proyecto(req.body);

        //guardar el creador via JWT
        proyecto.creador = req.usuario.id;

        // guardamos el proyecto
        proyecto.save();
        res.json(proyecto);
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}

// Obtiene todos los proyectos del usuario actual

exports.obtenerProyectos = async (req, res) => {
    try {

        const proyectos = await Proyecto.find({
            creador: req.usuario.id
        }).sort({creado: -1});
        res.json({proyectos});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}


// elimina un proyecto por su id
exports.eliminarProyecto = async (req, res) => {

    try {

        // revisar el ID
        let proyecto = await Proyecto.findById(req.params.id);
        // si el proyecto existe o no
        if(!proyecto){
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }
        // verificar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg: "No autorizado"});
        }

        // Eliminar el proyecto
        await Proyecto.findOneAndRemove({_id : req.params.id});
        res.json({msg: 'Proyecto eliminado'});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}

// actualiza un proyecto
exports.actualizarPoryecto = async (req, res) => {

    // revisar si hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
    }
    

     // extraer la informacion del proyecto
     const { nombre } = req.body;
     const nuevoProyecto = {};
 
     if(nombre){
         nuevoProyecto.nombre = nombre;
     }
    try {

        // revisar el ID
        let proyecto = await Proyecto.findById(req.params.id);
        // si el proyecto existe o no
        if(!proyecto){
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }
        // verificar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg: "No autorizado"});
        }
        // actualizar
        proyecto = await Proyecto.findByIdAndUpdate(req.params.id, nuevoProyecto, {new: true});
        res.json(proyecto);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}