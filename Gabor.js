let jsPsych = initJsPsych({
  display_element: 'jspsych-target'
})

taskData = []

let enterFullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: '<p>Press Start to enter full screen</p>',
  button_label: 'Start'
}

let exitFullScreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
  message: '<p>Thank you for completing the task. Press End to leave</p>',
  button_label: 'End'
}

let instruction = {
  type: jsPsychInstructions,
  pages: [
    'The second task is a visual judgment task. In this task, you have to judge the rotation direction of an object like this.<br>' +
    '<img src="perception_example1.png"></img><br>' +
    'The lines in the object will be rotated either 45° to the left or 45° to the right from vertical.',
    'For example, this is an object that is rotated 45° left.<br>' +
    '<img src="perception_example2.png"></img>',
    'This is an object that is rotated 45° right.<br>' +
    '<img src="perception_example3.png"></img>',
    'In the actual experiment, the task will be more difficult than in the examples you just saw because the image will be grainy and presented very briefly.<br>\
    Please do your best to decide the rotation direction as being Left or Right.',
    'After deciding whether the lines in the object are rotated to the left or right, you will be asked about how confident you are in the decision you just made.<br>\
    Please understand the confidence level as your estimated probability that you are correctly judging whether the line is rotated to the Left or Right from vertical.<br>\
    You can express a confidence level that ranges anywhere from being certain (100% sure) that your Left/Right decision is correct to being completely unsure (50% guessing) about whether the object is rotated Left or Right.',
    'Here is an example of the screen you will see after selecting Left or Right.<br>' +
    '<img src="perception_example4.png" width="600"></img>',
    'After a block of decisions, you will have a chance to take a break.<br>\
    The task will be repeated for 3 blocks.<br>\
    If you are ready to go, please click next to start the practice session.'
  ],
  allow_keys: false,
  show_clickable_nav: true,
}

let viewingDistanceCm = 60
let screenType = prompt(`Are you using monitor or laptop?\nPlease enter 'monitor' or 'laptop'`)
let screenWidthCm = 0
let screenWidthPx = 0
if (screenType === 'monitor') {
  screenWidthCm = 52
  screenWidthPx = prompt('Please enter the Screen resolution width (px)\nIf your resolution is 1920x1080, please enter 1920')
} else if (screenType === 'laptop') {
  screenWidthCm = 32
  screenWidthPx = prompt('Please enter the Screen resolution width (px)\nIf your resolution is 1920x1080, please enter 1920')
} else {
  alert('You enter an invalid response.\nPlease refresh the page and enter again')
}
let pxPerCm = screenWidthPx / screenWidthCm

function deg2px(deg) {
  let rad = (Math.PI / 180) * deg
  let sizeInCm = 2 * viewingDistanceCm * Math.tan(rad / 2)
  return Math.round(sizeInCm * pxPerCm)
}

let sizePx = deg2px(3)

let displayGabor = {
  type: jsPsychPsychophysics,
  stimuli: [
    {
      obj_type: 'rect',
      width: sizePx + 4,
      height: sizePx + 4,
      line_color: 'black',
      fill_color: 'gray',
      line_width: 2,
      show_start_time: 0,
      show_end_time: 600
    },
    {
      obj_type: 'gabor',
      sf: 0.05,
      tilt: jsPsych.timelineVariable('tilt'),
      contrast: jsPsych.timelineVariable('contrast'),
      disableNorm: true,
      width: sizePx,
      show_start_time: 500,
      show_end_time: 600
    },
    {
      obj_type: 'image',
      file: function (noiseContrast = 0.1) {
        let canvas = document.createElement('canvas')
        canvas.width = sizePx
        canvas.height = sizePx
        let ctx = canvas.getContext('2d')
        let imageData = ctx.createImageData(sizePx, sizePx)
        let data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          let value = Math.random() * 255
          data[i] = data[i + 1] = data[i + 2] = value // Random grayscale value from 0 to 255
          data[i + 3] = 255 * noiseContrast; // Alpha channel 255 is fully opaque
        }
        ctx.putImageData(imageData, 0, 0)
        return canvas.toDataURL()
      },
      size: [sizePx, sizePx],
      show_start_time: 500,
      show_end_time: 600
    }
  ],
  choices: 'NO_KEYS',
  trial_duration: 600,
  response_end_trial: false,
  background_color: 'gray',
  clear_screen: false
}

