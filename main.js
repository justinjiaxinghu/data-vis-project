var width = 1200;
var height = 1000;

d3.csv("books.csv", function (csv) {

    /* split up x axis so that there's enough space for all 11 years */
    var xRange = [];
    for (var i = 0; i < 900; i+=(900/11)) {
        xRange.push(i);
    }

    /* domain for x axis aka years that data was recorded */
    var xDomain = ["2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"];

    csv.forEach(function(d) {
        d.Genre = d.Genre
        d.Year = +d.Year;
        d.value = d.length;
    });

    var nest = d3.nest()
	  .key(function(d){
	    return d.Genre;
	  })
	  .key(function(d){
	  	return d.Year;
	  })
      .entries(csv)
    

    var testData = d3.nest()
                    .key(function (d) {
                        console.log(d.Genre)
                        return d.Genre;
                    })
                    .key(function (d) {
                        return d.Year;
                    })
                    .rollup(function (d) {
                        return d.length;
                    })
                    .object(csv);

    var min = 1000; //min value for y axis
    var max = 0;    //max value for y axis
    var fictionYearMap = new Map();    //map of values for non fiction books, ie 2009 : 2
    var nonFictionYearMap = new Map(); //map of values for fiction books, ie 2009 : 2

    var colors = d3.scaleOrdinal()
    .domain(["strawberry", "grape"])
    .range(["#EF5285", "#88F284"]);



    var nonFictionKeys = Object.keys(testData["Non Fiction"]);
    for (var i = 0; i < nonFictionKeys.length; i++) {
        var currKey = nonFictionKeys[i];
        var val = testData["Non Fiction"][currKey].length;
        if (val < min) {
            min = val;
        }
        if (val > max) {
            max = val;
        }
        nonFictionYearMap.set(currKey, val);
    }


    var fictionKeys = Object.keys(testData["Fiction"]);
    for (var i = 0; i < fictionKeys.length; i++) {
        var currKey = fictionKeys[i];
        var val = testData["Fiction"][currKey].length;
        if (val < min) {
            min = val;
        }
        if (val > max) {
            max = val;
        }
        fictionYearMap.set(currKey, val);
    }

    var x = d3.scaleOrdinal().domain(xDomain).range(xRange);
    var xAxis = d3.axisBottom().scale(x);
    
    var y = d3.scaleLinear()
                .domain([min - 3, max + 3])
                .range([500, 0]);
    var yAxis = d3.axisLeft().scale(y);

    var chart = d3.select("#chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height);   
                

                
    var valueLine = d3.line()
                .x(function(d) { return x(d.Year); })
                .y(function(d) { return y(+d.length); })

    console.log("val",valueLine)
            
    
    chart.selectAll("circle")
        .data(csv)
        .enter()
        .append("circle")
        .attr("id", function(d,i) {
            return i;
        })
        .attr("stroke", "black")
        .attr("cx", function (d) {
            return x(d.Year) + 150;
        })
        .attr("cy", function (d) {
            /* todo change to match preprocessed data */
            //return yScale(d.Author) + 6;
            return 0;
        })
        .attr("r", 2);

    
    chart.append("g") 
        .attr("transform", "translate(150," + (550) + ")")
        .call(xAxis) 
        .append("text")
        .attr("class", "label")
        .attr("x", width - 16)
        .attr("y", -6)
        .style("text-anchor", "end");

    chart.append("g")
        .attr("transform", "translate(150, 50)")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end"); 
        
    var genreGroups = chart.selectAll(".genreGroups")
	    .data(nest)
	    .enter()
	    .append("g")
        .attr("stroke", function(d){ return colors(d.key)});
    
    var paths = genreGroups.selectAll(".line")
        .data(function(d){ return d.values})
        .enter()
        .append("path");
    paths
	    .attr("d", function(d){
		  return valueLine(d.values)
		})
		.attr("class", "line")
		.style("stroke-dasharray")
});