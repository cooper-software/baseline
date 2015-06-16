"use strict"

var ChangeTracker = function (initial_state)
{
	this.position = 0
	this.stack = [ initial_state ]
}

ChangeTracker.prototype.push = function (state)
{
	if (this.position < this.stack.length - 1)
	{
		this.stack.splice(this.position + 1, this.stack.length, state)
	}
	else
	{
		this.stack.push(state)
	}
	
	this.position++
}

ChangeTracker.prototype.has_previous_state = function ()
{
	return this.position > 0
}

ChangeTracker.prototype.has_next_state = function ()
{
	return this.position < this.stack.length - 1
}

ChangeTracker.prototype.current = function ()
{
	return this.stack[this.position]
}

ChangeTracker.prototype.previous = function ()
{
	if (this.position > 0)
	{
		return this.stack[--this.position]
	}
}

ChangeTracker.prototype.next = function ()
{
	if (this.position < this.stack.length - 1)
	{
		return this.stack[++this.position]
	}
}

module.exports = ChangeTracker