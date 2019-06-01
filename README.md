# jsl
JSON stylesheet  processor like XSL


# Why created

I prefer to use XSLT as template engine, because i can replace any template just via condition. But I need to use React in my applications. I whould like to use the same templating  way for Rect.


# How to use 

1. You  have some data on JS:

<pre>
 var data = {
  items : [
    { a : 1, b :2, items: [  1, 2, 3 ] },
    { a : 1},
   ]
 }
</pre>


2. And you have some templates

<pre>
 jsl.match( (x) => eq( x.a, 1), function(node){ 
   return "this is A=1" );
 });
</pre>

<pre>
 jsl.match((x) => and( eq( x.a, 1), eq(x.b, 2) ), (node) => {
   return "this is A=1, B=2 " + node.a );
 })
</pre>

3. Apply templates to data

<pre>
console.log( jsl.applyForAll( null, data.items ) ); 
</pre>

JSL chooses the template with stronger condition like this: "x.a == 1" less strong then "(x.a == 1 && x.b == 2)"

For details see [example.js](example.js)



