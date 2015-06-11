"use strict"

var vdom = require('./vdom'),
	h = vdom.h,
	Range = require('./selection/Range'),
	Document = require('./Document'),
	Parser = require('./Parser'),
	Renderer = require('./Renderer'),
	defaults = require('./defaults')

var Editor = function Editor(options)
{
	options = options || {}
	
	if (!options.container)
	{
		throw new Error('A container element is required')
	}
	
	this.allow_breaks = (options.allow_breaks === undefined) ? true : options.allow_breaks
	this.onchange = options.onchange
	this.dom_window = options.dom_window || window
	this.dom_document = this.dom_window.document
	
	this.container = options.container
	this.container.contentEditable = true
	this.container.addEventListener('keydown', this.onkeydown.bind(this))
	this.container.addEventListener('keypress', this.onkeypress.bind(this))
	this.container.addEventListener('keyup', this.onkeyup.bind(this))
	this.container.addEventListener('paste', this.onpaste.bind(this))
	this.dom_document.addEventListener('selectionchange', this.onselectionchange.bind(this))
	
	this.parser = new Parser({
		block_recognizers: defaults.block_recognizers,
		annotation_types: defaults.annotation_types
	})
	
	this.renderer = new Renderer({
		container: this.container,
		onblockchange: this.onblockchange.bind(this),
		document: this.dom_document,
		parser: this.parser
	})
	
	this.document = new Document({
		blocks: this.parser.parse_dom(this.container)
	})
	this.document_stack = []
	this.document_stack_position = -1
	
	this.commands = {}
	Object.keys(defaults.commands).forEach(function (k)
	{
		this.commands[k] = defaults.commands[k]
	}.bind(this))
	
	this.update_range_from_window()
	this.render()
}

Editor.prototype.render = function ()
{
	this.renderer.render(this.document.blocks)
}

Editor.prototype.onblockchange = function (i, new_block)
{
	var blocks = this.document.blocks
	
	if (new_block)
	{
		this.update_document({
			blocks: blocks.slice(0, i)
						.concat([new_block])
						.concat(blocks.slice(i+1))
		})
	}
	else
	{
		this.update_document({
			blocks: blocks.slice(0, i).concat(blocks.slice(i+1))
		})
		this.render()
	}
}

Editor.prototype.update_document = function (props)
{
	this.document_stack.push(this.document)
	this.document = this.document.update(props)
	
	if (this.onchange)
	{
		this.onchange(this)
	}
}

Editor.prototype.undo = function ()
{
	if (this.document_stack_position < 0)
	{
		return
	}
	
	this.document_stack_position--
	this.document = this.document_stack[this.document_stack_position]
	this.render()
}

Editor.prototype.redo = function ()
{
	if (this.document_stack.length <= this.document_stack_position)
	{
		return
	}
	
	this.document_stack_position++
	this.document = this.document_stack[this.document_stack_position]
	this.render()
}

Editor.prototype.update_range_from_window = function ()
{
	this.range = Range.get_from_window(this.dom_window, this.container, this.document)
}

Editor.prototype.run_command = function (command)
{
	command(this)
	this.render()
	this.range.set_in_window(this.dom_window, this.container, this.document)
}
	
Editor.prototype.onkeydown = function (evt)
{
	// Check for a delete or backspace
	if (evt.which == 8 || evt.which == 46)
	{
		if (this.range.is_collapsed())
		{
			if (this.range.start.offset == 0)
			{
				evt.preventDefault()
				this.run_command(this.commands.merge_block_with_previous)
			}
		}
		else if (this.range.num_blocks() > 1)
		{
			evt.preventDefault()
			this.run_command(this.commands.delete_range)
		}
		/*
		else
		{
			// let the browser handle character insertion and deletion
		}
		*/
	}
}

Editor.prototype.onkeypress = function (evt)
{
	// Check for a new line, carriage return, etc.
	if (evt.which == 13 || evt.which == 5 ||
		(evt.which == 77 && evt.ctrlKey))
	{
		evt.preventDefault()
		
		if (this.allow_breaks)
		{
			this.run_command(this.commands.insert_block)
		}
	}
}

Editor.prototype.onkeyup = function (evt)
{
	evt.preventDefault()
}

Editor.prototype.onselectionchange = function (evt)
{
	this.update_range_from_window()
}
	
Editor.prototype.onpaste = function (evt)
{
	evt.preventDefault()
}

Editor.prototype.to_html = function ()
{
	return this.renderer.to_html()
}

module.exports = Editor