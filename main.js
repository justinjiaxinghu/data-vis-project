var width = 1000;
var height = 1000;

d3.csv("books.csv", function (csv) {

    for (var i = 0; i < csv.length; i++) {
        csv[i].Author = String(csv[i].Author);
        csv[i].Price = Number(csv[i].Price);
        csv[i].Year = Number(csv[i].Year);
        csv[i].Genre = String(csv[i].Genre);
    }

    
});