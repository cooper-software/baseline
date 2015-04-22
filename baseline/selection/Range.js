"use strict"

var Model = require('../Model'),
	Point = require('./Point')

module.exports = Model(
{
	start: new Point(),
	end: new Point()
})
