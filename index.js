

function JSLProcessor()
{
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
	
	var exprs = {};
	this.match = function(mode, expr, method)
	{	
		if ( exprs[mode] === undefined ) {
			 exprs[mode] = [];
		}
		exprs[mode].push( { expr: expr, method: method } );
	};

	this.applyForAll = function( mode, nodes ) {
		return nodes.map( x => this.apply(mode, x ) )
	};
	this.apply = function(mode, node){
		var tmpls = exprs[mode];
		var rank = 0;
		var selected = { rank : 0, method : (node)=> node };
		
		for( var i in tmpls ) {
			var current = tmpls[i];
			
			var expr = current.expr(node);
			
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