2//set the treatment number
// Treatment 1: one additional passenger, drop off order: P1, P0
// Treatment 2: two additional passengers, drop off order: P1, P2, P0
// Treatment 3: two additional passengers, drop off order: P2, P1, P0
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

//order in which car reaches the locations p1,p2,d1,d2
let orderOfLocations = {};
let columnIndex = [];

//p0 is the participant
//p1,p2,d1,d2
let p0 = 0, p1 = 0, p2 = 0, d0 = 0, d1 = 0, d2 = 0;
let p0Mod = 0, d0Mod = 0, p1Mod = 0, p2Mod = 0, d1Mod = 0, d2Mod = 0;

//user rating
let ratingList = [];
let ratingInterval;

//response times in seconds to close alerts
let responseTimes = [];

//car route
let route = [];

//carLocation number
let carLocation = 0;

//startingLocation
let startLocation = 0;
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

// adds to screen: major horizontal route, the car, participants locations.
function addToScreen() {
    var calcHeight = Math.floor((height/2));
    var carHeight = (calcHeight % 2 == 0 ? calcHeight-1 : calcHeight);

    carLocation = (carHeight * width) + 1;

    startLocation = (carHeight * width) + 1;
    endLocation = carLocation + width - 1;

    //add car to screen
    $(".grid div:nth-child("+ carLocation + ")").append("<img id='car' src='images/car.png' alt='Car'>");

    //adds the main path at the start location
    $(".grid div:nth-child("+ startLocation + ")").append("<hr class='majorRoute'>");
    $(".majorRoute").width($(".grid").width());

    //create and adjust height of the trail to the locations.
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

    //values for locations for Participant
    var participantPickup = startLocation + 2;
    p0 = participantPickup;
    p0Mod = p0 % width;
    orderOfLocations[p0Mod] = p0;

    //values for locations for additional passengers
    var first = (startLocation + fifthWidth) - width;
    var second = (startLocation + (fifthWidth * 2)) +  (fifthHeight * width);
    var third = startLocation + (fifthWidth * 3) - (fifthHeight * width);
    var fourth = (startLocation + (fifthWidth * 4)) +  (fifthHeight * width);

    //if treatment == 1, one additional passenger.
    //if treatment == 2, P2 displayed after P1 droppff, on specific location.
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
    var pickup;
    if(passengerID > 1){
        setTimeout(function (){
            let newDuration = parseInt(document.getElementById("time").innerHTML.split(":")[0]) * 60 +
            parseInt(document.getElementById("time").innerHTML.split(":")[1]) + 23;
            updateTimer(newDuration);

            let minutes = parseInt(document.getElementById("time").innerHTML.split(":")[0] / 60, 10);
            let seconds = parseInt(document.getElementById("time").innerHTML.split(":")[1] % 60, 10) + 23

            while(seconds >= 60) {
                seconds %= 60;
                minutes++;
            }

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            let time = minutes + ":" + seconds;

            let timeAtOpen, timeAtClose;
            Swal.fire({
                title: "Alert!",
                text: "New Passenger added! New time is " + time,
                type: "info",
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                onOpen: function() {
                    timeAtOpen = performance.now();
                },
                onClose: function() {
                    timeAtClose = performance.now();
                    responseTimes.push(Math.ceil((timeAtClose - timeAtOpen) / 1000));
                }
            });
        }, 20);
    }

    //display the displaced route
    //only if its the first stop since its handled separately
    $(".minorRoute").css("display", "block");

    //gets the DOM element for the pick up location.
    var pickup = $(".grid div:nth-child(" + (passengerID == 1 ? p0 : passengerID == 2 ? p1 : p2) + ")");

    if(passengerID == 1){
        //add the pick up image on the location.
        pickup.append("<img class='p1' src='images/d" + passengerID +
        ".png' alt='Destination'><strong class= 'p1Tag locTag' >Your Pickup!</strong>");

        var dropoff = $(".grid div:nth-child(" + endLocation + ")");
        dropoff.append("<img class='p1'src='images/d1.png' alt='Destination'>"+
        "<strong class= 'p1Tag locTag' >Your Dropoff!</strong>");
    }
    else if(passengerID == 2){
        //add the pick up image on the location.
        pickup.append("<img class='pickup' src='images/d2"+
        "p.png' alt='Destination'><strong class= 'locTag p2Tag pickupTag' >Pick up Passenger 2</strong>");
    }
    else{ //if(passengerID == 3)
        //add the pick up image on the location.
        pickup.append("<img class='pickup' src='images/d3"+
        "p.png' alt='Destination'><strong class= 'locTag p3Tag pickupTag' >Pick up Passenger 3</strong>");
    }
}

