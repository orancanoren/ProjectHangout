var db = require('../../config/psql');
var sequelize = require('sequelize');

var User = db.define('User', {
    headline: {
        type: sequelize.CHAR(500),
        allowNull: true
    },
    email: {
        type: sequelize.CHAR(256),
		allowNull: false,
		unique: true
    },
	username: {
		type: sequelize.CHAR(15),
		allowNull: false,
		unique: true
	},
	password: {
		type: sequelize.CHAR(60),
		allowNull: false
	},
	picture: {
		type: sequelize.CHAR(10),
		allowNull: false,
		defaultValue: '0000000001'
	},
	isActive: {
		type: sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	id: {
		type: sequelize.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	}
},
{
	freezeTableName: true
});

module.exports = User;