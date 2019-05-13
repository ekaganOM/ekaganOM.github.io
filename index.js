//set the treatment number
// Treatment 1: one additional passenger, dropped off before you
// Treatment 2: two additional passengers, both dropped before you
// Treatment 3: one additional passenger, dropped off before you
let treatment = 2;

//sizeOfGrid
let gridSize = 70;

let width = Math.floor($(window).width()/gridSize);
let height = Math.floor($(window).height()/gridSize);

//previous timer instance
let timerInstance;

//ROW RANGE CALCULATIONS
//rowRange divides the screen into 3 parts and uses the middle part only
let rowRange = Math.floor(height/3);
//COLUMN RANGE CALCULATIONS
let colRange = Math.floor(width/3);

let topRange = 0;
let bottomRange = 0;

//order in which car reaches the locations p1,p2,d1,d2
let orderOfLocations = {};
let columnIndex = [];

//p1,p2,d1,d2
let p1 = 0, p2 = 0, d1 = 0, d2 = 0;
let p1Mod = 0, p2Mod = 0, d1Mod = 0, d2Mod = 0;

//user rating
let rating = -1;
let ratingList = [];

//car route
let route = [];

//carLocation number
let carLocation = 0;

//move car off the screen
let endLocation = 0;

//number of stops reached
let numStopsReached = 0;

//creates the grid layout of size W x H of screen
function createGrid() {
    var ratioW = Math.floor($(window).width()/gridSize),
        ratioH = Math.floor($(window).height()/gridSize);

    var parent = $('<div />', {
        class: 'grid',
        width: ratioW  * gridSize,
        height: ratioH  * gridSize
    }).addClass('grid').appendTo('body');

    for (var i = 0; i < ratioH; i++) {
        for(var p = 0; p < ratioW; p++){
            $('<div />', {
                width: gridSize - 1,
                height: gridSize - 1
            }).appendTo(parent);
        }
    }
}

// adds car to the centre row of the screen, along with the main horizontal route
function addCar() {
    var calcHeight = Math.floor((height/2));
    var carHeight = (calcHeight % 2 == 0 ? calcHeight-1 : calcHeight);

    carLocation = (carHeight * width) + 1;
    var initialLocation = carLocation;
    endLocation = carLocation + width - 1;
    topRange = carLocation - 1 - (width * (rowRange - 1));
    bottomRange = carLocation - 1 + (width * (rowRange + 1));

    //add car to screen
    $(".grid div:nth-child("+ carLocation + ")").append("<img id='car' src='images/car.png' alt='Car'>" );

    //adds the main path at the same location
    $(".grid div:nth-child("+ carLocation + ")").append("<hr class='majorRoute'>");
    $(".majorRoute").width($(".grid").width());

    //create the trail to the locations.
    $(".minorRoute").height($(".grid div").height());
}

//timer
function updateTimer(duration) {
    var display = display = document.querySelector('#time');
    var timer = duration, minutes, seconds;

    clearInterval(timerInstance);
    timerInstance = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = 0;
        }
    }, 1000);

}

//displays start time from 1 minute and updates the timer.
function countDown() {
    //start the timer from 1 minutes
    let countDown = 1;
    let countdownText = countDown + ":00"
    document.getElementById("time").innerHTML = countdownText;
    var numSeconds = 60 * countDown - 1;
    updateTimer(numSeconds);
}

