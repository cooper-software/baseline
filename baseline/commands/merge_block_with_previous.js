module.exports = function (editor)
{
	var range = editor.range,
		blocks = editor.document.blocks
	
	if (range.start.block < 1)
	{
		throw new Error("Can't merge the first block with its previous block (there isn't one).")
	}
	
	editor.update_document(
	{
		blocks: blocks
					.slice(0, range.start.block-1)
					.concat([ blocks[range.start.block-1].append(blocks[range.start.block]) ])
					.concat(blocks.slice(range.start.block+1))
	})
	
	var new_start = range.start.update(
	{
		block: range.start.block-1,
		region: editor.document.blocks[range.start.block-1].regions.length - 1,
		offset: blocks[range.start.block-1].last_region().text.length
	})
	
	editor.range = range.update(
	{
		start: new_start,
		end: new_start
	})
}