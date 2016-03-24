"use strict"

var Renderer = require('../Renderer'),
	renderer = new Renderer()

module.exports = function (editor, event)
{
	if (editor.range.is_collapsed())
	{
		return
	}
	
	var fragment,
		blocks = editor.document.blocks,
		start = editor.range.start,
		end = editor.range.end
	
	if (end.block == start.block)
	{
		fragment = [
			blocks[start.block].extract(
				start,
				end
			)
		]
	}
	else
	{
		var start_block = blocks[start.block],
			end_block = blocks[end.block]
		
		fragment = [
				start_block.extract(
					start, { region: start_block.regions.length-1, offset: start_block.regions[start_block.regions.length-1].size() }
				)
			]
			.concat(blocks.slice(start.block+1, end.block))
			.concat([
				end_block.extract({ region: 0, offset: 0 }, end)
			])
	}
	
	event.clipboardData.setData('text/plain', editor.dom_window.getSelection().toString())
	
	renderer.render(fragment)
	event.clipboardData.setData('text/html', renderer.to_html())
	renderer.clear()
}