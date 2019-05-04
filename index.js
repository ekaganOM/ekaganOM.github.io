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

let width = Math.floor($(window).width()/gridSize);
let height = Math.floor($(window).height()/gridSize);

//ROW RANGE CALCULATIONS 
//rowRange divides the screen into 3 parts and uses the middle part only 
let rowRange = Math.floor(height/3); 
//COLUMN RANGE CALCULATIONS 
let colRange = Math.floor(width/3);

let topRange = 0;
let bottomRange = 0;

//order in which car reaches the locations p1,p2,d1,d2
let orderOfLocations = {};

//columns
let columnIndex = [];

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

// adds car to the centre row of the screen
function addCar() {
    var calcHeight = Math.floor((height/2));
    var carHeight = (calcHeight % 2 == 0 ? calcHeight-1 : calcHeight);

    carLocation = (carHeight * width) + 1; 
    topRange = carLocation - 1 - (width * (rowRange - 1));
    bottomRange = carLocation - 1 + (width * (rowRange + 1));

    $(".grid div:nth-child("+ carLocation + ")").append("<img id='car' src='./car.png' alt='Car'>");
    //adds the main path at the same location 
    $(".grid div:nth-child("+ carLocation + ")").append("<hr class='majorRoute'>");
}

function animateCar(cell){
    while(route.length > 0){
        var direction = route[0];
        switch(direction) {
            case "r":               
                $("#car").animate({"left": "+=69"}, "slow", "linear");            
                break;
            case "u":
                
                $("#car").animate({"top": "-=69"}, "slow", "linear");                          
                break;               
            case "d":                              
                $("#car").animate({"top": "+=69"}, "slow", "linear");                    
                break;
            default: //shouldn't reach here               
                $("#car").animate({"left": "+=69"}, "slow", "linear");               
        }
        route.shift();
    }
    setTimeout(() => {
        columnIndex.shift();
        if(columnIndex.length > 0){
            updateRoute(orderOfLocations[columnIndex[0]]);
        }
    },1000)
    
    //clearing the picked up location
    // if(carLocation == cell){
    //     $(".grid div:nth-child(" + cell + ")").empty();
    // }   
}

function updateRoute(cell){
    //get the best route between car and pick up 1       
    //if pick up in the same line => keep going right 
    if(carLocation < cell && (cell- carLocation)/ width < 1 ){
        var j = cell - carLocation;
        for(var i = 0; i < j; i++){
            route.push("r");
            carLocation += 1;
        }  
    }         
    // if pick up is above 
    else if (carLocation > cell){
        //gets to the same column
        while((carLocation % width) != (cell % width)){
            route.push("r");
            carLocation += 1;
        }
        while (carLocation > cell){
            carLocation -= width;
            route.push("u");
            // $(".grid div:nth-child("+ carLocation + ")").append("<img id='dash' src='./upDown.png'>");
        }
    }
    //if pick up is down
    else if(carLocation + width < cell){
        //gets to the same column
        while((carLocation % width) != (cell % width)){
            route.push("r");
            carLocation += 1;
        }
        while(carLocation < cell){
            carLocation += width;
            route.push("d"); 
            // $(".grid div:nth-child("+ carLocation + ")").append("<img id='dash' src='./upDown.png'>");
        }
    }  
    setTimeout(() => { 
        animateCar(cell);
    }, 4000);
}

function getLocations(dropoffColumn = null){
    //get two random locations on the grid
    var totalGrids = $(".grid").children().length;
    let first = 0, second = 0;

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
                (second % width == dropoffColumn || second % width == first % width)) {
            second = Math.floor((Math.random() * totalGrids) + 2);
        } 
    }  
    //to decide which is pickup and dropoff based on grid number 
    var firstMod = first % width;
    var secondMod = second % width;
  
    orderOfLocations[firstMod] = first;
    orderOfLocations[secondMod] = second;

    if (passengerID == 2){
        columnIndex = Object.keys(orderOfLocations).sort((a,b) => parseInt(a)<parseInt(b));
    }

    //gets the DOM element for the two locations
    var pickup = $(".grid div:nth-child(" + (firstMod < secondMod ? first : second) + ")");
    var dropoff = $(".grid div:nth-child(" + (firstMod < secondMod ? second : first) + ")");

    //add the destination image on the two random locations.
    pickup.append("<img class='destination' src='./d" + passengerID + 
        ".png' alt='Destination'><strong class= 'locTag' >Pick up Passenger " + passengerID + "</strong>");
    dropoff.append("<img class='destination' src='./d" + passengerID + 
        ".png' alt='Destination'><strong class= 'locTag' >Drop off Passenger " + passengerID + "</strong>");

    //route has been generated, call getLocations again after x seconds where x is a random num between 1
    // and route.length.
    if(passengerID == 1){

        updateRoute(first);
        // whichever is the dropOff location
        let dropoffLoc =  firstMod < secondMod ? secondMod : firstMod;
        //after 20 seconds, add another pair of locations
        setTimeout(() => {
            getLocations(dropoffLoc);
            //get the time remaining and add 3 minutes to it every time a new passenger is added
            let newDuration = parseInt(document.getElementById("time").innerHTML.split(":")[0]) * 60 + 
                parseInt(document.getElementById("time").innerHTML.split(":")[1]) + 180;
            updateTimer(newDuration);

        }, (route.length - 2) * 1000);
    }
    //update passengerID for the next destination image. 
    passengerID++;
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
createGrid();
addCar();

setTimeout(() => {
    //first passenger locations after 3 second delay
    getLocations();
    countDown();
}, 3000);