//creates locations for passengers
function getLocations(){
    var calcHeight = Math.floor((height/2));
    var carHeight = (calcHeight % 2 == 0 ? calcHeight-1 : calcHeight);
    var startLocation = (carHeight * width) + 1;

    //divides grid into equal portions to space out locations.
    //this is to account for screen sizes.
    var fifthWidth = Math.floor(width/5);
    var fifthHeight = Math.floor(height/5);

    var first = (startLocation + fifthWidth) - width;
    var second = (startLocation + (fifthWidth * 2)) +  (fifthHeight * width);
    var third = startLocation + (fifthWidth * 3) - (fifthHeight * width);
    var fourth = (startLocation + (fifthWidth * 4)) +  (fifthHeight * width);

    //if treatment == 1, one additional passenger.
    //if treatment == 2, P2 displayed after P1 droppff, on specific location.
    //if treatment == 3, P2 displayed inbetween P1, on a specific location.
    if(treatment == 1){
        p1 = first;
        d1 = second;
        p1Mod = p1 % width;
        d1Mod = d1 % width;
        orderOfLocations[p1Mod] = p1;
        orderOfLocations[d1Mod] = d1;
    }

    //p2 gets dropped off after p1
    else if(treatment == 2){
        p1 = first;
        d1 = second;
        p2 = third;
        d2 = fourth;

        p1Mod = p1 % width;
        d1Mod = d1 % width;
        p2Mod = p2 % width;
        d2Mod = d2 % width;

        orderOfLocations[p1Mod] = p1;
        orderOfLocations[d1Mod] = d1;
        orderOfLocations[p2Mod] = p2;
        orderOfLocations[d2Mod] = d2;
    }

    //p2 gets dropped off before p1
    else if (treatment == 3){
        p1 = first;
        p2 = second;
        d2 = third;
        d1 = fourth;

        p1Mod = p1 % width;
        d1Mod = d1 % width;
        p2Mod = p2 % width;
        d2Mod = d2 % width;

        orderOfLocations[p1Mod] = p1;
        orderOfLocations[d1Mod] = d1;
        orderOfLocations[p2Mod] = p2;
        orderOfLocations[d2Mod] = d2;
    }

    //go to the end location always
    orderOfLocations[width] = endLocation;

    //makes a list of all locations in order.
    columnIndex = Object.keys(orderOfLocations);
}

//increases the timer when new passengers are added.
//displays the locations on screen for pick up only.
function addLocations(passengerID){

    setTimeout(function (){
        let newDuration = parseInt(document.getElementById("time").innerHTML.split(":")[0]) * 60 +
        parseInt(document.getElementById("time").innerHTML.split(":")[1]) + 22;
        updateTimer(newDuration);

        let minutes =  "0" + (parseInt(document.getElementById("time").innerHTML.split(":")[0]));
        let seconds = parseInt(document.getElementById("time").innerHTML.split(":")[1]) + 22;
        let time = minutes + ":" + seconds;
        // alert("alert!!");
        alert("New Passenger added! New time is " + time);
    },20);

    //gets the DOM element for the pick up location.
    var pickup = $(".grid div:nth-child(" + (passengerID == 1 ? p1 : p2) + ")");

    //add the pick up image on the location.
    pickup.append("<img class='destination' src='images/d" + passengerID +
        ".png' alt='Destination'><strong class= 'locTag' >Pick up Passenger " + passengerID + "</strong>");
}

function updateRoute(cell){
    let displacedCells = 0; //number of cells moved up/down
    let direction = '';
    var dest = 0; //passengerID for drop off

    //get the best route between car and cell
    //if location in the same line => keep going right
    if(carLocation < cell && (cell - carLocation)/ width < 1 ){
        var j = cell - carLocation;
        for(var i = 0; i < j; i++){
            route.push("r");
            carLocation++;
        }
    }
    // if location is above
    else if (carLocation > cell){
        //direction is changed to "up" for animate to remove visited location
        direction = "up";
        //gets to the same column
        while((carLocation % width) != (cell % width)){
            route.push("r");
            carLocation++;
        }
        //go up
        while (carLocation > cell){
            $(".grid div:nth-child("+ (carLocation) + ")").prepend("<div class='minorRoute'></div>");
            carLocation -= width;
            route.push("u");
            displacedCells++;
        }
    }
    //if location is down
    else if(carLocation + width < cell){
        //add the destination image to the screen.
        if(numStopsReached == 1){
            dest = 1;
        }
        else{
            dest = 2;
        }
        var dropoff = $(".grid div:nth-child(" + (dest == 1 ? d1 : d2) + ")");
        dropoff.append("<img class='destination' src='images/d" + dest +
        ".png' alt='Destination'><strong class= 'locTag' >Drop off Passenger " + dest + "</strong>");

        //direction is changed to "down" for animate to remove visited location
        direction = "down";
        //gets to the same column
        while((carLocation % width) != (cell % width)){
            route.push("r");
            carLocation++;
        }
        //go down
        while(carLocation < cell){
            carLocation += width;
            //adds the route to destination on the screen.
            $(".grid div:nth-child("+ (carLocation) + ")").prepend("<div class='minorRoute'></div>");
            route.push("d");
            displacedCells++;
        }
    }
    //pause before going back to track
    route.push("p");

    setTimeout(function(){
        animateCar(cell, displacedCells, direction);
    }, 2500);

}

