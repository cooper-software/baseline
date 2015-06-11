"use strict"

var expect = require('chai').expect,
	model = require('../../baseline/vdom/model')

describe('vdom.model', function ()
{
	it('has method for accessing properties that may have been set as attributes', function ()
	{
		var velem = new model.VirtualElement({
			properties: {
				attributes: {
					class: 'foo'
				}
			}
		})
		expect(velem.prop('className')).to.equal('foo')
	})
})