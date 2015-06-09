"use strict"

var vdom = require('./vdom'),
	h = vdom.h,
	Range = require('./selection/Range'),
	Document = require('./Document'),
	Parser = require('./Parser'),
	Renderer = require('./Renderer'),
	List = require('./List'),
	defaults = require('./defaults')


var Editor = function Editor(options)
{
	options = options || {}
	
	this.allow_breaks = (options.allow_breaks === undefined) ? true : options.allow_breaks
	this.onchange = options.onchange
	this.dom_window = options.dom_window || window
	this.dom_document = options.dom_document || document
	
	this.container = options.container
	this.container.contentEditable = true
	this.container.addEventListener('keydown', this.onkeydown.bind(this))
	this.container.addEventListener('keyup', this.onkeyup.bind(this))
	this.dom_document.addEventListener('mouseup', this.onmouseup.bind(this))
	
	this.parser = new Parser({
		block_recognizers: defaults.block_recognizers,
		annotation_types: defaults.annotation_types
	})
	
	this.renderer = new Renderer({
		container: this.container,
		onchange: this.parse_block.bind(this),
		document: this.dom_document
	})
	
	this.document = new Document({
		blocks: List(this.parser.parse_dom(this.container))
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
	
	if (this.onchange)
	{
		this.onchange(
			this.renderer.to_html(this.document.blocks)
		)
	}
}

Editor.prototype.render = function ()
{
	this.renderer.render(this.document.blocks)
}

Editor.prototype.parse_block = function (i)
{
	var x = this.renderer.tree.children[i],
		vnode = x.vnode || x,
		block = this.parser.parse_vnode(vdom.parse(vnode.dom_node, false))
	
	if (block)
	{
		this.update_document({ blocks: this.document.blocks.replace(i, block) })
	}
	else
	{
		this.update_document({ blocks: this.document.blocks.remove(i) })
		this.render()
	}
}

Editor.prototype.update_document = function (props)
{
	this.document_stack.push(this.document)
	this.document = this.document.update(props)
	
	if (this.onchange)
	{
		this.onchange(
			this.renderer.to_html(this.document.blocks)
		)
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

Editor.prototype.onmouseup = function (evt)
{
	setTimeout(this.update_range_from_window.bind(this))
}
	
Editor.prototype.onkeydown = function (evt)
{
	// Check for a new line, carriage return, etc.
	if (evt.which == 13 || 
		evt.which == 5 ||
		(evt.which == 77 && evt.ctrlKey))
	{
		evt.preventDefault()
		if (this.allow_breaks)
		{
			this.run_command(this.commands.insert_block)
		}
	}
	// Check for a delete or backspace
	else if (evt.which == 8 || evt.which == 46)
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
	else if (evt.metaKey)
	{
		evt.preventDefault()
		console.log(evt)
	}
	else
	{
		this.run_command(this.commands.delete_range)
	}
}
	
Editor.prototype.onkeyup = function (evt)
{
	console.log('keyup')
	this.update_range_from_window()
}
	
Editor.prototype.onpaste = function (evt)
{
	evt.preventDefault()
}

module.exports = Editor