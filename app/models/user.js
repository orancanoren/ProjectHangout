var neo4j = require('neo4j');
var bcrypt = require('bcrypt-nodejs');
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'admin',
    database: 'hangoutsDB',
    port: 5432
});
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
        if (err)
            console.error(err.stack);
        
        else {
            return res.rows[0].email_count == '0';
        }
    });
}

// returned data contains pwHash - needed for Passport local Login strategy
User.addNewUser = function(fname, lname, email, dob, pwHash, sex, callback) {
    const query = [
        'INSERT INTO Users(',
        'FROM Users',
        'WHERE email=$1'
    ].join('\n');

    const values = [ email ];

    pool.query(query, values, (err, res) => {
        if (err)
            console.error(err.stack);
        
        else {
            return res.rows[0].email_count == '0';
        }
    });
}

User.getByUserId = function(id, callback) {
    var qp = {
        query: [
            'MATCH (user:User)',
            'WHERE ID(user)={id}',
            'RETURN user'
        ].join('\n'),
        params: {
            id: id
        }
    };
    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        if (!result[0]) {
            callback("getByUserId(): user not found!", null);
        } else {
            delete result[0]['user'].pwHash;
            return callback(null, result[0]['user']);
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

User.getFollowers = function(id, callback) {
    var qp = {
        query: [
            'MATCH (follower: User)-[:FOLLOWS]->(following: User)',
            'WHERE ID(following) = {userId}',
            'RETURN follower.fname AS first_name, follower.lname AS last_name'
        ].join('\n'),
        params: {
            userId: id
        }
    };

    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

User.getFollowing = function(id, callback) {
    var qp = {
        query: [
            'MATCH (follower: User)-[:FOLLOWS]->(following: User)',
            'WHERE ID(follower) = {userId}',
            'RETURN following.fname AS first_name, following.lname AS last_name'
        ].join('\n'),
        params: {
            userId: id
        }
    };

    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
}

User.newFollow = function(follower, following, callback) {
    var qp = {
        query: [
            'MATCH (follower :User), (following :User)',
            'WHERE ID(follower) = {follower_id} AND ID(following) = {following_id}',
            'CREATE UNIQUE (follower)-[rel:FOLLOWS {since: {since}}]->(following)',
            'RETURN rel'
        ].join('\n'),
        params: {
            follower_id: follower,
            following_id: following,
            since: new Date
        }
    };
    
    db.cypher(qp, function(err, result) {
        return callback(err);
    });
}

User.unfollow = function(follower, following, callback) {
    var qp = {
        query: [
            'MATCH (user:User)-[rel:FOLLOWS]->(other:User)',
            'WHERE ID(user) = {userId} AND ID(other) = {otherId}',
            'DELETE rel'
        ].join('\n'),
        params: {
            userId: userId,
            otherId: otherId
        }
    };

    db.cypher(qp, function(err, result) {
        return callback(err);
    });
}
/*
User.updateUserFields = function(user_id, data, callback) {
    var qp = {
        query: [
            'MATCH (user:User)',
            'WHERE ID(user) = {userId}',
            'SET user += {props}',
            'RETURN user'
        ].join('\n'),
        params: {
            userId: data.id,
            props: data.props
        }
    };

    db.cypher(qp, function(err, results) {
        if (err) return callback(err);
        callback(null, results[0]['user']);
    });
};*/

User.generateHash = function(password, next) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null, next);
};

User.validPassword = function(password, pass, next) {
    return bcrypt.compareSync(password, pass, next);
};