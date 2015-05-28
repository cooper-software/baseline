"use strict"

var Model = require('../Model')

module.exports = 
{
	VirtualNode: Model(
	{
		dom_node: null
	}),
	
	VirtualText: Model(
	{
		dom_node: null,
		text: ''
	}),
	
	VirtualElement: Model(
	{
		dom_node: null,
		tag: 'P',
		properties: {},
		children: [],
		key: null
	})
}