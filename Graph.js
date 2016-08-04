var width = 700,
height = 700; // Default width and height.

var colorArray = ["#A766AA", "#D84F48", "#ECAE3A", "#43B4D4"]; // Holds the potential colors for the nodes. Accessed by index of node mod the length of this array

var jsonData;   // Will hold the JSON from GetIssue
var graph;      // Holds the GraphData from the Json
var svg;        // Holds the SVG background

var done = false;
var speed = 200;
var time = 0;
var totalTime = 20000; // The totalTime we want the issue play to take

// Scales the X values of nodes to the size of the SVG. Makes sure it's not too close to each wall.
function scalex(x) {
    var newX = x * parseInt(width) * 0.5;
    if (newX < 15) return newX + 15;
    else if (newX > width - 15) return newX - 15;
    return newX;
}
// Scales the Y values of nodes to the size of SVG. Makes sure it's not too close to each wall.
function scaley(y) {
    var newY = y * parseInt(height) * 0.5;
    if (newY < 15) return newY + 15;
    else if (newY > height - 15) return newY - 15;
    return newY;
}

// Initializes the objects required for the graph.
function initializeGraph() {
    // Get the field.svg object and append it to the DOM if it hasn't been already.
    d3.xml("field.svg", function (xml) {
        divdom = document.getElementById("Graph");

        var svgElement = document.getElementById("Layer_1");
        if (!svgElement) {
            divdom.appendChild(xml.documentElement);
        }
        svg = d3.select("svg"); // set the object to the appended version of the SVg for later use.

        d3.json("ExampleData.json", function(json) {
            graph = json.GraphData;
            // Create link elements that will have the svg paths added later
        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("g")
            .attr("class", "linkg")
            .attr("id", function (d, i) { return "linkg" + i; });

        // Get the width and height of our space
        width = svg.style("width").replace("px", "");
        height = svg.style("height").replace("px", "");

        scalePosition();                   // Scale node position and link times
        scaleTime(20000);           // Scale Time to fit in total time
        createNodes();              // Create nodes on the graph
        createTextPaths();          // Create path labels
        createEventListeners();     // Set up event listeners for hovering
        });  
        
    });
}

// Scale all the links' times by the total time we want them to take.
function scaleTime(total) {
    for (var i = 0; i < graph.links.length; i++) {
        graph.links[i].speed *= total;
        graph.links[i].delay *= total;
    }
}

// Scale each position.
function scalePosition() {
    for (var i = 0; i < graph.nodes.length; i++) {
        graph.nodes[i].x = scalex(graph.nodes[i].x);
        graph.nodes[i].y = scaley(graph.nodes[i].y);
    }
}

// Pauses the transitions that haven't happened yet.
function pauseTransitions() {
    svg.selectAll("path").transition();
}

// Create the node objects on the SVG
function createNodes() {
    // Select all the node objects, create the circles, and stick them on the graph.
    var node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter().append("g")
                .attr("class", "node")
                .attr("id", function (d, i) { return "node" + String(i); })
                .style("pointer-events", "none")
                .append("circle")
                .attr("id", function (d, i) { return "nodecircle" + String(i); })
                .attr("cx", function (d, i) { return graph.nodes[i].x })
                .attr("cy", function (d, i) { return graph.nodes[i].y })
                .attr("r", 10)
                .attr("filter", "url(#f3)")
                .style("fill", function (d, i) { return colorArray[graph.nodes[i].Number % colorArray.length] })
                .style("stroke", "grey")
                .style("stroke-width", "1");

    // Create the triangles for the Start and Finish nodes.
    var startIndex = graph.nodes.length - 2;
    var endIndex = graph.nodes.length - 1;
    svg.select("#nodecircle" + String(startIndex)) // Remove the start node's circle.
        .remove("circle");
    svg.select('#node' + String(startIndex))
        .append("polygon")
            .attr("points", function () {
                var x = graph.nodes[startIndex].x - 10;
                var y = graph.nodes[startIndex].y - 10;

                var x1 = x + 0.9;
                var x2 = x + 26.1;
                var x3 = x + 13.5;
                var y1 = y + 0.5;
                var y2 = y + 0.5;
                var y3 = y + 22.4;
                return x1 + "," + y1 + " " +
                        x2 + "," + y2 + " " +
                        x3 + "," + y3;
            })
            .attr("filter", "url(#f3)")
            .attr("fill", "#FFFFFF")
            .attr("stroke", "grey")
            .style("stroke-width", "1");

    svg.select("#nodecircle" + String(endIndex))
        .remove("circle");
    svg.select('#node' + String(endIndex))
        .append("polygon")
            .attr("points", function () {
                var x = graph.nodes[endIndex].x - 10;
                var y = graph.nodes[endIndex].y - 10;

                var x1 = x + 26.1;
                var x2 = x + 0.9;
                var x3 = x + 13.5;
                var y1 = y + 22.4;
                var y2 = y + 22.4;
                var y3 = y + 0.5;
                return x1 + "," + y1 + " " +
                        x2 + "," + y2 + " " +
                        x3 + "," + y3;
            })
            .attr("filter", "url(#f3)")
            .attr("fill", "#FFFFFF")
            .attr("stroke", "grey")
            .style("stroke-width", "1");
}

