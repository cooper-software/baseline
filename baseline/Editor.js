"use strict"

var list = require('./list'),
	Selection = require('./selection/Selection')

module.exports = function (options)
{
	this.blocks = list()
	this.selection = new Selection()
	this.container = options.container
	this.container.contentEditable = true
}