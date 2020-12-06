const Tarea = require('../models/tarea');
const Proyecto = require('../models/proyecto');
const { validationResult } = require('express-validator');

// crea una nueva tarea

exports.crearTrea = async(req, res) => {

       // revisar si hay errores
       const errors = validationResult(req);
       if(!errors.isEmpty()){
           return res.status(400).json({errors: errors.array()});
       }

       try {
            //extraer el proyecto y coomprobar si existe
            const { proyecto } = req.body;
           
            const existeProyecto = await Proyecto.findById(proyecto);

            if(!existeProyecto){
                return res.status(404).json({msg: "Proyecto no encontrado"});
            }
            // revisar si el proyecto actual pertenece al usuario autenticado
            if(existeProyecto.creador.toString() !== req.usuario.id){
                return res.status(401).json({msg: 'No autorizado'});
            }
            // creamos la tarea
            const tarea = new Tarea(req.body);
            await tarea.save();
            res.json({tarea});

       } catch (error) {
           console.log(error);
           res.status(500).send('Hubo un error');
       }
}

// obtiene las tareas pro proyecto

exports.obtenerTreas = async(req, res) => {
    try {
         //extraer el proyecto y coomprobar si existe
         const { proyecto } = req.query;
           
         const existeProyecto = await Proyecto.findById(proyecto);

         if(!existeProyecto){
             return res.status(404).json({msg: "Proyecto no encontrado"});
         }
         // revisar si el proyecto actual pertenece al usuario autenticado
         if(existeProyecto.creador.toString() !== req.usuario.id){
             return res.status(401).json({msg: 'No autorizado'});
         }

         // obtener las tareas por proyecto
         const tareas = await Tarea.find({proyecto}).sort({creado: -1});
         res.json({tareas});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}


// actualizar una tarea
exports.actualizarTarea = async(req, res) =>{

    try {

        //extraer el proyecto y coomprobar si existe
        const { proyecto, nombre, estado } = req.body;

        // si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id);

        if(!tarea){
            return res.status(404).json({msg: 'No existe esa tarea'});
        }
           
        const existeProyecto = await Proyecto.findById(proyecto);

        // revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg: 'No autorizado'});
        }

        // crear un objeto con la nueva informacion
        const nuevaTarea = {};

        nuevaTarea.nombre = nombre;
        nuevaTarea.estado = estado;
           
        tarea = await Tarea.findByIdAndUpdate({_id : req.params.id}, nuevaTarea, {new:true});

        res.json({tarea});
        

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
        
    }
}


exports.eliminarTarea = async(req, res) => {

    try {

        //extraer el proyecto y coomprobar si existe
        const { proyecto } = req.query;

        // si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id);

        if(!tarea){
            return res.status(404).json({msg: 'No existe esa tarea'});
        }
           
        const existeProyecto = await Proyecto.findById(proyecto);

        // revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg: 'No autorizado'});
        }

        // Eliminar el proyecto
        await Tarea.findOneAndRemove({_id : req.params.id});
        res.json({msg: 'Proyecto eliminado'});
        

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
        
    }
}