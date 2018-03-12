
function init() {

    //***************************************
    //  Global Variables (no use of VAR word)
    //***************************************

    exA = [];               // the exacta Array of bets length n*(n-1)*...
    winA = [];              // the win Array of bets length N
    placeA = [];            // the place Array of length N (same model as the win array but may be easier to show separately)

    maxRunners = Number(document.getElementById("MaxRunners").value);        // the number of runners in the race 
    exactaDepth = Number(document.getElementById("ExactaDepth").value);        // the number of allowed runners to bet on in an exacta (2 or 3)
    seedBet = 1e-9;         // the nominal amount to avoid division by zero


    initialiseExactaArray(); // fill the arrays with seed money
    initialiseWinArray();
    initialisePlaceArray();


    // this is where you add bets to each runner. the functions take any number of arguments
    addExBet([0, 20], [1, 20], [2, 30], [3, 40], [4, 20], [5, 30], [6, 10], [7, 20], [8, 30], [9, 5], [10, 20], [11, 30]);
    addWinBet([0, 150], [1, 300], [2, 140],[3,310]);
    addPlaceBet([0, 90], [1, 120], [2, 80], [3, 110]);

    //addWinBet([0, 100]);
    //addPlaceBet([0, 50]);


    // iterate through the three steps of splitting hte win bets, the place bets, aggregate all of them and start again
    var iterations = Number(document.getElementById("iter").value);

    for (var i = 0; i < iterations ; i++) {
            splitBets(winA);
            splitBets(placeA);
            aggregateBets();
    }

    // display whihchever calculation you want to display
    showResults();

}



function showResults() {

    var pot;
    var st;

    //******************************
    //  UNMINGLED WINS
    //******************************

    // first calculate the total win pot by summing all win bets across the win array
    pot = 0;

    winA.forEach(function (bet) {
        pot += bet.amt;
    });
    
    // then calculate and output each of the odds for each win 
    winA.forEach(function (bet) {
        if ( bet.amt > 1 ) {
            st = (pot / bet.amt).toFixed(2).toString();
            document.getElementById("list4").innerHTML += "<div>" + st + "</div>"; // this is adding the string to the "list 4" element in the HTML
        }
    });

    //******************************
    //  UNMINGLED PLACE 
    //******************************
    // first calculate the total win pot by summing all win bets across the win array
    pot = 0;

    placeA.forEach(function (bet) {
        pot += bet.amt;
    });

    // then calculate and output each of the odds for each win 
    placeA.forEach(function (bet) {
        if (bet.amt > 1 ) {
            st = (pot / bet.amt).toFixed(2).toString();
            document.getElementById("list5").innerHTML += "<div>" + st + "</div>";
        }
    });

    //******************************
    //  UNMINGLED EXACTA 
    //******************************
    // first calculate the total win pot by summing all win bets across the win array
    pot = 0;

    exA.forEach(function (bet) {
        pot += bet.amt;
    });

    // then calculate and output each of the odds for each win 
    exA.forEach(function (bet) {
        if (bet.amt > 1 ) {
            st = (pot / bet.amt).toFixed(2).toString();
            document.getElementById("list6").innerHTML += "<div>" + st + "</div>";
        }
    });


    //******************************
    //  MINGLED EXACTA
    //******************************

    // first calculate the total win pot by summing all win bets across the win array
    pot = 0;

    exA.forEach(function (bet) {
        pot += bet.mingledAmt;
    });

    // then calculate and output each of the odds for each win 
    exA.forEach(function (bet) {
        if (bet.amt > 1 ) {
            st = (pot / bet.mingledAmt).toFixed(2).toString();
            document.getElementById("list3").innerHTML += "<div>" + st + "</div>";
        }
    });


    //******************************
    //  MINGLED WIN
    //******************************

    // first calculate the total aggregated pot across all bets

    pot = 0;

    exA.forEach(function (bet) {
        pot += bet.mingledAmt;
    });

    // for each win bet, calculate the return by checking the return of the first split. All splits have hte same return
    winA.forEach(function (bet) {

        var ind = bet.splitA[0].exIndex;   // take the first split. Returns are the same for all splits
        var exOdd = pot / exA[ind].mingledAmt;  // take the first split to compute the exacta mingled odds of that split
        var winReturn = bet.splitA[0].splitAmt * exOdd;  // calculate the return for that first split using the exacta odds

        mingledOdd = winReturn / bet.amt;  // the mingled odds are the ratio of the Win bets (bet.amt) to the winReturns

        if (bet.amt > 1 ) {
            st = mingledOdd.toFixed(2).toString();
            document.getElementById("list1").innerHTML += "<div>" + st + "</div>";
        }

    });



    //******************************
    //  MINGLED PLACE
    //******************************


    // first calculate the total aggregated pot across all bets

    pot = 0;

    exA.forEach(function (bet) {
        pot += bet.mingledAmt;
    });


    placeA.forEach(function (bet) {

        var ind = bet.splitA[0].exIndex;   // take the first split. Returns are the same for all splits
        var exOdd = pot / exA[ind].mingledAmt;  // take the first split to compute the exacta mingled odds of that split
        var winReturn = bet.splitA[0].splitAmt * exOdd;  // calculate the return for that first split using the exacta odds

        mingledOdd = winReturn / bet.amt;  // the mingled odds are the ratio of the Win bets (bet.amt) to the winReturns


        if (mingledOdd < 1000) {
            st = mingledOdd.toFixed(2).toString();
            document.getElementById("list2").innerHTML += "<div>" + st + "</div>";
        }

    });

// this inserts a blank line so that you can re-run another iteration and see the line break. 
    document.getElementById("list1").innerHTML += "</br>";
    document.getElementById("list2").innerHTML += "</br>";
    document.getElementById("list3").innerHTML += "</br>";
    document.getElementById("list4").innerHTML += "</br>";
    document.getElementById("list5").innerHTML += "</br>";
    document.getElementById("list6").innerHTML += "</br>";
}


