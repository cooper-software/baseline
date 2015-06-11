"use strict"

if (typeof window == "undefined")
{
	var MutationObserver = function ()
	{
		this.observe = function (){}
		this.disconnect = function (){}
		this.takeRecords = function (){}
	}
}
else
{
	MutationObserver = window.MutationObserver || 
							window.WebKitMutationObserver || 
							window.MozMutationObserver
}

var parse = require('./parse')

var Watcher = function (options)
{
	if (!options.vnode.dom_node)
	{
		throw new Error("Can't watch a VirtualNode that hasn't been rendered")
	}
	
	this.vnode = options.vnode
	this.onchange = options.onchange
	this.observer = new (options.MutationObserver||MutationObserver)(this.onmutation.bind(this))
}

Watcher.prototype.start = function ()
{
	this.observer.observe(
		this.vnode.dom_node,
		{
			childList: true,
			attributes: true,
			characterData: true,
			subtree: true
		}
	)
}

Watcher.prototype.stop = function ()
{
	this.observer.disconnect()
	this.observer.takeRecords()
}

Watcher.prototype.onmutation = function (mutations)
{
	var old_vnode = this.vnode
		
	for (var i=0; i<mutations.length; i++)
	{
		if (mutations[i].type == 'childList')
		{
			this.vnode = parse(old_vnode.dom_node, true)
			this.onchange(old_vnode, this.vnode)
			return
		}
	}
	
	var new_vnode = old_vnode
	
	mutations.forEach(function (mutation)
	{
		var path = this.get_path(mutation.target)
		
		if (path == null)
		{
			return
		}
		
		new_vnode = this.mutate(
			this.vnode,
			path,
			mutation,
			this['mutate_'+mutation.type]
		)
	}.bind(this))
	this.vnode = new_vnode
	this.onchange(old_vnode, new_vnode)
}

Watcher.prototype.mutate_attributes = function (mutation, vnode)
{
	var new_properties = {},
		prop_name = property_to_attribute(mutation.attributeName)
	
	Object.keys(vnode.properties).forEach(function (k)
	{
		if (k == 'attributes')
		{
			new_properties.attributes = {}
			Object.keys(vnode.properties.attributes).forEach(function (l)
			{
				new_properties.attributes[l] = vnode.properties.attributes[l]
			})
		}
		else if (k != prop_name)
		{
			new_properties[k] = vnode.properties[k]
		}
	})
	
	var value = mutation.target.getAttribute(mutation.attributeName)
		
	if (new_properties[prop_name] != undefined)
	{
		new_properties[prop_name] = value
	}
	else
	{
		if (!new_properties.attributes)
		{
			new_properties.attributes = {}
		}
		new_properties.attributes[mutation.attributeName] = value
	}
	
	return vnode.update({ properties: new_properties })
}

Watcher.prototype.mutate_childList = function (mutation, vnode)
{
	if (mutation.removedNodes.length > 0)
	{
		var removed_node = mutation.removedNodes[0]
		return vnode.update(
		{
			children: vnode.children.filter(function (child)
			{
				return child.dom_node != removed_node
			})
		})
	}
	else if (mutation.addedNodes.length > 0)
	{
		var new_children = []
		for (var i=0; i<mutation.addedNodes.length; i++)
		{
			var child = parse(mutation.addedNodes[i], true)
			if (child)
			{
				new_children.push(child)
			}
		}
		
		if (new_children.length > 0)
		{
			if (!mutation.previousSibling)
			{
				return vnode.update(
				{
					children: new_children.concat(vnode.children)
				})
			}
			else if (!mutation.nextSibling)
			{
				return vnode.update(
				{
					children: vnode.children.concat(new_children)
				}) 
			}
			else
			{
				for (var i=0; i<vnode.children.length; i++)
				{
					if (vnode.children[i].dom_node == mutation.previousSibling)
					{
						return vnode.update(
						{
							children: vnode.children
										.slice(0, i)
										.concat(new_children)
										.concat(vnode.children.slice(i))
						})
					}
				}
			}
		}
	}
}

Watcher.prototype.mutate_characterData = function (mutation, vnode)
{
	return vnode.update({ text: mutation.target.nodeValue })
}

Watcher.prototype.mutate = function (vnode, path, mutation, mutation_handler)
{
	if (path.length == 0)
	{
		return mutation_handler(mutation, vnode)
	}
	else
	{
		var index = path[0]
		return vnode.update({
			children: vnode.children
						.slice(0, index)
						.concat([ this.mutate(vnode.children[index], path.slice(1), mutation, mutation_handler) ])
						.concat(vnode.children.slice(index+1))
		})
	}
}

Watcher.prototype.get_path = function (target)
{
	var root = this.vnode.dom_node,
		current = target,
		node_path = []
	
	while (current.parentNode && current != root)
	{
		node_path.push(current)
		current = current.parentNode
	}
	
	if (node_path.length == 0)
	{
		return []
	}
	
	var vnode_path = [],
		current_vnode = this.vnode
	
	node_path.reverse().forEach(function (dom_node)
	{
		for (var i=0; i<current_vnode.children.length; i++)
		{
			if (current_vnode.children[i].dom_node == dom_node)
			{
				vnode_path.push(i)
				current_vnode = current_vnode.children[i]
				return
			}
		}
	})
	
	if (vnode_path.length != node_path.length)
	{
		return null
	}
	
	return vnode_path
}

var abnormal_property_name_mappings = 
{
  acceptcharset: 'acceptCharset',
  accesskey: 'accessKey',
  bgcolor: 'bgColor',
  cellindex: 'cellIndex',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  choff: 'chOff',
  class: 'className',
  codebase: 'codeBase',
  codetype: 'codeType',
  colspan: 'colSpan',
  datetime: 'dateTime',
  checked: 'defaultChecked',
  selected: 'defaultSelected',
  value: 'defaultValue',
  frameborder: 'frameBorder',
  httpequiv: 'httpEquiv',
  longdesc: 'longDesc',
  marginheight: 'marginHeight',
  marginwidth: 'marginWidth',
  maxlength: 'maxLength',
  nohref: 'noHref',
  noresize: 'noResize',
  noshade: 'noShade',
  nowrap: 'noWrap',
  readonly: 'readOnly',
  rowindex: 'rowIndex',
  rowspan: 'rowSpan',
  sectionrowindex: 'sectionRowIndex',
  selectedindex: 'selectedIndex',
  tabindex: 'tabIndex',
  tbodies: 'tBodies',
  tfoot: 'tFoot',
  thead: 'tHead',
  url: 'URL',
  usemap: 'useMap',
  valign: 'vAlign',
  valuetype: 'valueType'
}

function property_to_attribute(name)
{
	var prop_name = abnormal_property_name_mappings[name]
	if (prop_name)
	{
		return prop_name
	}
	else
	{
		return to_camelcase(name)
	}
}

function to_camelcase (name)
{
	return name.replace(/-([a-z])/gi, function (all, letter)
	{
        return letter.toUpperCase()
    })
}

module.exports = function (options)
{
	return new Watcher(options)
}