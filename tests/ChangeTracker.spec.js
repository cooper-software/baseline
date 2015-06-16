"use strict"

var expect = require('chai').expect,
	ChangeTracker = require('../baseline/ChangeTracker')

describe('ChangeTracker', function ()
{
	it('starts with an empty stack and zero position', function ()
	{
		var changes = new ChangeTracker({ foo: 1 })
		expect(changes.stack.length).to.equal(1)
		expect(changes.position).to.equal(0)
	})
	
	it('can push changes', function ()
	{
		var changes = new ChangeTracker({ foo: 1 })
		changes.push({ foo: 2 })
		changes.push({ foo: 3 })
		expect(changes.stack.length).to.equal(3)
		expect(changes.position).to.equal(2)
	})
	
	it('can tell if there are changes ahead or behind', function ()
	{
		var changes = new ChangeTracker({ foo: 1 })
		expect(changes.has_previous_state()).to.be.false
		expect(changes.has_next_state()).to.be.false
		
		changes.push({ foo: 2 })
		expect(changes.has_previous_state()).to.be.true
		expect(changes.has_next_state()).to.be.false
		
		changes.push({ foo: 3 })
		expect(changes.has_previous_state()).to.be.true
		expect(changes.has_next_state()).to.be.false
		
		changes.previous()
		expect(changes.has_previous_state()).to.be.true
		expect(changes.has_next_state()).to.be.true
		
		changes.previous()
		expect(changes.has_previous_state()).to.be.false
		expect(changes.has_next_state()).to.be.true
		
		changes.next()
		expect(changes.has_previous_state()).to.be.true
		expect(changes.has_next_state()).to.be.true
		
		changes.next()
		expect(changes.has_previous_state()).to.be.true
		expect(changes.has_next_state()).to.be.false
	})
	
	it('can return previous and next revisions', function ()
	{
		var changes = new ChangeTracker({ foo: 1 })
		
		var state = changes.previous()
		expect(state).to.be.undefined
		
		state = changes.next()
		expect(state).to.be.undefined
		
		state = changes.current()
		expect(state).to.deep.equal({ foo: 1 })
		
		changes.push({ foo: 2 })
		
		state = changes.next()
		expect(state).to.be.undefined
		
		state = changes.previous()
		expect(state).to.deep.equal({ foo: 1 })
		
		state = changes.next()
		expect(state).to.deep.equal({ foo: 2 })
	})
	
	it('clears the stack after a push when pushing elsewhere than the end top of the stack', function ()
	{
		var changes = new ChangeTracker({ foo: 1 })
		changes.push({ foo: 2 })
		changes.push({ foo: 3 })
		changes.push({ foo: 4 })
		changes.push({ foo: 5 })
		changes.previous()
		changes.previous()
		changes.previous()
		
		var state = changes.current()
		expect(state).to.deep.equal({ foo: 2 })
		
		changes.push({ foo: 'bar' })
		
		expect(changes.has_next_state()).to.be.false
		
		var state = changes.current()
		expect(state).to.deep.equal({ foo: 'bar' })
		
	})
})