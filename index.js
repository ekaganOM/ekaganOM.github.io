//passenger 'ID'
let passengerID = 1;

//creates the grid layout
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
//adds the car to the screen
$(".grid div:nth-child(1)").append("<img class='car' src='./car.png' alt='Car'>")

function getLocations(){
    //get two random locations on the grid
    var totalGrids = $(".grid").children().length;
    var first = Math.floor((Math.random() * totalGrids) + 2);
    var second = Math.floor((Math.random() * totalGrids) + 2);

    //gets the DOM element for the two locations
    var firstCell = $(".grid div:nth-child(" + first + ")");
    var secondCell = $(".grid div:nth-child(" + second + ")");

    //add the destination image on the two random locations.
    firstCell.append("<img class='destination' src='./d" + passengerID + ".png' alt='Destination'>");
    secondCell.append("<img class='destination' src='./d" + passengerID + ".png' alt='Destination'>");

    passengerID++;
}

setTimeout(() => {
    //first passenger locations after 3 second delay
    getLocations();
    //after every 20 seconds, add another pair of locations, max 3 in total 
    var timeout = setInterval(getLocations, 20000)
    setTimeout(() => clearInterval(timeout), 40000);

}, 3000);








