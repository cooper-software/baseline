"use strict"

var Point = require('../selection/Point')

module.exports = function (editor, prototype_block)
{
	var tuples = []
	editor.document.visit_blocks_in_range(editor.range, function (block, start, end)
	{
		tuples.push([block, start, end])
		return true
	})
	
	var changes = prototype_block.convert(tuples)
	
	editor.update_document(
	{
		blocks: editor.document.blocks
					.slice(0, editor.range.start.block)
					.concat(
						changes.blocks
					)
					.concat(
						editor.document.blocks.slice(editor.range.end.block + 1)
					)
	})
	
	editor.range = editor.range.update(
	{
		start: changes.point, 
		end: changes.point
	})
	
	editor.update_selection()
}