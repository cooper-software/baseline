"use strict"

var h = require('virtual-dom/h'),
	Document = require('./Document'),
	Parser = require('./Parser'),
	Renderer = require('./Renderer'),
	defaults = require('./defaults')


var Editor = function Editor(options)
{
	this.container = options.container
	this.container.contentEditable = true
	this.container.addEventListener('keydown', this.keydown.bind(this))
	this.container.addEventListener('keyup', this.keyup.bind(this))
	this.container.addEventListener('keypress', this.keypress.bind(this))
	this.document = new Document()
	this.document_stack = []
	this.parser = new Parser({
		block_recognizers: defaults.block_recognizers,
		annotation_types: defaults.annotation_types
	})
	this.renderer = new Renderer({ container: this.container })
	this.update_from_presentation()
}

Editor.prototype.update_document = function (props)
{
	this.document_stack.push(this.document)
	this.document = this.document.update(props)
	this.renderer.render(this.document.blocks)
}

Editor.prototype.update_from_presentation = function ()
{
	this.update_document(
	{
		blocks: this.parser.parse_html('<div>'+this.container.innerHTML+'</div>')
	})
}

/*
Editor.prototype.onmouseup = function (evt)
{
	setTimeout(function ()
	{
		this.document.range = selection.get(this.document, this.container)
		this.menu.ctrl.update_position()
	}.bind(this))
}
	
Editor.prototype.onkeydown = function (evt)
{
	this.last_char_code = null
	
	if (evt.which == 13 || evt.which == 5 ||
		(evt.which == 77 && evt.ctrlKey))
	{
		evt.preventDefault()
		if (this.allow_block_insertion)
		{
			commands.insert_block(this.document, this.allow_escape_enclosing_block)
			this.render()
		}
	}
	else if (evt.which == 8 || evt.which == 46)
	{
		if (this.document.range.is_collapsed())
		{
			if (this.document.range.start.offset == 0)
			{
				evt.preventDefault()
				commands.merge_with_previous(this.document)
				this.render()
				this.skip_next_sync = true
			}
		}
		else if (this.document.range.num_blocks() > 1)
		{
			evt.preventDefault()
			commands.delete(this.document)
			this.render()
			this.skip_next_sync = true
		}
	}
	else if (this.document.range && this.document.range.num_blocks() > 1 &&
		!evt.metaKey &&
		(evt.which < 37 || evt.which > 40))
	{
		
		commands.delete(this.document)
		this.render()
	}
}
	
Editor.prototype.onkeyup = function (evt)
{
	this.document.range = selection.get(this.document, this.container)
	
	if (evt.which == 8 || evt.which == 46)
	{
		if (this.document.range.num_blocks() == 1)
		{
			this.sync()
		}
	}
	else if (this.document.range.num_blocks() == 1 && this.last_char_code)
	{
		this.sync()
	}
	
	this.menu.ctrl.update_position()
}
	
Editor.prototype.onkeypress = function (evt)
{
	this.last_char_code = evt.charCode
}
	
Editor.prototype.onpaste = function (evt)
{
	evt.preventDefault()
	commands.paste(this.document, evt, this.allowed_paste_types)
	this.render()
}
*/

module.exports = Editor