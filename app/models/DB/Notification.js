var db = require('../../config/psql');
var sequelize = require('sequelize');

const notificationTypes = [
	'friend_request_sent',
	'friend_request_received',
	'event_invitation_received',
	'event_invitation_accepted'
]

var Notification = db.define('Notification', {
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    notificationType: {
        type: sequelize.ENUM(notificationTypes),
        allowNull: false,
	},
	values: {
		type: sequelize.ARRAY(sequelize.STRING),
		allowNull: true
	},
	issueDate: {
		type: sequelize.DATE,
		allowNull: false
	},
	isRead: {
		type: sequelize.BOOLEAN,
		allowNull: false
	},
	redirect: {
		type: sequelize.STRING,
		allowNull: false
	}
},
{
	freezeTableName: true
});

module.exports = Notification;