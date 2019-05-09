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

//car route
let route = [];

//carLocation number 
let carLocation = 0;

//move car off the screen
let endLocation = 0;

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
    endLocation = carLocation + width - 1;
    topRange = carLocation - 1 - (width * (rowRange - 1));
    bottomRange = carLocation - 1 + (width * (rowRange + 1));

    $(".grid div:nth-child("+ carLocation + ")").append("<img id='car' src='images/car.png' alt='Car'>");
    //adds the main path at the same location 
    $(".grid div:nth-child("+ carLocation + ")").append("<hr class='majorRoute'>");
    $(".majorRoute").width($(".grid").width());

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
            timer = duration;
        }
    }, 1000);
}

//displays start time from 2.5 minutes and updates the timer.
function countDown() {
    //start the timer from 2.5 minutes
    let countDown = 2;
    let countdownText = countDown + ":00"
    document.getElementById("time").innerHTML = countdownText;
    var numSeconds = 60 * countDown - 1;
    updateTimer(numSeconds);
}

function getLocations(){
    var totalGrids = $(".grid").children().length;
    let third = 0, fourth = 0;
    //p1
    //makes sure the location is never on boundary 
    while (p1 < topRange || p1 % width < 3 || p1 > bottomRange || p1 % width > colRange) {
        p1 = Math.floor((Math.random() * totalGrids) + 2);
    }
    //d1
    while (d1 < topRange || d1 % width < colRange + 1 || d1 > bottomRange || d1 % width > (width - 2)) {
        d1 = Math.floor((Math.random() * totalGrids) + 2);
    }  

    //p2
    //makes sure the location is never on boundary 
    while (third < topRange || third % width < colRange + 1 || third > bottomRange || third % width > (width - 2) ||
            third % width == d1 % width) {
        third = Math.floor((Math.random() * totalGrids) + 2);
    }
    //d2
    while (fourth < topRange || fourth % width < colRange + 1 || fourth > bottomRange || fourth % width > (width - 2) ||
            (fourth % width == d1 % width || fourth % width == third % width)) {
        fourth = Math.floor((Math.random() * totalGrids) + 2);
    }

    var p1Mod = p1 % width;
    var d1Mod = d1 % width;
    var thirdMod = third % width;
    var fourthMod = fourth % width;

    if(thirdMod < fourthMod){
        p2 = third;
        d2 = fourth;
    }
    else{
        p2 = fourth;
        d2 = third;
    }

    orderOfLocations[p1Mod] = p1;
    orderOfLocations[d1Mod] = d1;
    orderOfLocations[thirdMod] = third;
    orderOfLocations[fourthMod] = fourth;
    orderOfLocations[width] = endLocation;

    columnIndex = Object.keys(orderOfLocations).sort(function(a,b){parseInt(a)<parseInt(b)});
}

function addLocations(passengerID){
    //gets the DOM element for the two locations
    var pickup = $(".grid div:nth-child(" + (passengerID == 1 ? p1 : p2) + ")");
    var dropoff = $(".grid div:nth-child(" + (passengerID == 1 ? d1 : d2) + ")");

    //add the destination image on the two random locations.
    pickup.append("<img class='destination' src='images/d" + passengerID + 
        ".png' alt='Destination'><strong class= 'locTag' >Pick up Passenger " + passengerID + "</strong>");
    dropoff.append("<img class='destination' src='images/d" + passengerID + 
        ".png' alt='Destination'><strong class= 'locTag' >Drop off Passenger " + passengerID + "</strong>");   

    if(passengerID == 2){
        //get the time remaining and add 3 minutes to it every time a new passenger is added
        let newDuration = parseInt(document.getElementById("time").innerHTML.split(":")[0]) * 60 + 
        parseInt(document.getElementById("time").innerHTML.split(":")[1]) + 120;
        updateTimer(newDuration);
        
        let minutes =  "0" + (parseInt(document.getElementById("time").innerHTML.split(":")[0]) + 2);
        let seconds = parseInt(document.getElementById("time").innerHTML.split(":")[1]);
        let time = minutes + ":" + seconds;

        setTimeout(function() {
            alert("New Passenger added! New time is " + time);
        }, 20);
    }
}

function updateRoute(cell){

    let displacedCells = 0;
    let direction = '';
    //get the best route between car and cell       
    //if pick up in the same line => keep going right 
    if(carLocation < cell && (cell - carLocation)/ width < 1 ){
        var j = cell - carLocation;
        for(var i = 0; i < j; i++){
            route.push("r");
            carLocation++;
        }  
    }         
    // if pick up is above 
    else if (carLocation > cell){
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
    //if pick up is down
    else if(carLocation + width < cell){
        direction = "down";
        //gets to the same column
        while((carLocation % width) != (cell % width)){
            route.push("r");
            carLocation++;
        }
        //go down
        while(carLocation < cell){
            carLocation += width;
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

function animateCar(cell, displacedCells, dir){
    //index of destination
    let stopIndex = route.indexOf("p");
    //steps till cell
    let currStep = 0;

    function pauseAndRemove(){
        currStep++;
        if(stopIndex == currStep){
            //removes previous destination.
            let children = $(".grid div:nth-child(" + cell + ")").children();
            var i = dir == "down" ? 1 : 0;
            for(i ; i < children.length; i++){
                children[i].remove();
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
                columnIndex.shift();
                if(columnIndex.length > 0){
                    updateRoute(orderOfLocations[columnIndex[0]]);
                }
            }, 0);
        }
    } 

    //the route includes coming back to the track after destination.
    while(route.length > 0){
        var direction = route[0];
        switch(direction) {
            case "r":               
                $("#car").animate({"left": "+=70"}, "slow", "linear", function(){
                    pauseAndRemove();
                });  
                break;
            case "u":
                $("#car").animate({"top": "-=70"}, "slow", "linear", function(){
                    pauseAndRemove();
                });     
                break;               
            case "d":                              
                $("#car").animate({"top": "+=70"}, "slow", "linear", function(){                   
                    pauseAndRemove();
                });
                break;
            case "p":
                break;
            default: //shouldn't reach here               
                $("#car").animate({"left": "+=70"}, "slow", "linear", pauseAndRemove);               
        }
        prevDir = route.shift();
    }
}

//execution starts here 
createGrid();
addCar();
getLocations();

setTimeout(function(){
    //first passenger locations after 3 second delay  
    addLocations(1);
    countDown();
    updateRoute(orderOfLocations[columnIndex[0]]);

    setTimeout(function(){
        //add the second pair of locations on screen.
        addLocations(2);        
    }, 3000);
}, 3000);
