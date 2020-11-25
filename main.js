var width = 1200;
var height = 3500;

d3.csv("books.csv", function (csv) {

    // var authors = [];

    // for (var i = 0; i < csv.length; i++) {
    //     csv[i].Author = String(csv[i].Author);
    //     if (!authors.includes(csv[i].Author)) {
    //         authors.push(csv[i].Author);
    //     }
    // }

    // var year_extent = d3.extent(csv, function (data) {
    //     return data.Year;
    // })

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

    var fictionYearMap = new Map();
    var nonFictionYearMap = new Map();

    var nonFictionKeys = Object.keys(testData["Non Fiction"]);
    for (var i = 0; i < nonFictionKeys.length; i++) {
        var currKey = nonFictionKeys[i];
        nonFictionYearMap.set(currKey, testData["Non Fiction"][currKey].length);
    }
    console.log(nonFictionYearMap);

    var fictionKeys = Object.keys(testData["Fiction"]);
    for (var i = 0; i < fictionKeys.length; i++) {
        var currKey = fictionKeys[i];
        fictionYearMap.set(currKey, testData["Fiction"][currKey].length);
    }
    console.log(fictionYearMap);

    var xScale = d3.scaleOrdinal().domain(xDomain).range(xRange);
    
    /*todo change y scale*/
    // var yScale = d3.scaleBand().domain(authors).range([3000, 0]);
    // var yAxis = d3.axisLeft().scale(yScale);
    var xAxis = d3.axisBottom().scale(xScale);
    

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
                        return xScale(d.Year) + 200;
                    })
                    .attr("cy", function (d) {
                        /* todo change to match preprocessed data */
                        // return yScale(d.Author) + 6;
                        return 0;
                    })
                    .attr("r", 2);

    
    chart 
                    .append("g") 
                    .attr("transform", "translate(200," + (3000) + ")")
                    .call(xAxis) 
                    .append("text")
                    .attr("class", "label")
                    .attr("x", width - 16)
                    .attr("y", -6)
                    .style("text-anchor", "end");

    /* this is y axis stuff, change when data is preprocessed */
    // chart
    //                 .append("g")
    //                 .attr("transform", "translate(200, 0)")
    //                 .call(yAxis)
    //                 .append("text")
    //                 .attr("class", "label")
    //                 .attr("transform", "rotate(-90)")
    //                 .attr("y", 6)
    //                 .attr("dy", ".71em")
    //                 .style("text-anchor", "end");

});