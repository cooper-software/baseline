"use strict"

var h = require('../vdom').h

module.exports = 
{
	detect: function (event)
	{
		if (-1 < event.clipboardData.types.indexOf('text/plain'))
		{
			return event.clipboardData.getData('text/plain')
		}
	},
	
	transform: function (editor, content)
	{
		return h('div',
			content.match(/[^\r\n]+/g).map(function (x)
			{
				return h('p', x)
			})
		)
	}
}