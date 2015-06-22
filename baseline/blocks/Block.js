"use strict"

var Model = require('../Model'),
	DomPoint = require('../selection/DomPoint'),
	Point = require('../selection/Point')

module.exports = Model(
{
	// A list of regions contained within this block
	regions: [],
	
	// Create and return a VTree for this block
	render: function ()
	{
		return null
	},
	
	// Convert a list of blocks from a different type to this type
	convert: function (tuples)
	{
		var new_blocks = [],
			point_block = tuples[0][1].block
		
		tuples.forEach(function (tuple)
		{
			var block = tuple[0], start = tuple[1], end = tuple[2],
				start_regions = block.regions.slice(0, start.region),
				change_regions = block.regions.slice(start.region, end.region+1),
				end_regions = block.regions.slice(end.region+1)
			
			if (start_regions.length > 0)
			{
				new_blocks.push(block.update({ regions: start_regions }))
				point_block++
			}
			
			new_blocks.push(this.update({ regions: change_regions }))
			
			if (end_regions.length > 0)
			{
				new_blocks.push(block.update({ regions: end_regions }))
			}
			
		}.bind(this))
		
		return {
			blocks: new_blocks,
			point: {
				block: point_block,
				region: 0,
				offset: 0
			}
		}
	},
	
	// Given the DOM node associated with this block and a DomPoint within it,
	// return the region index and character offset that match the DomPoint
	get_position_of_dom_point: function (block_node, dom_point)
	{
		return new Point({
			region: 0,
			offset: 0
		})
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
	
	append_to: function (block)
	{
		var first_region = this.regions[0],
			last_region = block.last_region()
		
		var new_blocks = [
			block.update({
				regions: block.regions
								.slice(0, block.regions.length - 1)
								.concat([ last_region.append(first_region) ])
			})
		]
		
		if (this.regions.length > 1)
		{
			new_blocks.push(
				this.update({
					regions: this.regions.slice(1)
				})
			)
		}
		
		return new_blocks
	},
	
	delete_at_boundary: function (point)
	{
		// assert(point.region > 0 && point.region < this.regions.length)
		var previous_region = this.regions[point.region-1]
		
		return {
			blocks: [
				this.update(
				{
					regions: this.regions
								.slice(0, point.region-1)
								.concat([
									previous_region
										.append(this.regions[point.region])
								])
								.concat(
									this.regions.slice(point.region+1)
								)
				})
			],
			point: new Point({
				block: point.block,
				region: point.region-1,
				offset: previous_region.text.length
			})
		}
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
			point: new Point({
				block: point.block + 1,
				region: point.region + 1,
				offset: 0
			})
		}
	},
	
	has_annotation: function (start, end, prototype_annotation)
	{
		var start_region = this.regions[start.region]
		
		if (!start_region.has_annotation(start.offset, end.region == start.region ? end.offset : start_region.text.length, prototype_annotation))
		{
			return false
		}
		
		if (end.region == start.region)
		{
			return true
		}
		
		var end_region = this.regions[end.region]
		
		if (!end_region.has_annotation(0, end.offset, prototype_annotation))
		{
			return false
		}
		
		return this.regions.slice(start.region+1, end.region).every(function (region)
		{
			return region.has_annotation(0, region.text.length, prototype_annotation)
		})
	},
	
	add_annotation: function (start, end, prototype_annotation)
	{
		return this.modify_regions_in_range(start, end, function (region, start, end)
		{
			return region.add_annotation(start, end, prototype_annotation)
		})
	},
	
	remove_annotation: function (start, end, prototype_annotation)
	{
		return this.modify_regions_in_range(start, end, function (region, start, end)
		{
			return region.remove_annotation(start, end, prototype_annotation)
		})
	},
	
	modify_regions_in_range: function (start, end, fn)
	{
		var new_regions = this.regions.slice(0, start.region)
		
		this.visit_regions_in_range(start, end, function (region, start, end)
		{
			new_regions.push(fn(region, start, end))
			return true
		})
		
		return this.update(
		{
			regions: new_regions.concat(this.regions.slice(end.region+1))
		})
	},
	
	visit_regions_in_range: function (start, end, fn)
	{
		var range_regions = this.regions.slice(start.region, end.region+1)
		for (var i=0; i<range_regions.length; i++)
		{
			var region = range_regions[i]
			
			if (i == 0)
			{
				if (start.region == end.region)
				{
					if (!fn(region, start.offset, end.offset))
					{
						return false
					}
				}
				else
				{
					if (!fn(region, start.offset, region.text.length))
					{
						return false
					}
				}
			}
			else if (i == range_regions.length - 1)
			{
				if (!fn(region, 0, end.offset))
				{
					return false
				}
			}
			else
			{
				if (!fn(region, 0, region.text.length))
				{
					return false
				}
			}
		}
		
		return true
	}	
})