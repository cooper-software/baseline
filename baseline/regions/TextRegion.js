"use strict"

var Model = require('../Model'),
	AnnotationTree = require('../annotations/AnnotationTree').AnnotationTree,
	h = require('virtual-dom/h')

module.exports = Model(
{
	text: '',
	annotations: new AnnotationTree(),
	
	render: function ()
	{
		var text = this.fix_spaces(this.text)
		
		if (this.annotations.empty())
		{
			return [ text ]
		}
		else
		{
			return this.render_annotation_tree(text, this.annotations.root)
		}
	},
	
	render_annotation_tree: function (text, node)
	{
		var children = [],
			offset = node.annotation ? node.annotation.offset : 0,
			length = node.annotation ? node.annotation.length : text.length,
			end = offset + length
		
		if (node.children.length > 0)
		{
			var last_end = node.annotation ? node.annotation.offset : 0
			node.children.forEach(function (n)
			{
				if (last_end < n.annotation.offset)
				{
					children.push(text.substr(last_end, n.annotation.offset - last_end))
				}
				
				children = children.concat(this.render_annotation_tree(text, n))
				last_end = n.annotation.end()
			}.bind(this))
			
			if (last_end < end)
			{
				children.push(text.substr(last_end, end - last_end))
			}
		}
		else
		{
			children.push(text.substr(offset, length))
		}
		
		if (node.annotation)
		{
			return [this.render_annotation(node.annotation, children)]
		}
		else
		{
			return children
		}
	},
	
	render_annotation: function (annotation, children)
	{
		var attrs = {}
		
		Object.keys(annotation.attrs).forEach(function (k)
		{
			attrs[k] = annotation.attrs[k]
		})
		
		if (Object.keys(annotation.styles).length > 0)
		{
			var styles = []
			Object.keys(annotation.styles).forEach(function (k)
			{
				styles.push(k+':'+annotation.styles[k])
			})
			attrs.style = styles.join(';')
		}
		
		return h(annotation.type.tag, attrs, children)
	},
	
	fix_spaces: function (text)
	{
		return text.replace(/(^\s+)|(\s+$)/, function (match)
		{
			var spaces = []
			for (var i=0; i<match.length; i++)
			{
				spaces.push('\u00A0')
			}
			return spaces
		})
	}
})