"use strict"

var expect = require('chai').expect,
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	render = require('../../baseline/vdom/render'),
	update = require('../../baseline/vdom/update'),
	h = require('../../baseline/vdom/h'),
	model = require('../../baseline/vdom/model'),
	VirtualElement = model.VirtualElement,
	VirtualText = model.VirtualText
	
describe('vdom.update', function ()
{
	it('returns the original if the vnodes are equal', function ()
	{
		var node = h('foo'),
			result_a = render(document, node),
			result_b = update(document, result_a, node)
		
		expect(result_b).to.equal(result_a)
	})
	
	it('replaces the old dom node with a new one if the nodes are of a different type', function ()
	{
		var a = render(document, new VirtualElement({ children: [ new VirtualElement() ] })).children[0],
			b = new VirtualText({ text: 'foo' }),
			result = update(document, a, b)
		
		expect(result.dom_node).to.not.equal(a.dom_node)
		expect(result.constructor).to.equal(VirtualText)
	})
	
	it('retains the dom node of a differing text node but changes the node value', function ()
	{
		var a = render(document, h('p', 'some text')).children[0],
			b = new VirtualText({ text: 'some other text' }),
			result = update(document, a, b)
		
		expect(result).to.not.equal(a)
		expect(result.dom_node).to.equal(a.dom_node)
		expect(result.dom_node.nodeValue).to.equal(b.text)
	})
	
	it('replaces the old element with the new one when the tags are not the same', function ()
	{
		var a = render(document, h('div', h('foo'))).children[0],
			b = h('bar'),
			parent = a.dom_node.parentNode,
			result = update(document, a, b)
		
		expect(result.dom_node.tagName).to.equal('BAR')
		expect(result.dom_node.parentNode).to.equal(parent)
		expect(a.dom_node.parentNode).to.be.null
	})
	
	it('keeps the existing node but updates properties', function ()
	{
		var a = render(document, h('p', { className: 'foo',  attributes: { title: 'Stuff', skidoo: '23' }, style: { height: '100px', background: 'none' } })),
			b = h('p', { className: 'bar', attributes: { title: 'Things' }, style: { height: '50px' } }),
			result = update(document, a, b)
		
		expect(a.dom_node).to.equal(result.dom_node)
		expect(result.dom_node.className).to.equal('bar')
		expect(result.dom_node.getAttribute('title')).to.equal('Things')
		expect(result.dom_node.hasAttribute('skidoo')).to.be.false
	})
	
	it('updates removes tail nodes when nodes don\'t have keys', function ()
	{
		var a = render(document, h('div', h('p', 'foo'), h('p', 'bar'), h('p', 'baz'))),
			b = h('div', h('p', 'foo'), h('p', 'baz')),
			original_children = Array.prototype.slice.apply(a.dom_node.childNodes)
		
		expect(original_children.length).to.equal(3)
		
		var result = update(document, a, b)
		expect(a.dom_node).to.equal(result.dom_node)
		expect(result.dom_node.childNodes.length).to.equal(2)
		expect(result.dom_node.childNodes[0]).to.equal(original_children[0])
		expect(result.dom_node.childNodes[0].textContent).to.equal('foo')
		expect(result.dom_node.childNodes[1]).to.equal(original_children[1])
		expect(result.dom_node.childNodes[1].textContent).to.equal('baz')
		expect(original_children[2].parentNode).to.be.null
	})
	
	it('appends tail nodes when nodes don\'t have keys', function ()
	{
		var a = render(document, h('div', h('p', 'foo'), h('p', 'baz'))),
			b = h('div', h('p', 'foo'), h('p', 'bar'), h('p', 'baz')),
			original_children = Array.prototype.slice.apply(a.dom_node.childNodes)
		
		expect(original_children.length).to.equal(2)
		
		var result = update(document, a, b)
		expect(a.dom_node).to.equal(result.dom_node)
		expect(result.dom_node.childNodes.length).to.equal(3)
		expect(result.dom_node.childNodes[0]).to.equal(original_children[0])
		expect(result.dom_node.childNodes[0].textContent).to.equal('foo')
		expect(result.dom_node.childNodes[1]).to.equal(original_children[1])
		expect(result.dom_node.childNodes[1].textContent).to.equal('bar')
		expect(result.dom_node.childNodes[2].textContent).to.equal('baz')
	})
	
	it('updates child nodes with the same index when nodes don\'t have keys', function ()
	{
		var a = render(document, h('div', h('p', { className: 'foo' }))),
			b = h('div', h('p', { className: 'bar' })),
			result = update(document, a, b)
		
		expect(a.dom_node.childNodes[0].className).to.equal('bar')
		expect(result.dom_node.childNodes[0].className).to.equal('bar')
	})
	
	it('matches and updates child nodes with the same key', function ()
	{
		var a = render(document, h('div', h('p', { key: 'foo' }), h('p', { key: 'bar' }))),
			b = h('div', h('p', { key: 'bar' }), h('p', { key: 'foo' })),
			original_children = Array.prototype.slice.apply(a.dom_node.childNodes),
			result = update(document, a, b)
		
		expect(result.dom_node.childNodes[0]).to.equal(original_children[1])
		expect(result.dom_node.childNodes[1]).to.equal(original_children[0])
	})
	
	it('matches keyed child nodes when there are gaps', function ()
	{
		var a = render(document, h('div', h('p', { key: 'foo' }), h('p', { key: 'bar' }))),
			b = h('div', h('p', { key: 'foo' }), h('p', { key: 'baz' }), h('p', { key: 'bar' })),
			original_children = Array.prototype.slice.apply(a.dom_node.childNodes),
			result = update(document, a, b)
		
		expect(result.dom_node.childNodes[0]).to.equal(original_children[0])
		expect(result.dom_node.childNodes[2]).to.equal(original_children[1])
	})
	
	it('gets rid of keyed child nodes that have no match', function ()
	{
		var a = render(document, h('div', h('p', { key: 'foo' }), h('p', { key: 'bar' }))),
			b = h('div', h('p', { key: 'bar' })),
			original_children = Array.prototype.slice.apply(a.dom_node.childNodes),
			result = update(document, a, b)
		
		expect(result.dom_node.childNodes.length).to.equal(1)
		expect(result.dom_node.childNodes[0]).to.equal(original_children[1])
	})
	
	it('adds all children if new node has children and the old one doesn\'t', function ()
	{
		var a = render(document, h('div')),
			b = h('div', h('p', 'foo'), h('p', 'bar')),
			result = update(document, a, b)
		
		expect(result.dom_node).to.equal(a.dom_node)
		expect(result.dom_node.childNodes.length).to.equal(2)
	})
	
	it('removes all children if new node has no children and the old one does', function ()
	{
		var a = render(document, h('div', h('p', 'foo'), h('p', 'bar'))),
			b = h('div'),
			result = update(document, a, b)
		
		expect(result.dom_node).to.equal(a.dom_node)
		expect(result.dom_node.childNodes.length).to.equal(0)
	})
})