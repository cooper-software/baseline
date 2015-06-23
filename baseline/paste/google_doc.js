"use strict"

var vdom = require('../vdom'),
	h = vdom.h

module.exports = 
{
	detect: function (event)
	{
		if (-1 < event.clipboardData.types.indexOf('application/x-vnd.google-docs'))
		{
			return event.clipboardData.getData('text/html')
		}
		else if (-1 < event.clipboardData.types.indexOf('text/html'))
		{
			var html = event.clipboardData.getData('text/html')
			if (-1 < html.indexOf('id="docs-internal-guid'))
			{
				return html
			}
		}
	},
	
	transform: function (editor, content)
	{
		var root = document.createElement('div')
		root.innerHTML = content
		
		var context = 
		{
			roots: [],
			children: [],
			wrapper: null
		}
		
		parse_children(context, root.querySelector(':scope > b'))
		push_paragraph(context)
		
		return h('div', context.roots)
	}
}

function parse(context, node)
{
	if (node.nodeType == 3) // text
	{
		context.children.push(node.nodeValue)
	}
	else if (node.nodeType == 1) // Element
	{
		if (node.tagName == 'P')
		{
			parse_children(context, node)
		}
		else if (node.tagName == 'IMG')
		{
			push_paragraph(context)
			context.roots.push(
				h('figure',
					h(
						'img', 
						{
							src: node.src, 
							width: node.width, 
							height: node.height, 
							alt: node.alt 
						}
					)
				)
			)
		}
		else if (node.tagName == 'SPAN')
		{
			var styles = [],
				children = Array.prototype.slice.apply(node.childNodes).map(parse)
				
			if (node.style.fontWeight == 'bold')
			{
				styles.push('strong')
			}
			if (node.style.fontStyle == 'italic')
			{
				styles.push('em')
			}
			if (node.style.textDecoration == 'underline')
			{
				styles.push('underline')
			}
			
			if (styles.length > 0)
			{
				var root = h(styles.pop()),
					cur = root
				for (var i=1; i<styles.length; i++)
				{
					cur.children.push(h(styles.pop()))
					cur = cur.children[0]
				}
				var old_children = context.children
				context.children = []
				parse_children(context, children)
				cur.children = context.children
				old_children.push(root)
				context.children = old_children
			}
			else
			{
				parse_children(context, node)
			}
		}
	}
}

function push_paragraph(context)
{
	if (context.children.length > 0)
	{
		var children
		
		if (context.wrapper)
		{
			context.wrapper.children = context.children
			children = [ context.wrapper ]
			context.wrapper = null
			context.children = []
		}
		else
		{
			children = context.children
			context.children = []
		}
		
		context.roots.push(h('p', children))
	}
}

function parse_children(context, node)
{
	Array.prototype.slice.apply(node.childNodes).forEach(parse.bind(null, context))
}