// Create the text that will show up when you hover a node that says the amoutn of times each of that node's connections have happened
function createTextPaths() {
    svg.selectAll("textpaths")
               .data(graph.links)
               .each("start", function (d) {
                   if (d.time > 1) {
                       // If the time value is greater than one, remove the text value from before it
                       svg.selectAll("#" + "link" + "from" + graph.nodes[d.source].Number + "to" + graph.nodes[d.target].Number + "time" + (d.time - 1)).remove();
                   }
               })
               .enter()
               .append("text")
               .style("font-size", "12px")
               .attr("class", "texts")
               .attr("x", "0")
               .attr("y", "0")
               .append("textPath")
               .attr("class", function (d) {
                   return "pathlabel " + "from" + graph.nodes[d.source].Number + " to" + graph.nodes[d.target].Number + " time" + (d.time);
               })
               .attr("xlink:href", function (d) {
                   return '#' + "link" + "from" + graph.nodes[d.source].Number + "to" + graph.nodes[d.target].Number + "time" + (d.time)
               })
               .text(function (d) {
                   return d.time;
               })
               .attr("startOffset", "40%")
               .style("stroke", "black")
               .attr("filter", "url(#f3)")
               .style("fill", "white")
               .style("font-family", "sans-serif")
               .style("display", "none");
}

// Create the event Listeners for onMouseOver, onMouseOut for each node. This is what highlights the paths and shows the 
// text labels. onMouseOut stops the highlights and hides the text labels. Also brings the tooltip to visibility at the mouse.
function createEventListeners() {
    node = svg.selectAll(".node")
            .on("mouseover", function (d, i) {
                d3.selectAll(".to" + graph.nodes[i].Number + ":not(.pathlabel)")
                .transition()
                .duration(10)
                .style("stroke", "#1c9b83")
                .style("display", "block")
                .style("stroke-opacity", ".7")
                ;

                d3.selectAll(".from" + graph.nodes[i].Number + ":not(.pathlabel)")
                .transition()
                .duration(10)
                .style("stroke", "#723acc")
                .style("display", "block")
                .style("stroke-opacity", ".7")
                ;

                d3.selectAll(".pathlabel.to" + graph.nodes[i].Number)
                .style("fill", "orange")
                .style("stroke", "white")
                .style("display", "block");

                d3.selectAll(".pathlabel.from" + graph.nodes[i].Number)
                .style("fill", "blue")
                .style("stroke", "white")
                .style("display", "block");

                d3.select(this).style("fill", "LightGoldenRodYellow");

                d3.select("#tooltip")
                    .style("left", (graph.nodes[i].x + 15) + "px")
                    .style("top", (graph.nodes[i].y + 15) + "px")
                    .select("#name")
                    .text(graph.nodes[i].name);

                d3.select("#tooltip")
                    .select("#number")
                    .text(graph.nodes[i].Number);

                d3.select("#tooltip")
                    .select("#x")
                    .text(graph.nodes[i].x);
                d3.select("#tooltip")
                    .select("#y")
                    .text(graph.nodes[i].y);

                d3.select("#tooltip").classed("hidden", false);

            })
            .on("mouseout", function (d, i) {

                d3.selectAll(".to" + graph.nodes[i].Number + ":not(.pathlabel)")
                .style("stroke", "#DEDEDE")
                .style("stroke-opacity", ".2");

                d3.selectAll(".from" + graph.nodes[i].Number + ":not(.pathlabel)")
                .style("stroke", "#DEDEDE")
                .style("stroke-opacity", ".2");

                d3.selectAll(".pathlabel")
                .style("fill", "grey")
                .style("display", "none");

                d3.select("#tooltip").classed("hidden", true);
                d3.select(this).style("fill", "white");
            });
}

