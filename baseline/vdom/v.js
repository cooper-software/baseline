"use strict"

var VirtualElement = require('./VirtualElement')


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
			children = []
			
		process_args(Array.prototype.slice.call(arguments, 1), properties, children)
		
		return new VirtualElement({
			tag: arguments[0].toUpperCase(),
			properties: properties,
			children: children
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
		
		if (arg.constructor == String || arg.constructor == VirtualElement)
		{
			children.push(arg)
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
	})
}