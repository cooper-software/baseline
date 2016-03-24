"use strict"

module.exports = function (editor, alignment)
{
  var new_blocks = []
  editor.document.visit_blocks_in_range(editor.range, function (block, start, end)
  {
    new_blocks.push(
      block.modify_regions_in_range(start, end, function (region)
      {
        return region.update({
          alignment: alignment
        })
      })
    )
  })
  
  editor.update_document(
  {
    blocks: editor.document.blocks
          .slice(0, editor.range.start.block)
          .concat(
            new_blocks
          )
          .concat(
            editor.document.blocks.slice(editor.range.end.block + 1)
          )
  })
  
  editor.update_selection()
}