let combinedResponseConfidence = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    return `
      <div class='experiment-container'>        
        <div class='square-frame' style='
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${sizePx + 6}px;
          height: ${sizePx + 6}px;
          border: 2px solid black;
          background-color: gray;
          box-sizing: border-box;
        '></div>
        <div id='orientation-container' style='position: absolute; top: calc(50% + ${sizePx / 2}px); left: 0; width: 100%; text-align: center;'>
          <p>Which orientation did you see?</p>
          <div>
            <button class='jspsych-btn orientation-btn' data-response='left'>Left</button>
            <button class='jspsych-btn orientation-btn' data-response='right'>Right</button>
          </div>
        </div>
        
        <div id='confidence-container' style='display: none; position: absolute; top: calc(50% + ${sizePx / 2}px + 100px); left: 0; width: 100%; text-align: center;'>
          <p>How confident are you in your answer?</p>
          <div style='width: 80%; max-width: 500px; margin: 0 auto; position: relative;'>
            <div id='confidence-scale-container' style='width: 100%; height: 40px; background-color: #ddd; border-radius: 5px; position: relative; cursor: pointer;'>
              <div id='confidence-indicator' style='position: absolute; width: 12px; height: 40px; background-color: #aaccff; border-radius: 3px; top: 0; left: -6px; display: none;'></div>
            </div>
            <div style='display: flex; justify-content: space-between; width: 100%; margin-top: 8px;'>
              <span style='position: absolute; left: 0; transform: translateX(-50%);'>Guess</span>
              <span style='position: absolute; right: 0; transform: translateX(50%);'>Definitely correct</span>
            </div>
          </div>
        </div>
      </div>
    `
  },
  choices: 'NO_KEYS',
  trial_duration: null,
  background_color: 'gray',
  on_load: function () {
    let startTime = performance.now()
    let thisTilt = jsPsych.timelineVariable('tilt')
    let thisContrast = jsPsych.timelineVariable('contrast')
    let decisionRT = null
    let decisionResponse = null
    let confidenceStartTime = null

    document.querySelectorAll('.orientation-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        let decisionTime = performance.now()
        decisionRT = decisionTime - startTime
        decisionResponse = this.getAttribute('data-response')

        document.querySelectorAll('.orientation-btn').forEach(b => {
          b.disabled = true
          b.style.opacity = '0.6'
        })
        this.style.backgroundColor = '#aaccff'
        this.style.opacity = '1'

        document.getElementById('confidence-container').style.display = 'block'
        confidenceStartTime = performance.now()
      })
    })

    // Handle clicks on the confidence scale
    let confidenceScaleContainer = document.getElementById('confidence-scale-container')
    let confidenceIndicator = document.getElementById('confidence-indicator')

    confidenceScaleContainer.addEventListener('click', function (e) {
      // Calculate the relative position of the click within the container
      let rect = this.getBoundingClientRect()
      let x = e.clientX - rect.left
      let containerWidth = rect.width

      // Calculate confidence value (1-100 scale)
      let confidenceValue = Math.round((x / containerWidth) * 99) + 1 // +1 so scale is 1-100, not 0-99

      // Show indicator at clicked position
      confidenceIndicator.style.left = `${x - 6}px` // -6px to center the 12px wide indicator
      confidenceIndicator.style.display = 'block'

      // Record data and finish trial
      let confidenceTime = performance.now()
      let confidenceRT = confidenceTime - confidenceStartTime

      let trialData = {
        tilt: thisTilt,
        contrast: thisContrast,
        decision_response: decisionResponse,
        decision_rt: decisionRT,
        confidence_response: confidenceValue,
        confidence_rt: confidenceRT
      }
      taskData.push(trialData)
      console.log(trialData)

      // Short delay to show the indicator before finishing trial
      setTimeout(() => jsPsych.finishTrial(), 150)
    })
  },
  on_finish: function () {
    let prevTrialContainers = document.querySelectorAll('.experiment-container')
    prevTrialContainers.forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    })
  },
  clear_screen: false
}

let rest = {
  type: jsPsychInstructions,
  pages: [
    'Take a break!<br>\
    When you are ready for the next round, please click Continue'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  button_label_next: 'Continue',
  on_load: function () {
    let buttons = document.querySelectorAll('.jspsych-btn')
    if (buttons.length > 1) {
      buttons[0].style.display = 'none'
    }
  }
}

let start = {
  type: jsPsychInstructions,
  pages: [
    'You have completed the practice session.<br>\
    When you are ready for the main task, please click Continue to start.'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  button_label_next: 'Continue',
  on_load: function () {
    let buttons = document.querySelectorAll('.jspsych-btn')
    if (buttons.length > 1) {
      buttons[0].style.display = 'none'
    }
  }
}

let gaborTrial = {
  timeline: [
    displayGabor,
    combinedResponseConfidence
  ]
}

let conditions = [
  { contrast: 0.045, tilt: 45 },
  { contrast: 0.045, tilt: -45 },
  { contrast: 0.08, tilt: 45 },
  { contrast: 0.08, tilt: -45 }
]

let trials = conditions.flatMap(item => Array(38).fill(item))
let practiceTrials = conditions.flatMap(item => Array(10).fill(item))

let practice = {
  timeline: [gaborTrial],
  timeline_variables: practiceTrials,
  randomize_order: true
}

let fullTrial1 = {
  timeline: [gaborTrial],
  timeline_variables: trials,
  randomize_order: true
}

let fullTrial2 = {
  timeline: [gaborTrial],
  timeline_variables: trials,
  randomize_order: true
}

let fullTrial3 = {
  timeline: [gaborTrial],
  timeline_variables: trials,
  randomize_order: true
}

jsPsych.run([
  enterFullscreen,
  instruction,
  practice,
  start,
  fullTrial1,
  rest,
  fullTrial2,
  rest,
  fullTrial3,
  exitFullScreen])
