
function JSLContext(parent, nodes, position, name)
{
	const _parent = parent;
	const _nodes = nodes;
	const _position = position;
	const _name = name;
	
	this.nodes = function(){
		return _nodes;
	}
	this.node = function(){
		return _nodes;
	}
	this.name = function(){
		return _name;
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
	this.node = function() {
		return context.node();
	}
	this.name = function() {
		return context.name();
	}
	
	this.match = function(mode=null, expr, method)
	{	
		if ( arguments.length === 2) {
			expr = arguments['0'];
			method = arguments['1'];
			mode = null;
		}
		
		if ( exprs[mode] === undefined ) {
			 exprs[mode] = [];
		}
		exprs[mode].push( { expr: expr, method: method } );
	};

	this.apply = function( mode, nodes ) {
		if ( arguments.length === 1) {
			nodes = arguments[0];
			mode = null;
		}
		contextStack.push(context);
		context = new JSLContext(context, nodes);
		if ( Array.isArray(nodes) ) {
			var result =  nodes.map( (x, idx) => { 
				var rc =  this.applyForNode(mode, x, idx ); 
				return rc;
			});
		}
		else if ( nodes && typeof nodes === 'object' && nodes.constructor === Object ) {
			var result = {};
			var idx = 0;
			for( var name in nodes ) {
				++idx;
				result[name] = this.applyForNode(mode, nodes[name], idx, name); 
			}
		}
		context = contextStack.pop();
		return result;
	};
	this.applyForNode = function(mode, node, idx=0, name='object'){
		contextStack.push(context);
		context = new JSLContext(context, node, idx, name);
	
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
