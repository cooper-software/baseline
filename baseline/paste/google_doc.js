"use strict"

var vdom = require('../vdom')
var model = require('../vdom/model')

module.exports = 
{
	detect: function (event)
	{
		var is_google = event.clipboardData.types.some(function (x)
		{
			return (-1 < x.indexOf('application/x-vnd.google-docs'))
		})
		
		if (is_google)
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
		var vtree = vdom.parse(root.querySelector(':scope > b'))
		return new model.VirtualElement({
			tag: 'DIV',
			children: vtree.children.map(function (vnode)
			{
				if (vnode.tag == 'SPAN')
				{
					return new model.VirtualElement({
						tag: 'P',
						children: vnode.children
					})
				}
				else
				{
					return vnode
				}
			})
		})
	}
}