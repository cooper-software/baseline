"use strict"

var vdom = require('./vdom'),
	h = vdom.h,
	Range = require('./selection/Range'),
	Document = require('./Document'),
	Parser = require('./Parser'),
	Renderer = require('./Renderer'),
	ChangeTracker = require('./ChangeTracker'),
	defaults = require('./defaults')

var Editor = function Editor(options)
{
	options = options || {}
	
	if (!options.container)
	{
		throw new Error('A container element is required')
	}
	
	this.allow_breaks = (options.allow_breaks === undefined) ? true : options.allow_breaks
	this.ondocumentchange = options.ondocumentchange
	this.onselectionchange = options.onselectionchange
	this.dom_window = options.dom_window || window
	this.dom_document = this.dom_window.document
	this.selection_changed = false
	this.ignore_selection_change = false
	
	this.bound_event_listeners = {
		keydown: this.keydown_handler.bind(this),
		keypress: this.keypress_handler.bind(this),
		keyup: this.keyup_handler.bind(this),
		copy: this.copy_handler.bind(this),
		paste: this.paste_handler.bind(this),
		click: this.click_handler.bind(this),
		selectionchange: this.selectionchange_handler.bind(this)
	}
	this.container_events = ['keydown', 'keypress', 'keyup', 'paste', 'copy', 'click']
	this.document_events = ['selectionchange']
	
	this.parser = new Parser({
		block_recognizers: options.block_recognizers || defaults.block_recognizers,
		annotation_types: options.annotation_types || defaults.annotation_types
	})
	
	this.commands = {}
	Object.keys(defaults.commands).forEach(function (k)
	{
		this.commands[k] = defaults.commands[k]
	}.bind(this))
	
	this.set_container(options.container)
}

Editor.prototype.set_container = function (container)
{
	if (this.container)
	{
		this.remove_event_listeners()
	}
	
	this.container = container
	this.container.contentEditable = true
	
	this.add_event_listeners()
	
	this.renderer = new Renderer({
		container: this.container,
		onblockchange: this.onblockchange.bind(this),
		document: this.dom_document,
		parser: this.parser
	})
	
	this.document = new Document({
		blocks: this.parser.parse_dom(this.container)
	})
	
	this.changes = new ChangeTracker(this.document)
	
	this.update_range_from_window()
	this.render()
}

Editor.prototype.add_event_listeners = function ()
{
	this.container_events.forEach(function (k)
	{
		this.container.addEventListener(k, this.bound_event_listeners[k])
	}.bind(this))
	
	this.document_events.forEach(function (k)
	{
		this.dom_document.addEventListener(k, this.bound_event_listeners[k])
	}.bind(this))
}

Editor.prototype.remove_event_listeners = function ()
{
	this.container_events.forEach(function (k)
	{
		this.container.removeEventListener(k, this.bound_event_listeners[k])
	}.bind(this))
	
	this.document_events.forEach(function (k)
	{
		this.dom_document.removeEventListener(k, this.bound_event_listeners[k])
	}.bind(this))
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
	}
}

Editor.prototype.update_document = function (props)
{
	this.set_document(this.document.update(props))
}

Editor.prototype.set_document = function (doc)
{
	this.document = doc
	this.changes.push(this.document)
  this.render()
	
	if (this.ondocumentchange)
	{
		this.ondocumentchange(this)
	}
}

Editor.prototype.undo = function ()
{
	if (!this.changes.has_previous_state())
	{
		return
	}
	
	this.document = this.changes.previous()
	this.render()
	
	if (this.ondocumentchange)
	{
		this.ondocumentchange(this)
	}
}

Editor.prototype.redo = function ()
{
	if (!this.changes.has_next_state())
	{
		return
	}
	
	this.document = this.changes.next()
	this.render()
	
	if (this.ondocumentchange)
	{
		this.ondocumentchange(this)
	}
}

Editor.prototype.can_undo = function ()
{
	return this.changes.has_previous_state()
}

Editor.prototype.can_redo = function ()
{
	return this.changes.has_next_state()
}

Editor.prototype.update_range_from_window = function ()
{
	this.range = Range.get_from_window(this.dom_window, this.container, this.document)
}

Editor.prototype.run_command = function ()
{
	if (!this.range)
	{
		return
	}
	
	var command = arguments[0],
		args = Array.prototype.slice.call(arguments, 1)
	
	args.unshift(this)
	command.apply(null, args)
	this.render()
}
	
Editor.prototype.keydown_handler = function (evt)
{
	// Check for a delete or backspace
	if (evt.which == 8 || evt.which == 46)
	{
		if (this.range.is_collapsed())
		{
			if (this.range.start.offset == 0)
			{
				evt.preventDefault()
				this.run_command(this.commands.delete_at_boundary)
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

Editor.prototype.keypress_handler = function (evt)
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

Editor.prototype.keyup_handler = function (evt)
{
	evt.preventDefault()
}

Editor.prototype.selectionchange_handler = function (evt)
{
	if (this.ignore_selection_change)
	{
		return
	}
	
	this.selection_changed = true
	this.update_range_from_window()
	
	if (this.onselectionchange)
	{
		this.onselectionchange(this)
	}
}

Editor.prototype.update_selection = function ()
{
	this.range.set_in_window(this.dom_window, this.container, this.document)
	
	if (this.onselectionchange)
	{
		this.onselectionchange(this)
	}
}

Editor.prototype.click_handler = function (evt)
{
	if (!this.selection_changed)
	{
		var range = window.document.createRange()
		range.setStart(evt.target, 0)
		range.setEnd(evt.target, 0)
		
		var selection = window.getSelection()
		selection.removeAllRanges()
		selection.addRange(range)
	}
	else
	{
		this.selection_changed = false
	}
}
	
Editor.prototype.paste_handler = function (evt)
{
	evt.preventDefault()
	this.run_command(this.commands.paste, evt)
}

Editor.prototype.copy_handler = function (evt)
{
	evt.preventDefault()
	this.run_command(this.commands.copy, evt)
}

Editor.prototype.to_html = function ()
{
	return this.renderer.to_html()
}

module.exports = Editor