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
	},
	
	delete: function (start, end)
	{
		var changed_region = this.regions[start.region].delete(
			start.offset, 
			end.region == start.region ? end.offset : this.regions[start.region].text.length
		)
		
		if (end.region != start.region)
		{
			changed_region = changed_region.append(
				this.regions[end.region].delete(0, end.offset)
			)
		}
		
		return this.update(
		{
			regions: this.regions
						.slice(0, start.region)
						.concat([ changed_region ])
						.concat(this.regions.slice(end.region+1))
		})
	},
	
	append: function (block)
	{
		var last_region = this.last_region(),
			first_region = block.regions[0]
		
		var new_blocks = [
			this.update({
				regions: this.regions
								.slice(0, this.regions.length - 1)
								.concat([ last_region.append(first_region) ])
			})
		]
		
		if (block.regions.length > 1)
		{
			new_blocks.push(
				block.update({
					regions: block.regions.slice(1)
				})
			)
		}
		
		return new_blocks
	},
	
	last_region: function ()
	{
		return this.regions[this.regions.length -1]
	},
	
	insert: function (point)
	{
		// assert(point.region >= 0 && point.region < this.regions.length &&
		//        point.offset >= 0 && point.offset < this.regions[point.region].length)
		var region = this.regions[point.region]
		return {
			blocks: [
				this.update({
					regions: this.regions.slice(0, point.region).concat([ region.delete(point.offset, region.text.length) ])
				}),
				this.update({
					regions: this.regions.slice(point.region+1).concat([ region.delete(0, point.offset) ])
				})
			],
			point: point.update({
				block: point.block + 1,
				region: point.region + 1,
				offset: 0
			})
		}
	}
	
}, true)