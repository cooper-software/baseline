"use strict"

var list_methods = 
{
	insert: function (index, item)
	{
		return List(
			this.slice(0, index)
				.concat([item])
				.concat(this.slice(index))
		)
	},

	replace: function (index, item)
	{
		return List(
			this.slice(0, index)
				.concat([item])
				.concat(this.slice(index+1))
		)
	},

	remove: function (index)
	{
		return List(
			this.slice(0, index).concat(this.slice(index+1))
		)
	},

	append: function (item)
	{
		return List(
			this.concat([item])
		)
	}
}

var List = function (array)
{
	array = array || []
	
	Object.keys(list_methods).forEach(function (k)
	{
		Object.defineProperty(array, k,
		{
			configurable: false,
			enumerable: false,
			value: list_methods[k],
			writable: false
		})
	})
	
	return array
}

module.exports = List