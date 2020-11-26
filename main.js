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

    var testData = d3.nest().key(function (d) {
                            return d.Genre;
                        })
                        .key(function (d) {
                            return d.Year;
                        })
                        .object(csv);

    var min = 1000; // min value for y axis
    var max = 0;    // max value for y axis
    var fictionYearMap = [];    // array of values for non fiction books, ie 2009 : 2
    var nonFictionYearMap = []; // array of values for fiction books, ie 2009 : 2


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
        nonFictionYearMap.push({x : currKey, y : val});
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
        fictionYearMap.push({x : currKey, y : val});
    }

    var xScale = d3.scaleOrdinal().domain(xDomain).range(xRange);
    var xAxis = d3.axisBottom().scale(xScale);
    
    var yScale = d3.scaleLinear().domain([min - 3, max + 3]).range([500, 0]);
    var yAxis = d3.axisLeft().scale(yScale);


    var chart = d3.select("#chart")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(20, 10)")
    
    chart.append("g") 
        .attr("transform", "translate(20, 550)")
        .call(xAxis) 
        .append("text")
        .attr("class", "label")
        .attr("x", width - 16)
        .attr("y", -6)
        .style("text-anchor", "end");

    
    chart.append("g")
        .attr("transform", "translate(20, 50)")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    var fictionLine = d3.line()
        .x(function(d) { return xScale(d.x);}) // mapping xscale to the data on x-axis
        .y(function(d) { return yScale(d.y);}) // mapping yscale to the data on y-axis

    chart.append("path")
        .attr("class", "line")
        .attr("d", fictionLine(fictionYearMap)) //adding fiction line to chart
        .attr("transform", "translate(20, 49)")
        .style('stroke', 'green') //setting the line color
        .style('fill', 'none');// setting the fill color

    var nonFictionLine = d3.line()
        .x(function(d) { return xScale(d.x);}) // mapping xscale to the x-axis
        .y(function(d) { return yScale(d.y);}) // mapping yscale to the y-axis

    console.log(nonFictionYearMap)

    chart.append("path")
        .attr("class", "line")
        .attr("d", nonFictionLine(nonFictionYearMap)) //adding non fiction line to chart
        .attr("transform", "translate(20, 52)")
        .style('stroke', 'black')
        .style('fill', 'none');
});