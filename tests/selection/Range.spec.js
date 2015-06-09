"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	Model = require('../../baseline/Model'),
	Range = require('../../baseline/selection/Range'),
	Point = require('../../baseline/selection/Point'),
	DomPoint = require('../../baseline/selection/DomPoint'),
	SimpleBlock = require('../../baseline/blocks/SimpleBlock'),
	TextRegion = require('../../baseline/blocks/TextRegion'),
	Document = require('../../baseline/Document')
	
chai.use(sinon_chai)
	
describe("selection.Range", function ()
{
	it('maps an empty selection to null', function ()
	{
		var result = Range.get_from_window({ getSelection: function () { return {} } }, {}, {})
		expect(result).to.be.null
	})
	
	it('can map a dom selection to a range', function ()
	{
		var container = document.createElement('div')
		;['foo', 'bar'].forEach(function (text)
		{
			var p = document.createElement('p')
			p.appendChild(document.createTextNode(text))
			container.appendChild(p)
		})
		
		var doc = {
				blocks: [
					new SimpleBlock({ regions: [ new TextRegion({ text: 'foo' }) ] }),
					new SimpleBlock({ regions: [ new TextRegion({ text: 'bar' }) ] }),
					new SimpleBlock({ regions: [ new TextRegion({ text: 'baz' }) ] })
				]
			},
			win = {
				getSelection: function ()
				{
					return {
						anchorNode: container.childNodes[0].childNodes[0],
						anchorOffset: 2,
						focusNode: container.childNodes[1].childNodes[0],
						focusOffset: 1
					}
				}
			},
			range = Range.get_from_window(win, container, doc)
		
		expect(range.start.block).to.equal(0)
		expect(range.start.region).to.equal(0)
		expect(range.start.offset).to.equal(2)
		expect(range.end.block).to.equal(1)
		expect(range.end.region).to.equal(0)
		expect(range.end.offset).to.equal(1)
	})

	it('can map a dom selection to a range when there are annotations', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p>foo</p><p>b<b>aaaar</b> <b>quux</b></p><p>baz</p>'
		
		var doc = {
				blocks: [
					new SimpleBlock({ regions: [ new TextRegion({ text: 'foo' }) ] }),
					new SimpleBlock({ regions: [ new TextRegion({ text: 'baaaar quux' }) ] }),
					new SimpleBlock({ regions: [ new TextRegion({ text: 'baz' }) ] })
				]
			},
			win = {
				getSelection: function ()
				{
					return {
						anchorNode: container.childNodes[0].childNodes[0],
						anchorOffset: 1,
						focusNode: container.childNodes[2].childNodes[0],
						focusOffset: 1
					}
				}
			},
			range = Range.get_from_window(win, container, doc)
		
		expect(range.start.block).to.equal(0)
		expect(range.start.region).to.equal(0)
		expect(range.start.offset).to.equal(1)
		expect(range.end.block).to.equal(2)
		expect(range.end.region).to.equal(0)
		expect(range.end.offset).to.equal(1)
	})
	
	it('does nothing when attempting to set a selection that doesn\'t exist in the baseline model', function ()
	{
		var doc = new Document(),
			range = new Range({
				start: new Point(),
				end: new Point()
			})
		
		window.addRange = sinon.spy()
		range.set_in_window(window, {}, doc)
		expect(window.addRange).to.not.have.been.called
	})
	
	it('does nothing when attempting to set a selection that doesn\'t exist in the DOM', function ()
	{
		var doc = new Document(
			{
				blocks: [
					new SimpleBlock({ regions: [ new TextRegion({ text: 'Foo bar baz' }) ] })
				]
			}),
			range = new Range({
				start: new Point({ offset: 4 }),
				end: new Point({ offset: 7 })
			})
		
		window.addRange = sinon.spy()
		range.set_in_window(window, document.createElement('div'), doc)
		expect(window.addRange).to.not.have.been.called
	})
	
	it('can set the window\'s range', function ()
	{
		var doc = new Document(
			{
				blocks: [
					new SimpleBlock({ regions: [ new TextRegion({ text: 'Foo bar baz' }) ] })
				]
			}),
			range = new Range({
				start: new Point({ offset: 4 }),
				end: new Point({ offset: 7 })
			}),
			window_range = {
				setStart: sinon.spy(),
				setEnd: sinon.spy()
			},
			window_selection = {
				removeAllRanges: sinon.spy(),
				addRange: sinon.spy()
			},
			container = document.createElement('div')
			
		container.innerHTML = '<p>Foo bar baz</p>'
		
		window.document.createRange = sinon.stub().returns(window_range)
		window.getSelection = sinon.stub().returns(window_selection)
		range.set_in_window(window, container, doc)
		
		expect(window.document.createRange).to.have.been.calledOnce
		expect(window_range.setStart).to.have.been.calledOnce
		expect(window_range.setStart.args[0][0].nodeValue).to.equal(container.childNodes[0].childNodes[0].nodeValue)
		expect(window_range.setStart.args[0][1]).to.equal(4)
		expect(window_range.setEnd).to.have.been.called
		expect(window_range.setEnd.args[0][0].nodeValue).to.equal(container.childNodes[0].childNodes[0].nodeValue)
		expect(window_range.setEnd.args[0][1]).to.equal(7)
		expect(window.getSelection).to.have.been.calledOnce
		expect(window_selection.removeAllRanges).to.have.been.calledOnce
		expect(window_selection.addRange).to.have.been.calledOnce
		expect(window_selection.addRange).to.have.been.calledWith(window_range)
	})
})