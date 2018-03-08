
function init() {

    // Get the canvas and the context as global variables
    canv = document.getElementById("canvas1");
    ctx = canv.getContext("2d");
        
    // the time interval in seconds for the differntial equation increments 
    fps = 1 / 60;
    multip = 100;
    deltat = fps / multip;
    stepCounter = 0;

    dV = new diffVector();
    

    //******************************************************************************
    // the initial conditions for the pendulums: length, mass and angles
    l1 = 0.5;                        
    l2 = 0.5;
    l3 = 0.5;  

    mass1 = 1;                          
    mass2 = 1;                          
    mass3 = 1;                          

    dV.t1 = 1* Math.PI / 4;
    dV.t2 = 3*Math.PI / 4;
    dV.t3 = 2*Math.PI/4;

    g = 10;    // gravitational constant

    ax = new Axis(canv, -1.5, 1.5, -1.8, 1.2);  // the axis on which to draw

    //******************************************************************************

    // use other derived variables in the equations for ease of notation
    m1 = mass1 + mass2 + mass3;
    m2 = mass2 + mass3;
    m3 = mass3;

    // this is the postion of the centre of the entire pendulum  
    ball0 = new Ball();
    ball0.BallColor = "Blue";
    ball0.Radius = 5;
    ball0.X = 0;
    ball0.Y = 0;

    // this is the postion of the first pendulum
    ball1 = new Ball();
    ball1.BallColor = "Green";
    ball1.Radius = 15 * Math.sqrt(mass1);   //just sqrt to make the appearance bigger when the mass is higher
    ball1.X = l1 * Math.sin(dV.t1);
    ball1.Y = -l1 * Math.cos(dV.t1);

    // the posistion of the second pendulum
    ball2 = new Ball();
    ball2.BallColor = "Red";
    ball2.Radius = 15 * Math.sqrt(mass2);
    ball2.X = l2 * Math.sin(dV.t2) + ball1.X;
    ball2.Y = -l2 * Math.cos(dV.t2) + ball1.Y;

    // the posistion of the third pendulum
    ball3 = new Ball();
    ball3.BallColor = "Blue";
    ball3.Radius = 15 * Math.sqrt(mass3);
    ball3.X = l2 * Math.sin(dV.t3) + ball2.X;
    ball3.Y = -l2 * Math.cos(dV.t3) + ball2.Y;

    enPotential = -g * l1 * m1 * Math.cos(dV.t1) - g * m2 * l2 * Math.cos(dV.t2) - g * m3 * l3 * Math.cos(dV.t3);
    enKineticLine1 = m1 / 2 * l1 * l1 * dV.t1D * dV.t1D + m2 / 2 * l2 * l2 * dV.t2D * dV.t2D + m3 / 2 * l3 * l3 * dV.t3D * dV.t3D;
    enKineticLine2 = m2 * l1 * l2 * dV.t1D * dV.t2D * Math.cos(dV.t1 - dV.t2) + m3 * l2 * l3 * dV.t2D * dV.t3D * Math.cos(dV.t2 - dV.t3) + m3 * l1 * l3 * dV.t1D * dV.t3D * Math.cos(dV.t1 - dV.t3);
    enInitial = enPotential + enKineticLine1 + enKineticLine2;

  
    Draw();
}


