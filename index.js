function createGrid(size) {
    var ratioW = Math.floor($(window).width()/size),
        ratioH = Math.floor($(window).height()/size);
    
    var parent = $('<div />', {
        class: 'grid', 
        width: ratioW  * size, 
        height: ratioH  * size
    }).addClass('grid').appendTo('body');

    for (var i = 0; i < ratioH; i++) {
        for(var p = 0; p < ratioW; p++){
            $('<div />', {
                width: size - 1, 
                height: size - 1
            }).appendTo(parent);
        }
    }
}

createGrid(70);
$(".grid div:nth-child(1)").append("<img class='car' src='./car.png' alt='Car'>")

var totalGrids = $(".grid").children().length;
var first = Math.floor((Math.random() * totalGrids) + 2);
var second = Math.floor((Math.random() * totalGrids) + 2);

var firstCell = $(".grid div:nth-child(" + first + ")");
var secondCell = $(".grid div:nth-child(" + second + ")");

firstCell.append("<img class='destination' src='./destination.png' alt='Destination'>");
secondCell.append("<img class='destination' src='./destination.png' alt='Destination'>");