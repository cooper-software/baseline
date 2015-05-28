"use strict"

var Model = require('../Model'),
	DomPoint = require('../selection/DomPoint')

module.exports = Model(
{
	// A list of regions contained within this block
	regions: [],
	
	// Create and return a VTree for this block
	render: function ()
	{
		return null
	},
	
	// Given the DOM node associated with this block and a DomPoint within it,
	// return the region index and character offset that match the DomPoint
	get_position_of_dom_point: function (block_node, dom_point)
	{
		return {
			region: 0,
			offset: 0
		}
	},
	
	// Given a selection.Point, return the corresponding DomPoint within this block's DOM node.
	get_dom_point: function (block_node, point)
	{
		return new DomPoint(
		{
			node: block_node,
			offset: 0
		})
	}
}, true)