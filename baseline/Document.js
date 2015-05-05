"use strict"

var Model = require('mchammer').Model,
	List = require('./List')

module.exports = Model(
{
	blocks: List()
})