//creates route to the next location
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
        //because treatment 2 does not have drop off above the major route, we only need this order of
        //appearance of dropoff for treatment 3
        if(treatment == 3){
            //add the destination image to the screen along with the route.
            if(numStopsReached == 2){
                var dropoff = $(".grid div:nth-child(" + d1 + ")");
                dropoff.append("<img class='destination' src='images/d2d.png' alt='Destination'><strong class= 'locTag p2Tag' >Drop off Passenger 2</strong>");
            }
            else if(numStopsReached == 3){
                var dropoff = $(".grid div:nth-child(" + d2 + ")");
                dropoff.append("<img class='destination' src='images/d3d.png' alt='Destination'><strong class= 'locTag p3Tag' >Drop off Passenger 3</strong>");
            }
        }

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

        //display the displaced route
        //only if its not the first stop since that is handled separately
        if (numStopsReached > 1) {
            $(".minorRoute").css("display", "block");
        }
    }
    //if location is down
    else if(carLocation + width < cell){
        //add the destination image to the screen along with the route.
        if(treatment == 2){
            if(numStopsReached == 2){
                var dropoff = $(".grid div:nth-child(" + d1 + ")");
                dropoff.append("<img class='destination' src='images/d2d.png' alt='Destination'><strong class= 'locTag p2Tag' >Drop off Passenger 2</strong>");
            }
            else if(numStopsReached == 4){
                var dropoff = $(".grid div:nth-child(" + d2 + ")");
                dropoff.append("<img class='destination' src='images/d3d.png' alt='Destination'><strong class= 'locTag p3Tag' >Drop off Passenger 3</strong>");
            }
        }
        else{ //treatment 3
            if(numStopsReached == 3){
                var dropoff = $(".grid div:nth-child(" + d2 + ")");
                dropoff.append("<img class='destination' src='images/d3d.png' alt='Destination'><strong class= 'locTag p3Tag' >Drop off Passenger 3</strong>");
            }
            else if(numStopsReached == 4){
                var dropoff = $(".grid div:nth-child(" + d1 + ")");
                dropoff.append("<img class='destination' src='images/d2d.png' alt='Destination'><strong class= 'locTag p2Tag' >Drop off Passenger 2</strong>");
            }
        }

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

        //display the displaced route
        //only if its not the first stop since that is handled separately
        if (numStopsReached > 1) {
            $(".minorRoute").css("display", "block");
        }
    }
    //pause before going back to track
    route.push("p");

    if(numStopsReached == 0){
        addLocations(1);
    }
    setTimeout(function(){
        animateCar(cell, displacedCells, direction);
    }, 2500);

}

