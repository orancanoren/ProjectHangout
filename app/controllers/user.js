var bcrypt = require('bcrypt');
var async = require('async');
var sequelize = require('sequelize');
//var transporter = require('../config/transporter');

var UserItem = require('../models/UserItem');

const notificationTypes = [
	'friend_request_sent',
	'friend_request_received',
	'event_invitation_received',
	'event_invitation_accepted'
]

class UserController {
    constructor(eventModel, notificationModel, userModel, activationModel, graphDB) {
        this.eventModel = eventModel,
        this.notificationModel = notificationModel,
        this.userModel = userModel,
        this.activationModel = activationModel,
        this.graphDB = graphDB
    }

    // MARK: Authentication
    login(key, password, callback) {
        this.userModel.findOne({ where: { [sequelize.Op.or]: [ { username: key }, { email: key } ] }})
        .then(user => {
            if (!user) { // username or email not found
                return callback('Invalid combination');
            } else if (user.isActive != 1) { // user not active
                return callback('User not activated');
            } else {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (err) {
                        return callback(err);
                    } else if (res) {
                        return callback(null, user);
                    } else { // wrong password
                        return callback('Invalid combination');
                    }
                })
            }
        })
        .catch(err => callback(err));
    }

    register(username, email, password, callback) {
        // 1 - check if registration inputs match expected formats
		if ((typeof(email) === 'undefined') || (email === null) ||
		!email.match(/.+\@.+\..+/) || !email.match(/(.){1,64}\@(.){1,255}/)) {
            return callback('Invalid input');
        }
        
        // 2 - check if email exists or not and act accordingly
        this.userModel.count({ where: { email: email } })
        .then(count => {
            if (count) {
                return callback('Email exists');
            } else {
                async.waterfall([
                    (done) => {
                        bcrypt.hash(password, 12, (err, hash) => {
                            if (err) {
                                return done(err);
                            } else {
                                this.userModel.build({ 
                                    username: username,
                                    email: email,
                                    password: hash
                                }).save()
                                .then(user => {
                                    // TODO: send an email to the user for account activation
                                    done(null, user.id);
                                })
                            }
                        })
                    },
                    (userId, done) => {
                        var session = this.graphDB.session();
                        session.run('CREATE UNIQUE (n: User { uid: {userId}, username: {username} })', {
                            userId: userId,
                            username: username
                        })
                        .then(result => {
                            session.close();
                            done(null, userId);
                        })
                        .catch(err => {
                            done(err);
                        })
                    }
                ], (err, userId) => {
                    if (err) {
                        // delete postgres entry
                        this.userModel.findOne({ where: { username: username }})
                        .then(user => {
                            if (user) {
                                user.destroy()
                                .then(() => callback(err))
                                .catch(err => callback(err)); // critical!!
                            }
                        })
                    }
                    callback(err, userId);
                });
            }
        })
    }

    activate(userId, activationKey, callback) {
        this.activationModel.findOne({ where: { id: userId, activationKey: activationKey }})
        .then(userActivation => {
            // TODO: these actions should take place in a DB transaction!
            if (userActivation) {
                userActivation.destroy();
            
                this.userModel.findOne({ where: { id: userId }})
                then(user => {
                    user.isActive = true;
                    user.save();
                    return callback(null);
                })
            } else {
                return callback('Activation record not found');
            }
        })
        .catch(err => callback(err));
    }

    // MARK: User interaction
    addFriend(inviterId, receiverId, callback) {
        session = this.graphDB.session();
        
        // create an edge directed from the user having smaller id to the other one
        const relationQuery = (inviterId < receiverId ? 
            'CREATE UNIQUE (inviter)-[rel:FRIEND]->(receiver)' : 'CREATE UNIQUE (receiver)-[rel:FRIEND]->(inviter)')
        session.run([
            'MATCH (inviter: User), (receiver: User)',
            'WHERE inviter.uid = {inviterId} AND receiver.uid = {receiverId}',
            relationQuery,
            'SET rel.since={since}',
            'SET rel.active=true',
            'SET rel.deleted=false'
        ].join('\n'), {
            inviterId: inviterId,
            receiverId: receiverId
        })
        .then(result => {
            if (result) {
                session.close();
                callback();
            } else {
                callback('User::addFriend query returned:\n' + result);
            }
        })
        .catch(err => callback(err));

        // issue a notification for the followed user
        async.waterfall([
            (done) => {
                this.userModel.findOne({ where: { id: followerId }})
                .then(followerUser => {
                    if (!followerUser) {
                        return done('Follower user "' + followerUser + '" could not be found');
                    }
                    done(null, followerUser.username)
                });
            },
            (followerUser, done) => {
                this.notificationModel.build({
                    userId: followedId,
                    notificationType: notificationTypes[1],
                    values: [followerUser]
                })
            }
        ]);
    }

    removeFriend(removerId, oldFriendId, callback) {
        session = this.graphDB.session();
        session.run([
            'MATCH (remover :User), (oldFriend :User)',
            'WHERE remover.uid = {removerId} AND oldFriend.uid = {oldFriendId}',
            'SET rel.active = false',
            'SET rel.removeDate = {removeDate}',
            'SET removedBy = {removedBy}'
        ].join(' '), {
            removerId: removerId,
            oldFriendId: oldFriendId,
            removeDate: new Date(),
            removedBy: removerId
        })
        .then(result => {
            if (result) {
                session.close();
                callback(null);
            } else {
                callback('User::removeFriend query returned:\n' + result);
            }
        })
        .catch(err => callback(err));
    }

    getProfile(userId, callback) {
        async.parallel({
            relationalData: (done) => {
                this.userModel.findOne({ where: { id: userId }})
                .then(user => {
                    if (!user) {
                        return callback('User with id ' + userId + ' not found')
                    }
                    done(null, new UserItem(user.username, ))
                });
            },
            graphData: (done) => {
                session = this.graphDB.session();
                session.run([
                    'MATCH (a: User)-[:FRIEND]-(friend: User)',
                    'WHERE a.uid={userId}',
                    'RETURN COUNT(friend) as friendCount'
                ].join('\n'))
                .then(result => {
                    if (result) {
                        session.close();
                        callback();
                    } else {
                        callback('User::getProfile query returned:\n' + result);
                    }
                })
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            return callback(null, new UserItem(results.relationalData.username, results.graphData.friendCount))
        });
    }
}

