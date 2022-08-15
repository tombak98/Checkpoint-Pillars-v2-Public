/* eslint-disable no-unused-vars */
const Sequelize = require('sequelize');
const db = require('./db');
const { Op } = require('sequelize')

const Subject = db.define('subject', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Subject