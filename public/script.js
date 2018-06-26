const {ipcRenderer} = require('electron')



let greetingInProcess = false
let currentPerson;
let deletionTimeout;

let parent = getEl(".inner")[0];
let hello = document.createElement("h1");
let extraText = document.createElement("h2");
parent.appendChild(hello);
parent.appendChild(extraText);


// TESTS
console.log("Hello world")
// teste die verbindung zum electron
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg)
});

ipcRenderer.send('asynchronous-message', 'hello from frontend');

particlesJS.load('particles-js', 'public/particles.json', function() {
  console.log('callback - particles.js config loaded');
});


function setPositionForParticleEffect(x,y) {
  window.pJSDom[0].pJS.interactivity.mouse.click_pos_x = 1000
  window.pJSDom[0].pJS.interactivity.mouse.click_pos_y = 500
}

function setModeForParticleEffect(mode) {
  const modes = ["push", "repulse", "bubble"]
  if (modes.includes(mode)) {
    window.pJSDom[0].pJS.interactivity.events.onclick.mode = mode
  } else {
    throw new Error("Invalid mode " + mode)
  }
}

function dispatchFakeMouseEventForParticleJs(type, x, y) {
  var particles = getEl('.particles-js-canvas-el')[0];
  var evt = mouseEvent(type, x, y, x, y);
 
  dispatchEvent(particles, evt);
}

function triggerParticlePush(count,x,y) {
  try {
    setModeForParticleEffect("push")
  } catch (error) {
    console.log(error.message)
    return
  }

  window.pJSDom[0].pJS.fn.modes.pushParticles(count, {"pos_x": x, "pos_y": y})
  
  console.log("triggering push at", x, y)
}

function triggerParticleBubble(x,y) {
  try {
    setModeForParticleEffect("bubble")
  } catch (error) {
    console.log(error.message)
    return
  }

  dispatchFakeMouseEventForParticleJs("mousemove", x,y)
  console.log("triggering push at", x, y)
}

function triggerParticleRepulse(x,y) {
  try {
    setModeForParticleEffect("repulse")
  } catch (error) {
    console.log(error.message)
    return
  }

  setPositionForParticleEffect(x,y)
  dispatchFakeMouseEventForParticleJs("click")

  console.log("triggering repulse at", x, y)
}

function setParticleOpacity(opacity) {
  window.pJSDom[0].pJS.particles.opacity.value = opacity;  
}


function getGreetingText()
{
  let oneDigit = () => Math.floor(Math.random() * 10)

  let directions;

  let key = Math.floor(Math.random() * 3)
  switch (key) {
    case 0:
      directions = "please follow the staircase on the left."
      break;
    case 1:
      directions = "please go straight into the hallway."
      break;
    case 2:
        directions = "please follow along on the right."
        break;
    default:
      console.log("WTF?? " + key);
  }

  let roomNumber = "A" + oneDigit() + oneDigit() + oneDigit();

  return "Your upcoming meeting is in " + roomNumber + ", " + directions;
}

function startNewGreeting(name)
{
  if (greetingInProcess)
  {
    console.log("already greeting someone else....")
  }
  else
  {
    greetingInProcess = true;
    currentPerson = name;
    clearTimeout(deletionTimeout);

    getEl(".outer-square")[0].classList.remove("rotate")
    getEl(".inner-square")[0].classList.add("whiter")
    getEl("#text")[0].classList.add("invisible");

    hello.textContent = "Hello " + name.charAt(0).toUpperCase() + name.slice(1) + "!";
    hello.setAttribute("id", "headline")
    setTimeout(function () {
      hello.classList.add("make-visible")
    }, 0);

    setTimeout(function() {
      extraText.textContent = getGreetingText();
      extraText.setAttribute("id", "extratext");
      setTimeout(function () {
        extraText.classList.add("make-visible")
      }, 0);
    }, 500)

    getEl(".wrapper")[0].classList.add("start-bg-animation");
  }
}

function deleteGreeting() {
  console.log("shutting down last greeting");

  let hello = getEl("#headline")[0]
  let extraText = getEl("#extratext")[0]

  getEl(".outer-square")[0].classList.add("rotate");
  getEl(".inner-square")[0].classList.remove("whiter")
  getEl("#text")[0].classList.remove("invisible");
  getEl(".wrapper")[0].classList.remove("start-bg-animation");

  if (hello != null && extraText != null)
  {
    hello.classList.remove("make-visible")
    setTimeout(() => { extraText.classList.remove("make-visible") }, 500);

  }

  deletionTimeout = setTimeout(function () {
    let hello1 = getEl("#headline")[0]
    let extraText1 = getEl("#extratext")[0]
    if (hello1 != null && extraText1 != null)
    {
      hello1.textContent = "";
      extraText1.textContent = "";

    }
  }, 1000);

  greetingInProcess = false;
  currentPerson == undefined;
}

// let interpolator = {
//   interpolate: function (start, stop, count) {
//     let difference = Math.abs(stop - start)
//     let positive = (stop - start) > 0
//     let stepsize = difference / count
//     let out = []

