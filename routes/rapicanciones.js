module.exports = function (app, gestorBD) {

    app.get("/api/cancion", function (req, res) {
        gestorBD.obtenerCanciones({}, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });

    app.get("/api/cancion/:id", function (req, res) {
        const criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones[0]));
            }
        });
    });


    app.delete("/api/cancion/:id", function (req, res) {

        isOwnerOf(res.usuario, gestorBD.mongo.ObjectID(req.params.id), function (isOwner) {
            console.log(isOwner);
            if (isOwner) {
                gestorBD.eliminarCancion({"_id": gestorBD.mongo.ObjectID(req.params.id)}, function (canciones) {
                    if (canciones == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error en el servidor"
                        })
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(canciones));
                    }
                });
            } else {
                res.status(400);
                res.json({
                    error: "Operacion no permitida, no eres el dueño de la canción"
                });
            }
        });


    });

    app.post("/api/cancion", function (req, res) {
        const cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
        };
        // ¿Validar nombre, genero, precio?
        if (!cancion.nombre || !cancion.genero || !cancion.precio) {
            res.status(400);
            res.json({
                error: "Hay campos vacios"
            });
        } else if (cancion.precio <= 0) {
            res.status(400);
            res.json({
                error: "El precio debe ser positivo"
            });
        } else {
            gestorBD.insertarCancion(cancion, function (id) {
                if (id == null) {
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    })
                } else {
                    res.status(201);
                    res.json({
                        mensaje: "canción insertarda",
                        _id: id
                    })
                }
            });
        }

    });


    app.put("/api/cancion/:id", function (req, res) {

        isOwnerOf(res.usuario, gestorBD.mongo.ObjectID(req.params.id), function (isOwner) {
            console.log(isOwner);
            if (isOwner) {
                if (!req.body.nombre || !req.body.genero || !req.body.precio) {
                    res.status(400);
                    res.json({
                        error: "Hay campos vacios"
                    });
                } else if (req.body.precio <= 0) {
                    res.status(400);
                    res.json({
                        error: "El precio debe ser positivo"
                    });
                } else {
                    let cancion = {
                        nombre: req.body.nombre,
                        genero: req.body.genero,
                        precio: req.body.precio
                    }
                    gestorBD.modificarCancion({"_id": gestorBD.mongo.ObjectID(req.params.id)}, cancion, function (result) {
                        if (result == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            })
                        } else {
                            res.status(200);
                            res.json({
                                mensaje: "canción modificada",
                                _id: req.params.id
                            })
                        }
                    });
                }
            } else {
                res.status(400);
                res.json({
                    error: "Operacion no permitida, no eres el dueño de la canción"
                });
            }
        });

    });

    app.post("/api/autenticar/", function (req, res) {
        let seguro = app.get("crypto")
            .createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio = {
            email: req.body.email,
            password: seguro
        }

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                res.status(401);
                res.json({
                    autenticado: false
                });
            } else {
                var token = app.get('jwt').sign({
                    usuario: criterio.email,
                    tiempo: Date.now() / 1000
                }, "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                });
            }
        });
    });

    function isOwnerOf(userEmail, songId, functionCallback) {
        let criterio = {
            $and: [
                {_id: songId},
                {autor: userEmail}
            ]
        };
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null || canciones.length <= 0) {
                functionCallback(false);
            } else {
                functionCallback(true);
            }
        });
    }

};

