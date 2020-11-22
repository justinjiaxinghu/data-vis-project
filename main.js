var width = 1000;
var height = 3500;

d3.csv("books.csv", function (csv) {

    var authors = [];

    for (var i = 0; i < csv.length; i++) {
        csv[i].Author = String(csv[i].Author);
        if (!authors.includes(csv[i].Author)) {
            authors.push(csv[i].Author);
        }
        csv[i].Price = Number(csv[i].Price);
        csv[i].Year = Number(csv[i].Year);
        csv[i].Genre = String(csv[i].Genre);
    }

    // console.log(authors);

    var year_extent = d3.extent(csv, function (data) {
        return data.Year;
    })

    // var author_extent = d3.extent(csv, function(data) {
    //     return data.Author;
    // })

    // console.log(author_extent);

    var xScale = d3.scaleLinear().domain(year_extent).range([0, 950]);
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