//     // TODO IMPLEMENT BACKWARDS COUNTING!
//     for (let i = start; i <= stop; ) {
//       out.push(i)

//       if (positive) {
//         i = i + stepsize
//       } else {
//         i = i - stepsize
//       }
//     }

//     return out
//   },

//   currentState : {empty: true, last: "", interpolatedPositions: "", next: "", interval: "", interpolationCount: 0},

//   calculatePosition: function(x0, y0, x1, y1) {
//     let middle_x = (x0 + x1) / 2 
//     let middle_y = (y0 + y1) / 2
    
//     let particleCanvas = getEl("#particles-js > canvas")[0]
  
//     let scaled_pos_x = particleCanvas.getAttribute("width") - middle_x / 320 * particleCanvas.getAttribute("width")
//     let scaled_pos_y = middle_y / 240 * particleCanvas.getAttribute("height")

//     return { x: scaled_pos_x, y: scaled_pos_y}
//   },

//   updateState: function(x0, y0, x1, y1) {
//     let correctedPosition = this.calculatePosition(x0, y0, x1, y1)
//     let particleCanvas = getEl("#particles-js > canvas")[0]

//     if (this.currentState.empty) {
//       console.log("starting new interpolation session")

//       last = {x: particleCanvas.getAttribute("width") / 2, y: particleCanvas.getAttribute("height") / 2}
//       console.log("LAST", last)
//       next = {x: correctedPosition.x, y: correctedPosition.y}
//       console.log("NEXT", next)
//       interpolatedPositions = {x: this.interpolate(last.x, next.x, 10), y: this.interpolate(last.y, next.y, 10)}

//       console.log(last, next)
//       console.log(interpolatedPositions);
      


//     } else {
//       console.log("updating interpolation session")
      
//     }
//   }
// }

// setTimeout(() => {
//   console.log("Testing Interpolation")
//   console.log(interpolator.interpolate(1,10,9)) 

// }, 5000);


ipcRenderer.on("position", (event, arg) => {
  let correctedPosition = correctPosition(arg.x0, arg.y0, arg.x1, arg.y1)
  stepper.updateStepper(correctedPosition.x, correctedPosition.y)

  // triggerParticleBubble(correctedPosition.x, correctedPosition.y)

})

function correctPosition(x0, y0, x1, y1) {
  let middle_x = (x0 + x1) / 2 
  let middle_y = (y0 + y1) / 2
  
  let particleCanvas = getEl("#particles-js > canvas")[0]

  let scaled_pos_x = particleCanvas.getAttribute("width") - middle_x / 320 * particleCanvas.getAttribute("width")
  let scaled_pos_y = middle_y / 240 * particleCanvas.getAttribute("height")

  return { x: scaled_pos_x, y: scaled_pos_y}
}


function updatePosition(x,y) {

  triggerParticleBubble(x,y)
  // let div = getEl("#interpolation")[0]
  // let positionString = "left: " + x + "px; top: " + y + "px;"
  // div.setAttribute("style", positionString)
}

let stepper = {
  animationStep: 5,
  currentPosition: {x: 0, y: 0},
  targetPosition:  {x: 0, y: 0},
  started: false,

  getLengthOfCoordinates: function(x,y) {
      return Math.sqrt(x*x + y*y) 
  },

  normalizeCoordinates: function(x,y) {
      return {x: x / stepper.getLengthOfCoordinates(x,y),
              y: y / stepper.getLengthOfCoordinates(x,y)}
  },

  getDistanceFromTarget() {
      let targetVector = stepper.getTargetVector()
      
      return stepper.getLengthOfCoordinates(targetVector.x, targetVector.y)
  },

  getTargetVector() {
      let delta_x  = stepper.targetPosition.x - stepper.currentPosition.x
      let delta_y  = stepper.targetPosition.y - stepper.currentPosition.y

      return {"x": delta_x, "y": delta_y}
  },

  calculateDeltas(x,y) {
      let normalizedVector = stepper.normalizeCoordinates(x, y)

      return {"x": normalizedVector.x * stepper.animationStep, 
              "y": normalizedVector.y * stepper.animationStep}

  },

  getStartPosition: function() {
      // just taking the middle of the canvas

      let particleCanvas = getEl("#particles-js > canvas")[0]
      let top = particleCanvas.getAttribute("height") / 2
      let left = particleCanvas.getAttribute("width") / 2
      

      
      return {x: left, y: top}
  },

  updateStepper(x,y) {
      if (!stepper.started) {
          console.log("starting stepper")
          
          // stepper not started, so initialize with standart values and start the rekursion
          stepper.currentPosition = stepper.getStartPosition()
          stepper.targetPosition = {"x": x, "y": y}
          stepper.started = true

          window.requestAnimationFrame(stepper.steppingStepper)

      } else {
          console.log("updating stepper")
          stepper.targetPosition = {"x": x, "y": y}
      }
  },


  steppingStepper() {
      // check if target is reached and break 
      if (Math.abs( stepper.getDistanceFromTarget() ) < stepper.animationStep) {
          console.log("target is reached, terminating recursion...")
          stepper.started = false
          return
      }

      let targetVector = stepper.getTargetVector()

      // console.log("CURRENT", stepper.currentPosition)
      // console.log("TARGET ",stepper.targetPosition)
      // console.log("TARGETV",targetVector)

      let deltas = stepper.calculateDeltas(targetVector.x, targetVector.y)

      // console.log("DELTAS", deltas)

      let newCoordinates = {"x": parseFloat( stepper.currentPosition.x ) + parseFloat( deltas.x ),
                            "y": parseFloat( stepper.currentPosition.y ) + parseFloat( deltas.y ) }

      // console.log("NEW POS", newCoordinates)

      stepper.updateStateAndPosition(newCoordinates.x, newCoordinates.y)

      window.requestAnimationFrame(stepper.steppingStepper)
  },

  updateStateAndPosition(x,y) {
      stepper.currentPosition = {"x": x, "y": y}
      updatePosition(x,y)
      // console.log("updated position")
  }
}




