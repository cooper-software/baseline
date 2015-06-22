"use strict"

var Point = require('../selection/Point')

module.exports = function (editor)
{
	var range = editor.range,
		blocks = editor.document.blocks
	
	if (range.start.region == 0)
	{
		if (range.start.block > 0)
		{
			editor.update_document(
			{
				blocks: blocks
							.slice(0, range.start.block-1)
							.concat(blocks[range.start.block].append_to(blocks[range.start.block-1]))
							.concat(blocks.slice(range.start.block+1))
			})
			
			var new_point = new Point(
			{
				block: range.start.block-1,
				region: editor.document.blocks[range.start.block-1].regions.length - 1,
				offset: blocks[range.start.block-1].last_region().text.length
			})
			
			editor.range = range.update(
			{
				start: new_point,
				end: new_point
			})
		}
	}
	else
	{
		var block = blocks[range.start.block],
			result = block.delete_at_boundary(range.start)
		
		editor.update_document(
		{
			blocks: blocks
						.slice(0, range.start.block)
						.concat(result.blocks)
						.concat(blocks.slice(range.start.block+1))
		})
		
		editor.range = range.update(
		{
			start: result.point,
			end: result.point
		})
	}
}