// Functionto be called by animation timer.
function Draw() {

    var err = 0;
    var tol = 0.00000000001;
    // calculate next iteration from previous variables

    var v1 = new diffVector();
    var v0 = new diffVector();
    

    for (cumulDeltat = 0; cumulDeltat < 1 / 60; cumulDeltat += deltat) {


        // iterateRungeKutta(vDiff, deltat);
        // stepCounter += 1;

        v0.copy(dV);
        v1.copy(dV);

        iterateRungeKutta(v1, deltat);
        iterateRungeKutta(dV, deltat / 2);
        //vHalf.copy(vDiff);
        iterateRungeKutta(dV, deltat / 2);
        stepCounter += 3;

        err = Math.sqrt((dV.t1 - v1.t1) * (dV.t1 - v1.t1) + (dV.t2 - v1.t2) * (dV.t2 - v1.t2) + (dV.t3 - v1.t3) * (dV.t3 - v1.t3) + (dV.t1D - v1.t1D) * (dV.t1D - v1.t1D) + (dV.t2D - v1.t2D) * (dV.t2D - v1.t2D) + (dV.t3D - v1.t3D) * (dV.t3D - v1.t3D));


        while (err > tol) {

            dV.copy(v0);
            v1.copy(v0);

            deltat = 0.9 * deltat * Math.pow(tol / err, 1 / 4);

            iterateRungeKutta(v1, deltat);
            iterateRungeKutta(dV, deltat / 2);
            iterateRungeKutta(dV, deltat / 2);
            stepCounter += 3;

            err = Math.sqrt((dV.t1 - v1.t1) * (dV.t1 - v1.t1) + (dV.t2 - v1.t2) * (dV.t2 - v1.t2) + (dV.t3 - v1.t3) * (dV.t3 - v1.t3) + (dV.t1D - v1.t1D) * (dV.t1D - v1.t1D) + (dV.t2D - v1.t2D) * (dV.t2D - v1.t2D) + (dV.t3D - v1.t3D) * (dV.t3D - v1.t3D));

        }


        deltat = 0.9 * deltat * Math.pow(tol / err, 1 / 5);

       

    }


    // do the below only once every frame. No need to iterate between frames. Start by clearing the old picture
    ctx.clearRect(0, 0, canv.width, canv.height);

    // Calculate and display the total energy
    enPotential = -g * l1 * m1 * Math.cos(dV.t1) - g * m2 * l2 * Math.cos(dV.t2) - g * m3 * l3 * Math.cos(dV.t3);
    enKineticLine1 = m1 / 2 * l1 * l1 * dV.t1D * dV.t1D + m2 / 2 * l2 * l2 * dV.t2D * dV.t2D + m3 / 2 * l3 * l3 * dV.t3D * dV.t3D;
    enKineticLine2 = m2 * l1 * l2 * dV.t1D * dV.t2D * Math.cos(dV.t1 - dV.t2) + m3 * l2 * l3 * dV.t2D * dV.t3D * Math.cos(dV.t2 - dV.t3) + m3 * l1 * l3 * dV.t1D * dV.t3D * Math.cos(dV.t1 - dV.t3);
    enLossPercent = (enInitial - enPotential - enKineticLine1 - enKineticLine2) / Math.abs(enInitial) * 100;
    
    if (enLossPercent > 1) {
        dV.t1D = dV.t1D * 1.01;
        dV.t2D = dV.t2D * 1.01;
        dV.t3D = dV.t3D * 1.01;
    }
    
    if (enLossPercent < -1) {
        dV.t1D = dV.t1D * 0.99;
        dV.t2D = dV.t2D * 0.99;
        dV.t3D = dV.t3D * 0.99;
    }
    if (enLossPercent < -2) {
        dV.t1D = dV.t1D * 0.98;
        dV.t2D = dV.t2D * 0.98;
        dV.t3D = dV.t3D * 0.98;
    }
    

    enString = enLossPercent.toFixed(1);
    stepString = stepCounter.toString();
    ctx.font = "30px Arial";
    ctx.fillText("Energy loss: " + enString + "%   " + stepString, 10, 50);

    //Convert the new polar coordinates in cartesian coordinates
    ball1.X = l1 * Math.sin(dV.t1);
    ball1.Y = -l1 * Math.cos(dV.t1);

    ball2.X = l2 * Math.sin(dV.t2) + ball1.X;
    ball2.Y = -l2 * Math.cos(dV.t2) + ball1.Y;

    ball3.X = l3 * Math.sin(dV.t3) + ball2.X;
    ball3.Y = -l3 * Math.cos(dV.t3) + ball2.Y;

    // Draw the balls
    ball0.Join(ball1);
    ball1.Join(ball2);
    ball2.Join(ball3);
    ball0.Draw();
    ball1.Draw();
    ball2.Draw();
    ball3.Draw();

  
      re = requestAnimationFrame(Draw);


}

function diffVector() {
    // The differential vector
    this.t1 = 0;
    this.t2 = 0;
    this.t3 = 0;
    this.t1D = 0;
    this.t2D = 0;
    this.t3D = 0;
}


