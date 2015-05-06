"use strict"

var expect = require('chai').expect,
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	render = require('../../baseline/vdom/render'),
	v = require('../../baseline/vdom/v')
	
	
describe('vdom.render', function ()
{
	it('can render a simple node', function ()
	{
		var vnode = v('foo'),
			result = render(document, vnode)
		
		expect(result.element.tagName).to.equal('FOO')
		expect(result.element.childNodes.length).to.equal(0)
	})
	
	it('can render a node with properties', function ()
	{
		var vnode = v('input', { type: 'text', className: 'foo' }),
			result = render(document, vnode)
			
		expect(result.element.tagName).to.equal('INPUT')
		expect(result.element.type).to.equal('text')
		expect(result.element.className).to.equal('foo')
		expect(result.element.childNodes.length).to.equal(0)
	})
	
	it('can render a node with attributes', function ()
	{
		var vnode = v('input', { attributes: { type: 'checkbox', checked: true } }),
			result = render(document, vnode)
			
		expect(result.element.tagName).to.equal('INPUT')
		expect(result.element.type).to.equal('checkbox')
		expect(result.element.checked).to.equal(true)
		expect(result.element.childNodes.length).to.equal(0)
	})
	
	it('can render a node with style', function ()
	{
		var vnode = v('input', { attributes: { type: 'checkbox', checked: true } }),
			result = render(document, vnode)
			
		expect(result.element.tagName).to.equal('INPUT')
		expect(result.element.type).to.equal('checkbox')
		expect(result.element.checked).to.equal(true)
		expect(result.element.childNodes.length).to.equal(0)
	})
	
	it('can render a node with event handlers', function ()
	{
		var handler = function () {},
			vnode = v('button', { onclick: handler }),
			result = render(document, vnode)
			
		expect(result.element.tagName).to.equal('BUTTON')
		expect(result.element.onclick).to.equal(handler)
		expect(result.element.childNodes.length).to.equal(0)
	})
	
	it('can render a node with children', function ()
	{
		var vnode = v('ul', v('li', 'stuff'), v('li', 'things')),
			result = render(document, vnode)
			
		expect(result.element.tagName).to.equal('UL')
		expect(result.element.childNodes.length).to.equal(2)
		expect(result.element.childNodes[0].tagName).to.equal('LI')
		expect(result.element.childNodes[0].childNodes.length).to.equal(1)
		expect(result.element.childNodes[0].childNodes[0].nodeType).to.equal(3)
		expect(result.element.childNodes[0].childNodes[0].nodeValue).to.equal('stuff')
		expect(result.element.childNodes[1].childNodes.length).to.equal(1)
		expect(result.element.childNodes[1].childNodes[0].nodeType).to.equal(3)
		expect(result.element.childNodes[1].childNodes[0].nodeValue).to.equal('things')
		expect(result.children[0].element).to.equal(result.element.childNodes[0])
		expect(result.children[1].element).to.equal(result.element.childNodes[1])
	})
})