"use strict"

var h = require('virtual-dom/h'),
	Model = require('mchammer').Model,
	Block = require('./Block'),
	TextRegion = require('./TextRegion')

module.exports = Model.extend(Block,
{
	tag: 'P',
	regions: [ new TextRegion() ],
	
	render: function ()
	{
		return h(this.tag, { key: this._id },  this.regions[0].text == '' ? [ h('br') ] : this.regions[0].render())
	},
	
	get_position_of_dom_point: function (block_node, dom_point)
	{
		// assert(dom_point inside this block)
		
		return {
			region: 0,
			offset: this.regions[0].get_offset_of_dom_point(block_node, dom_point)
		}
	},
	
	get_dom_point: function (block_node, point)
	{
		return this.regions[0].get_dom_point(block_node, point)
	}
})