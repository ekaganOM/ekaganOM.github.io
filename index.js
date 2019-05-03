//passenger 'ID'
let passengerID = 1;

//previous timer instance
let timerInstance;

//sizeOfGrid 
let gridSize = 70;

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

    var carLocation = (carHeight * width )+ 1; 
    $(".grid div:nth-child("+ carLocation + ")").append("<img class='car' src='./car.png' alt='Car'>");
}

function getLocations(){
    //get two random locations on the grid
    var totalGrids = $(".grid").children().length;

    let first = 0, second = 0;
    //makes sure the location is never on boundary 
    while (first < 20 || first % 20 < 2 || first > 200) {
        first = Math.floor((Math.random() * totalGrids) + 2);
    }
    while (second < 20 || second % 20 < 2 || second > 200) {
        second = Math.floor((Math.random() * totalGrids) + 2);
    }

    //to decide which is pickup and dropoff based on grid number 
    var firstMod = first % 20;
    var secondMod = second % 20;
  
    //gets the DOM element for the two locations
    var pickup = $(".grid div:nth-child(" + (firstMod < secondMod ? first : second) + ")");
    var dropoff = $(".grid div:nth-child(" + (firstMod < secondMod ? second : first) + ")");

    //add the destination image on the two random locations.
    pickup.append("<img class='destination' src='./d" + passengerID + 
        ".png' alt='Destination'><strong class= 'locTag' >Pick up Passenger " + passengerID + "</strong>");
    dropoff.append("<img class='destination' src='./d" + passengerID + 
        ".png' alt='Destination'><strong class= 'locTag' >Drop off Passenger " + passengerID + "</strong>");

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
createGrid(gridSize);
addCar(gridSize);

setTimeout(() => {
    //first passenger locations after 3 second delay
    getLocations();
    countDown();

    //after 20 seconds, add another pair of locations
    setTimeout(() => {

        getLocations();
        //get the time remaining and add 3 minutes to it every time a new passenger is added
        let newDuration = parseInt(document.getElementById("time").innerHTML.split(":")[0]) * 60 + 
            parseInt(document.getElementById("time").innerHTML.split(":")[1]) + 180;
        updateTimer(newDuration);

    }, 20000);

}, 3000);