// function addNewFacePosition(newPosition) {
//   facePositions.last = facePositions.current
//   facePositions.current = newPosition
//   interpolationCount = 0
// }



// let particleCanvas
// let canvasWidth
// let canvasHeight

// setTimeout(() => {
//   particleCanvas = getEl("#particles-js > canvas")[0]
//   canvasWidth = particleCanvas.getAttribute("width")
//   canvasHeight = particleCanvas.getAttribute("height")
// }, 300);


// let facePositions = {"last": undefined, "current": undefined}
// let interpolationCount = 0
// let interpolationInterval = undefined
// let killTimeout = undefined
// let updateRate = 50
// let interpolationIntervalStarted = false

// function startNewFaceInterval(position) {

//   killTimeout = setTimeout(() => {
//     clearInterval(interpolationInterval)
//   }, 1000);

//   interpolationIntervalStarted = true
//   facePositions.current = position
//   facePositions.last = {"x": canvasWidth/2, "y": canvasHeight/2}

//   interpolationInterval = setInterval(() => {
//     let finalX, finalY
//     if (facePositions.last != undefined && facePositions.current != undefined) {
//       let distanceX = facePositions["current"]["x"] - facePositions["last"]["x"]
//       let distanceY = facePositions["current"]["y"] - facePositions["last"]["y"]
      
//       finalX = facePositions["last"]["x"] + interpolationCount * distanceX / updateRate
//       finaly = facePositions["last"]["y"] + interpolationCount * distanceY / updateRate
      
//       if (interpolationCount < updateRate) {
//         console.log("updated interpolation count", interpolationCount)
//         interpolationCount = interpolationCount + 1
//       } else {
//         console.log("clearing interval because no update")
//         clearInterval(interpolationInterval)
//         interpolationIntervalStarted = false

//       }

//       triggerParticleBubble(finalX, finalY)

//     }

//   }, 1000/ updateRate)
// }


// function addPositionParticleEffect(position) {
//   let middle_x = (position.x0 + position.x1) / 2 
//   let middle_y = (position.y0 + position.y1) / 2
  
//   particleCanvas = getEl("#particles-js > canvas")[0]

//   let scaled_pos_x = particleCanvas.getAttribute("width") - middle_x / 320 * particleCanvas.getAttribute("width")
//   let scaled_pos_y = middle_y / 240 * particleCanvas.getAttribute("height")


//   if (!interpolationIntervalStarted) {
//     startNewFaceInterval({"x": scaled_pos_x, "y": scaled_pos_y})
//   } else {
//     addNewFacePosition({"x": scaled_pos_x, "y": scaled_pos_y})
//   }
// }

ipcRenderer.on("new-session", (event, arg) => {
  console.log(arg.name);
  console.log(arg)

  if (greetingInProcess)
  {
    console.log("another greeting in process");
    deleteGreeting()
    setTimeout(function () {
      startNewGreeting(arg.name);
    }, 500);
  }
  else
  {
    startNewGreeting(arg.name);
  }
});

ipcRenderer.on("stop-session", (event, arg) => {
  if (arg != null && arg.hasOwnProperty("name"))
  {
    if (arg.name == currentPerson)
    {
      console.log("Stopping session " + arg.name);
      deleteGreeting();
    }
    else
    {
      console.log("wanting to delete person not shown");
    }
  }
  else {
    console.log("got the fucking error");
    console.log(arg);
  }
})



function getEl(sel)
{
  return document.querySelectorAll(sel)
}

function mouseEvent(type, sx, sy, cx, cy) {
  var evt;
  var e = {
    bubbles: true,
    cancelable: (type != "mousemove"),
    view: window,
    detail: 0,
    screenX: sx, 
    screenY: sy,
    clientX: cx, 
    clientY: cy,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined
  };
  if (typeof( document.createEvent ) == "function") {
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(type, 
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode);
  } else if (document.createEventObject) {
    evt = document.createEventObject();
    for (prop in e) {
    evt[prop] = e[prop];
  }
    evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
  }
  return evt;
}

function dispatchEvent (el, evt) {
  if (el.dispatchEvent) {
    el.dispatchEvent(evt);
  } else if (el.fireEvent) {
    el.fireEvent('on' + type, evt);
  }
  return evt;
}