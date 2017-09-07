var neo4j = require('neo4j');
var bcrypt = require('bcrypt-nodejs');
const { Pool } = require('pg');

const ENV = process.env.NODE_ENV || 'development';

var postgresql_config = {};
if (ENV == 'development') {
    postgresql_config = {
        host: 'localhost',
        user: 'postgres',
        password: 'admin',
        database: 'hangoutsdb',
        port: 5432
    }
} else {

    postgresql_config = {
        host: 'ec2-54-247-81-76.eu-west-1.compute.amazonaws.com',
        user: 'riprxfgafvjxqy',
        password: '879a37c83dc5fe36d2013e8ac85a9d92dc0910b41ce4f0325d683397f87c77e5',
        database: 'd3npn811pmr6n2',
        port: 5432
    };
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
            'MERGE (u:User { email: {email} })',
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

User.newNotification = function(email, text_id, value_arr, action, callback) {
    const query = [
        'INSERT INTO Notifications(user_email, text_id, value_arr, issued, is_read, notif_action)',
        'VALUES ($1, $2, $3, $4, $5, $6)'
    ].join('\n');
    const values = [
        email,
        text_id,
        value_arr,
        new Date,
        false,
        action
    ];

    pool.query(query, values, (err) => {
        if (err) {
            console.error(err);
        }
        callback(err);
    });
}

User.getNotifications = function(email, callback) {
    const query = [
        'SELECT NT.notif_text AS notif_text, N.value_arr AS value_arr,',
        'N.issued AS issue_date, N.is_read AS is_read, N.id AS notif_id, N.notif_action AS action',
        'FROM Notifications N, NotificationTexts NT',
        'WHERE N.user_email=$1',
        'AND NT.id=N.text_id',
        'ORDER BY issue_date'
    ].join('\n');

    const values = [ email ];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            callback(err);
        }
        else {
            callback(null, result.rows);
        }
    });
}

User.setNotificationRead = function(notif_id, callback) {
    const query = [
        'UPDATE Notifications',
        'SET is_read=true',
        'WHERE id=$1'
    ].join('\n');
    const values = [ notif_id ];

    pool.query(query, values, (err) => {
        if (err) {
            console.error(err);
        }
        callback(err);
    });
}

User.getByEmail = function(args, callback) {
    if (!args.email)
        throw "User.getByEmail requires an email field";
    const query = [
        'SELECT *',
        'FROM Users',
        'WHERE email=$1'
    ].join('\n');

    const values = [ args.email ];

    pool.query(query, values, (err, res) => {
        if (err) {
            console.error(err.stack);
            return callback(err, null);
        }
        
        if (res.rows[0] && !args.getPw) {
            delete res.rows[0].pwhash; // might cause trouble for logins!
        }
        return callback(null, res.rows[0]);
    });
}

User.getFollowers = function(email, callback) {
    var qp = {
        query: [
            'MATCH (follower:User)-[:FOLLOWS]->(following:User)',
            'WHERE following.email = {email}',
            'RETURN follower.email AS email'
        ].join('\n'),
        params: {
            email: email
        }
    };

    db.cypher(qp, function(err, result) {
        if (err) return callback(err);
        follower_emails = result;
        if (follower_emails.length == 0) {
            return callback(null, []);
        }

        getNameByEmails(follower_emails, (err, result) => {
            if (err) {
                callback(err);
            }
            else {
                callback(null, result);
            }
        });
    });
}

User.getFollowing = function(email, callback) {
    var qp = {
        query: [
            'MATCH (follower:User)-[:FOLLOWS]->(following:User)',
            'WHERE follower.email = {email}',
            'RETURN following.email AS email'
        ].join('\n'),
        params: {
            email: email
        }
    };

    db.cypher(qp, function(err, result) {
        if (err) return callback('res:', err);
        following_emails = result;
        following_names = []; // USING AN ARRAY IS INEFFICIENT HERE! USE A LINKED LIST
        if (following_emails.length == 0) {
            return callback(null, []);
        }

        getNameByEmails(following_emails, (err, result) => {
            if (err) {
                console.error(err);
                return callback(err);
            } 
            else {
                return callback(null, result);
            }
        });
    });
}

