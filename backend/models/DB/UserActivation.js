var db = require('../../config/psql');
var sequelize = require('sequelize');

var UserActivation = db.define('UserActivation', {
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    activationKey: {
        type: sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = UserActivation;