function clearResults() {

    // clear all the lists by instering null character
    document.getElementById("list1").innerHTML = "";
    document.getElementById("list2").innerHTML = "";
    document.getElementById("list3").innerHTML = "";
    document.getElementById("list4").innerHTML = "";
    document.getElementById("list5").innerHTML = "";
    document.getElementById("list6").innerHTML = "";
}





function splitBets(betArray) { 

    // the parameter passed is the array of bets, so we can pass WinArray or PlaceArray, because the model and calcs are the same for wins and place
    betArray.forEach(function (betValue) {
        var unsplitAmt = betValue.amt;
        var splitA = betValue.splitA;
        var totExAmt = 0;

        // first cycle through all the win/place splits to compute the total Exacta amounts
        splitA.forEach(function (splitVal) {
            totExAmt += exA[splitVal.exIndex].mingledAmt;
        });

        // then cycle again to compute the new splits from the total amount. Splits are in the same ratio as exacta mingled amounts
        splitA.forEach(function (splitVal) {
            splitVal.oldSplitAmt = splitVal.splitAmt;
            splitVal.splitAmt = unsplitAmt * exA[splitVal.exIndex].mingledAmt / totExAmt;
        });

    });
       
}



function averageSplits(betArray) {

    var totExAmt = 0;
    

    // first cycle through all the win/place splits to compute the total Exacta amounts
    exA.forEach(function (exBet) {
        totExAmt += exBet.mingledAmt;
    });

    // calculate.the exacta odds. 
    exA.forEach(function (exBet) {
        exBet.mingledOdd= totExAmt/exBet.mingledAmt;
    });

    // cycle through the bet arrays and compute the average return 
    betArray.forEach(function (betValue) {
        var unsplitAmt = betValue.amt;
        var splitA = betValue.splitA;
        var averageSplit = 0;
        var averageReturn = 0;

        splitA.forEach(function (split) {
            averageReturn += exA[split.exIndex].mingledOdd * split.splitAmt / splitA.length
        });
         
        splitA.forEach(function (split) {
            split.splitAmt = averageReturn / exA[split.exIndex].mingledOdd 
        });

    });

}





function aggregateBets() {

    // first set the mingled amounts to be the exacta bets
    exA.forEach(function (val) {
        val.oldMingledAmt = val.mingledAmt;  //old amounts are only used for internal data in case you compare iterations. Not necessary otherwise
        val.mingledAmt = val.amt;  // store the first component of the mingled amount to be the exacta bet. The next steps add win and place splits
        });

    // then add each win split
    winA.forEach(function (winAEntry) {
        var splitA = winAEntry.splitA;  // splitA is the array conaining the splits
        splitA.forEach(function (splitVal) {  // perform another loop for each win bet
            exA[splitVal.exIndex].mingledAmt +=  splitVal.splitAmt;
        });
    });

    // then add each place split
    placeA.forEach(function (placeAEntry) {
        var splitA = placeAEntry.splitA;  // splitA is the array conaining the splits
        splitA.forEach(function (splitVal) {  // perform another loop for each place bet
            exA[splitVal.exIndex].mingledAmt += splitVal.splitAmt;
        });
    });

}




