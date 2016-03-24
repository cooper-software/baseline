"use strict"

var delete_range = require('./delete_range'),
	Point = require('../selection/Point')

module.exports = function (editor, new_blocks)
{
	if (!editor.range.is_collapsed())
	{
		delete_range(editor)
	}
	
	var range = editor.range
	var blocks = editor.document.blocks
	
	var result = blocks[range.start.block].insert(range.start, new_blocks)
	
	editor.update_document(
	{
		blocks: blocks.slice(0, range.start.block)
					.concat(result.blocks)
					.concat(
						blocks.slice(range.start.block+1)
					)
	})
	
	editor.range = range.update(
	{
		start: result.point,
		end: result.point
	})
	
	editor.update_selection()
}