module.exports = UserController;


// private constructor
var User = function(_node) {
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
        'SELECT email',
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

User.getFollowCounts = function(email, callback) {
    var qp = {
        query: [
            'MATCH (follower:User)-[:FOLLOWS]->(n:User)',
            'WHERE n.email={email}',
            'WITH COUNT(DISTINCT follower) AS followerCount, n',
            'MATCH (n:user)-[:FOLLOWS]->(following:User)',
            'RETURN COUNT(DISTINCT following.email) AS followingCount, followerCount'
        ].join('\n'),
        params: {
            email: email
        }
    }

    db.cypher(qp, (err, result) => {
        if (err) {
            console.error(err);
            return callback(err);
        }
        else {
            return callback(null, result);
        }
    })
}

User.getCardData = function(email, self_email, callback) {
    // Returns name, school, follower/following counts and distance for <email>
    async.parallel([
        function(callback) {
            // PostgreSQL query
            const query = [
                'SELECT fname, lname, school, dob',
                'FROM Users',
                'WHERE email=$1'
            ].join('\n');

            const values = [ email ];

            pool.query(query, values, (err, result) => {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, result.rows[0]);
            });
        },
        function(callback) {
            const qp = {
                query: [
                    ''
                ].join('\n'),
                params: {

                }
            }

            // Neo4j query - get distance
            if (self_email) {
                var authData = {};
                User.getDistance(self_email, email, (err, distance) => {
                    if (err) {
                        return callback(err, null);
                    }
                    authData.distance = distance;
                    return callback(null, authData);
                });
            }
            else {
                return callback(null, null);
            }
        }
    ], function(err, results) {
        results[0].authData = results[1];
        results = results[0];
        if (err) {
            return callback(err);
        }
        if (email == self_email) {
            results.selfData = true;
        }
        return callback(null, results);
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
            return callback(null, -1);
    });
}

User.generateHash = function(password, next) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null, next);
}

User.validPassword = function(password, pass, next) {
    return bcrypt.compareSync(password, pass, next);
}

User.addToCircle = function(email1, email2, callback) {
    const qp = {
        query: [
            'MATCH (u1:User), (u2:User)',
            'WHERE u1.email={email1} AND u2.email={email2}',
            'MATCH (u1)-[:CIRCLE]->(u2)'
        ].join('\n'),
        params: {
            email1: email1,
            email2: email2
        }
    }

    db.cypher(qp, (err) => {
        if (err)
            console.error(err);
        return callback(err);
    });
}

User.removeFromCircle = function(email1, email2, callback) {
    const qp = {
        query: [
            'MATCH (u1:User)-[rel:CIRCLE]-(u2:User)',
            'WHERE u1.email={email1} AND u2.email={email2}',
            'DELETE rel'
        ].join('\n'),
        params: {
            email1: email1,
            email2: email2
        }
    }

    db.cypher(qp, (err) => {
        if (err)
            console.error(err);
        return callback(err);
    })
}

var getNameByEmails = function(emails, callback) {
    var pg_query = [
        'SELECT fname, lname, school, email',
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