// TODO: LABEL LARGEST NODES WITHOUT HOVERING 

// What projects the cluster has worked on
var universityColor = 'rgb(122, 86, 20)';
var corporationColor = 'rgb(87, 11, 11)';
var currencyFormat = d3.format('$,');



$(document).ready(function(){

  
  queue()
    .defer(d3.json, 'data/2011_darpa_graph2.json')
    .defer(d3.json, 'data/darpa_performer_descriptions_GOOD.json')
    .defer(d3.json, 'data/project_descriptions.json')
    .await(graphics);

});


function graphics(error, graph, performerDescription, projectDescription) {
  // console.log(graph);
  console.log('performers', performerDescription);
  console.log('projects', projectDescription);

  var contractors = [];
  var programs = [];

  for (var i = 0; i < graph.nodes.length; i++) {
      var d = graph.nodes[i];
      d.index = i;
      if (d.type === 'program') {    
          programs.push(d);
      } else {
          contractors.push(d);
      }
  }


  var maxContract = d3.max(graph.nodes, function(d){ return d.weight; });

  createGraph(graph, performerDescription);
  // rowChart(graph, contractors, maxContract, '#performer-list', 'performer', performerDescription);
  // rowChart(graph, programs, maxContract, '#project-list', 'program', projectDescription);


  $('#performer-list svg g').on('mouseover', function(d) {
      var id = ($(this).data()).id;
      $('circle[node-id=' + id + ']')
          .css('fill', 'white');

      var data = d3.select('circle').attr('node-id', id).data();
      console.log(data[0].x);

  }).on('mouseout', function(d) {
      $('circle').css('fill', '');
      $('.bar').removeClass('selected');

  }).on('click', function(d) {
    
  });


  // Highlights the corresponding nodes
  $('#project-list svg g').on('mouseover', function(d) {
      var id = ($(this).data()).id;   

      for (var i = 0; i < graph.links.length; i++) {

          // d3.selectAll('circle').attr('fill-opacity', 0.2);

          if (id === graph.links[i].source || id === graph.links[i].target) {
              // console.log(graph.links[i]);
              // d3.selectAll('circle').attr('node-id', graph.links[i].target).attr('fill-opacity', 1);

              $('circle[node-id=' + graph.links[i].target + ']')
                  .css('fill', 'white');
              $('circle[node-id=' + graph.links[i].source + ']')
                  .css('fill', 'white');

          } else {
              
              // THIS IS WHERE THE FADE OUT WOULD HAPPEN...
              // $('circle').css('fill', 'rgba(100, 100, 100, 0.2');
          }
      }

    // console.log(nodes);
  }).on('mouseout', function() {
      // d3.selectAll('circle').attr('fill-opacity', 1);
      $('.bar').removeClass('selected');
      $('circle').css('fill', '');
  }).on('click', function() {
      console.log($(this).data());
  }); // ends the click to change color function.

  

  $('circle').on('click', function(d) {
    console.log(this);
  });


  var button = d3.select('#graphic')
    .append('button')
    .attr('class', 'btn btn-default')
    .attr('id', 'colorToggle')
    .style('position', 'absolute')
    .style('top','10px')
    .style('left','20px')
    .text('Color by University/Corporation')
    .on('click', function() {
      if (d3.selectAll('circle.university').classed('university-selected')){
        d3.select('#colorToggle').text('Color by University/Corporation');
        d3.selectAll('circle.university').classed('university-selected', false);
      } else {
        d3.select('#colorToggle').text('Color by DARPA Department');
        d3.selectAll('circle.university').classed('university-selected', true);
      }

      if (d3.selectAll('circle.corporation').classed('corporation-selected')){
        d3.selectAll('circle.corporation').classed('corporation-selected', false);
      } else {
        d3.selectAll('circle.corporation').classed('corporation-selected', true);
      }
    });

} // ENDS graphics()



