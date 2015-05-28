"use strict"

var Model = require('../Model')

var VirtualNode = Model(
{
	dom_node: null,
	onchange: null,
	watcher: null,
	key: null
})

var VirtualText = Model.extend(VirtualNode,
{
	text: ''
})

var VirtualElement = Model.extend(VirtualNode,
{
	tag: 'P',
	properties: {},
	children: []
})

module.exports = 
{
	VirtualNode: VirtualNode,
	VirtualText: VirtualText,
	VirtualElement: VirtualElement
}