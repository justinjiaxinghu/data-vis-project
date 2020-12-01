var width = 600;
var height = 300;

d3.csv("books.csv", function (csv) {
    
    /* split up x axis so that there's enough space for all 11 years */
    var xRange = [];
    for (var i = 0; i < 500; i+=(500/11)) {
        xRange.push(i);
    }

    /* domain for x axis aka years that data was recorded */
    var xDomain = ["2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"];

    var testData = d3
                        .nest()
                        .key(function (d) {
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


    var nonFictionKeys = Object.keys(testData["Non Fiction"]); //map year to # of non fiction books
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

    var fictionKeys = Object.keys(testData["Fiction"]); //map year to # of fiction books
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

    var mean_prices = d3                                //get mean prices
                        .nest()
                        .key(function(d) { return d.Year})
                        .rollup(function (d) { 
                            return d3.mean(d, function(d_1) { 
                                return d_1.Price}
                            )
                        })
                        .object(csv);
    
    //min and max values for mean y axis 
    var min_mean = 1000;
    var max_mean = 0;
    var meanPricesMap = [];
    for (var i = 0; i < xDomain.length; i++) {
        if (mean_prices[xDomain[i]] < min_mean) {
            min_mean = Math.round(mean_prices[xDomain[i]]);
        }
        if (mean_prices[xDomain[i]] > max_mean) {
            max_mean = Math.round(mean_prices[xDomain[i]]);
        }
        meanPricesMap.push({x : xDomain[i], y : mean_prices[xDomain[i]]});
    }
    console.log(meanPricesMap);
    console.log(min_mean);
    console.log(max_mean);

    var xScale = d3.scaleOrdinal().domain(xDomain).range(xRange);
    var xAxis = d3.axisBottom().scale(xScale);
    
    var yScale = d3.scaleLinear().domain([min - 3, max + 3]).range([200, 0]);
    var yAxis = d3.axisLeft().scale(yScale);

    var yScale2 = d3.scaleLinear().domain([min_mean - 3, max_mean + 3]).range([200, 0]);
    var yAxis2 = d3.axisLeft().scale(yScale2);

    var chart = d3.select("#chart")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(20, 10)")
    
    chart.append("g") 
        .attr("transform", "translate(20, 250)")
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
        .attr("transform", "translate(20, 50)")
        .style('stroke', 'green') //setting the line color
        .style('fill', 'none');// setting the fill color

    var nonFictionLine = d3.line()
        .x(function(d) { return xScale(d.x);}) // mapping xscale to the x-axis
        .y(function(d) { return yScale(d.y);}) // mapping yscale to the y-axis

    chart.append("path")
        .attr("class", "line")
        .attr("d", nonFictionLine(nonFictionYearMap)) //adding non fiction line to chart
        .attr("transform", "translate(20, 50)")
        .style('stroke', 'black')
        .style('fill', 'none');

    var fiction_circles = chart
        .selectAll("#fiction_circles")
        .data(fictionYearMap)
        .enter()
        .append("circle")
        .attr("id", function (d,i) {
            return i;
        })
        .attr("class", "fiction_circles")
        .attr("fill", "green")
        .attr("cx", function (d) {
            return xScale(d.x) + 20;
        })
        .attr("cy", function (d) {
            return yScale(d.y) + 50;
        })
        .attr("r", 3)
        .on("click", function(d, i) {
            //d.attr("fill", "blue")

            // p = document.getElementById(i)

            // //for data in testData:

            // // console.log(d.x)
            // // console.log(d.y)
            // // console.log(testData["Fiction"][d.x])

            // topFive = {}
            // ficYearBooks = testData["Fiction"][d.x]
            // console.log("hello")
            // for (book in Object.keys(ficYearBooks)) {
            // }

        });

    var non_fiction_circles = chart
        .selectAll("#non_fiction_circles")
        .data(nonFictionYearMap)
        .enter()
        .append("circle")
        .attr("id", function (d,i) {
            return i;
        })
        .attr("class", "non_fiction_circles")
        .attr("fill", "black")
        .attr("cx", function (d) {
            return xScale(d.x) + 20;
        })
        .attr("cy", function (d) {
            return yScale(d.y) + 50;
        })
        .attr("r", 3);

    var chart2 = d3                         //mean prices bar chart
                    .select("#chart2")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(20, 10)");
    
    chart2
                    .append("g") 
                    .attr("transform", "translate(50, 250)")
                    .call(xAxis) 
                    .append("text")
                    .attr("class", "label")
                    .attr("x", width - 16)
                    .attr("y", -6)
                    .style("text-anchor", "end");

    chart2
                    .append("g")
                    .attr("transform", "translate(20, 50)")
                    .call(yAxis2)
                    .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end");

    chart2
                    .selectAll(".bar")
                    .data(meanPricesMap)
                    .enter()
                    .append("rect")
                    .attr("fill", "steelblue")
                    .attr("x", function (d) {
                        return xScale(d.x) + 40;
                    })
                    .attr("y", function (d) {
                        return yScale2(d.y) + 50;
                    })
                    .attr("width", 20)
                    .attr("height", function (d) {
                        return height - yScale2(d.y) - 100;
                    })
    
});