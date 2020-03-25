//Módulos
let express = require('express');
let app = express();

let mongo = require('mongodb');
let swig  = require('swig');
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let gestorBD = require("./modules/gestorDB.js");
gestorBD.init(app,mongo);


app.use(express.static('public'));

app.set('port', 8081);
app.set('db','mongodb://tiendamusicaadmin:7UsGPXKsQxHD1xO5@tiendamusica-shard-00-00-uchuk.mongodb.net:27017,tiendamusica-shard-00-01-uchuk.mongodb.net:27017,tiendamusica-shard-00-02-uchuk.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true');
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig);

app.listen(app.get('port'), function () {
    console.log("Servidor activo");
});