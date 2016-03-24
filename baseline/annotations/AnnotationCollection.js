'use strict'

var Model = require('../Model')

var AnnotationTreeNode = Model(
{
  annotation: null,
  children: []
})


module.exports = Model(
{
  annotations: [],
  tree: null,
  
  empty: function ()
  {
    return this.annotations.length == 0
  },
  
  add: function (ann)
  {
    return this.set(this.annotations.concat([ann]))
  },
  
  set: function (annotations)
  {
    if (annotations.length == 0)
    {
      if (this.annotations.length != 0)
      {
        return this.update({
          annotations: [],
          tree: new AnnotationTreeNode()
        })
      }
      else
      {
        return this
      }
    }
    
    var annotations = sort_annotations(annotations)
    var tree = build_tree(annotations)
    
    return this.update({
      annotations: annotations_from_tree(tree),
      tree: tree
    })
  },
  
  concat: function (annotations)
  {
    return this.set(this.annotations.concat(annotations))
  },
  
  each: function (fn)
  {
    return this.annotations.forEach(fn)
  },
  
  map: function (fn)
  {
    return this.annotations.map(fn)
  },
  
  filter: function (fn)
  {
    return this.annotations.filter(fn)
  },
  
  in_range: function (start, end)
  {
    var length = end - start
    var matches = []
    this.annotations.every(function (ann)
    {
      if (ann.overlaps(start, length))
      {
        matches.push(ann)
        return true
      }
    })
    return matches
  },
  
  remove: function (start, end)
  {
    var new_annotations = []
    var length = end - start
    
    this.annotations.forEach(function (ann)
    {
      if (ann.overlaps(start, length))
      {
        if (start <= ann.offset && end >= ann.end())
        {
          return
        }
        
        var new_offset = ann.offset
        var new_length = ann.length
        
        if (ann.offset < start)
        {
          if (ann.end() > end)
          {
            new_length = ann.length - length
          }
          else
          {
            new_length = start - ann.offset
          }
        }
        else
        {
          new_offset = start
          new_length = ann.end() - start
        }
        
        new_annotations.push(
          ann.update({
            offset: new_offset,
            length: new_length
          })
        )
      }
      else if (ann.offset > start)
      {
        new_annotations.push(
          ann.update({
            offset: ann.offset - length
          })
        )
      }
    })
    
    return this.set(new_annotations)
  },
  
  clear: function (start, end, prototype)
  {
    var new_annotations = []
    var length = end - start
    
    this.annotations.forEach(function (ann)
    {
      if (prototype && !Model.equals(ann, prototype, ['type']))
      {
        new_annotations.push(ann)
        return
      }
      
      var ann_start = ann.offset
      var ann_end = ann.end()
      
      if (ann_end <= start)
      {
        new_annotations.push(ann)
      }
      else if (ann_start >= end)
      {
        new_annotations.push(ann)
      }
      else
      {
        if (ann_start <= start)
        {
          var new_ann = ann.update(
          {
            offset: ann_start,
            length: start - ann_start
          })
          
          if (new_ann.length > 0)
          {
            new_annotations.push(new_ann)
          }
        }
        
        if (ann_end >= end)
        {
          var new_ann = ann.update(
          {
            offset: end,
            length: ann_end - end
          })
          
          if (new_ann.length > 0)
          {
            new_annotations.push(new_ann)
          }
        }
      }
    })
    
    return this.set(new_annotations)
  },
  
  has_contiguous_condition: function (start, end, has_condition)
  {
    var ann_start = -1
    var ann_end = -1
    var has_gap = false
    var annotations = this.annotations
    
    for (var i=0; i<annotations.length; i++)
    {
      var ann = annotations[i]
      
      if (!ann.overlaps(start, end-start))
      {
        continue
      }
      
      if (has_condition(ann))
      {
        if (ann_start < 0)
        {
          if (ann.offset > start)
          {
            return false
          }
          else
          {
            ann_start = ann.offset
            ann_end = ann.end()
          }
        }
        else
        {
          if (ann.offset > ann_end)
          {
            return false
          }
          else
          {
            ann_end = ann.end()
          }
        }
      }
    }
    
    if (ann_start < 0 || ann_start > start || ann_end < end)
    {
      return false
    }
    else
    {
      return true
    }
  },
  
  to_array: function ()
  {
    return this.annotations
  }
})

function sort_annotations (annotations)
{
  return annotations.slice(0).sort(compare_annotations)
}

