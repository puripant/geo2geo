let width = 400;
let height = 700;

let projection = d3.geoAlbers()
  .center([100.0, 13.5])
  .rotate([0, 24])
  .parallels([5, 21])
  .scale(1200 * 2)
  .translate([-100, 200]);

let path = d3.geoPath().projection(projection);

let color = d3.scaleLinear()
  .domain([0, 1])
  .range(["gainsboro", "#eb307c"]);

let svg = d3.select("#result")
  .append("svg")
  .attr("class", "map")
  .attr("width", width)
  .attr("height", height);

let tooltip = d3.select("body")
  .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Based on https://bl.ocks.org/mbostock/3081153
let circle = (coordinates) => {
  let circle = [];
  let length = 0;
  let lengths = [length];
  let p0 = coordinates[0];
  let p1;
  let x;
  let y;
  let i = 0;
  let n = coordinates.length;

  while (++i < n) {
    p1 = coordinates[i];
    x = p1[0] - p0[0];
    y = p1[1] - p0[1];
    lengths.push(length += Math.sqrt(x * x + y * y));
    p0 = p1;
  }

  let area = d3.polygonArea(coordinates);
  let radius = Math.sqrt(Math.abs(area) / Math.PI);
  let centroid = d3.polygonCentroid(coordinates);
  let angleOffset = Math.atan2(coordinates[0][1]-centroid[1], coordinates[0][0]-centroid[0]);
  let angle;
  i = -1;
  let k = 2 * Math.PI / lengths[lengths.length - 1];

  while (++i < n) {
    angle = angleOffset + lengths[i] * k;
    circle.push([
      centroid[0] + radius * Math.cos(angle),
      centroid[1] + radius * Math.sin(angle)
    ]);
  }

  return circle;
}

// adapted from d3 hexbin
let hex = (coordinates, [x0, y0], [dx, dy], radius) => {
  const num = 6; //coordinates.length;
  if (num >= 6) {
    const numPerSide = Math.floor(num / 6);
    const remainder = num - (numPerSide*6);

    const thirdPi = Math.PI / 6;
    const angles = [thirdPi, thirdPi*3, thirdPi*5, thirdPi*7, thirdPi*9, thirdPi*11];

    x0 = (x0 - ((y0%2 === 0)? 0.5:0))*radius*Math.sqrt(3);
    y0 *= radius*3/2;

    const centroid = d3.polygonCentroid(coordinates);
    const angleOffset = Math.atan2(coordinates[0][1]-centroid[1], coordinates[0][0]-centroid[0]);
    const angles2 = angles.map((a) => Math.abs((a - angleOffset) % (2*Math.PI)));
    const indexOffset = angles2.indexOf(d3.min(angles2));

    let corners = angles.map((angle) => {
        let x1 = Math.cos(angle) * radius;
        let y1 = Math.sin(angle) * radius;
        return [dx + x0 + x1, dy + y0 + y1];
      });
    let hex = [];
    for (let i = indexOffset; i < indexOffset+6; i++) {
      let n = numPerSide + ((i%6 < remainder)? 1:0);
      for (let j = 0; j < n; j++) {
        hex.push(d3.interpolateArray(corners[i%6], corners[(i+1)%6])(j / n));
      }
    }
    return hex;
  } else {
    return [];
  }
}
const thaiHexMap = [
  { id: 57, y:  0, x: 2 },

  { id: 50, y:  1, x: 0 },
  { id: 52, y:  1, x: 1 },
  { id: 56, y:  1, x: 2 },

  { id: 58, y:  2, x: 0 },
  { id: 51, y:  2, x: 1 },
  { id: 53, y:  2, x: 2 },
  { id: 55, y:  2, x: 3 },

  { id: 54, y:  3, x: 0 },
  { id: 64, y:  3, x: 1 },
  { id: 65, y:  3, x: 2 },
  { id: 67, y:  3, x: 3 },
  { id: 43, y:  3, x: 5 },
  { id: 38, y:  3, x: 6 },
  { id: 48, y:  3, x: 7 },

  { id: 63, y:  4, x: 1 },
  { id: 62, y:  4, x: 2 },
  { id: 66, y:  4, x: 3 },
  { id: 42, y:  4, x: 4 },
  { id: 39, y:  4, x: 5 },
  { id: 41, y:  4, x: 6 },
  { id: 47, y:  4, x: 7 },
  { id: 49, y:  4, x: 8 },

  { id: 61, y:  5, x: 1 },
  { id: 18, y:  5, x: 2 },
  { id: 60, y:  5, x: 3 },
  { id: 36, y:  5, x: 4 },
  { id: 40, y:  5, x: 5 },
  { id: 46, y:  5, x: 6 },
  { id: 35, y:  5, x: 7 },

  { id: 71, y:  6, x: 1 },
  { id: 15, y:  6, x: 2 },
  { id: 17, y:  6, x: 3 },
  { id: 16, y:  6, x: 4 },
  { id: 30, y:  6, x: 5 },
  { id: 44, y:  6, x: 6 },
  { id: 45, y:  6, x: 7 },
  { id: 37, y:  6, x: 8 },

  { id: 72, y:  7, x: 1 },
  { id: 14, y:  7, x: 2 },
  { id: 13, y:  7, x: 3 },
  { id: 19, y:  7, x: 4 },
  { id: 31, y:  7, x: 5 },
  { id: 32, y:  7, x: 6 },
  { id: 33, y:  7, x: 7 },
  { id: 34, y:  7, x: 8 },

  { id: 70, y:  8, x: 1 },
  { id: 12, y:  8, x: 2 },
  { id: 10, y:  8, x: 3 },
  { id: 26, y:  8, x: 4 },
  { id: 25, y:  8, x: 5 },

  { id: 73, y:  9, x: 1 },
  { id: 74, y:  9, x: 2 },
  { id: 11, y:  9, x: 3 },
  { id: 24, y:  9, x: 4 },
  { id: 27, y:  9, x: 5 },

  { id: 76, y: 10, x: 1 },
  { id: 75, y: 10, x: 2 },
  { id: 20, y: 10, x: 4 },
  { id: 21, y: 10, x: 5 },
  { id: 22, y: 10, x: 6 },

  { id: 77, y: 11, x: 1 },
  { id: 23, y: 11, x: 6 },

  { id: 86, y: 12, x: 1 },

  { id: 85, y: 13, x: 0 },

  { id: 84, y: 14, x: 1 },

  { id: 82, y: 15, x: 0 },
  { id: 80, y: 15, x: 1 },

  { id: 83, y: 16, x: 0 },
  { id: 81, y: 16, x: 1 },

  { id: 92, y: 17, x: 1 },
  { id: 93, y: 17, x: 2 },

  { id: 91, y: 18, x: 2 },
  { id: 90, y: 18, x: 3 },
  { id: 94, y: 18, x: 4 },

  { id: 95, y: 19, x: 3 },
  { id: 96, y: 19, x: 4 },
];

