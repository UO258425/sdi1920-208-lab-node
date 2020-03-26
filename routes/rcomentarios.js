module.exports = function (app, swig, gestorDB) {

    app.post('/comentarios/:cancion_id', function (req, res) {
        let id = req.params.cancion_id;
        let comentario = {
            autor: req.session.usuario,
            texto: req.body.texto,
            cancion_id: gestorDB.mongo.ObjectID(id)
        };

        gestorDB.insertarComentario(comentario, function (id) {
            if (id == null) {
                res.send("Error al añadir comentario");
            } else {
                res.redirect("/cancion/" + req.params.cancion_id);
            }
        });
    });


    app.get('/comentario/borrar/:comentario_id', function (req, res) {

        let criterio = {"_id": gestorDB.mongo.ObjectID(req.params.comentario_id)};
        let cancion_id = null;
        gestorDB.obtenerComentarios(criterio, function (comentario) {
            console.log(comentario[0])
            cancion_id = comentario[0].cancion_id.toString();
            if (comentario[0].autor !== req.session.usuario)
                res.send("Error: No puedes borrar un comentario que no es tuyo");
            else {
                gestorDB.borrarComentario(criterio, function (isDeleted) {
                    if (isDeleted == false) {
                        res.send("Error al borrar comentario");
                    } else {
                        //res.redirect("/tienda");
                        res.redirect("/cancion/" + cancion_id);
                    }
                });
            }
        });
    });

};