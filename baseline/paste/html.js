"use strict"

var vdom = require('../vdom')

module.exports = 
{
	detect: function (event)
	{
		if (-1 < event.clipboardData.types.indexOf('text/html'))
		{
			return event.clipboardData.getData('text/html')
		}
	},
	
	transform: function (editor, content)
	{
		var root = document.createElement('div')
		root.innerHTML = content
		return vdom.parse(root)
	}
}