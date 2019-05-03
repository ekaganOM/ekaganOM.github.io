//passenger 'ID'
let passengerID = 1;

//previous timer instance
let timerInstance;

//sizeOfGrid 
let gridSize = 70;

//carLocation number 
let carLocation = 0;

//car route
let route = [];

//creates the grid layout of size W x H of screen
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

// adds car to the centre row of the screen
function addCar(size) {
    var width = Math.floor($(window).width()/size);
    //calculate the middle row for the screen 
    var height = Math.floor($(window).height()/size);
    var calcHeight = Math.floor((height/2));
    var carHeight = (calcHeight % 2 == 0 ? calcHeight-1 : calcHeight);

    carLocation = (carHeight * width )+ 1; 
    $(".grid div:nth-child("+ carLocation + ")").append("<img id='car' src='./car.png' alt='Car'>");
}

function animateCar(){
    // $("#car").animate({"left": "+=50"});  // right
    // $("#car").animate({"top": "+=50"});   // down
    // $("#car").animate({"top": "-=50"});   // up 
    while(route.length > 0){
        var direction = route[0];
        switch(direction) {
            case "r":
                $("#car").animate({"margin-left": "+=69"}, "slow");
                break;
            case "u":
                $("#car").animate({"margin-top": "-=69"}, "slow");
                break;
            case "d":
                $("#car").animate({"margin-top": "+=69"}, "slow");
                break;
            default: //shouldn't reach here
                $("#car").animate({"margin-left": "+=69"}, "slow");
        }
        route.shift();
    }
}
function updateRoute(firstCell, secondCell){

    var width = Math.floor($(window).width()/gridSize);
    if(passengerID == 1){ //participant
        //get the best route between car and pick up 1
        //first if ((firstcell- carLocation)/ width < 1 ) => keep going right 

        if(carLocation < firstCell && (firstCell- carLocation)/ width < 1 ){
            for(var i = 0; i < firstCell - carLocation; i++){
                route.push("r");
            }  
        }
        
        //second if pick up is above => 
        else if (carLocation > firstCell){
            while (carLocation > firstCell){
                //keep subtracting width from car location 
                //for every subtract go up one step 
                //when looop ends 
                //do the same as first if 
                carLocation -= width;
                route.push("u");
            }
            for(var i = 0; i < firstCell - carLocation; i++){
                route.push("r");
            } 
        }

        else if(carLocation + width < firstCell){
            while(carLocation + width < firstCell){
                carLocation += width;
                route.push("d");
            }
            for(var i = 0; i < firstCell - carLocation; i++){
                route.push("r");
            } 
        }
    }
    animateCar(); 
}
function getLocations(dropoffColumn = null){
    //get two random locations on the grid
    var totalGrids = $(".grid").children().length;

    let first = 0, second = 0;
    var width = Math.floor($(window).width()/gridSize);
    var height = Math.floor($(window).height()/gridSize);

    //ROW RANGE CALCULATIONS 
    //rowRange divides the screen into 3 parts and uses the middle part only 
    var rowRange = Math.floor(height/3); 
    var topRange = carLocation - 1 - (width * (rowRange - 1));
    var bottomRange = carLocation - 1 + (width * (rowRange + 1));

    //COLUMN RANGE CALCULATIONS 
    var colRange = Math.floor(width/3);
    //different passengers have different regions on the grid for their locations

    if(passengerID == 1){ //participant
        //makes sure the location is never on boundary 
        while (first < topRange || first % width < 3 || first > bottomRange || first % width > colRange) {
            first = Math.floor((Math.random() * totalGrids) + 2);
        }
        while (second < topRange || second % width < colRange + 1 || second > bottomRange || second % width > (width - 2)) {
            second = Math.floor((Math.random() * totalGrids) + 2);
        } 
    }
    else{ //2nd passenger 
        //makes sure the location is never on boundary 
        while (first < topRange || first % width < colRange + 1 || first > bottomRange || first % width > (width - 2) ||
                first % width == dropoffColumn) {
            first = Math.floor((Math.random() * totalGrids) + 2);
        }
        while (second < topRange || second % width < colRange + 1 || second > bottomRange || second % width > (width - 2) ||
                (second % width == dropoffColumn || second % width == first)) {
            second = Math.floor((Math.random() * totalGrids) + 2);
        } 
    }
   
    //to decide which is pickup and dropoff based on grid number 
    var firstMod = first % width;
    var secondMod = second % width;
  
    //gets the DOM element for the two locations
    var pickup = $(".grid div:nth-child(" + (firstMod < secondMod ? first : second) + ")");
    var dropoff = $(".grid div:nth-child(" + (firstMod < secondMod ? second : first) + ")");

    //add the destination image on the two random locations.
    pickup.append("<img class='destination' src='./d" + passengerID + 
        ".png' alt='Destination'><strong class= 'locTag' >Pick up Passenger " + passengerID + "</strong>");
    dropoff.append("<img class='destination' src='./d" + passengerID + 
        ".png' alt='Destination'><strong class= 'locTag' >Drop off Passenger " + passengerID + "</strong>");

    updateRoute(first, second);
    //update passengerID for the next destination image. 
    passengerID++;

    return firstMod < secondMod ? secondMod : firstMod;
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
            timer = duration;
        }
    }, 1000);
}

//displays start time from 5 minutes and updates the timer.
function countDown() {
    //start the timer from 5 minutes
    let countDown = 5;
    let countdownText = countDown + ":00"
    document.getElementById("time").innerHTML = countdownText;
    var numSeconds = 60 * countDown - 1;
    updateTimer(numSeconds);
};

//execution starts here 
createGrid(gridSize);
addCar(gridSize);

setTimeout(() => {
    //first passenger locations after 3 second delay

    let p1Dropoff = getLocations();
    countDown();

    //after 20 seconds, add another pair of locations
    setTimeout(() => {

        getLocations(p1Dropoff);
        //get the time remaining and add 3 minutes to it every time a new passenger is added
        let newDuration = parseInt(document.getElementById("time").innerHTML.split(":")[0]) * 60 + 
            parseInt(document.getElementById("time").innerHTML.split(":")[1]) + 180;
        updateTimer(newDuration);

    }, 20000);

}, 3000);