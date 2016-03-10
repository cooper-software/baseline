"use strict"

var paste = require('../paste')
var Point = require('../selection/Point')
var vdom = require('../vdom')
var insert_block = require('./insert_block')

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
	var blocks = editor.document.blocks
	var range = editor.range
	var new_blocks = editor.parser.parse_vtree(vtree)
	
	if (new_blocks && new_blocks.length > 0)
	{
		insert_block(editor, new_blocks)
	}
}