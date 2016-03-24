"use strict"

module.exports = function (editor, prototype_annotation)
{
	if (editor.document.has_annotation(editor.range, prototype_annotation))
	{
		editor.set_document(
			editor.document.remove_annotation(editor.range, prototype_annotation)
		)
	}
	else
	{
		editor.set_document(
			editor.document.add_annotation(editor.range, prototype_annotation)
		)
	}
	
	editor.update_selection()
}