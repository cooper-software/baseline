"use strict"

module.exports = function (editor, prototype_annotation)
{
	if (editor.document.has_annotation(editor.range, prototype_annotation))
	{
		editor.document.remove_annotation(editor.range, prototype_annotation)
	}
	else
	{
		editor.document.add_annotation(editor.range, prototype_annotation)
	}
}