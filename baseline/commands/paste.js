"use strict"

var paste = require('../paste'),
	Point = require('../selection/Point'),
	vdom = require('../vdom')

module.exports = function (editor, event)
{
	var vtree = get_vtree(editor, event)
	if (vtree)
	{
		insert_blocks_from_vtree(editor, vtree)
	}
}

function get_vtree(editor, event)
{
	for (var k in paste)
	{
		var handler = paste[k],
			content = handler.detect(event)
			
		if (content)
		{
			return handler.transform(editor.dom_document, content)
		}
	}
}

function insert_blocks_from_vtree(editor, vtree)
{
	var new_blocks = editor.parser.parse_vtree(vtree)
	
	if (new_blocks && new_blocks.length > 0)
	{
		var blocks = editor.document.blocks,
			boundary_block = blocks[editor.range.start.block],
			split = boundary_block.insert(editor.range.start, new_blocks)
		
		editor.update_document(
		{
			blocks: blocks
						.slice(0, editor.range.start.block)
						.concat(split.blocks)
						.concat(
							blocks.slice(editor.range.start.block + 1)
						)
		})
		
		editor.range = editor.range.update(
		{
			start: split.point,
			end: split.point
		})
	}
}