"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	h = require('../../baseline/vdom/h'),
	render = require('../../baseline/vdom/render'),
	watch = require('../../baseline/vdom/watch')

chai.use(sinon_chai)

var MutationObserver = function (handler)
{
	this.handler = handler
	
	this.observe = sinon.spy()
	this.disconnect = sinon.spy()
	this.takeRecords = sinon.spy()
}

describe('vdom.watch', function ()
{
	it('throws an error if trying to watch a vnode that hasn\'t been rendered', function ()
	{
		expect(function ()
		{
			var watcher = watch({ MutationObserver: MutationObserver, vnode: h() })
		}).to.throw(/Can't watch a VirtualNode that hasn't been rendered/)
	})
	
	it('starts observing when start is called', function ()
	{
		var watcher = watch(
		{
			MutationObserver: MutationObserver,
			vnode: render(document, h())
		})
		
		expect(watcher.observer.observe).to.not.have.been.called
		watcher.start()
		expect(watcher.observer.observe).to.have.been.calledOnce
	})
	
	it('stops observing and clears the queue when stop is called', function ()
	{
		var watcher = watch(
		{
			MutationObserver: MutationObserver,
			vnode: render(document, h())
		})
		
		watcher.start()
		expect(watcher.observer.disconnect).to.not.have.been.called
		expect(watcher.observer.takeRecords).to.not.have.been.called
		watcher.stop()
		expect(watcher.observer.disconnect).to.have.been.calledOnce
		expect(watcher.observer.takeRecords).to.have.been.calledOnce
	})
	
	it('handles text changes', function ()
	{
		var watcher = watch({
				MutationObserver: MutationObserver,
				vnode: render(document, h('p', 'foo')),
				onchange: sinon.spy()
			}),
			old_vnode = watcher.vnode
			
		watcher.start()
		watcher.vnode.children[0].dom_node.nodeValue = 'bar'
		watcher.observer.handler([
		{
			target: watcher.vnode.children[0].dom_node,
			type: 'characterData'
		}])
		expect(watcher.onchange).to.have.been.calledOnce
		expect(watcher.onchange).to.have.been.calledWith(old_vnode, watcher.vnode)
		expect(watcher.vnode.tag).to.equal('P')
		expect(watcher.vnode.children.length).to.equal(1)
		expect(watcher.vnode.children[0].text).to.equal('bar')
	})
	
	it('handles attribute changes', function ()
	{
		var watcher = watch({
				MutationObserver: MutationObserver,
				vnode: render(document, h('p', { className: 'foo' })),
				onchange: sinon.spy()
			}),
			old_vnode = watcher.vnode
			
		watcher.start()
		watcher.vnode.dom_node.className = 'bar'
		watcher.observer.handler([
		{
			target: watcher.vnode.dom_node,
			type: 'attributes',
			attributeName: 'class'
		}])
		expect(watcher.onchange).to.have.been.calledOnce
		expect(watcher.onchange).to.have.been.calledWith(old_vnode, watcher.vnode)
		expect(watcher.vnode.tag).to.equal('P')
		expect(watcher.vnode.children.length).to.equal(0)
		expect(watcher.vnode.properties).to.deep.equal({ attributes: { class: 'bar' } })
	})
	
	it('handles additions in child nodes', function ()
	{
		var watcher = watch({
				MutationObserver: MutationObserver,
				vnode: render(document, h('p')),
				onchange: sinon.spy()
			}),
			old_vnode = watcher.vnode
			
		watcher.start()
		watcher.vnode.dom_node.innerHTML = '<span>foo</span>'
		watcher.observer.handler([
		{
			target: watcher.vnode.dom_node,
			type: 'childList',
			removedNodes: [],
			addedNodes: [watcher.vnode.dom_node.childNodes[0]]
		}])
		watcher.observer.handler([
		{
			target: watcher.vnode.dom_node.childNodes[0],
			type: 'childList',
			removedNodes: [],
			addedNodes: [watcher.vnode.dom_node.childNodes[0].childNodes[0]]
		}])
		expect(watcher.onchange).to.have.been.called
		expect(watcher.onchange).to.have.been.calledWith(old_vnode, watcher.vnode)
		expect(watcher.vnode.tag).to.equal('P')
		expect(watcher.vnode.children.length).to.equal(1)
		expect(watcher.vnode.children[0].tag).to.equal('SPAN')
		expect(watcher.vnode.children[0].children.length).to.equal(1)
		expect(watcher.vnode.children[0].children[0].text).to.equal('foo')
	})
	
	it('handles removals in child nodes', function ()
	{
		var watcher = watch({
				MutationObserver: MutationObserver,
				vnode: render(document, h('p', h('span', 'foo'), h('span', 'bar'), h('span', 'baz'))),
				onchange: sinon.spy()
			}),
			old_vnode = watcher.vnode,
			removed_node = watcher.vnode.dom_node.childNodes[1]
			
		watcher.start()
		watcher.vnode.dom_node.removeChild(removed_node)
		watcher.observer.handler([
		{
			target: watcher.vnode.dom_node,
			type: 'childList',
			removedNodes: [removed_node],
			addedNodes: []
		}])
		expect(watcher.onchange).to.have.been.called
		expect(watcher.onchange).to.have.been.calledWith(old_vnode, watcher.vnode)
		expect(watcher.vnode.tag).to.equal('P')
		expect(watcher.vnode.children.length).to.equal(2)
		expect(watcher.vnode.children[0].tag).to.equal('SPAN')
		expect(watcher.vnode.children[0].children.length).to.equal(1)
		expect(watcher.vnode.children[0].children[0].text).to.equal('foo')
		expect(watcher.vnode.children[1].tag).to.equal('SPAN')
		expect(watcher.vnode.children[1].children.length).to.equal(1)
		expect(watcher.vnode.children[1].children[0].text).to.equal('baz')
	})
})