function compare_annotations (a, b)
{
  var rank_cmp = a.type.rank - b.type.rank
  if (rank_cmp == 0)
  {
    return a.offset - b.offset
  }
  else
  {
    return rank_cmp
  }
}

function build_tree(annotations)
{
  return build_tree_from_actions(get_actions(annotations))
}

function get_actions (annotations)
{
  var actions = []
  annotations.reverse().forEach(function (ann)
  {
    var start = ann.offset
    var end = ann.end()
    var should_include = true
    
    annotations.forEach(function (x)
    {
      if (ann == x)
      {
        return
      }
      
      if (ann.overlaps(x))
      {
        if (ann.is_similar(x))
        {
          if (ann.end() > x.end())
          {
            x.length = ann.end() - x.offset
            should_include = false
          }
          else if (x.contains(ann))
          {
            should_include = false
          }
        }
        else if (x.type.rank > ann.type.rank)
        {
          var x_start = x.offset
          var x_end = x.end()
          
          if (start < x_end && x_start < start)
          {
            actions.push({ type: 'CLOSE', pos: start, annotation: x })
            actions.push({ type: 'OPEN', pos: start, annotation: x })
          }
          
          if (x.offset < end && x.offset + x.length > end)
          {
            actions.push({ type: 'CLOSE', pos: end, annotation: x })
            actions.push({ type: 'OPEN', pos: end, annotation: x })
          }
        }
      }
    }.bind(this))
    
    if (should_include)
    {
      actions.push({ type: 'OPEN', pos: start, annotation: ann })
      actions.push({ type: 'CLOSE', pos: end, annotation:ann })
    }
  })
  
  var seen = {}
  
  return actions.filter(function (x)
  {
    if (!seen[x.pos])
    {
      seen[x.pos] = {}
      seen[x.pos][x.annotation.type.tag] = {}
      seen[x.pos][x.annotation.type.tag][x.type] = 1
      return true
    }
    
    if (!seen[x.pos][x.type.tag])
    {
      seen[x.pos][x.annotation.type.tag] = {}
      seen[x.pos][x.annotation.type.tag][x.type] = 1
      return true
    }
    
    if (seen[x.pos][x.annotation.type.tag][x.type] === undefined)
    {
      seen[x.pos][x.annotation.type.tag][x.type] = 1
      return true
    }
    
    return !seen[x.pos][x.annotation.type.tag][x.type]
  }).sort(compare_actions)
}

function build_tree_from_actions(actions)
{
  var root = new AnnotationTreeNode({ annotation: null, children: [] })
  var current = root
  var stack = [current]
  
  var process_action = function (action)
  {
    if (action.type == 'OPEN')
    {
      open(action)
    }
    else
    {
      close(action)
    }
  }
  
  var open = function (action)
  {
    if (current.annotation && 
        current.annotation.overlaps(action.annotation) && 
        Model.equals(current.annotation, action.annotation, ['type']))
    {
      if (action.annotation.end() > current.annotation.end())
      {
        current.annotation.length = action.annotation.end() - current.annotation.offset
        stack.push(null)
      }
    }
    else
    {
      var node = new AnnotationTreeNode({
        annotation: action.annotation.update({
          offset: action.pos,
          length: 0
        }),
        children: []
      })
      current.children.push(node)
      current = node
      stack.push(current)
    }
  }
  
  var close = function (action)
  {
    var last = stack.pop()
    if (last)
    {
      last.annotation.length = action.pos - last.annotation.offset
    }
    current = stack[stack.length-1]
  }
  
  actions.forEach(process_action)
  
  return root
}

function compare_actions (a, b)
{
  var cmp_pos = a.pos - b.pos
  
  if (a.type == b.type)
  {
    var cmp_rank = a.annotation.type.rank - b.annotation.type.rank
    if (a.type == 'OPEN')
    {
      return cmp_pos == 0 ? cmp_rank : cmp_pos
    }
    else
    {
      return cmp_pos == 0 ? -1 * cmp_rank : cmp_pos
    }
  }
  else
  {
    if (cmp_pos == 0)
    {
      return a.type == 'OPEN' ? 1 : -1
    }
    else
    {
      return cmp_pos
    }
  }
}

function annotations_from_tree (tree)
{
  var annotations = []
  _annotations_from_tree(annotations, tree)
  return annotations
}

function _annotations_from_tree(annotations, tree)
{
  if (tree.annotation)
  {
    annotations.push(tree.annotation)
  }
  
  tree.children.forEach(_annotations_from_tree.bind(null, annotations))
}