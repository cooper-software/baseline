var revision = document.getElementById('revision'),
	buttons =
	{
		normal: document.getElementById('action-normal'),
		h1: document.getElementById('action-h1'),
		h2: document.getElementById('action-h2'),
		h3: document.getElementById('action-h3'),
		ol: document.getElementById('action-ol'),
		ul: document.getElementById('action-ul'),
		left: document.getElementById('action-left'),
		center: document.getElementById('action-center'),
		right: document.getElementById('action-right'),
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

var normal_block = new baseline.SimpleBlock({ tag: 'P' })
buttons.normal.addEventListener('click', function ()
{
	editor.run_command(
		editor.commands.set_block_type,
		normal_block
	)
})

;['h1', 'h2', 'h3'].forEach(function (n)
{
	var prototype_block = new baseline.SimpleBlock({ tag: n.toUpperCase() })
	buttons[n].addEventListener('click', function ()
	{
		editor.run_command(
			editor.commands.set_block_type,
			prototype_block
		)
	})
})

;['ul', 'ol'].forEach(function (n)
{
	var prototype_block = new baseline.ListBlock({ list_tag: n.toUpperCase() })
	buttons[n].addEventListener('click', function ()
	{
		editor.run_command(
			editor.commands.set_block_type,
			prototype_block
		)
	})
})

;['left', 'center', 'right'].forEach(function (n)
{
	buttons[n].addEventListener('click', function ()
	{
		editor.run_command(
			editor.commands.set_text_alignment,
			n
		)
	})
})

;['bold', 'italic', 'underline'].forEach(function (n)
{
	var prototype_annotation = new baseline.Annotation({
		type: baseline.defaults.named_annotation_types[n]
	})
	
	buttons[n].addEventListener('click', function ()
	{
		editor.run_command(
			editor.commands.toggle_annotation,
			prototype_annotation
		)
	})
})