function createGraph(graph, descriptions) {
  var width = $('#graphic').width();
  var height = $(window).height() - 100;

    var padding = 2.5; // separation between same-color nodes
    var clusterPadding = 15; // separation between different-color nodes
    var maxRadius = 12;

  // var tip = d3.tip()
  //   .attr('class', 'd3-tip')
  //   .html(function(d) { return d.id; });

  var partitionMax = d3.max(graph.nodes, function(d){ return d.partition; });
  // console.log('pM:', partitionMax);

  // var color = d3.scale.category20b()
  //     .domain(d3.range(partitionMax));

  var color = d3.scale.category10()
      .domain(d3.range(partitionMax));


  // var x = d3.scale.ordinal()
  //     .domain(d3.range(partitionMax))
  //     .rangePoints([0, width], 1);

  var weightMin = Math.sqrt(d3.min(graph.nodes, function(d){ return d.weight; }));
  var weightMax = Math.sqrt(d3.max(graph.nodes, function(d){ return d.weight; }));
  var radiusScale = d3.scale.linear()
    .domain([weightMin, weightMax])
    .range([2, 30]);
  var radius = 6;

  // The largest node for each cluster.
  var clusters = new Array(partitionMax);
  var nodes = [];

  for (var j = 0; j < graph.nodes.length; j++) {
    var d = graph.nodes[j];

    // console.log(d);

    // if (d.partition !== 99) {
        var c = d.partition;
        var r;
        if (d.partition === 99) {
            var r = 0.0000001;
        } else {
            var r = radiusScale(Math.sqrt(d.weight));
        }
        
        

        var nd = { cluster: c,
                  radius: r,
                  id: d.id,
                  type: d.type,
                  amount: d.weight,
                  office: d.office,
                  index: j
              };    

        if (!clusters[c] || (r > clusters[c].radius)) clusters[c] = nd;
        nodes.push(nd); 

        // if (j < 20){
        //     console.log('d', d);
        //     console.log('nd', nd);
        // }

        // $('#performer-list').append('<p data-id=' + j+ '>' + d.id + '</p>');

    // } 
    // else {
      // var element = $('#project-list').append('<p data-id=' + j+ '>' + d.id + '</p>');
    // }

    // console.log(nodes);

  }

  // Use the pack layout to initialize node positions.
  d3.layout.pack()
      .sort(null)
      .size([width, height])
      .children(function(d) { return d.values; })
      .value(function(d) { return d.radius * d.radius; })
      .nodes({values: d3.nest()
        .key(function(d) { return d.cluster; })
        .entries(nodes)});

  var force = d3.layout.force()
      .nodes(nodes)
      //.links(graph.links)
      .size([width, height])
      .gravity(0.01)
      // .gravity(0)
      .charge(0)
      .on("tick", tick)
      .start();

  var svg = d3.select("#graphic").append("svg")
      .attr("width", width)
      .attr("height", height)
      // .call(tip)
      ;

  var node = svg.selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr('node-id', function(d) {
        return d.index;
      })
      .attr('class', function(d) {


        var nodeClass = '';


        var offices = _.sortBy(d.office, function(i) {
          return i[1];
        });
        offices.reverse();

        nodeClass = offices[0][0].toLowerCase();

        if (d.cluster === 99) {
          nodeClass += ' project';
        } 
        else if (d.type === 'corporation') {
          // return d3.rgb('rgb(173, 208, 238)').darker(1);
          nodeClass += ' corporation';
         // return 'rgba(173, 208, 238, 1)';
        } else if (d.type === 'university') {
          nodeClass += ' university';
         // return 'rgba(246, 179, 53, 1)';
        } 
        // console.log(nodeClass);
        return nodeClass;

      })
      .on('mouseover', function(d) {
        var content;
        var amount = currencyFormat(d.amount);
        if (d.id in descriptions) {
          content = '<h4>' + d.id + '</h4>' +
            '<p>Funding: ' + amount + '</p>' +
            '<p class="description">' + descriptions[d.id].description + '</p>';
        } else {
          content = '<h4>' + d.id + '</h4>' +
            '<p>Funding: ' + amount + '</p>'+
            '<p class="description"> No description available</p>';
        }
        tooltip.on(content);
      })
      .on('mousemove', function(d) { 

        console.log(d);

        var id = d.index;
        var others = [];
        for (var i = 0; i < graph.links.length; i++) {

            if (id === graph.links[i].source) {
                others.push(graph.links[i].target);
            } else if (id === graph.links[i].target) {
                others.push(graph.links[i].source);
            }
        }
        var otherNodes = [];
        for (var i = 0; i < others.length; i++) {
            var temp = {};
            var node = others[i];
            if (graph.nodes[node].type === 'program') {
                temp.label = graph.nodes[node].label;
                temp.amount = graph.nodes[node].weight;
                otherNodes.push(temp);   
            }
        }
        otherNodes.sort(function(a, b) { return a.amount - b.amount; }).reverse();

        var amount = currencyFormat(d.amount);
        var content;

        if (d.id in descriptions) {
          content = '<h4>' + d.id + '</h4>' +
            '<p>Funding: ' + amount + '</p>' +
            '<p class="description">' + descriptions[d.id].description + '</p>';
        } else {
          content = '<h4>' + d.id + '</h4>' +
            '<p>Funding: ' + amount + '</p>'+
            '<p class="description"> No description available</p>'; 
        }
        for (var i = 0; i < otherNodes.length; i++) {
            var s = '<p class="subtext">' + otherNodes[i].label + '</p>';
            content += s;
        }

        tooltip.on(content);





        // console.log(d);
        // var content;
        // var amount = currencyFormat(d.amount);
        // if (d.id in descriptions) {
        //   content = '<h4>' + d.id + '</h4>' +
        //     '<p>Funding: ' + amount + '</p>' +
        //     '<p class="description">' + descriptions[d.id].description + '</p>';
        // } else {
        //   content = '<h4>' + d.id + '</h4>' +
        //     '<p>Funding: ' + amount + '</p>'+
        //     '<p class="description"> No description available</p>';
        // }
        // tooltip.on(content);
      })
      .on('mouseout', function(d) { 
        tooltip.off();
      })
      .on('click', function(d) {
        console.log(d);
        return;
      });

  node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        // .attr("dx", 12)
        .text(function(d) {

          if (d.radius > 24) {
            console.log(d.id, d.radius);  
            return d.id;
          }
        });

  node.transition()
      .duration(750)
      .delay(function(d, i) { return i * 5; })
      .attrTween("r", function(d) {
        if (d.cluster === 99) {
            return 0;
        } else {
            var i = d3.interpolate(0, d.radius);
            return function(t) { return d.radius = i(t); };    
        }
        
      });


    // Legend nodes:
    svg.append('circle')
        .attr('class', 'legend')
        .attr('r', 20)
        .attr('cx', width - 60)
        .attr('cy', 20)
        .attr('stroke', 'darkgray')
        .attr('stroke-width', '4px !important')
        .append('text')
        .text('circle');

    svg.append('circle')
        .attr('class', 'legend')
        .attr('r', 10)
        .attr('cx', width - 60)
        .attr('cy', 60)
        .attr('fill', corporationColor)
        .attr('stroke-width', '4px !important');

    svg.append('circle')
        .attr('class', 'legend')
        .attr('r', 10)
        .attr('cx', width - 60)
        .attr('cy', 90)
        .attr('fill', universityColor)
        .attr('stroke-width', '4px !important');


  function tick(e) {
    node
        // .each(gravity(0.2 * e.alpha))
        .each(cluster(10 * e.alpha * e.alpha))
        .each(collide(0.5))
        .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
  }

  // Move nodes toward cluster focus.
  function gravity(alpha) {
    return function(d) {
      d.y += (d.cy - d.y) * alpha;
      d.x += (d.cx - d.x) * alpha;
    };
  }

  // Move d to be adjacent to the cluster node.
  function cluster(alpha) {
    return function(d) {     
      // console.log(d);
      var cluster = clusters[d.cluster];
      if (cluster === d) return;
      var x = d.x - cluster.x,
          y = d.y - cluster.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + cluster.radius;
      if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    };
  }

  function gravity(alpha) {
    return function(d) {
      d.y += (d.cy - d.y) * alpha;
      d.x += (d.cx - d.x) * alpha;
    };
  }

  // Resolves collisions between d and all other circles.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
      var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
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
    };
  }
}




