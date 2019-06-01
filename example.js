var  pkg  =  require("./index.js");

var jsl = new pkg.JSLProcessor();
var eq = jsl.eq;
var and = jsl.and;
var any = jsl.any;

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
		items: jsl.applyForAll( 'item', node.items)
	};
})

jsl.match(null, (x) => eq( x.a, 1), function(node){ 
	return { "case": "x.a == 1", 
		undefValue: jsl.valueOf( ()=>node.undef.property ), 
		definedVaue: jsl.valueOf( ()=>node.a ),
		position: jsl.position() };
	
});


jsl.match(null, (x) => eq( x.a, 2), function(node){ 
	return { "case" : "x.a == 2", position: jsl.position() };
});


jsl.match(null, (x) => eq( x.undef, 2), function(node){ 
	return { "case" : "x.undef == 2" };
});

jsl.match(null, (x) => eq( (x)=>x.undef.undef, 2), function(node){ 
	return { "case" : "x.undef.undef == 2" };
});

jsl.match('item-object', any, (node) => {
	return { any: node };
});

jsl.match('item-object', (x) => jsl.parent().parent().node().a === 3, (node) => {
	return { parent: 3, node: node, "case":"match by parent()" };
})

jsl.match(null, any, function(node){ 
	return { "case" : "match any node", value: " any item "+ node.a, items: jsl.applyForAll( 'item-object', node.items) };
});

var data = {
	items : [
		{ a : 1, b :2, items: [  1, 2, 3 ] },
		{ a : 1},
		{ a : 2},
		{ a : 3, items: [ 4, 5, 6] },
	]
}


//console.log( data.items.map( x => jsl.apply(null, x ) ) ); //no position info

console.log( JSON.stringify( jsl.applyForAll( null, data.items ), null, "  " )); //the same as previous