User.newFollow = function(follower_mail, following_mail, callback) {
    var qp = {
        query: [
            'MATCH (follower :User), (following :User)',
            'WHERE follower.email = {follower_mail} AND following.email = {following_mail}',
            'CREATE UNIQUE (follower)-[rel:FOLLOWS]->(following)',
            'SET rel.since={since}'
        ].join('\n'),
        params: {
            follower_mail: follower_mail,
            following_mail: following_mail,
            since: new Date
        }
    };

    var postgres_query = [
        'SELECT fname, lname',
        'FROM Users',
        'WHERE email=$1'
    ].join('\n');
    const values = [ follower_mail ];
    
    db.cypher(qp, function(err) {
        if (err) {
            console.error(err);
            return callback(err);
        }

        pool.query(postgres_query, values, (err, result) => {
            const fname = result.rows[0].fname, lname = result.rows[0].lname;
            User.newNotification(following_mail, 1, [ fname + ' ' + lname ], '/view/' + follower_mail, (err) => {
                return callback(err);
            });
        });
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
            following_mail: following_mail
        }
    };

    db.cypher(qp, function(err, result) {
        return callback(err);
    });
}

User.searchByName = function(name, callback) {
    const query = [
        'SELECT fname, lname, email, school',
        'FROM Users',
        'WHERE LOWER(fname) LIKE $1 OR LOWER(lname) LIKE $1',
        'ORDER BY fname',
        'LIMIT 10'
    ].join('\n');

    const values = [ '%' + name + '%' ];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error(err.stack);
            return callback(err, null);
        }
        return callback(null, result.rows);
    });
}

User.newEvent = function(eventObject, callback) {
    if (eventObject.title == null || eventObject.place == null || eventObject.host_email == null
            || eventObject.start_time == null || eventObject.end_time == null) {
        callback("Event fields not provided to newEvent()", null);
        return;
    }

    // 1 - Create the event entity in Postgres
    const query = [
        'INSERT INTO Events(title, description, place, host_email, start_time, end_time, vendor)',
        'VALUES($1, $2, $3, $4, $5, $6, $7)',
        'RETURNING eid'
    ].join('\n');
    

    const values = [eventObject.title, eventObject.description, eventObject.place, eventObject.host_email,
        eventObject.start_time, eventObject.end_time, eventObject.vendor];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            callback(err);
        }
        else {
            // 2 - Create the event node and necessary relationships in neo4j
            const eid = result.rows[0].eid;
            console.log('neo4j params:\nhost_email: ',eventObject.host_email, '\neid:', eid);
            var qp = {
                query: [
                    'MATCH (u:User)',
                    'WHERE u.email={host_email}',
                    'MERGE (e:Event {eid: {eid}})-[:HOSTED_BY]->(u)'
                ].join('\n'),
                params: {
                    host_email: eventObject.host_email,
                    eid: eid
                }
            };

            db.cypher(qp, (err, result) => {
                if (err) {
                    console.error(err);
                    callback(err);
                }
                else {
                    callback(null);
                }
            });
        }
    });
}

User.getDistance = function(email1, email2, callback) {
    var qp = {
        query: [
            'MATCH (u1:User), (u2:User),',
            'p=(u1)-[:FOLLOWS*]->(u2)',
            'WHERE u1.email = {email1} AND u2.email={email2}',
            'WITH p ORDER BY LENGTH(p)',
            'LIMIT 1',
            'RETURN LENGTH(p) AS dist'
        ].join('\n'),
        params: {
            email1: email1,
            email2: email2
        }
    };

    db.cypher(qp, function(err, result) {
        if (err) {
            console.error(err);
            return callback(err);
        }
        else if (result[0])
            return callback(null, result[0].dist);
        else
            return callback(null, null);
    });
}

User.generateHash = function(password, next) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null, next);
}

User.validPassword = function(password, pass, next) {
    return bcrypt.compareSync(password, pass, next);
}

var getNameByEmails = function(emails, callback) {
    var pg_query = [
        'SELECT fname, lname, school',
        'FROM Users',
        'WHERE email=$1'
    ];

    for (var i = 1; i < emails.length; i++) {
        pg_query.push('OR email=$' + (i + 1));
    }

    email_param = [];
    for (var i = 0; i < emails.length; i++) {
        email_param.push(emails[i].email);
    }

    pool.query(pg_query.join('\n'), email_param, (err, result) => {
        if (err) {
            console.error(err.stack);
            return callback(err);
        } else {
            return callback(null, result.rows);
        }
    });  
}