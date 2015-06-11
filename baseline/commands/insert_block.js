var delete_range = require('./delete_range')

module.exports = function (editor)
{
	if (!editor.range.is_collapsed())
	{
		delete_range(editor)
	}
	
	var range = editor.range,
		blocks = editor.document.blocks
	
	var new_blocks = blocks[range.start.block].insert(range.start)
	
	editor.update_document(
	{
		blocks: blocks.slice(0, range.start.block)
					.concat(new_blocks)
					.concat(
						blocks.slice(range.start.block+1)
					)
	})
	
	var new_point = range.start.update({
		block: range.start.block + new_blocks.length - 1,
		region: new_blocks[new_blocks.length - 1].regions.length - 1,
		offset: 0
	})
	
	editor.range = range.update(
	{
		start: new_point,
		end: new_point
	})
}