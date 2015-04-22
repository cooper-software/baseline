"use strict"

function set_properties(obj, props, default_props)
{
	props = props || {}
	
	for (var k in props)
	{
		if (props.hasOwnProperty(k) && !default_props.hasOwnProperty(k))
		{
			throw new Error('Unknown property "'+k+'"')
		}
	}
	
	Object.keys(default_props).forEach(function (k)
	{
		Object.defineProperty(obj, k, 
		{
			configurable: false,
			enumerable: true,
			value: props[k] !== undefined ? props[k] : default_props[k],
			writable: false
		})
	})
}

module.exports = function (default_props)
{
	var default_props = default_props || {}
	
	default_props.update = function (props)
	{
		return new this.constructor(props, this)
	}
	
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
	
	default_props.equals = function (other, only)
	{
		if (this === other)
		{
			return true
		}
		
		if (this.constructor !== other.constructor)
		{
			return false
		}
		
		if (only)
		{
			for (var i=0; i<only.length; i++)
			{
				if (!prop_equals(this[only[i]], other[only[i]]))
				{
					return false
				}
			}
		}
		else
		{
			for (var k in default_props)
			{
				if (default_props.hasOwnProperty(k))
				{
					if (!prop_equals(this[k], other[k]))
					{
						return false
					}
				}
			}
		}
		
		return true
	}
	
	return function (props, default_props_arg)
	{
		set_properties(this, props, default_props_arg || default_props)
	}
}