diffVector.prototype.copy = function (source) {

    this.t1 = source.t1;
    this.t2 = source.t2;
    this.t3 = source.t3;
    this.t1D = source.t1D;
    this.t2D = source.t2D;
    this.t3D = source.t3D;

};


// The ball object.
function Ball() {
    // Starting position.
    this.X = 0;
    this.Y = 0;

    //Color of the ball (from the html object tagged color1)
    this.BallColor = color1.value;
    
    // Size of the ball.
    this.Radius = 8;

}


Ball.prototype.Draw = function () {
    ctx.beginPath();
    ctx.fillStyle = this.BallColor;


    ctx.arc(ax.ConvX(this.X), ax.ConvY(this.Y), this.Radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};
    
Ball.prototype.Join = function (ball2) {
    ctx.beginPath();

    ctx.moveTo(ax.ConvX(this.X), ax.ConvY(this.Y));
    ctx.lineTo(ax.ConvX(ball2.X), ax.ConvY(ball2.Y));

    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.closePath();
};


function reset() {
   //cancelAnimationFrame(re);
   //init();
   re = requestAnimationFrame(Draw);
}


function Axis(canv, xMin,xMax, yMin, yMax) {
    // Coordinates of the axis
    this.XMax = xMax;
    this.XMin = xMin;
    this.YMax = yMax;
    this.YMin = yMin;
    this.canv = canv;
}

Axis.prototype.ConvX = function (X) {
    return X * this.canv.width / (this.XMax - this.XMin) - this.canv.width * this.XMin / (this.XMax - this.XMin);
};

Axis.prototype.ConvY = function (Y) {
    return -Y * this.canv.height / (this.YMax - this.YMin) + this.canv.height * this.YMax / (this.YMax - this.YMin);
};

function iterateRungeKutta(dV, step) {

    // copy the values of input vector in local variables for processing. 
    var y1 = dV.t1;
    var y2 = dV.t2;
    var y3 = dV.t3;
    var y4 = dV.t1D;
    var y5 = dV.t2D;
    var y6 = dV.t3D;

    // now use the Runge Kutta algorithm of order 4 applied to a vector V
    // V has the coordinates y1...y6 and the function motionSolve is the funciton that calculates the differenial V' of V
    // we use this function with a number of inputs to calculate the best approximation of the next iteration. 

    var K1 = motionSolve(y1, y2, y3, y4, y5, y6);
    var a1 = K1.t1D;
    var a2 = K1.t2D;
    var a3 = K1.t3D;
    var a4 = K1.t1DD;
    var a5 = K1.t2DD;
    var a6 = K1.t3DD;

    var K2 = motionSolve(y1 + step / 2 * a1, y2 + step / 2 * a2, y3 + step / 2 * a3, y4 + step / 2 * a4, y5 + step / 2 * a5, y6 + step / 2 * a6);
    var b1 = K2.t1D;
    var b2 = K2.t2D;
    var b3 = K2.t3D;
    var b4 = K2.t1DD;
    var b5 = K2.t2DD;
    var b6 = K2.t3DD;

    var K3 = motionSolve(y1 + step / 2 * b1, y2 + step / 2 * b2, y3 + step / 2 * b3, y4 + step / 2 * b4, y5 + step / 2 * b5, y6 + step / 2 * b6);
    var c1 = K3.t1D;
    var c2 = K3.t2D;
    var c3 = K3.t3D;
    var c4 = K3.t1DD;
    var c5 = K3.t2DD;
    var c6 = K3.t3DD;

    var K4 = motionSolve(y1 + step * c1, y2 + step * c2, y3 + step * c3, y4 + step * c4, y5 + step * c5, y6 + step * c6);
    var d1 = K4.t1D;
    var d2 = K4.t2D;
    var d3 = K4.t3D;
    var d4 = K4.t1DD;
    var d5 = K4.t2DD;
    var d6 = K4.t3DD;

    y1 = y1 + step / 6 * (a1 + 2 * b1 + 2 * c1 + d1);
    y2 = y2 + step / 6 * (a2 + 2 * b2 + 2 * c2 + d2);
    y3 = y3 + step / 6 * (a3 + 2 * b3 + 2 * c3 + d3);
    y4 = y4 + step / 6 * (a4 + 2 * b4 + 2 * c4 + d4);
    y5 = y5 + step / 6 * (a5 + 2 * b5 + 2 * c5 + d5);
    y6 = y6 + step / 6 * (a6 + 2 * b6 + 2 * c6 + d6);


    // the iteration is now complete
    // store the value of the next point in the vector. 
    dV.t1 = y1;
    dV.t2 = y2;
    dV.t3 = y3;
    dV.t1D = y4;
    dV.t2D = y5;
    dV.t3D = y6;

}


function motionSolve(y1, y2, y3, y4, y5, y6) {
        
    // the differential equation for a triple pendulum can be expressed in three equations with three unknown x,y,z (which are T1DD, T2DD and T3DD - the second order differentals of the angles Theta)
    // this set of three equations have the form caX+cbY+ccZ+cd = 0, za1X+cb1Y+cc1Z+cd1 = 0 and ca2X+cb2Y+cc2Z+cd2 = 0 
    // using the Euler Lagrange formula, you can express the values of the coefficients ca,ca1,ca2,cb,cb1...etc as functions of y1...y6 where y1...y6 are the coordinates of a differential vector equation
    // the differntial equation resulted from the Euler Lagrange equation is of the form V'=f(V) in other words Deriv(y1) = f1(y1,y2,y3,y4,y5,y6), Deriv(y2) = f2(y1,..y6)...etc
    // this Function is solving the differental equation and returning the vector V' given an input V 
    
    // start by setting the values of the coefficients of hte three equations with three unknown
    var a = m1 * l1 * l1;
    var b = m2 * l1 * l2 * Math.cos(y1 - y2);
    var c = m3 * l1 * l3 * Math.cos(y1 - y3);
    var d = l1*(m1 * l2 * y5 * y5 * Math.sin(y1 - y2) + m3 * l3 * y6 * y6 * Math.sin(y1 - y3) + m1 * g * Math.sin(y1));

    var a1 = b;
    var b1 = m2 * l2 * l2;
    var c1 = m3 * l2 * l3 * Math.cos(y2 - y3);
    var d1 = l2*(-m2 * l1 * y4 * y4 * Math.sin(y1 - y2) + m3 * l3 * y6 * y6 * Math.sin(y2 - y3) + m2 * g * Math.sin(y2));

    var a2 = c;
    var b2 = c1;
    var c2 = m3 * l3 * l3;
    var d2 = -m3 * l3 * (l2 * y5 * y5 * Math.sin(y2 - y3) + l1 * y4 * y4 * Math.sin(y1 - y3) - g * Math.sin(y3));


    if (b === 0 && c === 0 && b1 === 0) {
        t1DD = -d / a;
        t2DD = 0;
        t3DD = 0;
    }
    else {


        // solve the generic three equations with three unknown in a generic manner
        var A = 2 * b * a1 * a2 - b1 * a * a2 - b2 * a * a1;
        var B = 2 * c * a1 * a2 - c1 * a * a2 - c2 * a * a1;
        var C = 2 * d * a1 * a2 - d1 * a * a2 - d2 * a * a1;

        var A1 = 2 * a * b1 * b2 - a1 * b * b2 - a2 * b * b1;
        var B1 = 2 * c * b1 * b2 - c1 * b * b2 - c2 * b * b1;
        var C1 = 2 * d * b1 * b2 - d1 * b * b2 - d2 * b * b1;

        var A2 = 2 * a * c1 * c2 - a1 * c * c2 - a2 * c * c1;
        var B2 = 2 * b * c1 * c2 - b1 * c * c2 - b2 * c * c1;
        var C2 = 2 * d * c1 * c2 - d1 * c * c2 - d2 * c * c1;
        

        t1DD = (-B2 * C1 * B - A* B1 * C2 + B1 * B2 * C) / (A* B1 * A2 + A1 * B2 * B );
        t3DD = (-C1 - A1 * t1DD) / B1;
        t2DD = (-C - B * t3DD) / A;

        

    }
    //now pass back the derivatives V' of the input vector V

    return {
        t1D: y4,
        t2D: y5,
        t3D: y6,
        t1DD: t1DD,
        t2DD: t2DD,
        t3DD: t3DD
    };
}
