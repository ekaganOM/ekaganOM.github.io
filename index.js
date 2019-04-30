//passenger 'ID'
let passengerID = 1;

//previous timer instance
let timerInstance;

//creates the grid layout
function createGrid(size) {
    var ratioW = 20, //Math.floor($(window).width()/size)
        ratioH = 11; //Math.floor($(window).height()/size)
    
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
    pickup.append("<img class='destination' src='./d" + passengerID + ".png' alt='Destination'><strong>Pick up Passenger " + passengerID + "</strong>");
    dropoff.append("<img class='destination' src='./d" + passengerID + ".png' alt='Destination'><strong>Drop off Passenger " + passengerID + "</strong>");

    //update passengerID for the next destination image. 
    passengerID++;
}

//countDown 
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

//gets a random time between 5 and 10 minutes and makes a countDown from that time.
function countDown() {
    let countDown = Math.floor((Math.random() * 6) + 5);
    let countdownText = (countDown == 10 ? countDown : "0" + countDown) + ":00"
    document.getElementById("time").innerHTML = countdownText;

    var numSeconds = 60 * countDown - 1;
    updateTimer(numSeconds);
};

setTimeout(() => {
    //first passenger locations after 3 second delay
    getLocations();
    countDown();

    //after every 20 seconds, possibly add another pair of locations, max 3 in total
    var numExtraPassengers = Math.floor(Math.random() * 3);
    var timeout = setInterval(() => {
        getLocations();

        //get the time remaining and add 3 minutes to it every time a new passenger is added
        let newDuration = parseInt(document.getElementById("time").innerHTML.split(":")[0]) * 60 + 
            parseInt(document.getElementById("time").innerHTML.split(":")[1]) + 180;

        updateTimer(newDuration);
    }, 20000);
    setTimeout(() => clearInterval(timeout), 20000 * numExtraPassengers);
    console.log(numExtraPassengers)
}, 3000);












