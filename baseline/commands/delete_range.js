"use strict"

var Point = require('../selection/Point')

module.exports = function (editor)
{
	var range = editor.range,
		blocks = editor.document.blocks
	
	if (range.is_collapsed())
	{
		return
	}
	
	editor.update_document(
	{
		blocks: blocks
					.slice(0, range.start.block)
					.concat(
						(function ()
						{
							if (range.start.block == range.end.block)
							{
								return [ blocks[range.start.block].delete(range.start, range.end) ]
							}
							else
							{
								var start_block = blocks[range.start.block],
									end_block = blocks[range.end.block],
									truncated_start_block = start_block.delete(
										range.start, 
										new Point({
											region: start_block.regions.length - 1, 
											offset: start_block.last_region().text.length
										})),
									truncated_end_block = end_block.delete(new Point({ region: 0, offset: 0 }), range.end)
								
								return truncated_start_block.append(truncated_end_block)
							}
						})()
					)
					.concat(
						blocks.slice(range.end.block+1)
					)
	})
	
	editor.range = range.collapse()
}