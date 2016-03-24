"use strict"

var Model = function Model (defaults)
{
	var model = function (props, new_defaults)
	{
		var props = props || {},
			actual_defaults = new_defaults || defaults
			
		Object.keys(actual_defaults).forEach(function (k)
		{
			this[k] = props[k] == undefined ? actual_defaults[k] : props[k]
		}.bind(this))
	}
	model.prototype.update = function (props)
	{
		return new model(props, this)
	}
	
	return model
}

Model.extend = function (parent, props)
{
	var parent_inst = new parent(),
		new_props = {},
		props = props || {}
	
	Object.keys(parent_inst).forEach(function (k)
	{
		new_props[k] = parent_inst[k]
	})
	
	Object.keys(props).forEach(function (k)
	{
		new_props[k] = props[k]
	})
	
	var model =  Model(new_props)
	model._parent = parent
	return model
}

Model.is_instance = function (inst, model)
{
	var child = inst.constructor
	
	if (child === model)
	{
		return true
	}
	
	while (child._parent)
	{
		if (child._parent === model)
		{
			return true
		}
		
		child = child._parent
	}
	
	return false
}

Model.equals = function (a, b, only)
{
	var prop_equals = function (a, b)
	{
		if (a === b)
		{
			return true
		}
		
		if (typeof b === "undefined" || typeof a === "undefined" ||
			b === null || a === null)
		{
			return a == b
		}
		
		if (a.constructor != b.constructor)
		{
			return false
		}
		
		if (a.equals)
		{
			return a.equals(b)
		}
		else if (b.equals)
		{
			return b.equals(a)
		}
		else if (a.constructor == Array)
		{
			if (a.length != b.length)
			{
				return false
			}
			for (var i=0; i<a.length; i++)
			{
				if (!prop_equals(a[i], b[i]))
				{
					return false
				}
			}
			return true
		}
		else if (a instanceof Object)
		{
			for (var k in a)
			{
				if (a.hasOwnProperty(k))
				{
					if (!prop_equals(a[k], b[k]))
					{
						return false
					}
				}
			}
			return true
		}
		else
		{
			return a == b
		}
	}
	
	if (a === b)
	{
		return true
	}
	
	if (a.constructor !== b.constructor)
	{
		return false
	}
	
	if (only)
	{
		for (var i=0; i<only.length; i++)
		{
			if (a[only[i]] == undefined)
			{
				throw new Error("Unknown property '"+only[i]+"' chosen for equality comparison")
			}
			
			if (!prop_equals(a[only[i]], b[only[i]]))
			{
				return false
			}
		}
	}
	else
	{
		for (var k in a)
		{
			if (a.hasOwnProperty(k) && a.constructor != Function)
			{
				if (!prop_equals(a[k], b[k]))
				{
					return false
				}
			}
		}
	}
	
	return true
}

module.exports = Model