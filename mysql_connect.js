const mysql = require('mysql');

let connect = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_KEY,
    database: process.env.MYSQL_DATABASE
});

connect.connect(function(err) { 
    if (err) {
        console.log("Connexion impossible. " + err); 
    }
    console.log("\033[32mConnexion à la base de données réussie\033[37m.");
});

module.exports = connect;