// Stops the eventListeners, used while animation is happening so that lines are still drawn as they should be
function stopEventListeners() {
    svg.selectAll(".node")
        .style("pointer-events", "none");
}

// Function called when transitions finish running. If the transition count is equal to the expected number of transitions
// then restore transitions
function endCallback(i, index) {
    if (i == index) {
        done = true;
        svg.selectAll(".node")
            .style("pointer-events", "all");
    }
}

// Plays transitions for each link from start to finish
function playTransition() {
    pauseTransitions();
    var count = 0;

    stopEventListeners();                   // Stop event listeners
    svg.selectAll(".pathlink").remove();    // Remove the existing paths before drawing new ones
    svg.selectAll(".link").remove();

    // Select all the links, append the paths 
    svg.selectAll(".linkg")
        .data(graph.links)
        .append("path")
        .attr("class", function (d, i) {
            return "link " + "from" + graph.nodes[d.source].Number + " to" + graph.nodes[d.target].Number + " time" + graph.links[i].time;
        })
        .attr("id", function (d, i) {
            return "link" + "from" + graph.nodes[d.source].Number + "to" + graph.nodes[d.target].Number + "time" + graph.links[i].time;
        })
        .attr("d", function (d) { // Calculates the curve of the path or something. I don't actually know.
            var sx = graph.nodes[d.source].x, sy = graph.nodes[d.source].y,
            tx = graph.nodes[d.target].x, ty = graph.nodes[d.target].y,
            dx = tx - sx, dy = ty - sy,
            dr = 2 * Math.sqrt(dx * dx + dy * dy);
            return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
        })
        .style("stroke", "yellow") // Start stroke off with color
        .style("stroke-width", function (d) { // Set the width of the stroke to the amount of times the stroke has already happened
            return d.time * 2;
        })
        .attr("stroke-dasharray", 1000) // this is how line transitions work in html/d3 I guess
        .attr("stroke-dashoffset", 1000)
        .transition() // Actual transition code
            .each("start", function (d) {
                if (d.time > 1) {   // Remove the path if this has happened before
                    svg.selectAll("#" + "link" + "from" + graph.nodes[d.source].Number + "to" + graph.nodes[d.target].Number + "time" + (d.time - 1)).remove();
                }
                document.getElementById("NodeIndex").innerText = String(parseInt(document.getElementById("NodeIndex").innerText) + 1);
                count++;
            })
            .delay(function (d, i) {        // Set the delay of the transition so that they play one after the other
                console.log(graph.links[i].delay);
                return graph.links[i].delay;
            })
            .duration(function (d, i) { // set the duration of the transition so it takes the amount of time the KI actually took
                return graph.links[i].speed;
            })
            .ease("linear")
            .attr("stroke-dashoffset", 0)
            .each("end", function (d, i) {
                // After each callback see if we can enable the event listeners again
                endCallback(i, graph.links.length - 1);
            })
        .style("stroke", "#DEDEDE"); // after the line is done drawing, change it's color back to grey
}

