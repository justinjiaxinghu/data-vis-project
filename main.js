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

    console.log(testData);

    var min = 1000; //min value for y axis
    var max = 0;    //max value for y axis
    var fictionYearMap = new Map();    //map of values for non fiction books, ie 2009 : 2
    var nonFictionYearMap = new Map(); //map of values for fiction books, ie 2009 : 2

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
    console.log(nonFictionYearMap);

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

    var xScale = d3.scaleOrdinal().domain(xDomain).range(xRange);
    var xAxis = d3.axisBottom().scale(xScale);
    
    var yScale = d3.scaleLinear().domain([min - 3, max + 3]).range([500, 0]);
    var yAxis = d3.axisLeft().scale(yScale);
    
    

    var chart = d3
                    .select("#chart")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);
    var circles = chart
                    .selectAll("circle")
                    .data(csv)
                    .enter()
                    .append("circle")
                    .attr("id", function(d,i) {
                        return i;
                    })
                    .attr("stroke", "black")
                    .attr("cx", function (d) {
                        return xScale(d.Year) + 150;
                    })
                    .attr("cy", function (d) {
                        /* todo change to match preprocessed data */
                        // return yScale(d.Author) + 6;
                        return 0;
                    })
                    .attr("r", 2);

    
    chart 
                    .append("g") 
                    .attr("transform", "translate(150," + (550) + ")")
                    .call(xAxis) 
                    .append("text")
                    .attr("class", "label")
                    .attr("x", width - 16)
                    .attr("y", -6)
                    .style("text-anchor", "end");

    chart
                    .append("g")
                    .attr("transform", "translate(150, 50)")
                    .call(yAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end");

});