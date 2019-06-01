
function JSLContext()
{
	this.position = 0;
	this.nodes = [];
}


function JSLProcessor()
{
	var exprs = {};
	var contextStack = [];
	var context = new JSLContext();

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
		return context.position;
	}
	this.isLast = function(){
		return context.position === context.nodes.length;
	}
	this.isFirst = function(){
		return context.position === 0;
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
		context = new JSLContext();
		context.nodes = nodes; 
		
		var result =  nodes.map( (x, idx) => { 
			context.position = idx;
			return this.apply(mode, x ); 
		});
		context = contextStack.pop();
		return result;
	};
	this.apply = function(mode, node){
		var tmpls = exprs[mode];
		var rank = 0;
		var selected = { rank : 0, method : (node)=> node };
		
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
		return selected.method(node);
	};
	this.any  = function()
	{
		return { rank: 1, result: true };
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
