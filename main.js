var width = 1000;
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

    var svg = d3.select("#main")
	.select("svg")
	.append("g")
		.attr("transform",
			"translate(20,10)");


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
        .style('stroke', 'red') //setting the line color
        .style('fill', 'none');// setting the fill color

    var nonFictionLine = d3.line()
        .x(function(d) { return xScale(d.x);}) // mapping xscale to the x-axis
        .y(function(d) { return yScale(d.y);}) // mapping yscale to the y-axis

    chart.append("path")
        .attr("class", "line")
        .attr("d", nonFictionLine(nonFictionYearMap)) //adding non fiction line to chart
        .attr("transform", "translate(20, 50)")
        .style('stroke', 'blue')
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
        .attr("fill", "red")
        .attr("cx", function (d) {
            return xScale(d.x) + 20;
        })
        .attr("cy", function (d) {
            return yScale(d.y) + 50;
        })
        .attr("r", 3)
        .on("mouseover", function(d, i) {

            year = d.x
            numberOfBooks = d.y
            ficYearBooks = testData["Fiction"][d.x]

            topFiveBooks = {}
            lowestBook = {}

            for (i = 0; i < ficYearBooks.length; i++) {

                book = ficYearBooks[i]
                name = book["Name"]
                author = book["Author"]
                price = +book["Price"]

                if (Object.keys(topFiveBooks).length < 5) {

                    topFiveBooks[name] = price

                    if (Object.keys(lowestBook).length == 0) {
                        lowestBook["Price"] = price
                        lowestBook["Book"] = name
                    }

                    if (price < lowestBook["Price"]) {
                        lowestBook["Price"] = price
                        lowestBook["Book"] = name
                    }

                } else {
                    
                    if (price > lowestBook["Price"]) {

                        delete topFiveBooks[lowestBook["Book"]]
                        topFiveBooks[name] = price

                        lowestPrice = price
                        lowestBook["Price"] = price
                        lowestBook["Book"] = name

                        for (b in topFiveBooks) {
                            if (topFiveBooks[b] < lowestPrice) {
                                lowestBook["Price"] = topFiveBooks[b]
                                lowestBook["Book"] = b
                                lowestPrice = topFiveBooks[b]
                            }
                        }
                    }
                }
            }
            var items = Object.keys(topFiveBooks).map(function(key) {
                return [key, topFiveBooks[key]]
            });
            items.sort(function(first, second) {
                return second[1] - first[1];
            });
            document.getElementById("topFiveBooksTitle").textContent = "Highest priced fiction books from " + year
            document.getElementById("topFiveBooks1").textContent = "$" + items[0][1] + ": " + items[0][0]
            document.getElementById("topFiveBooks2").textContent = "$" + items[1][1] + ": " + items[1][0]
            document.getElementById("topFiveBooks3").textContent = "$" + items[2][1] + ": " + items[2][0]
            document.getElementById("topFiveBooks4").textContent = "$" + items[3][1] + ": " + items[3][0]
            document.getElementById("topFiveBooks5").textContent = "$" + items[4][1] + ": " + items[4][0]
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
        .attr("fill", "blue")
        .attr("cx", function (d) {
            return xScale(d.x) + 20;
        })
        .attr("cy", function (d) {
            return yScale(d.y) + 50;
        })
        .attr("r", 3)
        .on("mouseover", function(d, i) {

            year = d.x
            numberOfBooks = d.y
            nonficYearBooks = testData["Non Fiction"][d.x]

            topFiveBooks = {}
            lowestBook = {}

            for (i = 0; i < nonficYearBooks.length; i++) {

                book = nonficYearBooks[i]
                name = book["Name"]
                author = book["Author"]
                price = +book["Price"]

                if (Object.keys(topFiveBooks).length < 5) {

                    topFiveBooks[name] = price

                    if (Object.keys(lowestBook).length == 0) {
                        lowestBook["Price"] = price
                        lowestBook["Book"] = name
                    }

                    if (price < lowestBook["Price"]) {
                        lowestBook["Price"] = price
                        lowestBook["Book"] = name
                    }

                } else {
                    
                    if (price > lowestBook["Price"]) {

                        delete topFiveBooks[lowestBook["Book"]]
                        topFiveBooks[name] = price

                        lowestPrice = price
                        lowestBook["Price"] = price
                        lowestBook["Book"] = name

                        for (b in topFiveBooks) {
                            if (topFiveBooks[b] < lowestPrice) {
                                lowestBook["Price"] = topFiveBooks[b]
                                lowestBook["Book"] = b
                                lowestPrice = topFiveBooks[b]
                            }
                        }
                    }
                }
            }
            var items = Object.keys(topFiveBooks).map(function(key) {
                return [key, topFiveBooks[key]]
            });
            items.sort(function(first, second) {
                return second[1] - first[1];
            });
            document.getElementById("topFiveBooksTitle").textContent = "Highest priced non-fiction books from " + year
            document.getElementById("topFiveBooks1").textContent = "$" + items[0][1] + ": " + items[0][0]
            document.getElementById("topFiveBooks2").textContent = "$" + items[1][1] + ": " + items[1][0]
            document.getElementById("topFiveBooks3").textContent = "$" + items[2][1] + ": " + items[2][0]
            document.getElementById("topFiveBooks4").textContent = "$" + items[3][1] + ": " + items[3][0]
            document.getElementById("topFiveBooks5").textContent = "$" + items[4][1] + ": " + items[4][0]
        });

        chart.append("text").attr("x", 520).attr("y", 50).attr("id", "topFiveBooksTitle").text("").style("font-size", "13px").style("font-weight", "bold").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 520).attr("y", 65).attr("id", "topFiveBooks1").text("").style("font-size", "13px").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 520).attr("y", 80).attr("id", "topFiveBooks2").text("").style("font-size", "13px").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 520).attr("y", 95).attr("id", "topFiveBooks3").text("").style("font-size", "13px").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 520).attr("y", 110).attr("id", "topFiveBooks4").text("").style("font-size", "13px").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 520).attr("y", 125).attr("id", "topFiveBooks5").text("").style("font-size", "13px").attr("alignment-baseline","middle")

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
                    .attr("fill", "#842db7")
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


    // Legend
    chart.append("circle").attr("cx", 100).attr("cy",285).attr("r", 5).style("fill", "blue")
    chart.append("circle").attr("cx", 220).attr("cy",285).attr("r", 5).style("fill", "red")
    chart.append("text").attr("x", 113).attr("y", 287).text("Non-Fiction").style("font-size", "13px").attr("alignment-baseline","middle")
    chart.append("text").attr("x", 233).attr("y", 287).text("Fiction").style("font-size", "13px").attr("alignment-baseline","middle")
    
});