var neo4j = require('neo4j');
var bcrypt = require('bcrypt-nodejs');

var db = new neo4j.GraphDatabase(
    process.env['GRAPHENEDB_URL'] ||
    'http://neo4j:admin@localhost:7474'
);

// private constructor
var User = module.exports = function(_node) {
    this._node = _node;
}

User.checkEmail = function(email, callback) {
    var qp = {
        query: [
            'MATCH (email:Email)',
            'WHERE email.address = {email}',
            'RETURN COUNT(email)'
        ].join('\n'),
        params: {
            email: email
        }
    };

    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        return callback(false, result == 0);
    });
}

User.addNewUser = function(fname, lname, email, dob, pwHash, sex, callback) {
    var qp = {
        query: [
            'CREATE (cred:Credential {address: {email}, hash: {pwHash}}),',
            '(user:User {fname: {fname}, lname: {lname}, sex:{sex}})',
            'MERGE (dob:Date {date: {dob}})',
            'CREATE (user)-[:BORN_IN]->(dob),',
            '(cred)-[:BELONGS]->(user)',
            'RETURN user, cred'
        ].join('\n'),
        params: {
            email: email,
            pwHash: pwHash,
            fname: fname,
            lname: lname,
            dob: dob,
            sex: sex
        }
    };
    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        var userData = prepareSessionData(result);
        return callback(null, userData);
    });
}

User.getByCredId = function(id, callback) {
    var qp = {
        query: [
            'MATCH (bday:Date)<-[:BORN_IN]-(user:User)<-[:BELONGS]-(cred:Credential)',
            'WHERE ID(cred)={id}',
            'RETURN user, cred, bday'
        ].join('\n'),
        params: {
            id: id
        }
    };
    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        if (!result[0]) {
            callback("user not found", null);
        } else {
            var userData = prepareSessionData(result);
            return callback(null, userData);
        }
    });
}

// called only for logins - returned data contains pw hash
User.getUserByEmail = function(email, callback) {
    var qp = {
        query: [
            'MATCH (user:User)<-[:BELONGS]-(cred:Credential)',
            'WHERE cred.address={email}',
            'RETURN user, cred'
        ].join('\n'),
        params: {
            email: email
        }
    };
    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        if (!result[0]) {
            callback(null, null);
        } else {
            var userData = prepareSessionData(result);
            userData.properties.pwHash = result[0]['cred'].properties.hash;
            return callback(null, userData);
        }
    });
}

User.checkFollowing = function(follower_id, following_id, callback) {
    // returns true if <follower> is following <following>
    var qp = {
        query: [
            'MATCH (n:User)-[f:FOLLOWS]->(o:User)',
            'WHERE ID(n)={follower_id} AND ID(o)={following_id}',
            'RETURN COUNT(f) AS isFollowing'
        ].join('\n'),
        params: {
            follower_id: follower_id,
            following_id: following_id
        }
    };
    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        return callback(null, result == 1);
    });
}

User.getFollowers = function(id, callback) {
    var qp = {
        query: [
            'MATCH (follower)-[:FOLLOWS]->()<-[:BELONGS]-(cred:Credential)',
            'WHERE ID(cred) = {userId}',
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
            'MATCH (cred:Credential)-[:BELONGS]->()-[:FOLLOWS]->(following)',
            'WHERE ID(cred) = {userId}',
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
            'MATCH (follower)-[:FOLLOWS]->(n)',
            'WHERE ID(n)={userId}',
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
/*
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
}; */

User.addUserRelationship = function(relation, userId, otherId, callback) {
    switch(relation) {
        case 'FOLLOW':
            var qp = {
                query: [
                    'MATCH (cred1:Credential)-[:BELONGS]->(user:User), (other:User)<-[:BELONGS]-(cred2:Credential)',
                    'WHERE ID(cred1) = {userId} AND ID(cred2) = {otherId}',
                    'MERGE (user)-[rel:FOLLOWS]->(other)',
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
        return callback(err);
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

User.generateHash = function(password, next) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null, next);
};

User.validPassword = function(password, pass, next) {
    return bcrypt.compareSync(password, pass, next);
};

function prepareSessionData(DBresult) {
    var userData = DBresult[0]['user'];
    userData.properties['email'] = DBresult[0]['cred'].properties.address;
    userData._id = DBresult[0]['cred']._id;
    if (DBresult[0]['bday']) {
        userData.properties.bday = DBresult[0]['bday'].properties.date;
    }
    return userData;
}