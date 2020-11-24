var width = 1200;
var height = 3500;

d3.csv("books.csv", function (csv) {

    var authors = [];

    for (var i = 0; i < csv.length; i++) {
        csv[i].Author = String(csv[i].Author);
        if (!authors.includes(csv[i].Author)) {
            authors.push(csv[i].Author);
        }
    }

    var year_extent = d3.extent(csv, function (data) {
        return data.Year;
    })

    var xRange = [];
    for (var i = 0; i < 900; i+=(900/11)) {
        xRange.push(i);
    }
    console.log(xRange);

    var xScale = d3.scaleOrdinal().domain(["2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"]).range(xRange);
    var yScale = d3.scaleBand().domain(authors).range([3000, 0]);

    var xAxis = d3.axisBottom().scale(xScale);
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
                        return xScale(d.Year) + 200;
                    })
                    .attr("cy", function (d) {
                        return yScale(d.Author) + 6;
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
    chart
                    .append("g")
                    .attr("transform", "translate(200, 0)")
                    .call(yAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end");

});