"use strict"

var Model = require('./Model')

module.exports = Model(
{
	blocks: [],
	
	has_annotation: function (range, prototype_annotation)
	{
		return this.visit_blocks_in_range(range, function (block, start, end)
		{
			return block.has_annotation(start, end, prototype_annotation)
		})
	},
	
	add_annotation: function (range, prototype_annotation)
	{
		var new_blocks = this.blocks.slice(0, range.start.block)
		
		this.visit_blocks_in_range(range, function (block, start, end)
		{
			new_blocks.push(block.add_annotation(start, end, prototype_annotation))
			return true
		})
		
		return this.update({
			blocks: new_blocks.concat(this.blocks.slice(range.end.block+1))
		})
	},
	
	remove_annotation: function (range, prototype_annotation)
	{
		var new_blocks = this.blocks.slice(0, range.start.block)
		
		this.visit_blocks_in_range(range, function (block, start, end)
		{
			new_blocks.push(block.remove_annotation(start, end, prototype_annotation))
			return true
		})
		
		return this.update({
			blocks: new_blocks.concat(this.blocks.slice(range.end.block+1))
		})
	},
	
	visit_blocks_in_range: function (range, fn)
	{
		var range_blocks = this.blocks.slice(range.start.block, range.end.block+1)
		
		for (var i=0; i<range_blocks.length; i++)
		{
			var block = range_blocks[i]
			
			if (i == 0)
			{
				if (range.start.block == range.end.block)
				{
					if (!fn(block, range.start, range.end))
					{
						return false
					}
				}
				else
				{
					if (!fn(block, range.start, { region: block.regions.length-1, offset: block.regions[block.regions.length-1].size() }))
					{
						return false
					}
				}
			}
			else if (i == range_blocks.length - 1)
			{
				if (!fn(block, { region: 0, offset: 0 }, range.end))
				{
					return false
				}
			}
			else
			{
				if (!fn(block, { region: 0, offset: 0 }, { region: block.regions.length-1, offset: block.regions[block.regions.length-1].size() }))
				{
					return false
				}
			}
		}
		
		return true
	}
})