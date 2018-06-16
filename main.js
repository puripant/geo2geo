//Width and height of map
var width = 400;
var height = 700;

// D3 Projection
var projection = d3.geoAlbers()
  .center([100.0, 13.5])
  .rotate([0, 24])
  .parallels([5, 21])
  .scale(1200 * 2)
  .translate([-100, 200]);

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

// Define linear scale for output
var color = d3.scaleLinear()
  .domain([0, 1])
  .range(["gainsboro", "#eb307c"]);

//Create SVG element and append map to the SVG
var svg = d3.select("#result")
  .append("svg")
  .attr("class", "map")
  .attr("width", width)
  .attr("height", height);

// Append Div for tooltip to SVG
var tooltip = d3.select("body")
  .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
// Based on https://bl.ocks.org/mbostock/3081153
var circle = function(coordinates) {
  var circle = [];
  var length = 0;
  var lengths = [length];
  var p0 = coordinates[0];
  var p1;
  var x;
  var y;
  var i = 0;
  var n = coordinates.length;

  // Compute the distances of each coordinate.
  while (++i < n) {
    p1 = coordinates[i];
    x = p1[0] - p0[0];
    y = p1[1] - p0[1];
    lengths.push(length += Math.sqrt(x * x + y * y));
    p0 = p1;
  }

  var area = d3.polygonArea(coordinates);
  var radius = Math.sqrt(Math.abs(area) / Math.PI);
  var centroid = d3.polygonCentroid(coordinates);
  var angleOffset = Math.atan2(coordinates[0][1]-centroid[1], coordinates[0][0]-centroid[0]);
  var angle;
  var i = -1;
  var k = 2 * Math.PI / lengths[lengths.length - 1];

  // Compute points along the circle’s circumference at equivalent distances.
  while (++i < n) {
    angle = angleOffset + lengths[i] * k;
    circle.push([
      centroid[0] + radius * Math.cos(angle),
      centroid[1] + radius * Math.sin(angle)
    ]);
  }

  return circle;
}

var geo;
var geometryMode = true;
var updateMap = function() {
  svg.selectAll("path")
    .style("fill", function(d) {
      var value = d.properties.visited;
      return value ? color(value) : "gainsboro";
    })
    .transition()
      .duration(2000)
      .attr("d", function(d) {
        var coords = d.geometry.coordinates[0];
        if (coords.length == 1) { //find the biggest part in each province
          var max_length = -1;
          var max_i = -1;
          for (var i = 0; i < d.geometry.coordinates.length; i++) {
            if (max_length < d.geometry.coordinates[i][0].length) {
              max_length = d.geometry.coordinates[i][0].length;
              max_i = i;
            }
          }
          coords = d.geometry.coordinates[max_i][0];
        }
        var circleCoords = circle(coords.map(function(coord) { return projection(coord); }));
        return (geometryMode && circleCoords.length > 1)? ("M" + circleCoords.join("L") + "Z") : path(d);
      });
  geometryMode = !geometryMode;
}

var provinces;
var findProvinceTH = function(province) {
  // Find the corresponding province inside the GeoJSON
  for (var i = 0; i < provinces.length; i++)  {
    if (province === provinces[i].province) {
      return provinces[i].provinceTH;
    }
  }
}

d3.csv("data/provinces-visited.csv", function(data) {
  provinces = data;

  // Load GeoJSON data and merge with states data
  d3.json("data/thailand-topo.json", function(json) {
    geo = topojson.feature(json, json.objects.thailand).features;
    // console.log(topojson.neighbors(json.objects.thailand.geometries));
    
    biggest_parts = geo.map(function(g) {
      if (g.geometry.coordinates.length > 1) {
        g.geometry.coordinates.sort((a, b) => { d3.polygonArea(b[0]) - d3.polygonArea(a[0]) });
      }
      return (g.geometry.coordinates[0].length === 1)? g.geometry.coordinates[0][0] : g.geometry.coordinates[0];
    });
    // console.log(biggest_parts);

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(geo)
      .enter()
      	.append("path")
      	.attr("d", path)
      	.style("stroke", "#fff")
      	.style("stroke-width", "1")
        .on("mouseover", function(d) {
            tooltip.transition()
              .duration(200)
              .style("opacity", 0.8);
            tooltip.html(findProvinceTH(d.properties.NAME_1))
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 30) + "px");
          })
        .on("mouseout", function(d) {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          })
        .on("click", function(d) {
            updateMap();
          });
    updateMap();
  });
  
});