//animate car includes:
//pauseAndRemove - pauses the car at destinations,
//                 removes the destination image when visited,
//                 changes the images of the car according to the passengers in it
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

            //Participant is picked up
            if(numStopsReached == 1){
                let timeAtOpen, timeAtClose;
                Swal.fire({
                    title: "Alert!",
                    text: "Passenger 1, your driver has arrived. You will arrive in " + document.getElementById("time").innerHTML,
                    type: "info",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    onOpen: function() {
                        timeAtOpen = performance.now();
                    },
                    onClose: function() {
                        timeAtClose = performance.now();
                        responseTimes.push(Math.ceil((timeAtClose - timeAtOpen) / 1000));
                    }
                });

                setTimeout(function(){
                    //second passenger locations after 5 second delay
                    addLocations(2);
                }, 5000);
            }

            //removes previous destination.
            // let children = $(".grid div:nth-child(" + cell + ")").children();
            // var i = dir == "down" ? 1 : 0;
            // for(i ; i < children.length; i++){
            //     children[i].remove();
            // }

            //change the image to have passengers in car.
            if(treatment == 2){
                if(numStopsReached == 1 || numStopsReached == 3 || numStopsReached == 5){
                    document.getElementById("car").src = 'images/car1.png';
                }
                else if(numStopsReached == 2){
                    document.getElementById("car").src = 'images/car2.png';
                }
                else if(numStopsReached == 4){
                    document.getElementById("car").src = 'images/car3.png';
                }
                else{ //last stop 6 i.e car only has driver
                    document.getElementById("car").src = 'images/car.png';
                }
            }
            if(treatment == 3){
                if(numStopsReached == 1 || numStopsReached == 5){
                    document.getElementById("car").src = 'images/car1.png';
                }
                else if(numStopsReached == 2 || numStopsReached == 4){
                    document.getElementById("car").src = 'images/car2.png';
                }
                else if(numStopsReached == 3){
                    document.getElementById("car").src = 'images/car4.png';
                }
                else{ //last stop 6
                    document.getElementById("car").src = 'images/car.png';
                }
            }

            //add location of second passenger to the screen according to the treatment
            if(treatment == 2 && numStopsReached == 3){
                addLocations(3);
            }
            else if(treatment == 3 && numStopsReached == 2){
                addLocations(3);
            }
            if(numStopsReached == 6){
                clearInterval(ratingInterval);

                let timeAtOpen, timeAtClose;
                Swal.fire({
                    title: "Notice",
                    text: "You have reached your destination!",
                    type: "success",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    onOpen: function() {
                        timeAtOpen = performance.now();
                    },
                    onClose: function() {
                        timeAtClose = performance.now();
                        responseTimes.push(Math.ceil((timeAtClose - timeAtOpen) / 1000));
                    }
                });
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
            }, 1000);
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

                    $("#car").supremate({"left": "+=70"}, 20, "linear", function(){
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

                    $("#car").supremate({"top": "-=70"}, 20, "linear", function(){
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

                    $("#car").supremate({"top": "+=70"}, 20, "linear", function(){
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

                    $("#car").supremate({"left": "+=70"}, 20, "linear", function(){
                        route.shift();
                        pauseAndRemove();
                        adjustRoute();
                    });
            }
        }
    }
    adjustRoute();
}

function userRating() {
    let timeAtOpen, timeAtClose;
    Swal.fire({
        title: "Please leave a rating!",
        html:
            "<head><style>" +
            "#rate{display:inline-block;height:46px;padding:0 10px}#rate:not(:checked)>input{position:absolute;top:-9999px}" +
            "#rate:not(:checked)>label{float:right;width:1em;overflow:hidden;white-space:nowrap;cursor:pointer;" +
            "font-size:30px;color:#ccc}#rate:not(:checked)>label:before{content:url(images/unfilled.png);}#rate>input:checked~label{content:url(images/filled.png);}" +
            "#rate:not(:checked)>label:hover,#rate:not(:checked)>label:hover~label{content:url(images/filled.png);}#rate>input:checked + label:hover," +
            "#rate>input:checked + label:hover~label,#rate>input:checked~label:hover,#rate>input:checked~label:hover~label," +
            "#rate>label:hover~input:checked~label{color:#c59b08}" +
            "</style></head>" +
            "<body><form id='rate'>" +
                "<input type='radio' id='star7' name='rate' value='7' /><label for='star7' title='text'>7 stars</label>" +
                "<input type='radio' id='star6' name='rate' value='6' /><label for='star6' title='text'>6 stars</label>" +
                "<input type='radio' id='star5' name='rate' value='5' /><label for='star5' title='text'>5 stars</label>" +
                "<input type='radio' id='star4' name='rate' value='4' /><label for='star4' title='text'>4 stars</label>" +
                "<input type='radio' id='star3' name='rate' value='3' /><label for='star3' title='text'>3 stars</label>" +
                "<input type='radio' id='star2' name='rate' value='2' /><label for='star2' title='text'>2 stars</label>" +
                "<input type='radio' id='star1' name='rate' value='1' /><label for='star1' title='text'>1 star</label>" +
            "</form></body>",
        preConfirm: function() {
            ratingList.push(parseInt($('input[name=rate]:checked', '#rate').val()));
        },
        type: "question",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        onOpen: function() {
            timeAtOpen = performance.now();
        },
        onClose: function() {
            timeAtClose = performance.now();
            responseTimes.push(Math.ceil((timeAtClose - timeAtOpen) / 1000));
        }
    });
}

//execution starts here
ratingInterval = setInterval(function(){
    userRating();
}, 30000);

createGrid();
addToScreen();
getLocations();
countDown();
updateRoute(orderOfLocations[columnIndex[0]]);
