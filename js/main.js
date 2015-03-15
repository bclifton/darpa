$(document).ready(function(){

	var width = $(window).width() - 300;
	var height = 500;
	var radius = 4;

	var colorScale = d3.scale.category20b();

	var force = d3.layout.force()
	    .gravity(0.1)
	    .charge(-20)
	    .linkDistance(10)
	    .size([width, height]);

	var svg = d3.select("#graphic").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	d3.json("data/data.json", function(error, graph) {
	  
		if (error) return console.error(error);
		// console.log(graph);

		force
		    .nodes(graph.nodes)
		    .links(graph.links)
		    .on("tick", tick)
		    .start();

		var drag = force.drag()
		    .on("dragstart", dragstart);

		var weightMin = d3.min(graph.nodes, function(d){ return d.weight; });
		var weightMax = d3.max(graph.nodes, function(d){ return d.weight; });

		// Why is the weight of the nodes being attributed to the count not value?
		console.log(weightMin, weightMax);

		var radiusScale = d3.scale.linear()
			.domain([ weightMin, weightMax])
			.range([2, 20]);

		var link = svg.selectAll("line")
	    	.data(graph.links)
	    	.enter()
	    	.append("line");

	    // var link = svg.append("path")
	    //       .attr("class", "link");

		var node = svg.selectAll(".node")
	    	.data(graph.nodes)
	    	.enter()
	    	.append("g")
			.attr("class", "node")
	    	.call(force.drag);
	    
	    node.append('circle')
	    	.attr("r", function(d) {
	    		if (d.type === 'university' || d.type === 'corporation') {
	    			return radiusScale(d.weight);
	    		} else {
	    			return 2;
	    		}
	    	})
	    	.style("fill", function(d) {

	    		// console.log(d.partition);
	    		return colorScale(d.partition);

	    		// if (d.type === 'corporation') {
	    		// 	return 'rgba(173, 208, 238, 1)';
	    		// } else if (d.type === 'university') {
	    		// 	return 'rgba(246, 179, 53, 1)';
	    		// } else {
	    		// 	return 'rgba(50, 50, 50, 1)'; 	
	    		// }
	    	})
	    	// .style("stroke", function(d) { 

	    	// 	if (d.type === 'corporation') {
	    	// 		return d3.rgb(173, 208, 238).darker();
	    	// 	} else if (d.type === 'university') {
	    	// 		return d3.rgb(246, 179, 53).darker();
	    	// 	} else {
	    	// 		return 'rgba(50, 50, 50, 1)'; 
	    	// 	}
    		// })
            .on("dblclick", dblclick)
            .call(drag);

	    // node.append('text')
	    // 	.attr('class', 'nodetext')
	    // 	.attr('dx', 12)
	    // 	.attr('dy', '.35em')
	    // 	.text(function(d){ return d.id; });

	
	  	function tick() {
	  		node.attr("transform", function(d) {
	  			var dx = Math.max(radius, Math.min(width - radius, d.x));
	  			var dy = Math.max(radius, Math.min(height - radius, d.y));
	  			return "translate(" + dx + "," + dy + ")"; 
	  		});
	  		// link.attr("d", "M" + graph.links.map(function(d) { return d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y; }).join("M"));
		    link.attr("x1", function(d) { return d.source.x; })
		        .attr("y1", function(d) { return d.source.y; })
		        .attr("x2", function(d) { return d.target.x; })
		        .attr("y2", function(d) { return d.target.y; });
		}

		function dblclick(d) {
			d3.select(this).classed("fixed", d.fixed = false);
		}

		function dragstart(d) {
			d3.select(this).classed("fixed", d.fixed = true);
		}

	});

});