function rowChart(fullgraph, graph, maxContract, target, listType, descriptions) {
    // console.log(graph);

    graph.sort(function(a, b) { return a.weight - b.weight; });
    console.log(graph);
    var data = graph.reverse();

    var width = $(target).width();
    var height = 5000;
    var fill = 'rgb(212, 210, 197)';
    var duration = 50;
    var barspacing = 1;

    var barWidth = function(d) { return x(d.weight); };
    var barHeight = 20;
    
    var x = d3.scale.linear()
        .domain([0, maxContract])
        .range([4, width]);

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], 0.1);

    var svg = d3.select(target)
        .append('svg')
        .attr('width',width)
        .attr('height',height);
    

    // DATA JOIN
    var bars = svg.selectAll('.bar')
        .data(data);

    var bar = svg.selectAll('text')
        .data(data);

    // UPDATE
    bars
        .transition()
        .duration(duration)
        .attr('width', barWidth);

    bar
        .attr('dx', barWidth)
        .html(function(d) {
            return d.id;
        });

    // ENTER
    bar = bars.enter()
        .append('g')
        .attr('data-id', function(d) { return d.index; })
        .attr('transform', function(d, i) { return 'translate(0,' + i * barHeight +')'; })
        .on('mouseover', function(d) {
            // var id = d.index;
            // var others = [];
            // for (var i = 0; i < fullgraph.links.length; i++) {

            //     if (id === fullgraph.links[i].source) {
            //         // console.log(fullgraph.links[i]);
            //         others.push(fullgraph.links[i].target);
            //     } else if (id === fullgraph.links[i].target) {
            //         others.push(fullgraph.links[i].source);
            //     }
            // }
    
            // var otherNodes = [];
            // for (var item in others) {
            //     var temp = {};

            //     if (listType === 'program') {
            //         if (fullgraph.nodes[item].type === 'corporation' || fullgraph.nodes[item].type === 'university') {
            //             temp.label = fullgraph.nodes[item].label;
            //             temp.amount = fullgraph.nodes[item].weight;
            //             otherNodes.push(temp);   
            //         }
            //     } else if (listType === 'performer') {
            //         if (fullgraph.nodes[item].type === 'program') {
            //             temp.label = fullgraph.nodes[item].label;
            //             temp.amount = fullgraph.nodes[item].weight;
            //             otherNodes.push(temp);   
            //         }
            //     }
                
                
            // }
            // otherNodes.sort(function(a, b) { return a.amount - b.amount; }).reverse();

            // var amount = currencyFormat(d.weight);
            // var content = '<p>' + amount + '</p>';

            // for (var i = 0; i < otherNodes.length; i++) {
            //     var s = '<p>' + otherNodes[i].label + '</p>';
            //     content += s;
            // }

            // tooltip.on(content);
        })
        .on('mousemove', function(d) {

            var id = d.index;
            var others = [];
            for (var i = 0; i < fullgraph.links.length; i++) {

                if (id === fullgraph.links[i].source) {
                    others.push(fullgraph.links[i].target);
                } else if (id === fullgraph.links[i].target) {
                    others.push(fullgraph.links[i].source);
                }
            }

            // console.log(d.id);

            if (listType === 'program') {

                var otherNodes = [];
                for (var i = 0; i < others.length; i++) {
                    var temp = {};

                    var node = others[i];
                
                    if (fullgraph.nodes[node].type === 'corporation' || fullgraph.nodes[node].type === 'university') {
                        temp.label = fullgraph.nodes[node].label;
                        temp.amount = fullgraph.nodes[node].weight;
                        otherNodes.push(temp);   
                    }
                }
                otherNodes.sort(function(a, b) { return a.amount - b.amount; }).reverse();

                var amount = currencyFormat(d.weight);
                var content = '<h4>' + d.id + '</h4>' +
                    '<p>Funding: ' + amount + '</p>' + 
                    '<p class="description">' + descriptions[d.id].description + '</p>';

                for (var i = 0; i < otherNodes.length; i++) {
                    var s = '<p class="subtext">' + otherNodes[i].label + '</p>';
                    content += s;
                }
                

                tooltip.on(content);



            } else if (listType === 'performer') {

                var otherNodes = [];
                for (var i = 0; i < others.length; i++) {
                    var temp = {};
                    var node = others[i];
                    if (fullgraph.nodes[node].type === 'program') {
                        temp.label = fullgraph.nodes[node].label;
                        temp.amount = fullgraph.nodes[node].weight;
                        otherNodes.push(temp);   
                    }
                }
                otherNodes.sort(function(a, b) { return a.amount - b.amount; }).reverse();

                var amount = currencyFormat(d.weight);
                var content;

                if (d.id in descriptions) {
                  content = '<h4>' + d.id + '</h4>' +
                    '<p>Funding: ' + amount + '</p>' +
                    '<p class="description">' + descriptions[d.id].description + '</p>';
                } else {
                  content = '<h4>' + d.id + '</h4>' +
                    '<p>Funding: ' + amount + '</p>'+
                    '<p class="description"> No description available</p>'; 
                }
                for (var i = 0; i < otherNodes.length; i++) {
                    var s = '<p class="subtext">' + otherNodes[i].label + '</p>';
                    content += s;
                }

                tooltip.on(content);
            }
        })
        .on('mouseout', function(d) {
            tooltip.off();
        });

    bar.append('rect')
        .attr('class', 'row-button')
        .attr('width', '100%')
        .attr('height', barHeight - barspacing);

    bar.append("rect")
        .attr("class", "bar")
        .classed('deselected-bar', false)
        .attr("height", barHeight - barspacing)
        .attr("width", barWidth)
        .style('fill', function(d) {
            if (d.type === 'corporation') {
                return corporationColor;
            } else if (d.type === 'university') {
                return universityColor;
            } else {
                return 'rgb(59, 59, 59)';
            }
        })
        .style('cursor', 'pointer')
        .style('pointer-events', 'none');

    bar.append('text')
        .attr('x', 2)
        .attr('y', barHeight / 2)
        .attr("dy", ".35em")
        // .style('fill', function(d) {
        //     // console.log(d);
            
        // })
        .html(function(d) {
            return d.id;
        });


    // EXIT
    bars.exit()
        .transition()
        .style('opacity', 0)
        .remove();

    
}

var tooltip = {
    on: function(content) {
        $("#tooltip")
            .html(content)
            .css("visibility", "visible")
            .css('left', (event.pageX + 20) + "px")
            .css('top', (event.pageY - 10) + "px");
    },
    off: function() {
        $("#tooltip").empty();
        $("#tooltip").css("visibility", "hidden");
    }
};