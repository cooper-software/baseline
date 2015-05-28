"use strict"

var vdom = require('./vdom'),
	h = vdom.h,
	Document = require('./Document'),
	Parser = require('./Parser'),
	Renderer = require('./Renderer'),
	List = require('./List'),
	defaults = require('./defaults')


var Editor = function Editor(options)
{
	this.container = options.container
	this.container.contentEditable = true
	this.container.addEventListener('keydown', this.onkeydown.bind(this))
	this.container.addEventListener('keyup', this.onkeyup.bind(this))
	this.container.addEventListener('keypress', this.onkeypress.bind(this))
	
	this.parser = new Parser({
		block_recognizers: defaults.block_recognizers,
		annotation_types: defaults.annotation_types
	})
	
	this.renderer = new Renderer({ container: this.container })
	
	this.document = new Document({
		blocks: List(this.parser.parse_dom(this.container))
	})
	this.document_stack = []
	
	this.render()
}

Editor.prototype.render = function ()
{
	this.renderer.render(this.document.blocks)
	this.watchers = this.renderer.tree.children.map(function (vnode, i)
	{
		var watcher = vdom.watch({ vnode: vnode, onchange: this.parse_block.bind(this, i) })
		watcher.start()
		return watcher
	}.bind(this))
}

Editor.prototype.parse_block = function (i)
{
	var vnode = this.renderer.tree.children[i],
		block = this.parser.parse_vnode(vdom.parse(vnode.dom_node, false))
	
	console.log(block)
	
	if (block)
	{
		this.update_document({ blocks: this.document.blocks.replace(i, block) })
	}
	else
	{
		this.update_document({ blocks: this.document.blocks.remove(i) })
	}
}

Editor.prototype.update_document = function (props)
{
	this.document_stack.push(this.document)
	this.document = this.document.update(props)
}

Editor.prototype.onkeydown = function (e)
{
	
}

Editor.prototype.onkeyup = function (e)
{
	
}

Editor.prototype.onkeypress = function (e)
{
	
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