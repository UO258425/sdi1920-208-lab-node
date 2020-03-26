module.exports = function (app, swig, gestorDB) {

    app.get('/favoritos', function (req, res) {
        let total = 0;
        if(req.session.favoritos === null || req.session.favoritos === undefined ) {
            req.session.favoritos = [];

        }
        else{
            total = req.session.favoritos.map(x => parseFloat(x.precio)).reduce((a, b) => a + b, 0);
        }

        let respuesta = swig.renderFile("views/bfavoritos.html", {
            favoritos: req.session.favoritos,
            total: total
        });
        res.send(respuesta);
    });


    app.get('/favoritos/add/:cancion_id', function (req, res) {

        let criterio = {"_id": gestorDB.mongo.ObjectID(req.params.cancion_id)};

        gestorDB.obtenerCanciones(criterio, function (canciones) {
            if (canciones[0] === null)
                res.send("Error: la cancion no existe");
            else {
                if (req.session.favoritos.filter(x => x._id === req.params.cancion_id).length != 0) {
                    res.redirect("/tienda");
                } else {
                    let fav = {
                        _id: canciones[0]._id,
                        titulo: canciones[0].nombre,
                        precio: canciones[0].precio
                    };

                req.session.favoritos.push(fav);
                res.redirect("/tienda");
            }
        }
    });
}
)
;

app.get('/favoritos/eliminar/:cancion_id', function (req, res) {
    if (req.session.favoritos === null)
        res.redirect("/favoritos")
    else {
        req.session.favoritos = req.session.favoritos.filter(x => x._id != req.params.cancion_id);
        res.redirect("/favoritos")
    }
});

}
;