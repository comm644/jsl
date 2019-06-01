var  pkg  =  require("./index.js");

var jsl = new pkg.JSLProcessor();
var [ eq,     and,     any,     parent] = 
    [ jsl.eq, jsl.and, jsl.any, jsl.parent];

jsl.match('item', (x) => eq( x, 1), (node) => { 
	return { 
		"case": "match by value", 
		item: node, 
		"index": jsl.position(), 
		isLast:jsl.isLast(), 
		isFirst: jsl.isFirst() }; 
});

jsl.match('item', (x) => jsl.position() === 2, (node) => {
	return { "case": "match by position()", value: node };
})

jsl.match('item', (x) => jsl.parent().parent().node().a === 3, (node) => {
	return { "case": "match by value of parent() ", value: node };
})


jsl.match('item', any, (node) => { 
	return { "case:" : "match any node",  value: node, index: jsl.position() }; });


jsl.match(null, (x) => and( eq( x.a, 1), eq(x.b, 2) ), (node) => {
	return { "case": "x.a == 1 && x.b == 2  - match stronger condition", 
		undefValue: jsl.valueOf( ()=>node.undef.property ), 
		definedVaue: jsl.valueOf( ()=>node.a ),
		position: jsl.position(),
		items: jsl.apply( 'item', node.items)
	};
})

jsl.match( (x) => eq( x.a, 1), function(node){ 
	return { "case": "x.a == 1", 
		undefValue: jsl.valueOf( ()=>node.undef.property ), 
		definedVaue: jsl.valueOf( ()=>node.a ),
		position: jsl.position() };
	
});
jsl.match('show-value', any, node => {
	return { 
		'case': 'process object member, , mode=show-value',
		'name': jsl.name(),
		'position': jsl.position(),
		'value': node };
		
});

jsl.match( (x) => jsl.node().a === 4, function(node){ 
	return { "case" : "match via node(), mode=null", value: node, values: jsl.apply( 'show-value', node ) };
});

jsl.match( (x) => eq( x.a, 2), function(node){ 
	return { "case" : "match via eq() ", position: jsl.position() };
});


jsl.match( (x) => eq( x.undef, 2), function(node){ 
	return { "case" : "x.undef == 2" };
});

jsl.match( (x) => eq( (x)=>x.undef.undef, 2), function(node){ 
	return { "case" : "x.undef.undef == 2" };
});

jsl.match('item-object', any, (node) => {
	return { "case": "match any, mode=item-object", any: jsl.node() };
});

jsl.match('item-object', (x) => jsl.parent().parent().node().a === 3, (node) => {
	return { parent: 3, node: node, "case":"match by parent()" };
})

jsl.match( (x) => jsl.name() == 'items', node => {
	return { "case" : "match by name(), mode=null", 
		items: jsl.apply( node) 
	};
	
});

jsl.match( 'param', node => {
	return { "case" : "match by nodeName", 
		value: jsl.apply( node ) 
	};
	
});
jsl.match( (node) =>  (/boolean|number|string/).test(typeof node), function(node){ 
	return node;
});

jsl.match( any, function(node){ 
	return { "case" : "match any node, mode=null", 
		node: node, 
		items: jsl.apply( 'item-object', node.items) 
	};
});

var data = {
	items : [
		{ a : 1, b :2, items: [  1, 2, 3 ] },
		{ a : 1},
		{ a : 2},
		{ a : 3, items: [ 4, 5, 6] },
		{ a : 4, c: 5, d: "value"},
	],
	param: 'value'
		
	
}


console.log( JSON.stringify( jsl.apply( data ), null, "  " )); //the same as previous


/**
Result:

{
  "items": {
    "case": "match by name(), mode=null",
    "items": [
      {
        "case": "x.a == 1 && x.b == 2  - match stronger condition",
        "definedVaue": 1,
        "position": 0,
        "items": [
          {
            "case": "match by value",
            "item": 1,
            "index": 0,
            "isLast": false,
            "isFirst": true
          },
          {
            "case:": "match any node",
            "value": 2,
            "index": 1
          },
          {
            "case": "match by position()",
            "value": 3
          }
        ]
      },
      {
        "case": "x.a == 1",
        "definedVaue": 1,
        "position": 1
      },
      {
        "case": "match via eq() ",
        "position": 2
      },
      {
        "case": "match any node, mode=null",
        "node": {
          "a": 3,
          "items": [
            4,
            5,
            6
          ]
        },
        "items": [
          {
            "parent": 3,
            "node": 4,
            "case": "match by parent()"
          },
          {
            "parent": 3,
            "node": 5,
            "case": "match by parent()"
          },
          {
            "parent": 3,
            "node": 6,
            "case": "match by parent()"
          }
        ]
      },
      {
        "case": "match via node(), mode=null",
        "value": {
          "a": 4,
          "c": 5,
          "d": "value"
        },
        "values": {
          "a": {
            "case": "process object member, , mode=show-value",
            "name": "a",
            "position": 1,
            "value": 4
          },
          "c": {
            "case": "process object member, , mode=show-value",
            "name": "c",
            "position": 2,
            "value": 5
          },
          "d": {
            "case": "process object member, , mode=show-value",
            "name": "d",
            "position": 3,
            "value": "value"
          }
        }
      }
    ]
  },
  "param": {
    "case": "match by nodeName",
    "value": "value"
  }
}

*/

