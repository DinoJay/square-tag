import * as d3 from 'd3';
(function() {
    //D3 program to fit circles of different sizes
    //in a rectangle of fixed aspect ratio
    //as tightly as reasonable.
    //
    //By Amelia Bellamy-Royds, in response to
    //http://stackoverflow.com/questions/13339615/packing-different-sized-circles-into-rectangle-d3-js

    //Based on Mike Bostock's
    //"http://bl.ocks.org/mbostock/7882658" example:
    //http://bl.ocks.org/mbostock/7882658

//parameters//
var N = 25; //number of nodes
var sortOrder = -1;
   //>0 for ascending, <0 for descending, 0 for no sort

//create data array//
var data = [], i = N;
var randNorm = d3.random.normal(1,0.6);
while(i--) data.push({
    "size": Math.max(randNorm(), 0.1) });
    //circle area will be proportional to size

var dataMax = d3.max(data, function(d){return d.size;});
var totalSize = d3.sum(data, function(d){return d.size;});

//________________//

//Set up SVG and rectangle//
var svg = d3.select("svg");
var digits = /(\d*)/;
var margin = 50; //space in pixels from edges of SVG
var padding = 4; //space in pixels between circles

var svgStyles = window.getComputedStyle(svg.node());
var width = parseFloat(svgStyles["width"]) - 2*margin;
var height = parseFloat(svgStyles["height"]) - 2*margin;

var usableArea = Math.PI*
    Math.pow( Math.min(width,height)/2 ,2)*0.667;
var scaleFactor = Math.sqrt(usableArea)/
        Math.sqrt(totalSize)/Math.PI;
var rScale = d3.scale.sqrt()
        //make radius proportional to square root of data r
        .domain([0, dataMax]) //data range
        .range([0,  Math.sqrt(dataMax)*scaleFactor]);
//The rScale range will be adjusted as necessary
//during packing.
//The initial value is based on scaling such that the total
//area of the circles is 2/3 the area of the largest circle
//you can draw within the box.

/*
    console.log("Dimensions: ", [height, width]);
    console.log("area", width*height);
    console.log("Usable area: ", usableArea);
    console.log("TotalSize: ", totalSize);
    console.log("Initial Scale: ", scaleFactor);
    console.log("RScale: ",rScale.domain(), rScale.range());
console.log("r(1)", rScale(1) );
//  */

var box = svg.append("rect")
            .attr({ "height": height, "width":width,
                   "x":margin, "y":margin,
                   "class":"box"
            });

var bubbleGroup = svg.append("g")
        .attr("class", "bubbles")
        .attr("transform",
              "translate(" + [margin,margin] + ")");



//__Initialize layout objects__//

// Use the pack layout to initialize node positions:
d3.layout.pack()
    .sort((
        sortOrder?
            ( (sortOrder<0)?
                function(a,b){return b.size - a.size;} : //descending
                function(a,b){return a.size - b.size;} ) : //ascending
            function(a,b){return 0;} //no sort
        ))
    .size([width/scaleFactor, height/scaleFactor])
    .value(function(d) { return d.size; })
    .nodes({children:data});

//Use the force layout to optimize:
var force = d3.layout.force()
    .nodes(data)
    .size([width/scaleFactor, height/scaleFactor])
    .gravity(.5)
    .charge(0) //don't repel
    .on("tick", updateBubbles);


    //Create circles!//
var bubbles = bubbleGroup.selectAll("circle")
    .data(data)
    .enter()
        .append("circle");


// Create a function for this tick round,
// with a new quadtree to detect collisions
// between a given data element and all
// others in the layout, or the walls of the box.


//keep track of max and min positions from the quadtree
var bubbleExtent;
function collide(alpha) {
  var quadtree = d3.geom.quadtree(data);
  var maxRadius = Math.sqrt(dataMax);
  var scaledPadding = padding/scaleFactor;
  var boxWidth = width/scaleFactor;
  var boxHeight = height/scaleFactor;

    //re-set max/min values to min=+infinity, max=-infinity:
  bubbleExtent = [[Infinity, Infinity],[-Infinity, -Infinity]];

  return function(d) {

      //check if it is pushing out of box:
    var r = Math.sqrt(d.size) + scaledPadding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;

      if (nx1 < 0) {
           d.x = r;
      }
      if (nx2 > boxWidth) {
           d.x = boxWidth - r;
      }
      if (ny1 < 0) {
           d.y = r;
      }
      if (ny2 > boxHeight) {
           d.y = boxHeight - r;
      }


    //check for collisions
    r = r + maxRadius,
        //radius to center of any possible conflicting nodes
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;

    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = Math.sqrt(d.size) + Math.sqrt(quad.point.size)
                    + scaledPadding;
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });

    //update max and min
    r = r-maxRadius; //return to radius for just this node
    bubbleExtent[0][0] = Math.min(bubbleExtent[0][0],
                                  d.x - r);
    bubbleExtent[0][1] = Math.min(bubbleExtent[0][1],
                                  d.y - r);
    bubbleExtent[1][0] = Math.max(bubbleExtent[1][0],
                                  d.x + r);
    bubbleExtent[1][1] = Math.max(bubbleExtent[1][1],
                                  d.y + r);

  };
}

function updateBubbles() {

    bubbles
        .each( collide(0.5) ); //check for collisions

    //update the scale to squeeze in the box
    //to match the current extent of the bubbles
    var bubbleWidth = bubbleExtent[1][0] - bubbleExtent[0][0];
    var bubbleHeight = bubbleExtent[1][1] - bubbleExtent[0][1];

    scaleFactor = (height/bubbleHeight +
                           width/bubbleWidth)/2; //average
    /*
    console.log("Box dimensions:", [height, width]);
    console.log("Bubble dimensions:", [bubbleHeight, bubbleWidth]);
    console.log("ScaledBubble:", [scaleFactor*bubbleHeight,
                                 scaleFactor*bubbleWidth]);
    //*/

    rScale
        .range([0,  Math.sqrt(dataMax)*scaleFactor]);

    //shift the bubble cluster to the top left of the box
    bubbles
        .each( function(d){
            d.x -= bubbleExtent[0][0];
            d.y -= bubbleExtent[0][1];
        });

    //update positions and size according to current scale:
    bubbles
        .attr("r", function(d){return rScale(d.size);} )
        .attr("cx", function(d){return scaleFactor*d.x;})
        .attr("cy", function(d){return scaleFactor*d.y;})
}

force.start();

})();
