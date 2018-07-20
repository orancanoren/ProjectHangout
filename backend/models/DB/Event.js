var db = require('../../config/psql');
var sequelize = require('sequelize');

var Event = db.define('Event', {
	creator: {
		type: sequelize.CHAR(25),
		allowNull: false
	},
    place: {
        type: sequelize.CHAR(256),
        allowNull: false
	},
	location: {
		type: sequelize.STRING,
		allowNull: false
	},
	time: {
		type: sequelize.DATE,
		allowNull: false
	},
	id: {
		type: sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
	}
},
{
	freezeTableName: true
});

module.exports = Event;