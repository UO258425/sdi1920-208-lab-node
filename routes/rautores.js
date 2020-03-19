module.exports = function (app, swig) {

    app.get("/autores", function (req, res) {
        let autores = [{
            "nombre": "Lars Ulrich",
            "grupo": "Metallica",
            "rol":"batería"
        }, {
            "nombre": "Eddie Van Halen",
            "grupo": "Van Halen",
            "rol":"Guitarrista"
        },{
            "nombre": "Fito Cabrales",
            "grupo": "Platero y tu",
            "rol":"Cantante"
        }];

        let respuesta = swig.renderFile("views/autores.html", {
            autores: autores
        });

        res.send(respuesta);
    });

    app.get("/autores/agregar", function(req, res) {

        let roles =["Cantante","Batería","Guitarrista","Bajista","Teclista"];

        let respuesta = swig.renderFile("views/autores-agregar.html", {
            roles: roles
        });
        res.send(respuesta);
    });

    app.post("/autores/agregar", function(req, res) {
        let errorResponse = "";
        if (req.body.nombre === null || req.body.nombre === "" || typeof req.body.nombre === undefined)
            errorResponse+="Nombre no enviado en la petición";

        if (req.body.grupo === null || req.body.grupo === "" || typeof req.body.grupo === undefined)
            errorResponse+="<br>Grupo  no enviado en la petición";

        if (req.body.rol === null || req.body.rol === "" || typeof req.body.rol === undefined)
            errorResponse+="<br>Rol no enviado en la petición";

        if(errorResponse=="")
            res.send("Autor agregado: " + req.body.nombre + "<br>" + " Grupo: " + req.body.grupo + "<br>" + " Rol: " + req.body.rol);
        else
            res.send(errorResponse);
    });

    app.get("/autores/filtrar/:rol", function (req, res) {
        let autores = [{
            nombre: "Lars Ulrich",
            grupo: "Metallica",
            rol:"batería"
        }, {
            nombre: "Eddie Van Halen",
            grupo: "Van Halen",
            rol:"guitarrista"
        },{
            nombre: "Fito Cabrales",
            grupo: "Platero y tu",
            rol:"cantante"
        }];

        let respuesta = swig.renderFile("views/autores.html", {
            autores: autores.filter(autor => autor.rol === req.params.rol)
        });

        res.send(respuesta);
    });

    app.get('/autores/*', function(req, res) {
        res.redirect("/autores");
    });
};