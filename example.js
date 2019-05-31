var  pkg  =  require("./index.js");

var jsl = new pkg.JSLProcessor();
var eq = jsl.eq;
var and = jsl.and;
var any = jsl.any;

jsl.match('item', (x) => eq( x, 1), (node) => 'item'+node);
jsl.match('item', any, (node) => 'any'+node);


jsl.match(null, (x) => and( eq( x.a, 1), eq(x.b, 2) ), (node) => {
	return "this is A=1, B=2 " + node.a + ' items:' + node.items.map( x => jsl.apply('item', x ) );
})

jsl.match(null, (x) => eq( x.a, 1), function(node){ 
	return "this is A=1 undef:"  + jsl.valueOf( ()=>node.undef.property ) + " def:" + jsl.valueOf( ()=>node.a );
	
});


jsl.match(null, (x) => eq( x.a, 2), function(node){ 
	return "this is A=2";
});


jsl.match(null, (x) => eq( x.undef, 2), function(node){ 
	return "this is A=2";
});

jsl.match(null, (x) => eq( (x)=>x.undef.undef, 2), function(node){ 
	return "this is A=2";
});

var data = {
	items : [
		{ a : 1, b :2, items: [  1, 2, 3 ] },
		{ a : 1},
	]
}


console.log( data.items.map( x => jsl.apply(null, x ) ) );
console.log( jsl.applyForAll( null, data.items ) ); //the same as previous