function initialiseExactaArray() {

    // the data model for the exacta Array contains array elements who are structures (objects) with properties:
    // amt(the amount bet on the exacta only), 
    // mingledAmt(the mingled amount containing wins and place)
    // oldMingledAMT(for conveneince) and 
    // seq(an array containing the sequence of the exacta - for example [1,2] exacta and [1,3] exacta...etc.
    // so the exacta array length is N(n-1) in teh case of a 2 depth


    var index = 0;


    if (exactaDepth == 2) {
        for (var i = 0; i < maxRunners; i++) {
            for (var j = 0; j < maxRunners; j++) {
                if (j != i) {
                    exA[index++] = { amt: seedBet, mingledAmt: seedBet, seq: [i, j], oldMingledAmt: seedBet}
                }
            }
        }
    }

    if (exactaDepth == 3) {
        for (var i = 0; i < maxRunners; i++) {
            for (var j = 0; j < maxRunners; j++) {
                for (var k = 0; k < maxRunners; k++) {

                    if (j != i && k != i && k != j) {
                        exA[index++] = { amt: seedBet, mingledAmt: seedBet, seq: [i, j, k] , oldMingledAmt:seedBet}
                    }
                }
            }
        }
    }

}

function initialiseWinArray() {

    // the win array winA contains bet elements made of objects with properties amt and splitA (see below)
    // the index of the array is the runner number [0] woud be the bet on horse 0, [1] the bet on horse 1...
    // - amt: the total win amount bet on this runner
    // - splitA: the split Array containing the splits
    // the Split Array is made of split elements which have the following properties
    // - splitamt: the amount of this split
    // - exIndex: the index of the exacta to which the split applies (for example SplitAmount £10 is put on exacta 6 ->index = 6)
    // - oldSplitAmount is not needed. only for internal calculations if you want to compare one iterations after the other 

    for (var runNum = 0; runNum < maxRunners; runNum++) {

        var thisWinA = [];
        var winInd = 0;

        for (var exInd = 0; exInd < exA.length; exInd++) {
            if (runNum == exA[exInd].seq[0]) {
                thisWinA[winInd++] = { splitAmt: seedBet, exIndex: exInd, oldSplitAmt:seedBet }
            }
        }
        winA[runNum] = { amt: seedBet, splitA: thisWinA };
    }
}

function initialisePlaceArray() {
    // same comments as win array. Same model and same code

    for (var runNum = 0; runNum < maxRunners; runNum++) {

        var thisPlaceA = [];
        var placeInd = 0;
        var foundPlaceInExacta = false;
       
        for (var exInd = 0; exInd < exA.length; exInd++) {
            if (exactaDepth == 2)
                foundPlaceInExacta = runNum == exA[exInd].seq[0] || runNum == exA[exInd].seq[1];
            else
                foundPlaceInExacta = runNum == exA[exInd].seq[0] || runNum == exA[exInd].seq[1] || runNum == exA[exInd].seq[2];

            if (foundPlaceInExacta) {
                thisPlaceA[placeInd++] = { splitAmt: seedBet, exIndex: exInd, oldSplitAmt: seedBet };
            }
        }
        placeA[runNum] = { amt: seedBet, splitA: thisPlaceA };
    }
}



function addWinBet() {
    // cycle through the arguments so you can have multiple entries at the same time
    for (var i = 0; i < arguments.length; i++) {
        var runner = arguments[i][0];
        var amount = arguments[i][1];
        winA[runner].amt += amount;
    }
}

function addPlaceBet() {
    // cycle through the arguments so you can have multiple entries at the same time
    for (var i = 0; i < arguments.length; i++) {
        var runner = arguments[i][0];
        var amount = arguments[i][1];
        placeA[runner].amt += amount;
    }
}

function addExBet() {
    // cycle through the arguments so you can have multiple entries at the same time
    for (var i = 0; i < arguments.length; i++) {
        var runner = arguments[i][0];
        var amount = arguments[i][1];
        exA[runner].amt += amount;
        exA[runner].mingledAmt += amount;
    }
}
