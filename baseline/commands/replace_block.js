"use strict"

var delete_range = require('./delete_range')

module.exports = function (editor, old_block, new_block)
{
  var blocks = editor.document.blocks
  var index = blocks.indexOf(old_block)
  if (-1 < index)
  {
    var replacement = new_block ? [ new_block ] : []
    editor.set_document(
      editor.document.update({
        blocks: blocks
          .slice(0, index)
          .concat(replacement)
          .concat(
            blocks.slice(index+1)
          )
      })
    )
    
    if (!new_block)
    {
      var new_point = editor.range.start.update({
        block: editor.range.start.block == 0 ? 0 : editor.range.start.block - 1
      })
      editor.range = editor.range.update({
        start: new_point,
        end: new_point
      })
    }
  }
}