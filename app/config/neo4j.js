const neo4j = require('neo4j-driver').v1;

// NEO4JCONN environment variable must be set for DB connection
// Credentials must also be set as "NEO4JUSER" and "NEO4JPASS"

const driver = neo4j.driver(process.env.NEO4JCONN,
    neo4j.auth.basic(process.env.NEO4JUSER, process.env.NEO4JPASS));

module.exports = driver;