let geo;
let geometryMode = 0;
let updateMap = () => {
  svg.selectAll("path")
    .transition()
      .duration(2000)
      .attrTween("d", (d) => {
        let coords = d.geometry.coordinates[0];
        if (coords.length == 1) { //find the biggest part in each province
          let max_length = -1;
          let max_i = -1;
          for (let i = 0; i < d.geometry.coordinates.length; i++) {
            if (max_length < d.geometry.coordinates[i][0].length) {
              max_length = d.geometry.coordinates[i][0].length;
              max_i = i;
            }
          }
          coords = d.geometry.coordinates[max_i][0];
        }

        let geo_path = flubber.splitPathString(path(d)).reduce((a, b) => a.length > b.length ? a : b); //find the biggest ring in each path

        let circleCoords = circle(coords.map((coord) => projection(coord)));
        let circle_path = "M" + circleCoords.join("L") + "Z";

        let hexCenter = thaiHexMap.find((h) => h.id === +d.properties.ISO);
        let hexCoords = hex(coords.map((coord) => projection(coord)), [hexCenter.x, hexCenter.y], [80, 50], 20);
        let hex_path = "M" + hexCoords.join("L") + "Z";

        switch(geometryMode % 3) {
          case 0: default: return flubber.interpolate(hex_path, geo_path);
          case 1: return flubber.interpolate(geo_path, circle_path);
          case 2: return flubber.interpolate(circle_path, hex_path);
        }
      })
  geometryMode++;
}

let provinces;
let findProvinceTH = (province) => {
  for (let i = 0; i < provinces.length; i++)  {
    if (province === provinces[i].province) {
      return provinces[i].provinceTH;
    }
  }
}

d3.csv("data/provinces-visited.csv", (data) => {
  provinces = data;

  d3.json("data/thailand-topo.json", (json) => {
    geo = topojson.feature(json, json.objects.thailand).features;

    biggest_parts = geo.map((g) => {
      if (g.geometry.coordinates.length > 1) {
        g.geometry.coordinates.sort((a, b) => { d3.polygonArea(b[0]) - d3.polygonArea(a[0]) });
      }
      return (g.geometry.coordinates[0].length === 1)? g.geometry.coordinates[0][0] : g.geometry.coordinates[0];
    });

    svg.selectAll("path")
        .data(geo)
      .enter()
      	.append("path")
      	.attr("d", path)
      	.style("stroke", "#fff")
      	.style("stroke-width", "1")
        .on("mouseover", (d) => {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.8);
          tooltip.html(findProvinceTH(d.properties.NAME_1))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
        })
        .on("mouseout", (d) => {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        })
    svg.on("click", (d) => {
      updateMap();
    });
    updateMap();
  });

});
