
function JSLContext(parent, nodes, position)
{
	const _parent = parent;
	const _nodes = nodes;
	const _position = position;
	
	this.nodes = function(){
		return _nodes;
	}
	this.node = function(){
		return _nodes;
	}
	this.parent = function(){
		return _parent;
	}
	this.position = function(){
		return _position;
	}
	this.isLast = function(){
		return _position === _nodes.length;
	}
	this.isFirst = function(){
		return _position === 0;
	}
	this.toString = function(){
		return JSON.stringify({ position: position, nodes: nodes});
	}
	
}


function JSLProcessor()
{
	var exprs = {};
	var contextStack = [];
	var context = new JSLContext(null, null, 0);

	this.valueOf = function( x ) {
		if ( typeof( x ) !== "function" ) return x;
		
		try{
			return x();
		}
		catch{
			return undefined;			
		}
	};
	var valueOf = this.valueOf;
	
	this.position = function(){
		return context.position();
	}
	this.isLast = function(){
		return context.isLast();
	}
	this.isFirst = function(){
		return context.isFirst();
	}
	this.parent = function() {
		return context.parent();
	}
	
	this.match = function(mode, expr, method)
	{	
		if ( exprs[mode] === undefined ) {
			 exprs[mode] = [];
		}
		exprs[mode].push( { expr: expr, method: method } );
	};

	this.applyForAll = function( mode, nodes ) {
		contextStack.push(context);
		context = new JSLContext(context, nodes);
		
		var result =  nodes.map( (x, idx) => { 
			var rc =  this.apply(mode, x, idx ); 
			return rc;
		});
		context = contextStack.pop();
		return result;
	};
	this.apply = function(mode, node, idx=0){
		contextStack.push(context);
		context = new JSLContext(context, node, idx);
	
		var tmpls = exprs[mode];
		var rank = -1;
		var selected = { rank : -1, method : (node)=> node };
		
		for( var i in tmpls ) {
			var current = tmpls[i];
			
			var expr = current.expr(node);
			if ( typeof(expr) === "boolean" ) {
				expr = { result : expr, rank : 1 };
			}
			
			if ( !expr.result )  continue;
			if  (expr.rank <= rank ) continue;
			rank = expr.rank;
			selected = current;
		}
		var result  = selected.method(node);
		context = contextStack.pop();
		return result;
	};
	this.any  = function()
	{
		return { rank: 0, result: true };
	};
	this.eq  = function(x, y)
	{
		return { rank: 1, result: valueOf(x) === valueOf(y) };
	};
	this.neq  = function(x, y)
	{
		return { rank: 1, result: valueOf(x) !== valueOf(y) };
	};
	this.and = function(...args){
		var rank = 1;
		var rc = true;
		for( var i in args ) {
			var arg = args[i];
			rank+= arg.rank; 
			rc = rc && arg.result; 
		}
		return { rank: rank, result : rc }
	};
	this.or = function(...args){
		var rank = 1;
		var rc = false;
		for( var i in args ) {
			var arg = args[i];
			rank+= arg.rank; 
			rc = rc || arg.result; 
		}
		return { rank: rank, result : rc }
	};
}

exports.JSLProcessor = JSLProcessor;
