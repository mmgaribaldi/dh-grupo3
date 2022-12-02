/* REQUIRES */
const fs = require("fs");
const path = require('path')
const multer = require('multer');
const userDatabase = require('../../datos/innerDatabase.json')
const session = require('express-session');
const { validationResult } = require("express-validator");
const prestadoresFilePath = path.join(__dirname, '../../datos/publicMedicos.json')
const publicMedicos = JSON.parse(fs.readFileSync(prestadoresFilePath, 'utf-8'))
const innerDatabase = path.join(__dirname, '../../datos/innerDatabase.json')
const prestadoresUsers = JSON.parse(fs.readFileSync(innerDatabase, 'utf-8'))
const bcryptjs = require('bcryptjs')
const db = require('../../database/models')

const user = {
    findByField: (field, text) => {
        let usuario = prestadoresUsers;
        let userFound = usuario.find(oneUser => oneUser[field] === text);
        return userFound;
    }
}
/* CONTROLLER */
const prestadoresController = {
    index: (req, res) => {
        return res.render("prestadoresLogin")
    },
    home: (req, res) => {
        const publicMedicos = JSON.parse(fs.readFileSync(prestadoresFilePath, 'utf-8'))
    //  --------------------------  OBTENER DATOS DE LA BASE DE DATOS -------------------------- 
    //             Hay que tener el XAMPP/MAMPP corriendo. --- Hay que tener datos en la base de datos.


        db.Rol.findAll().then((data) => {
            let datosEncontrados = [];

            for (let x of data) {

                let objectDato = {
                    id: x.id,
                    nombre: x.nombre
                }

                datosEncontrados.push(objectDato)
            }

            return res.render('prestadoresViews/prestadoresHome', { ps: publicMedicos })
        })
       // return res.render('prestadoresViews/prestadoresHome', { ps: publicMedicos })
    },
    login: (req, res) => {
        let errors = validationResult(req)

        if (errors.isEmpty()) {
            let userToLogin = user.findByField('user' === req.body.user)

            console.log(userToLogin)

            if (userToLogin) {
                let isOkThePassword = bcryptjs.compareSync(req.body.password, userToLogin.password)

                if ((isOkThePassword === true && (req.body.secondPassword == userToLogin.secondPassword)) || ((req.body.userType === "administrador") && (req.body.user === "administrador") && (req.body.password === "admin") && (req.body.secondPassword === "admin"))) {

                    req.session.userLogged = userToLogin

                    if (req.body.recordarme) {
                        res.cookie('rememberMe', userToLogin, { maxAge: 1000 * 60 * 60 * 24 * 360 })
                    }

                    return res.redirect("/prestadores/home");


                } else {
                    let loginError = "Usuario, clave o tipo de usuario incorrectos."
                    return res.render('prestadoresLogin', { errors: errors.mapped(), loginProcess: loginError })
                }
            }
        } else {
            return res.render('prestadoresLogin', { errors: errors.mapped() })
        }
    },
    agregarMedico: (req, res) => {
        res.render('prestadoresViews/secretariaAgregarMedicoPublico')
    },
    agregarMedicoPublico: (req, res) => {
        let errors = validationResult(req);
        console.log(errors)
        if (errors.isEmpty()) {
            if (req.file) {
                let nuevoMedico = {
                    id: "CMD" + Date.now() + "P",
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    especialidad: req.body.especialidad,
                    especialidad2: req.body.especialidad2,
                    sexo: req.body.sexo,
                    estudios: req.body.estudios,
                    profileImg: req.file.filename
                };
                publicMedicos.push(nuevoMedico)
            } else {
                let nuevoMedico = {
                    id: "CMD" + Date.now() + "P",
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    especialidad: req.body.especialidad,
                    especialidad2: req.body.especialidad2,
                    sexo: req.body.sexo,
                    estudios: req.body.estudios,
                    profileImg: "default_profile_img.png"
                }
                publicMedicos.push(nuevoMedico)
            }

            fs.writeFileSync("./datos/publicMedicos.json", JSON.stringify(publicMedicos, null, " "));

            res.redirect("/prestadores/home")

        } else {
            res.render('prestadoresViews/secretariaAgregarMedicoPublico', { errors: errors.mapped() })
        }
    },
    editarMedicoPublico: (req, res) => { // comienzo edicion Mariela
        let errors = validationResult(req);
        console.log(errors)

        if (errors.isEmpty()) {
            if (req.file) {
                let nuevoMedico = {
                    id: "CMD" + Date.now() + "P",
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    especialidad: req.body.especialidad,
                    especialidad2: req.body.especialidad2,
                    sexo: req.body.sexo,
                    estudios: req.body.estudios,
                    profileImg: req.file.filename
                };
                publicMedicos.push(nuevoMedico)
            } else {
                let nuevoMedico = {
                    id: "CMD" + Date.now() + "P",
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    especialidad: req.body.especialidad,
                    especialidad2: req.body.especialidad2,
                    sexo: req.body.sexo,
                    estudios: req.body.estudios,
                    profileImg: "default_profile_img.png"
                }
                publicMedicos.push(nuevoMedico)
            }

            fs.writeFileSync("./datos/publicMedicos.json", JSON.stringify(publicMedicos, null, " "));

            res.redirect("/prestadores/home")

        } else {
            res.render('prestadoresViews/editarPrestador/:id', { errors: errors.mapped() })
        }
    },
    editandoPrestador: (req, res) => {
        let idPrestador = req.params.id;
        let objPrestador;

        for (let o of publicMedicos) {
            if (idPrestador == o.id) {
                objPrestador = o;
                break;
            }
        }
        res.render('prestadoresViews/editarPrestador', { prestador: objPrestador })
    },

    confirmarEliminacion: (req, res) => {
        let idPrestador = req.params.id;
        let objPrestador;

        for (let o of publicMedicos) {
            if (idPrestador == o.id) {
                objPrestador = o;
                break;
            }
        }

        res.render('prestadoresViews/confirmDelete', { prestador: objPrestador })
    },

    deletePrestador: (req, res) => {

        let id = req.params.id
        let filteredPrestadores = publicMedicos.filter(prestador => prestador.id != id)

        fs.writeFileSync(prestadoresFilePath, JSON.stringify(filteredPrestadores, null, " "));

        res.redirect('/prestadores/eliminacionConfirmada');
    },

    eliminacionConfirmada: (req, res) => {
        res.render('prestadoresViews/eliminacionConfirmada')
    },

    editarPrestador: (req, res) => {
        let id = req.params.id
        for (let i = 0; i < publicMedicos.length; i++) {
            if (publicMedicos[i].id == id) {
                publicMedicos[i].nombre = req.body.nombre;
                publicMedicos[i].apellido = req.body.apellido
                publicMedicos[i].especialidad = req.body.especialidad
                publicMedicos[i].especialidad2 = req.body.especialidad2
                publicMedicos[i].sexo = req.body.sexo
                publicMedicos[i].estudios = req.body.estudios
                if (req.file) {
                    publicMedicos[i].profileImg = req.file.filename
                } else {
                    publicMedicos[i].profileImg = "default_profile_img.png"
                }
            }
        }

        fs.writeFileSync(prestadoresFilePath, JSON.stringify(publicMedicos, null, " "));

        res.redirect('/prestadores/home');
    },
    logout: (req, res) => {
        req.session.destroy();
        res.clearCookie('rememberMe');
        return res.redirect("/pacientes/login")

    },

    especialidades: (req, res) => {

        db.Especialidad.findAll().then((data) => {

            let datos = [];

            for (let especialidad of data) {
                let datosPush = {
                    id: especialidad.id,
                    nombre: especialidad.nombre
                }

                datos.push(datosPush);
            }
            console.log(datos)
            res.render('prestadoresViews/especialidades_admin', { especialidades: datos })
        })

    },

    agregarEspecialidad: (req, res) => {
        res.render('prestadoresViews/agregarEspecialidad')
    },

    agregarEspecialidadSubmit: (req, res) => {
        let errors = validationResult(req);
        console.log(errors)
        if (errors.isEmpty()) {
            db.Especialidad.create({
                nombre: req.body.especialidadNombre
            }).then((result) => {
                res.redirect('/prestadores/especialidades')
                console.log(result)
            })
        } else {
            return res.render('prestadoresViews/agregarEspecialidad', { errors: errors.mapped() })
        }
    }
}

module.exports = prestadoresController;