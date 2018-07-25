var sequelize = require('sequelize');
var sqlite = require('sqlite3');

/*
* If the database connection is not set in the environment,
* an in-memory storage is used for the database configuration
* "PSCONN" environment variable must be set for
* custom connections
*
* Credentials must be set in the environment as
* "PSUER" and "PSPASS", db name is also retrieved as "PSDB"
*/

var db;
if (process.env.NODE_ENV != 'PRODUCTION') {
    db = new sequelize(process.env.PSCONN);
    /*     db = new sequelize('ProjectHangout',
    process.env.PDSB, process.env.PSUSER, process.env.PSPASS, {
        host: process.env.PSCONN,
        dialect: 'postgres'
    }); */
}
else {
    var memoryDB = new sqlite.Database(':memory:');
    db = new sequelize('sqlite://:memory:')
}

db.authenticate()
.then(() => {
    console.log('Connection has been established successfully.')
})
.catch(err => {
    console.error('Unable to connecto to the database:', err);
});

db.sync({ force: false });

module.exports = db;