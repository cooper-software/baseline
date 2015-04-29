"use strict"

var expect = require('chai').expect,
	List = require('../baseline/List')
	
	
describe('List', function ()
{
	it('has a non-destructive insert method', function ()
	{
		var list1 = List([1,2,3]),
			list2 = list1.insert(1, 55)
		
		expect(list1).to.deep.equal([1,2,3])
		expect(list2).to.deep.equal([1,55,2,3])
	})
	
	it('has a non-destructive replace method', function ()
	{
		var list1 = List([1,2,3]),
			list2 = list1.replace(1, 55)
		
		expect(list1).to.deep.equal([1,2,3])
		expect(list2).to.deep.equal([1,55,3])
	})
	
	it('has a non-destructive remove method', function ()
	{
		var list1 = List([1,2,3]),
			list2 = list1.remove(1)
		
		expect(list1).to.deep.equal([1,2,3])
		expect(list2).to.deep.equal([1,3])
	})
	
	it('has a non-destructive append method', function ()
	{
		var list1 = List([1,2,3]),
			list2 = list1.append(4)
		
		expect(list1).to.deep.equal([1,2,3])
		expect(list2).to.deep.equal([1,2,3,4])
	})
})