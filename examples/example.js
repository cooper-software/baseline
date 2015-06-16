var revision = document.getElementById('revision'),
	buttons =
	{
		bold: document.getElementById('action-bold'),
		italic: document.getElementById('action-italic'),
		underline: document.getElementById('action-underline'),
		undo: document.getElementById('action-undo'),
		redo: document.getElementById('action-redo')
	},
	editor = new baseline.Editor(
	{
		container: document.getElementById('editor'),
		ondocumentchange: function (editor)
		{
			revision.innerHTML = 'rev #'+(editor.changes.position)
			
			if (editor.can_undo())
			{
				buttons.undo.removeAttribute('disabled')
			}
			else
			{
				buttons.undo.setAttribute('disabled', 'true')
			}
			
			if (editor.can_redo())
			{
				buttons.redo.removeAttribute('disabled')
			}
			else
			{
				buttons.redo.setAttribute('disabled', 'true')
			}
		}
	})

buttons.undo.addEventListener('click', editor.undo.bind(editor))
buttons.redo.addEventListener('click', editor.redo.bind(editor))