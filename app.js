//Módulos
let express = require('express');
let app = express();

app.set('port', 8081);

//Rutas/controladoresporlógica
require("./routes/rusuarios.js")(app);
require("./routes/rcanciones.js")(app);

app.listen(app.get('port'), function(){
    console.log("Servidor activo");
});