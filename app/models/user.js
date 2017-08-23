var neo4j = require('neo4j');
var bcrypt = require('bcrypt-nodejs');
const { Pool } = require('pg');

var postgresql_config = {};
const DEBUG = false;
if (DEBUG) {
    postgresql_config = {
        host: 'localhost',
        user: 'jdobscdwjpnhxq',
        password: 'f681ba03a2d0e8c26b1e2be020ab19c963edcfb2ab2e1a76cc89929bb189e490',
        database: 'd8bpk7igid6vkp',
        port: 5432
    };
} else {
    postgresql_config = {
        host: 'ec2-54-228-255-234.eu-west-1.compute.amazonaws.com',
        user: 'postgres',
        password: 'admin',
        database: 'hangoutsdb',
        port: 5432
    }
}

// PostgreSQL connection
const pool = new Pool(postgresql_config);
// Important: Use a query builder in production to avoid SQL injection

// neo4j connection
var db = new neo4j.GraphDatabase(
    process.env['GRAPHENEDB_URL'] ||
    'http://neo4j:admin@localhost:7474'
);

// private constructor
var User = module.exports = function(_node) {
    this._node = _node;
}

User.checkEmail = function(email, callback) {
    const query = [
        'SELECT COUNT(*) AS email_count',
        'FROM Users',
        'WHERE email=$1'
    ].join('\n');

    const values = [ email ];

    pool.query(query, values, (err, res) => {
        if (err) {
            console.error(err.stack);
            return callback(err);
        }
        
        else {
            return callback(null, res.rows[0].email_count != '0');
        }
    });
}

// returned data contains pwHash - needed for Passport local Login strategy
User.addNewUser = function(fname, lname, email, dob, pwhash, sex, school, callback) {
    // 1 - INSERTION INTO NEO4J
    var qp = {
        query: [
            'CREATE (u:User { email: {email} })',
        ].join('\n'),
        params: {
            email: email
        }
    };
    
    db.cypher(qp, function(err, result) {
        if (err)
            return callback(err);
    });

    // 2 - INSERTION INTO POSTGRES
    const query = [
        'INSERT INTO Users(dob, sex, school, email, pwhash, fname, lname)',
        'VALUES ($1, $2 ,$3, $4, $5, $6, $7)',
        'RETURNING dob, sex, school, email, fname, lname'
    ].join('\n');

    const values = [ dob, sex=='female', school, email, pwhash, fname, lname ];

    pool.query(query, values, (err, res) => {
        if (err) {
            console.error(err.stack);
            return callback(err);
        }
        
        else {
            return callback(null, res.rows[0]);
        }
    });
}

// called only for logins - returned data contains pw hash
User.getByEmail = function(email, callback) {
    const query = [
        'SELECT *',
        'FROM Users',
        'WHERE email=$1'
    ].join('\n');

    const values = [ email ];

    pool.query(query, values, (err, res) => {
        if (err) {
            console.error(err.stack);
            return callback(err, null);
        }
        
        return callback(null, res.rows[0]);
    });
}

User.getFollowers = function(email, callback) {
    var qp = {
        query: [
            'MATCH (follower: User)-[:FOLLOWS]->(following: User)',
            'WHERE following.email = {email}',
            'RETURN follower.fname AS first_name, follower.lname AS last_name'
        ].join('\n'),
        params: {
            email: email
        }
    };

    db.cypher(qp, function(err, result) {
        if (err) {
            console.error(err);
            return callback(err);
        }
        callback(null, result);
    });
};

User.getFollowing = function(email, callback) {
    var qp = {
        query: [
            'MATCH (follower: User)-[:FOLLOWS]->(following: User)',
            'WHERE follower.email = {email}',
            'RETURN following.fname AS first_name, following.lname AS last_name'
        ].join('\n'),
        params: {
            email: email
        }
    };

    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
}

User.newFollow = function(follower_mail, following_mail, callback) {
    var qp = {
        query: [
            'MATCH (follower :User), (following :User)',
            'WHERE follower.email = {follower_mail} AND following.email = {following_mail}',
            'CREATE UNIQUE (follower)-[rel:FOLLOWS {since: {since}}]->(following)',
            'RETURN rel'
        ].join('\n'),
        params: {
            follower_mail: follower_mail,
            following_mail: following_mail,
            since: new Date
        }
    };
    
    db.cypher(qp, function(err, result) {
        return callback(err);
    });
}

User.unfollow = function(follower_mail, following_mail, callback) {
    var qp = {
        query: [
            'MATCH (user:User)-[rel:FOLLOWS]->(other:User)',
            'WHERE user.email = {follower_mail} AND other.email = {following_mail}',
            'DELETE rel'
        ].join('\n'),
        params: {
            follower_mail: follower_mail,
            following_mail: callback
        }
    };

    db.cypher(qp, function(err, result) {
        return callback(err);
    });
}

User.generateHash = function(password, next) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null, next);
};

User.validPassword = function(password, pass, next) {
    return bcrypt.compareSync(password, pass, next);
};