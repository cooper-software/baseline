"use strict"

var expect = require('chai').expect,
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	parse = require('../../baseline/vdom/parse'),
	h = require('../../baseline/vdom/h')
	
describe('vdom.parse', function ()
{
	it('can parse a text node', function ()
	{
		var node = document.createTextNode('foo bar'),
			vnode = parse(node)
		
		expect(vnode.text).to.equal('foo bar')
	})
	
	it('can parse a simple element node', function ()
	{
		var node = document.createElement('p'),
			vnode = parse(node)
		
		expect(vnode.tag).to.equal('P')
		expect(vnode.properties).to.deep.equal({ attributes: {}, style: {} })
		expect(vnode.children).to.deep.equal([])
	})
	
	it('can parse an element node with attributes', function ()
	{
		var node = document.createElement('p')
		node.className = 'foo'
		node.title = 'bar'
		var vnode = parse(node)
		
		expect(vnode.tag).to.equal('P')
		expect(vnode.properties).to.deep.equal({ attributes: { class: 'foo', title: 'bar' }, style: {} })
		expect(vnode.children).to.deep.equal([])
	})
	
	it('can parse an element node with style', function ()
	{
		var node = document.createElement('p')
		node.setAttribute('style', 'color: red; background-color: black')
		var vnode = parse(node)
		
		expect(vnode.tag).to.equal('P')
		expect(vnode.properties).to.deep.equal({ attributes: {}, style: { color: 'red', 'background-color': 'black' } })
		expect(vnode.children).to.deep.equal([])
	})
	
	it('can parse an element node with children', function ()
	{
		var node = document.createElement('p'),
			child = document.createElement('span')
		
		child.appendChild(document.createTextNode('foo'))
		node.appendChild(child)
		
		var vnode = parse(node)
		
		expect(vnode.tag).to.equal('P')
		expect(vnode.properties).to.deep.equal({ attributes: {}, style: {} })
		expect(vnode.children.length).to.equal(1)
		expect(vnode.children[0].tag).to.equal('SPAN')
		expect(vnode.children[0].properties).to.deep.equal({ attributes: {}, style: {} })
		expect(vnode.children[0].children.length).to.equal(1)
		expect(vnode.children[0].children[0].text).to.equal('foo')
	})
})