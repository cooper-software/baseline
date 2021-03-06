"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	Renderer = require('../baseline/Renderer'),
	vdom = require('../baseline/vdom'),
	SimpleBlock = require('../baseline/blocks/SimpleBlock'),
	TextRegion = require('../baseline/regions/TextRegion'),
	Parser = require('../baseline/Parser')

chai.use(sinon_chai)


describe('Renderer', function ()
{
	it('has sensible defaults', function ()
	{
		var renderer = new Renderer()
		
		expect(renderer.document).to.be.undefined
		expect(renderer.container).to.be.undefined
		expect(renderer.tree).to.be.null
		expect(renderer.vdom_update).to.equal(vdom.update)
		expect(renderer.vdom_render).to.equal(vdom.render)
	})
	
	it('can be configured', function ()
	{
		var options = {
				vdom_update: sinon.spy(),
				vdom_render: sinon.spy(),
				document: document,
				container: document.createElement('div')
			},
			renderer = new Renderer(options)
		
		expect(renderer.document).to.equal(options.document)
		expect(renderer.container).to.equal(options.container)
		expect(renderer.vdom_update).to.equal(options.vdom_update)
		expect(renderer.vdom_render).to.equal(options.vdom_render)
	})
	
	it('replaces the container\'s children on first render', function ()
	{
		var renderer = new Renderer({
			document: document,
			container: document.createElement('div')
		})
		sinon.spy(renderer, 'replace')
		renderer.render([])
		expect(renderer.replace).to.have.been.calledWith([])
	})
	
	it('performs an update on all renders after the first one', function ()
	{
		var renderer = new Renderer({
			document: document,
			container: document.createElement('div')
		})
		sinon.spy(renderer, 'vdom_update')
		sinon.spy(renderer, 'vdom_render')
		renderer.render([])
		renderer.render([ new SimpleBlock({ regions: [ new TextRegion({ text: 'foo' }) ] }) ])
		
		expect(renderer.vdom_update).to.have.been.calledOnce
		expect(renderer.vdom_render).to.have.been.calledOnce
		expect(renderer.container.childNodes.length).to.equal(1)
		expect(renderer.container.childNodes)
		expect(renderer.container.childNodes[0].tagName).to.equal('P')
		expect(renderer.container.childNodes[0].childNodes.length).to.equal(1)
		expect(renderer.container.childNodes[0].childNodes[0].data).to.equal('foo')
	})
	
	it('watches block-level vnodes for changes', function ()
	{
		var onchange = sinon.spy(),
			renderer = new Renderer({
				document: document,
				container: document.createElement('div'),
				onblockchange: onchange,
				parser: new Parser()
			})
		renderer.render([ new SimpleBlock({ regions: [ new TextRegion({ text: 'foo' }) ] }), new SimpleBlock({ regions: [ new TextRegion({ text: 'bar' }) ] }) ])
		
		expect(renderer.tree.children.length).to.equal(2)
		expect(renderer.tree.children[1].vnode.watcher).to.not.be.undefined
		expect(renderer.tree.children[1].vnode.children[0].text).to.equal('bar')
		
		renderer.tree.children[1].vnode.children[0].dom_node.nodeValue = 'baz'
		renderer.tree.children[1].vnode.watcher.onmutation([])
		
		expect(renderer.tree.children[1].vnode.children[0].text).to.equal('baz')
		expect(onchange).to.have.been.called
		expect(onchange.args[0][0]).to.equal(1)
		expect(onchange.args[0][1].regions.length).to.equal(1)
		expect(onchange.args[0][1].regions[0].text).to.equal('baz')
	})
})