module.exports = function (editor)
{
	var range = editor.range,
		blocks = editor.document.blocks,
		new_start
	
	if (range.start.region == 0)
	{
		if (range.start.block > 0)
		{
			editor.update_document(
			{
				blocks: blocks
							.slice(0, range.start.block-1)
							.concat(blocks[range.start.block-1].append(blocks[range.start.block]))
							.concat(blocks.slice(range.start.block+1))
			})
			
			new_start = range.start.update(
			{
				block: range.start.block-1,
				region: editor.document.blocks[range.start.block-1].regions.length - 1,
				offset: blocks[range.start.block-1].last_region().text.length
			})
		}
	}
	else
	{
		var block = blocks[range.start.block],
			previous_region = block.regions[range.start.region-1]
		
		editor.update_document(
		{
			blocks: blocks
						.slice(0, range.start.block)
						.concat([
							block.update(
							{
								regions: block.regions
											.slice(0, range.start.region-1)
											.concat([
												previous_region
													.append(block.regions[range.start.region])
											])
											.concat(
												block.regions.slice(range.start.region+1)
											)
							})
						])
						.concat(
							blocks.slice(range.start.block+1)
						)
		})
		
		new_start = range.start.update(
		{
			region: range.start.region-1,
			offset: previous_region.text.length
		})
	}
	
	editor.range = range.update(
	{
		start: new_start,
		end: new_start
	})
}