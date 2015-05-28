"use strict"

var model = require('./model'),
	VirtualText = model.VirtualText,
	VirtualElement = model.VirtualElement


module.exports = function ()
{
	if (arguments.length == 0)
	{
		return new VirtualElement()
	}
	else if (arguments.length == 1)
	{
		return new VirtualElement({ tag: arguments[0].toUpperCase() })
	}
	else
	{
		var properties = {},
			children = [],
			key = null
			
		process_args(Array.prototype.slice.call(arguments, 1), properties, children)
		
		if (properties.key)
		{
			key = properties.key
			delete properties.key
		}
		
		return new VirtualElement({
			tag: arguments[0].toUpperCase(),
			properties: properties,
			children: children,
			key: key
		})
	}
}

var process_args = function (args, properties, children)
{
	args.forEach(function (arg)
	{
		if (!arg || !arg.constructor)
		{
			return
		}
		
		if (arg.constructor == VirtualElement)
		{
			children.push(arg)
		}
		if (arg.constructor == String)
		{
			children.push(new VirtualText({ text: arg }))
		}
		else if (arg.constructor == Array)
		{
			process_args(arg, properties, children)
		}
		else if (arg.constructor == Object)
		{
			Object.keys(arg).forEach(function (k)
			{
				properties[k] = arg[k]
			})
		}
		else if (arg.render)
		{
			children.push(arg)
		}
	})
}