// Same thing as Play transitions but draws everything below index at 0 speed, so it can appear as if it's just continuing from a pause
function resumeTransition(index) {
    pauseTransitions();
    var count = index;

    stopEventListeners();
    svg.selectAll(".pathlink").remove();
    svg.selectAll(".link").remove();

    svg.selectAll(".linkg")
        .data(graph.links)
        .append("path")
        .attr("class", function (d, i) {
            return "link " + "from" + graph.nodes[d.source].Number + " to" + graph.nodes[d.target].Number + " time" + graph.links[i].time;
        })
        .attr("id", function (d, i) {
            return "link" + "from" + graph.nodes[d.source].Number + "to" + graph.nodes[d.target].Number + "time" + graph.links[i].time;
        })
        .attr("d", function (d) {
            var sx = graph.nodes[d.source].x, sy = graph.nodes[d.source].y,
            tx = graph.nodes[d.target].x, ty = graph.nodes[d.target].y,
            dx = tx - sx, dy = ty - sy,
            dr = 2 * Math.sqrt(dx * dx + dy * dy);
            return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
        })
        .style("stroke", "yellow")
        .style("stroke-width", function (d) {
            return d.time * 2;
        })
        .attr("stroke-dasharray", 1000)
        .attr("stroke-dashoffset", 1000)
        .transition()
            .each("start", function (d, i) {
                if (d.time > 1) {
                    svg.selectAll("#" + "link" + "from" + graph.nodes[d.source].Number + "to" + graph.nodes[d.target].Number + "time" + (d.time - 1)).remove();
                }
                if (i >= index) {
                    document.getElementById("NodeIndex").innerText = String(parseInt(document.getElementById("NodeIndex").innerText) + 1);
                }
                count++;
            })
            .delay(function (d, i) {
                if (i <= index) return 0;
                return graph.links[i].delay;
            })
            .duration(function (d, i) {
                if (i < index) return 0;
                return graph.links[i].speed;
            })
            .ease("linear")
            .attr("stroke-dashoffset", 0)
            .each("end", function (d, i) {
                endCallback(i, graph.links.length - 1);
            })
        .style("stroke", "#DEDEDE");
}

// Plays one transition from the index. Plays everything before that at 0 speed.
function playTransitionFromIndex(index) {
    pauseTransitions();
    stopEventListeners();

    svg.selectAll(".pathlink").remove();
    svg.selectAll(".link").remove();
    var max = index + 1;
    if (index == graph.links.length - 2) max = index + 2;

    for (var j = 0; j < max; j++) {
        svg.select("#linkg" + j)
            .datum(graph.links[j])
            .append("path")
            .attr("class", function (d, i) {
                return "link " + "from" + graph.nodes[d.source].Number + " to" + graph.nodes[d.target].Number + " time" + graph.links[j].time + " pathlink";
            })
            .attr("id", function (d, i) {
                return "link" + "from" + graph.nodes[d.source].Number + "to" + graph.nodes[d.target].Number + "time" + graph.links[j].time;
            })
            .attr("d", function (d) {
                var sx = graph.nodes[d.source].x, sy = graph.nodes[d.source].y,
                tx = graph.nodes[d.target].x, ty = graph.nodes[d.target].y,
                dx = tx - sx, dy = ty - sy,
                dr = 2 * Math.sqrt(dx * dx + dy * dy);
                return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
            })
            .style("stroke", "yellow")
            .style("stroke-width", function (d) {
                return d.time * 2;
            })
            .attr("stroke-dasharray", 1000)
            .attr("stroke-dashoffset", 1000)
            .transition()
                .each("start", function (d) {
                    if (d.time > 1) {
                        svg.selectAll("#" + "link" + "from" + graph.nodes[d.source].Number + "to" + graph.nodes[d.target].Number + "time" + (d.time - 1)).remove();
                    }
                })
                .delay(function (d, i) {
                    if (max == index - 2 && j == index - 1) return graph.links[j - 1].speed;
                    return 0;
                })
                .duration(function (d, i) {
                    if (j < max - 1) return 0;
                    return graph.links[j].speed;
                })
                .ease("linear")
                .attr("stroke-dashoffset", 0)
                .each("end", function (i) {
                    endCallback(j, max);
                })
            .style("stroke", "#DEDEDE");
    };

}