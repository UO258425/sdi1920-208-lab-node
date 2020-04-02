module.exports = function (app, swig, gestorBD) {

    app.get("/tienda", function (req, res) {
        let criterio = {};
        if (req.query.busqueda != null && req.query.busqueda != "") {
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}};
        }
        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerCancionesPg(criterio, pg, function (canciones, total) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: canciones,
                        paginas: paginas,
                        actual: pg
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                checkIfPurchasable(req.session.usuario, gestorBD.mongo.ObjectID(req.params.id), function (isPurchasable) {
                    let criterio = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
                    gestorBD.obtenerComentarios(criterio, function (comentarios) {
                        let respuesta = swig.renderFile('views/bcancion.html',
                            {
                                cancion: canciones[0],
                                comentarios: comentarios,
                                sesion: req.session.usuario,
                                isPurchasable: isPurchasable
                            });
                        res.send(respuesta);
                    });
                });
            }
        });
    });

    app.get("/canciones", function (req, res) {
        let canciones = [{
            "nombre": "blank space",
            "precio": "1.2"
        }, {
            "nombre": "see you again",
            "precio": "1.3"
        }, {
            "nombre": "uptown funk",
            "precio": "1.1"
        }];

        let respuesta = swig.renderFile("views/btienda.html", {
            vendedor: "tienda de canciones",
            canciones: canciones
        });

        res.send(respuesta);
    });

    app.get('/canciones/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {});
        res.send(respuesta);
    })


    app.get('/canciones/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });
    app.get('/canciones/:genero/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>' + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });

    app.post("/cancion", function (req, res) {

        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: req.session.usuario
        }

        // Conectarse
        gestorBD.insertarCancion(cancion, function (id) {
            if (id == null) {
                res.send("Error al insertar canción");
            } else {
                if (req.files.portada != null) {
                    let imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function (err) {
                        if (err) {
                            res.send("Error al subir la portada");
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/' + id + '.mp3', function (err) {
                                    if (err) {
                                        res.send("Error al subir el audio");
                                    } else {
                                        res.redirect('/publicaciones');
                                    }
                                });
                            }
                        }
                    });
                }

            }
        });
    });


    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        canciones: canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion: canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if (result == null) {
                        res.send("Error en la modificación");
                    } else {
                        res.redirect('/publicaciones');
                    }
                });
            }
        });
    });

    function paso1ModificarPortada(files, id, callback) {
        if (files && files.portada != null) {
            let imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    };

    function paso2ModificarAudio(files, id, callback) {
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/' + id + '.mp3', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        checkIfPurchasable(req.session.usuario, cancionId, function (isPurchasable) {
            if (isPurchasable) {
                let compra = {
                    usuario: req.session.usuario,
                    cancionId: cancionId
                }
                gestorBD.insertarCompra(compra, function (idCompra) {
                    if (idCompra == null) {
                        res.send(respuesta);
                    } else {
                        res.redirect("/compras");
                    }
                });
            } else {
                res.redirect("/cancion/" + req.params.id.toString() + "?mensaje=La canción no se pudo comprar&tipoMensaje=alert-danger");
            }
        });

    });


    app.get('/compras', function (req, res) {
        let criterio = {"usuario": req.session.usuario};
        gestorBD.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                res.send("Error al listar");
            } else {
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }
                let criterio = {"_id": {$in: cancionesCompradasIds}};
                gestorBD.obtenerCanciones(criterio, function (canciones) {
                    let respuesta = swig.renderFile("views/bcompras.html", {
                        canciones: canciones
                    });
                    res.send(respuesta);
                });
            }
        });
    });

    function checkIfPurchasable(user, songId, callback) {
        let queryIsSongOfUser = {
            $and: [
                {"_id": songId},
                {"autor": user}
            ]
        };

        gestorBD.obtenerCanciones(queryIsSongOfUser, function (queryIsSongOfUserResponse) {
            if (queryIsSongOfUserResponse == null || queryIsSongOfUserResponse.length > 0) {
                callback(false);
            } else {
                let queryIsAlreadyPurchased = {
                    $and: [
                        {"cancionId": songId},
                        {"usuario": user}
                    ]
                };
                gestorBD.obtenerCompras(queryIsAlreadyPurchased, function (isPurchased) {
                    if (isPurchased == null || isPurchased.length > 0) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
    }
};