//animate car includes:
//pauseAndRemove - pauses the car at destinations and removes the destination when visited
//adjustRoute - rotates and moves the car up/down. Recursively calls itself to work through the route.
function animateCar(cell, displacedCells, dir){
    //index of destination
    let stopIndex = route.indexOf("p");

    //steps till cell
    let currStep = 0;

    //pause car at destination,
    function pauseAndRemove(){
        currStep++;
        if(stopIndex == currStep){
            numStopsReached++;

            //removes previous destination.
            let children = $(".grid div:nth-child(" + cell + ")").children();
            var i = dir == "down" ? 1 : 0;
            for(i ; i < children.length; i++){
                children[i].remove();
            }

            //add location of second passenger to the screen according to the treatment
            if(treatment == 2 && numStopsReached == 2){
                addLocations(2);
            }
            else if(treatment == 3 && numStopsReached == 1){
                addLocations(2);
            }

            setTimeout(function(){
                //brings car back to track.
                if(dir == "up"){
                    for (var i = displacedCells; i > 0; i--){
                        route.push("d");
                        carLocation += width;
                    }
                }
                else {
                    for (var i = displacedCells; i > 0; i--){
                        route.push("u");
                        carLocation -= width;
                    }
                }
                //remove the visited location from the list.
                columnIndex.shift();
                if(columnIndex.length > 0){
                    //we know we've paused, so remove that pause from the route before calculating the rest
                    route.shift();
                    updateRoute(orderOfLocations[columnIndex[0]]);
                }
            }, 0);
        }
    }

    //recursively calls itself to shift route
    function adjustRoute(){
        if(route.length > 0){
            var direction = route[0];
            switch(direction) {
                //syntax for animation: $(selector).supremate(properties,speed,easing,callback);
                case "r":
                    $("#car").css({
                        "-webkit-transform": "rotate(0deg)",
                        "-moz-transform": "rotate(0deg)",
                        "transform": "rotate(0deg)"
                    });

                    $("#car").supremate({"left": "+=70"}, 25, "linear", function(){
                        route.shift();
                        pauseAndRemove();
                        adjustRoute();
                    });
                    break;
                case "u":
                    $("#car").css({
                        "-webkit-transform": "rotate(-90deg)",
                        "-moz-transform": "rotate(-90deg)",
                        "transform": "rotate(-90deg)"
                    });

                    $("#car").supremate({"top": "-=70"}, 25, "linear", function(){
                        route.shift();
                        pauseAndRemove();
                        adjustRoute();
                    });
                    break;
                case "d":
                    $("#car").css({
                        "-webkit-transform": "rotate(90deg)",
                        "-moz-transform": "rotate(90deg)",
                        "transform": "rotate(90deg)"
                    });

                    $("#car").supremate({"top": "+=70"}, 25, "linear", function(){
                        route.shift();
                        pauseAndRemove();
                        adjustRoute();
                    });
                    break;
                case "p":
                    break;
                default: //shouldn't reach here
                    $("#car").css({
                        "-webkit-transform": "rotate(0deg)",
                        "-moz-transform": "rotate(0deg)",
                        "transform": "rotate(0deg)"
                    });

                    $("#car").supremate({"left": "+=70"}, 25, "linear", function(){
                        route.shift();
                        pauseAndRemove();
                        adjustRoute();
                    });
            }
        }
    }

    adjustRoute();
}

//execution starts here
createGrid();
addCar();
getLocations();
countDown();

setTimeout(function(){
    //first passenger locations after 2 second delay
    addLocations(1);
    updateRoute(orderOfLocations[columnIndex[0]]);
}, 2000);

