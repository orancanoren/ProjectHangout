var neo4j = require('neo4j');
var bcrypt = require('bcrypt-nodejs');

var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    'http://neo4j:admin@localhost:7474'
);

// private constructor
var User = module.exports = function(_node) {
    this._node = _node;
}

User.get = function(id, callback) {
    var qp = {
        query: [
            'MATCH (user:User)',
            'WHERE ID(user) = {userId}',
            'RETURN user'
        ].join('\n'),
        params: {
            userId: id
        }
    };
    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        if (result.length == 0) {
            callback("user not found");
        } else {
            callback(null, result[0]['user']);
        }
    });
};

User.getAll = function(callback) {
    var qp = {
        query: [
            'MATCH (user:User)',
            'RETURN user',
            'LIMIT 100'
        ].join('\n')
    }

    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

User.getBy = function(field, value, callback) {
    var qp = {
        query: [
            'MATCH (user:User)',
            'WHERE ' + field + ' = {value}',
            'RETURN user',
        ].join('\n'),
        params: {
            value: value
        }
    }
    
    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        if (!result[0]) {
            callback(null, null);
        } else {
            callback(null, result[0]['user']);
        }
    });
};

User.addUserRelationship = function(relation, userId, otherId, callback) {
    switch(relation) {
        case 'FOLLOW':
            var qp = {
                query: [
                    'MATCH (user:User), (other:User)',
                    'WHERE ID(user) = {userId} AND ID(other) = {otherId}',
                    'CREATE UNIQUE (user)-[rel:FOLLOWS]->(other)',
                    'RETURN rel'
                ].join('\n'),
                params: {
                    userId: userId,
                    otherId: otherId
                }
            };
            break;
        case 'UNFOLLOW':
            var qp = {
                query: [
                    'MATCH (user:User)-[rel:FOLLOWS]->(other:User)',
                    'WHERE user.id = {userId} AND other.id = {otherId}',
                    'DELETE rel'
                ].join('\n'),
                params: {
                    userId: userId,
                    otherId: otherId
                }
            };
            break;
    }

    db.cypher(qp, function(err, result) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            callback(null);
        }
    });
};

User.getFollowers = function(id, callback) {
    var qp = {
        query: [
            'START n=node({userId})',
            'MATCH (follower)-[:FOLLOWS]->(n)',
            'RETURN follower.fname, follower.lname'
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
            'START n=node({userId})',
            'MATCH (n)-[:FOLLOWS]->(following)',
            'RETURN following.fname, following.lname'
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

User.getFollowCounts = function(id, callback) {
    var qp = {
        query: [
            'START n=NODE({userId})',
            'MATCH (follower)-[:FOLLOWS]->(n)',
            'WITH follower',
            'MATCH (n)-[:FOLLOWS]->(following)',
            'RETURN COUNT(following) AS numFollowing, COUNT(follower) AS numFollowers',
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

User.getUserRelationships = function(id, callback) {
    var qp = {
        query: [
            'START n=node({userId})',
            'MATCH n-[r]-(m)',
            'RETURN n, r, m'
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

User.create = function(data, callback) {
    var qp = {
        query: [
            'CREATE (user:User {data})',
            'RETURN user'
        ].join('\n'),
        params: {
            data: data
        }
    };

    db.cypher(qp, function(err, results) {
        if (err) return callback(err);
        callback(null, results[0]['user']);
    });
};

User.update = function(data, callback) {
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
};

User.getID = function(email, callback) {
    var qp = {
        query: [
            'MATCH (user:User)',
            'WHERE user.localEmail = {email}',
            'RETURN ID(user)'
        ].join('\n'),
        params: {
            email: email
        }
    };

    db.cypher(qp, function(err, results) {
        if (err) return callback(err);
        callback(null, results)
    });
};

User.generateHash = function(password, next) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null, next);
};

User.validPassword = function(password, pass, next) {
    return bcrypt.compareSync(password, pass, next);
};