"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	render = require('../../baseline/vdom/render'),
	h = require('../../baseline/vdom/h')
	
chai.use(sinon_chai)
	
	
describe('vdom.render', function ()
{
	it('can render a simple node', function ()
	{
		var vnode = h('foo'),
			result = render(document, vnode)
		
		expect(result.dom_node.tagName).to.equal('FOO')
		expect(result.dom_node.childNodes.length).to.equal(0)
	})
	
	it('can render a node with properties', function ()
	{
		var vnode = h('input', { type: 'text', className: 'foo' }),
			result = render(document, vnode)
			
		expect(result.dom_node.tagName).to.equal('INPUT')
		expect(result.dom_node.type).to.equal('text')
		expect(result.dom_node.className).to.equal('foo')
		expect(result.dom_node.childNodes.length).to.equal(0)
	})
	
	it('can render a node with attributes', function ()
	{
		var vnode = h('input', { attributes: { type: 'checkbox', checked: true } }),
			result = render(document, vnode)
			
		expect(result.dom_node.tagName).to.equal('INPUT')
		expect(result.dom_node.type).to.equal('checkbox')
		expect(result.dom_node.checked).to.equal(true)
		expect(result.dom_node.childNodes.length).to.equal(0)
	})
	
	it('can render a node with style', function ()
	{
		var vnode = h('input', { attributes: { type: 'checkbox', checked: true } }),
			result = render(document, vnode)
			
		expect(result.dom_node.tagName).to.equal('INPUT')
		expect(result.dom_node.type).to.equal('checkbox')
		expect(result.dom_node.checked).to.equal(true)
		expect(result.dom_node.childNodes.length).to.equal(0)
	})
	
	it('can render a node with event handlers', function ()
	{
		var handler = function () {},
			vnode = h('button', { onclick: handler }),
			result = render(document, vnode)
			
		expect(result.dom_node.tagName).to.equal('BUTTON')
		expect(result.dom_node.onclick).to.equal(handler)
		expect(result.dom_node.childNodes.length).to.equal(0)
	})
	
	it('can render a node with children', function ()
	{
		var vnode = h('ul', h('li', 'stuff'), h('li', 'things')),
			result = render(document, vnode)
			
		expect(result.dom_node.tagName).to.equal('UL')
		expect(result.dom_node.childNodes.length).to.equal(2)
		expect(result.dom_node.childNodes[0].tagName).to.equal('LI')
		expect(result.dom_node.childNodes[0].childNodes.length).to.equal(1)
		expect(result.dom_node.childNodes[0].childNodes[0].nodeType).to.equal(3)
		expect(result.dom_node.childNodes[0].childNodes[0].nodeValue).to.deep.equal('stuff')
		expect(result.dom_node.childNodes[1].childNodes.length).to.equal(1)
		expect(result.dom_node.childNodes[1].childNodes[0].nodeType).to.equal(3)
		expect(result.dom_node.childNodes[1].childNodes[0].nodeValue).to.equal('things')
		expect(result.children[0].dom_node).to.equal(result.dom_node.childNodes[0])
		expect(result.children[1].dom_node).to.equal(result.dom_node.childNodes[1])
	})
	
	it('adds a watcher when there is an onchange field on a vnode', function ()
	{
		var onchange = sinon.spy(),
			a = h('foo'),
			b = h('bar', { onchange: onchange }),
			result_a = render(document, a),
			result_b = render(document, b)
		
		expect(a.watcher).to.be.null
		expect(b.watcher).to.not.be.null
		expect(b.watcher.onchange).to.equal(onchange)
	})
})