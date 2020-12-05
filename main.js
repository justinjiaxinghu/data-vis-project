var width = 1300;
var height = 300;

d3.csv("books.csv", function (csv) {

    // split up x axis so that there's enough space for all 11 years
    var xRange = [];
    for (var i = 0; i < 500; i+=(500/11)) {
        xRange.push(i);
    }

    // domain for x axis aka years that data was recorded
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

    // get mean prices
    var mean_prices = d3                                
                        .nest()
                        .key(function(d) { return d.Year})
                        .rollup(function (d) { 
                            return d3.mean(d, function(d_1) { 
                                console.log(d_1.Price);
                                return d_1.Price}
                            )
                        })
                        .object(csv);

    var min = 1000; // min value for y axis
    var max = 0;    // max value for y axis
    var chart;      // line graph
    var chart2;     // bar graph

    var svg = d3.select("#main")
	.select("svg")
	.append("g")
		.attr("transform",
			"translate(20,10)");

//function to populate line and bar graphs
function generateGraphs() {
    chart = d3.select("svg").remove();
    chart2 = d3.select("svg").remove();
    var fictionYearMap = [];    // array of values for non fiction books, ie 2009 : 2
    var nonFictionYearMap = []; // array of values for fiction books, ie 2009 : 2
    var meanPricesMap = [];
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

    //min and max values for mean y axis 
    var min_mean = 1000;
    var max_mean = 0;

    for (var i = 0; i < xDomain.length; i++) { //map year to mean prices of books 
        if (mean_prices[xDomain[i]] < min_mean) {
            min_mean = Math.round(mean_prices[xDomain[i]]);
        }
        if (mean_prices[xDomain[i]] > max_mean) {
            max_mean = Math.round(mean_prices[xDomain[i]]);
        }
        meanPricesMap.push({x : xDomain[i], y : mean_prices[xDomain[i]]});
    }

    //year x axis information
    var xScale = d3.scaleOrdinal().domain(xDomain).range(xRange); 
    var xAxis = d3.axisBottom().scale(xScale);
    
    //line graph y axis information
    var yScale = d3.scaleLinear().domain([0, max + 3]).range([200, 0]);
    var yAxis = d3.axisLeft().scale(yScale);

    //bar graph y axies information
    var yScale2 = d3.scaleLinear().domain([0, max_mean + 3]).range([200, 20]);
    var yAxis2 = d3.axisLeft().scale(yScale2); 

    chart = d3.select("#chart")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(20, 10)");
    //x axis
    chart           .append("g") 
                    .attr("transform", "translate(55, 200)")
                    .call(xAxis) 
                    .append("text")
                    .attr("class", "label")
                    .attr("x", width - 16)
                    .attr("y", -6)
                    .style("text-anchor", "end");
                    
    //x axis year label
    chart      
                    .append("text")
                    .attr("transform", "translate(290" + ", " + (height - 65) + ")")
                    .style("font-size", "12px")
                    .text("Year");    
    //y axis
    chart           .append("g")
                    .attr("transform", "translate(55, 0)")
                    .call(yAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end");
    //y axis label
    chart
                    .append("text")
                    .attr("transform", "translate(30" + "," + (height / 2) + "), rotate(-90)")
                    .style("font-size", "12px")
                    .text("Number of Books");

    var fictionLine = d3.line()
        .x(function(d) { return xScale(d.x);}) // mapping xscale to the data on x-axis
        .y(function(d) { return yScale(d.y);}) // mapping yscale to the data on y-axis

    chart.append("path")
        .attr("class", "line")
        .transition()
        .attr("d", fictionLine(fictionYearMap)) //adding fiction line to chart
        .attr("transform", "translate(55, 0)")
        .style('stroke', 'red') //setting the line color
        .style('fill', 'none');// setting the fill color

    var nonFictionLine = d3.line()
        .x(function(d) { return xScale(d.x);}) // mapping xscale to the x-axis
        .y(function(d) { return yScale(d.y);}) // mapping yscale to the y-axis

    chart.append("path")
        .attr("class", "line")
        .transition()
        .attr("d", nonFictionLine(nonFictionYearMap)) //adding non fiction line to chart
        .attr("transform", "translate(55, 0)")
        .style('stroke', 'blue')
        .style('fill', 'none');
        
    // generating circles for vertices of fiction books of line chart
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
        .on("mouseover", function(d, i) { // hover event to display top 5 rated books

            year = d.x
            numberOfBooks = d.y
            ficYearBooks = testData["Fiction"][d.x]

            topFiveBooks = {}
            lowestBook = {}

            // loop through fiction books
            for (i = 0; i < ficYearBooks.length; i++) {

                book = ficYearBooks[i]
                name = book["Name"]
                author = book["Author"]
                rating = +book["User Rating"]

                // add first 5 books to top5 list
                if (Object.keys(topFiveBooks).length < 5) {

                    topFiveBooks[name] = rating

                    if (Object.keys(lowestBook).length == 0) {
                        lowestBook["User Rating"] = rating
                        lowestBook["Book"] = name
                    }

                    if (rating < lowestBook["User Rating"]) {
                        lowestBook["User Rating"] = rating
                        lowestBook["Book"] = name
                    }

                // swap out lowest rated book for higher rated book in top5 if available
                } else {
                    
                    if (rating > lowestBook["User Rating"]) {

                        delete topFiveBooks[lowestBook["Book"]]
                        topFiveBooks[name] = rating

                        lowestRating = rating
                        lowestBook["User Rating"] = rating
                        lowestBook["Book"] = name

                        for (b in topFiveBooks) {
                            if (topFiveBooks[b] < lowestRating) {
                                lowestBook["User Rating"] = topFiveBooks[b]
                                lowestBook["Book"] = b
                                lowestRating = topFiveBooks[b]
                            }
                        }
                    }
                }
            }

            // sort top5 list
            var items = Object.keys(topFiveBooks).map(function(key) {
                return [key, topFiveBooks[key]]
            });
            items.sort(function(first, second) {
                return second[1] - first[1];
            });

            // add text for book rating
            document.getElementById("topFiveBooksTitle").textContent = "Highest rated fiction books from " + year
            document.getElementById("topFiveBooks1").textContent = items[0][1] + " - " + items[0][0]
            document.getElementById("topFiveBooks2").textContent = items[1][1] + " - " + items[1][0]
            document.getElementById("topFiveBooks3").textContent = items[2][1] + " - " + items[2][0]
            document.getElementById("topFiveBooks4").textContent = items[3][1] + " - " + items[3][0]
            document.getElementById("topFiveBooks5").textContent = items[4][1] + " - " + items[4][0]
        })

        // event for when hover over dot ends
        .on("mouseout", function(d, i) {
            document.getElementById("topFiveBooksTitle").textContent = ""
            document.getElementById("topFiveBooks1").textContent = ""
            document.getElementById("topFiveBooks2").textContent = ""
            document.getElementById("topFiveBooks3").textContent = ""
            document.getElementById("topFiveBooks4").textContent = ""
            document.getElementById("topFiveBooks5").textContent = ""
        });

    // adding animation for fiction circlecs
    fiction_circles
                    .attr("cx", function (d) {
                        return xScale(d.x) + 55;
                    })
                    .transition()
                    .attr("cy", function (d) {
                        return yScale(d.y);
                    })
                    .attr("r", 3)

    // generating circles for vertices of non fiction part of line graph 
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
        .on("mouseover", function(d, i) { // hover event to display top 5 rated books

            year = d.x
            numberOfBooks = d.y
            nonficYearBooks = testData["Non Fiction"][d.x]

            topFiveBooks = {}
            lowestBook = {}

            // loop through non-fiction books
            for (i = 0; i < nonficYearBooks.length; i++) {

                book = nonficYearBooks[i]
                name = book["Name"]
                author = book["Author"]
                rating = +book["User Rating"]

                // add first 5 books to top5 list
                if (Object.keys(topFiveBooks).length < 5) {

                    topFiveBooks[name] = rating

                    if (Object.keys(lowestBook).length == 0) {
                        lowestBook["User Rating"] = rating
                        lowestBook["Book"] = name
                    }

                    if (rating < lowestBook["User Rating"]) {
                        lowestBook["User Rating"] = rating
                        lowestBook["Book"] = name
                    }

                // swap out lowest rated book for higher rated book in top5 if available
                } else {
                    
                    if (rating > lowestBook["User Rating"]) {

                        delete topFiveBooks[lowestBook["Book"]]
                        topFiveBooks[name] = rating

                        lowestRating = rating
                        lowestBook["User Rating"] = rating
                        lowestBook["Book"] = name

                        for (b in topFiveBooks) {
                            if (topFiveBooks[b] < lowestRating) {
                                lowestBook["User Rating"] = topFiveBooks[b]
                                lowestBook["Book"] = b
                                lowestRating = topFiveBooks[b]
                            }
                        }
                    }
                }
            }

            // sort top5 list
            var items = Object.keys(topFiveBooks).map(function(key) {
                return [key, topFiveBooks[key]]
            });
            items.sort(function(first, second) {
                return second[1] - first[1];
            });

            // add text for book rating
            document.getElementById("topFiveBooksTitle").textContent = "Highest rated non-fiction books from " + year
            document.getElementById("topFiveBooks1").textContent = items[0][1] + " - " + items[0][0]
            document.getElementById("topFiveBooks2").textContent = items[1][1] + " - " + items[1][0]
            document.getElementById("topFiveBooks3").textContent = items[2][1] + " - " + items[2][0]
            document.getElementById("topFiveBooks4").textContent = items[3][1] + " - " + items[3][0]
            document.getElementById("topFiveBooks5").textContent = items[4][1] + " - " + items[4][0]
        })

        // event for when hover over dot ends
        .on("mouseout", function(d, i) {
            document.getElementById("topFiveBooksTitle").textContent = ""
            document.getElementById("topFiveBooks1").textContent = ""
            document.getElementById("topFiveBooks2").textContent = ""
            document.getElementById("topFiveBooks3").textContent = ""
            document.getElementById("topFiveBooks4").textContent = ""
            document.getElementById("topFiveBooks5").textContent = ""
        });;

        //adding animation for non fiction circles
        non_fiction_circles
                            .attr("cx", function (d) {
                                return xScale(d.x) + 55;
                            })
                            .transition()
                            .attr("cy", function (d) {
                                return yScale(d.y);
                            })
                            .attr("r", 3);

        // adding text for top5 list
        chart.append("text").attr("x", 600).attr("y", 30).attr("id", "topFiveBooksTitle").text("").style("font-size", "13px").style("font-weight", "bold").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 600).attr("y", 45).attr("id", "topFiveBooks1").text("").style("font-size", "13px").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 600).attr("y", 60).attr("id", "topFiveBooks2").text("").style("font-size", "13px").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 600).attr("y", 75).attr("id", "topFiveBooks3").text("").style("font-size", "13px").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 600).attr("y", 90).attr("id", "topFiveBooks4").text("").style("font-size", "13px").attr("alignment-baseline","middle")
        chart.append("text").attr("x", 600).attr("y", 105).attr("id", "topFiveBooks5").text("").style("font-size", "13px").attr("alignment-baseline","middle")

    chart2 = d3                         
                    .select("#chart2")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(20, 10)");
    //x axis
    chart2
                    .append("g") 
                    .attr("transform", "translate(70, 200)")
                    .call(xAxis) 
                    .append("text")
                    .attr("class", "label")
                    .attr("x", width - 16)
                    .attr("y", -6)
                    .style("text-anchor", "end");

    //x axis year label
    chart2      
                    .append("text")
                    .attr("transform", "translate(287" + ", " + (height - 65) + ")")
                    .style("font-size", "12px")
                    .text("Year");
    
    //y axis
    chart2
                    .append("g")
                    .attr("transform", "translate(55, 0)")
                    .call(yAxis2)
                    .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end");
    
    //y axis label
    chart2
                    .append("text")
                    .attr("transform", "translate(30" + "," + (height / 2) + "), rotate(-90)")
                    .style("font-size", "12px")
                    .text("Mean Price (USD)");
    
    chart2
    
                    .selectAll(".bar")
                    .data(meanPricesMap)
                    .enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("fill", "#842db7")
                    .attr("x", function (d) {
                        return xScale(d.x) + 60;
                    })
                    .attr("width", 20)
                    .attr("y", yScale2(0))
                    .attr("height", 0)
                    .transition()
                    .attr("y", function (d) {
                        return yScale2(d.y);
                    })
                    .attr("height", function (d) {
                        return height - yScale2(d.y) - 100;
                    })
     // Legend
     chart.append("circle").attr("cx", 600).attr("cy",140).attr("r", 5).style("fill", "blue")
     chart.append("circle").attr("cx", 600).attr("cy",160).attr("r", 5).style("fill", "red")
     chart.append("text").attr("x", 620).attr("y", 140).text("Non-Fiction").style("font-size", "13px").attr("alignment-baseline","middle")
     chart.append("text").attr("x", 620).attr("y", 160).text("Fiction").style("font-size", "13px").attr("alignment-baseline","middle")
};
    generateGraphs();
    
    var filter1 = document.getElementById('filter1');
    var filter2 = document.getElementById('filter2');

    //resets data to original information (line graph)
    function resetData() {
        var resetData = d3
                        .nest()
                        .key(function (d) {
                            return d.Genre;
                        })
                        .key(function (d) {
                            return d.Year;
                        })
                        .object(csv);
        testData = resetData;
    }

    //resets data to original information (bar chart)
    function resetData2() {
        var new_mean_prices = d3                                
                        .nest()
                        .key(function(d) { return d.Year})
                        .rollup(function (d) { 
                            return d3.mean(d, function(d_1) { 
                                return d_1.Price;
                            })
                        })
                        .object(csv);
        mean_prices = new_mean_prices
    }

    //creates filter for line graph
    function newFilterData1() {
        var filterData = d3
                        .nest()
                        .key(function (d) {
                            if (Number(d.Price) <= document.getElementById('bookPriceValue').value) {
                                return d.Genre;
                            }
                        })
                        .key(function (d) {
                            if (Number(d.Price) <= document.getElementById('bookPriceValue').value) {
                                return d.Year;
                            }
                        })
                        .object(csv);
        testData = filterData;
    }

    //craetes filter for bar chart 
    function newFilterData2() {
        var new_mean_prices = d3                                
                        .nest()
                        .key(function(d) {
                            if (Number(d.Price) <= document.getElementById('bookMeanValue').value) { 
                                return d.Year
                            }
                        })
                        .rollup(function (d) { 
                            return d3.mean(d, function(d_1) { 
                                return d_1.Price;
                            })
                        })
                        .object(csv);
        mean_prices = new_mean_prices
    }

    d3.select(filter1)
        .append('p')
        .append('button')
            .style("border", "1px solid black")
        .text('Filter Data')
        .on('click', function() {
            resetData();
            newFilterData1();
            generateGraphs();
        });

    d3.select(filter1)
        .append('p')
        .append('button')
            .style("border", "1px solid black")
        .text('Reset Filter')
        .on('click', function() {
            resetData();
            generateGraphs();
        });

    d3.select(filter2)
        .append('p')
        .append('button')
            .style('border', '1px solid black')
        .text('Filter Data')
        .on('click', function() { 
            resetData2();
            newFilterData2();
            generateGraphs();
        });

    d3.select(filter2)
        .append('p')
        .append('button')
            .style("border", "1px solid black")
        .text('Reset Filter')
        .on('click', function() {
            resetData2();
            generateGraphs();
        });
});