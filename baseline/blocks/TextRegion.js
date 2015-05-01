"use strict"

var h = require('virtual-dom/h'),
	Model = require('../Model'),
	AnnotationTree = require('../annotations/AnnotationTree')

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
		return text
				.replace(/\s+/, function (match)
				{
					var spaces = []
					
					for (var i=0; i<match.length; i++)
					{
						spaces.push(i % 2 == 0 ? '\u0020' : '\u00A0')
					}
					
					return spaces.join("")
				})
				.replace(/\s$/, '\u00A0')
	},
	
	get_offset_of_dom_point: function (root_node, dom_point)
	{
		// assert(dom_point inside this region)
		
		var offset = 0,
			children = Array.prototype.slice.apply(root_node.childNodes)
		
		for (var i=0; i<children.length; i++)
		{
			var child = children[i]
			
			if (child == dom_point.node)
			{
				return offset + dom_point.offset
			}
			else if (child.nodeType == 3) // TEXT_NODE
			{
				offset += child.nodeValue.length
			}
			else
			{
				offset += this.get_offset_of_dom_point(child, dom_point)
			}
		}
		
		return offset
	}
})