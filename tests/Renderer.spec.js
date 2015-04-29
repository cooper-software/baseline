"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	document = require('min-document'),
	Renderer = require('../baseline/Renderer'),
	vtree_diff = require('virtual-dom/diff'),
	vdom_patch = require('virtual-dom/patch'),
	vdom_create = require('virtual-dom/create-element'),
	SimpleBlock = require('../baseline/blocks/SimpleBlock'),
	TextRegion = require('../baseline/blocks/TextRegion')

chai.use(sinon_chai)


describe('Renderer', function ()
{
	it('has sensible defaults', function ()
	{
		var renderer = new Renderer()
		
		expect(renderer.document).to.be.undefined
		expect(renderer.container).to.be.undefined
		expect(renderer.tree).to.be.null
		expect(renderer.vtree_diff).to.equal(vtree_diff)
		expect(renderer.vdom_patch).to.equal(vdom_patch)
		expect(renderer.vdom_create).to.equal(vdom_create)
	})
	
	it('can be configured', function ()
	{
		var options = {
				vtree_diff: sinon.spy(),
				vdom_patch: sinon.spy(),
				vdom_create: sinon.spy(),
				document: document,
				container: document.createElement('div')
			},
			renderer = new Renderer(options)
		
		expect(renderer.document).to.equal(options.document)
		expect(renderer.container).to.equal(options.container)
		expect(renderer.vtree_diff).to.equal(options.vtree_diff)
		expect(renderer.vdom_patch).to.equal(options.vdom_patch)
		expect(renderer.vdom_create).to.equal(options.vdom_create)
	})
	
	it('replaces the container\'s children on first render', function ()
	{
		var renderer = new Renderer({
			document: document,
			container: document.createElement('div')
		})
		renderer.replace = sinon.spy()
		renderer.render([])
		expect(renderer.replace).to.have.been.calledWith([])
	})
	
	it('performs a patch on all renders after the first one', function ()
	{
		var renderer = new Renderer({
			document: document,
			container: document.createElement('div')
		})
		sinon.spy(renderer, 'vtree_diff')
		sinon.spy(renderer, 'vdom_patch')
		renderer.render([])
		renderer.render([ new SimpleBlock({ regions: [ new TextRegion({ text: 'foo' }) ] }) ])
		
		expect(renderer.vtree_diff).to.have.been.calledOnce
		expect(renderer.vdom_patch).to.have.been.calledOnce
		// min-document inserts an empty node when appending a document 
		// fragment as happens in replace() so we have two children
		// instead of the expected 1
		expect(renderer.container.childNodes.length).to.equal(2)
		expect(renderer.container.childNodes)
		expect(renderer.container.childNodes[1].tagName).to.equal('P')
		expect(renderer.container.childNodes[1].childNodes.length).to.equal(1)
		expect(renderer.container.childNodes[1].childNodes[0].data).to.equal('foo')
	})
})