export const SCENARIOS = [
  {
    id: 0,
    title: 'Sandbox (Free Play)',
    description: 'Welcome to the Sandbox! Customize your character, paint the wall, and write status messages!',
    initialCode: "// Try customizing the world!\n// wall.color = 'pink';\n// status.text = 'Hello World!';\n\nbox.color = 'purple';\n",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: () => false
  },
  // --- PART 1: APPEARANCE (1-5) ---
  {
    id: 1,
    title: 'Level 1: First Magic Spell',
    description: 'Make the box blue! Type: box.color = \'blue\';',
    initialCode: "box.color = 'blue';",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.color === 'blue'
  },
  {
    id: 2,
    title: 'Level 2: Paint the Wall',
    description: 'Change the background wall color to pink!',
    initialCode: "wall.color = 'red'; // Change this!",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'pink'
  },
  {
    id: 3,
    title: 'Level 3: Hello Status',
    description: 'Make the status text say "Hello!"',
    initialCode: "status.text = '';",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && status.text === 'Hello!'
  },
  {
    id: 4,
    title: 'Level 4: Spin it! (Angle)',
    description: 'Rotate the box! Set box.angle to 45.',
    initialCode: "box.angle = 0; // Try 45!",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.angle === 45
  },
  {
    id: 5,
    title: 'Level 5: Box Borders',
    description: 'Add a thick border to the box! Set box.borders to 10.',
    initialCode: "box.borders = 0; // Make it 10",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.borders === 10
  },

  // --- PART 2: THE WORLD & DIMENSIONS (6-10) ---
  {
    id: 6,
    title: 'Level 6: Wall Borders',
    description: 'The wall needs a frame! Set wall.borders to 20.',
    initialCode: "wall.borders = 0;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.borders === 20
  },
  {
    id: 7,
    title: 'Level 7: Highlight Status',
    description: 'Make the status.color yellow and give it status.borders = 4.',
    initialCode: "status.text = 'Warning!';\nstatus.color = 'white';\nstatus.borders = 0;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && status.color === 'yellow' && status.borders === 4
  },
  {
    id: 8,
    title: 'Level 8: Getting Taller',
    description: 'Change the box height to 250.',
    initialCode: "box.height = 150;\n",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.height === 250
  },
  {
    id: 9,
    title: 'Level 9: Super Tall',
    description: 'Make height 400 and width 10.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.height === 400 && box.width === 10
  },
  {
    id: 10,
    title: 'Level 10: The Giant Square',
    description: 'Make both width and height 300.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.width === 300 && box.height === 300
  },

  // --- PART 3: MOVEMENT (11-15) ---
  {
    id: 11,
    title: 'Level 11: Moving Right',
    description: 'Set box.x to 100 to move it right!',
    initialCode: "box.x = 0;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100
  },
  {
    id: 12,
    title: 'Level 12: Moving Down',
    description: 'Set box.y to 150 to move it down!',
    initialCode: "box.y = 0;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.y === 150
  },
  {
    id: 13,
    title: 'Level 13: Moving Left (Minus!)',
    description: 'You can use negative numbers! Set box.x to -100.',
    initialCode: "box.x = -50;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === -100
  },
  {
    id: 14,
    title: 'Level 14: Diagonal Move',
    description: 'Set both x to 100 and y to 100.',
    initialCode: "box.x = 0;\n",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100 && box.y === 100
  },
  {
    id: 15,
    title: 'Level 15: Hide the Box',
    description: 'Set x to 500 to move the box completely outside the wall!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 500
  },

  // --- PART 4: MATH (16-20) ---
  {
    id: 16,
    title: 'Level 16: Math Magic (+)',
    description: 'Use math! Make the box width 100 + 100.',
    initialCode: "box.width = 100 + 0;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.width === 200
  },
  {
    id: 17,
    title: 'Level 17: Shrinking (-)',
    description: 'Make the box height 200 - 150.',
    initialCode: "box.height = 200 - 0;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.height === 50
  },
  {
    id: 18,
    title: 'Level 18: Multiplication (*)',
    description: 'Make x equal to 50 * 2.',
    initialCode: "box.x = 50 * 1;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100
  },
  {
    id: 19,
    title: 'Level 19: Division (/)',
    description: 'Make y equal to 200 / 2.',
    initialCode: "box.y = 200 / 1;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.y === 100
  },
  {
    id: 20,
    title: 'Level 20: Mega Math',
    description: 'Set wall.borders to (10 + 10) * 2.',
    initialCode: "wall.borders = ",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.borders === 40
  },

  // --- PART 5: BOOLEANS & BODY PARTS (21-25) ---
  {
    id: 21,
    title: 'Level 21: Hello Console!',
    description: 'Print "Hello!" to the console.',
    initialCode: "console.log('Hello!');",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs) => logs && logs.includes('Hello!')
  },
  {
    id: 22,
    title: 'Level 22: True or False (Smile)',
    description: 'Booleans are "true" or "false". Set box.smile to true!',
    initialCode: "box.smile = false; // Make it true!",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.smile === true
  },
  {
    id: 23,
    title: 'Level 23: Give it Hands!',
    description: 'Turn on the hands! Set box.hands to true.',
    initialCode: "box.hands = ",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.hands === true
  },
  {
    id: 24,
    title: 'Level 24: A Full Body',
    description: 'Give the box legs and a nose! Set them both to true.',
    initialCode: "box.legs = true;\n",
    environment: { isRaining: false, isSunny: false, isNight: true },
    checkWin: (box) => box.legs === true && box.nose === true
  },
  {
    id: 25,
    title: 'Level 25: Close your Eyes',
    description: 'You can turn things off! Set box.eyes to false.',
    initialCode: "box.eyes = ",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: (box) => box.eyes === false
  },

  // --- PART 6: IF STATEMENTS (26-30) ---
  {
    id: 26,
    title: 'Level 26: First IF',
    description: 'If isSunny is true, make the wall yellow.',
    initialCode: "if (isSunny) {\n  wall.color = 'yellow';\n}",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'yellow'
  },
  {
    id: 27,
    title: 'Level 27: Night Mode',
    description: 'If isNight is true, make the wall black and status.text "Spooky!"',
    initialCode: "if (isNight) {\n  \n}",
    environment: { isRaining: false, isSunny: false, isNight: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'black' && status && status.text === 'Spooky!'
  },
  {
    id: 28,
    title: 'Level 28: Sad in the Rain',
    description: 'If isRaining, turn off the smile (set box.smile to false).',
    initialCode: "box.smile = true; // It starts smiling\nif (isRaining) {\n  \n}",
    environment: { isRaining: true, isSunny: false, isNight: false },
    checkWin: (box) => box.smile === false
  },
  {
    id: 29,
    title: 'Level 29: Big if Sunny',
    description: 'If isSunny, make width 200.',
    initialCode: "if (isSunny) {\n  \n}",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: (box) => box.width === 200
  },
  {
    id: 30,
    title: 'Level 30: Double Trouble',
    description: 'If isNight, make color black AND give it a nose!',
    initialCode: "if (isNight) {\n  box.color = 'black';\n  // Add nose here\n}",
    environment: { isRaining: false, isSunny: false, isNight: true },
    checkWin: (box) => box.color === 'black' && box.nose === true
  },

  // --- PART 7: IF / ELSE & LOGIC (31-35) ---
  {
    id: 31,
    title: 'Level 31: Rainy Day Else',
    description: 'If isRaining, make the wall blue. Else, make it orange. (It IS raining!)',
    initialCode: "if (isRaining) {\n  \n} else {\n  \n}",
    environment: { isRaining: true, isSunny: false, isNight: false },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'blue'
  },
  {
    id: 32,
    title: 'Level 32: Sunny Day Else',
    description: 'If isRaining, set status.text to "Wet". Else, "Dry". (It is NOT raining!)',
    initialCode: "if (isRaining) {\n  status.text = 'Wet';\n} else {\n  status.text = 'Dry';\n}",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: (box, env, logs, status) => status && status.text === 'Dry'
  },
  {
    id: 33,
    title: 'Level 33: Movement Else',
    description: 'If isNight, move x to -100, else move x to 100. (It is Night!)',
    initialCode: "if (isNight) {\n  \n} else {\n  \n}",
    environment: { isRaining: false, isSunny: false, isNight: true },
    checkWin: (box) => box.x === -100
  },
  {
    id: 34,
    title: 'Level 34: AND Logic (&&)',
    description: 'If it isRaining AND isNight, give it hands. (Type: isRaining && isNight)',
    initialCode: "if (isRaining && isNight) {\n  box.hands = true;\n}",
    environment: { isRaining: true, isSunny: false, isNight: true },
    checkWin: (box) => box.hands === true
  },
  {
    id: 35,
    title: 'Level 35: OR Logic (||)',
    description: 'If isSunny OR isRaining, add 10 box.borders. (Type: isSunny || isRaining)',
    initialCode: "if (isSunny || isRaining) {\n  box.borders = 10;\n}",
    environment: { isRaining: true, isSunny: false, isNight: false },
    checkWin: (box) => box.borders === 10
  },

  // --- PART 8: VARIABLES (36-40) ---
  {
    id: 36,
    title: 'Level 36: Declaring Variables',
    description: 'Create a variable: let myColor = "pink"; then set wall.color to myColor.',
    initialCode: "let myColor = 'pink';\nwall.color = myColor;",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'pink'
  },
  {
    id: 37,
    title: 'Level 37: My Message',
    description: 'Create: let msg = "Winner!"; then set status.text to msg.',
    initialCode: "let msg = 'Winner!';\n",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && status.text === 'Winner!'
  },
  {
    id: 38,
    title: 'Level 38: Math with Variables',
    description: 'let a = 50; let b = 50; Set box.x to a + b.',
    initialCode: "let a = 50;\nlet b = 50;\nbox.x = ",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100
  },
  {
    id: 39,
    title: 'Level 39: Overriding Rain',
    description: 'Declare let isRaining = false; Then if isRaining is false, make wall green.',
    initialCode: "let isRaining = false;\nif (isRaining === false) {\n  wall.color = 'green';\n}",
    environment: { isRaining: true, isSunny: false },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'green'
  },
  {
    id: 40,
    title: 'Level 40: Custom Mood',
    description: 'Declare let isHappy = true; Print it to console!',
    initialCode: "let isHappy = true;\nconsole.log(isHappy);",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs) => logs && logs.includes('true')
  },

  // --- PART 9: WHILE LOOPS (41-45) ---
  {
    id: 41,
    title: 'Level 41: The While Loop',
    description: 'A loop repeats code! Make a loop that adds 10 to box.x until it reaches 50.',
    initialCode: "let count = 0;\nwhile (count < 5) {\n  box.x = box.x + 10;\n  count = count + 1;\n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 50
  },
  {
    id: 42,
    title: 'Level 42: While Loop Fun',
    description: 'Add 20 to box.y 3 times using a while loop.',
    initialCode: "let count = 0;\nwhile (count < 3) {\n  box.y = box.y + 20;\n  count = count + 1;\n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.y === 60
  },
  {
    id: 43,
    title: 'Level 43: Infinite Loop Danger!',
    description: 'Loops can crash computers if they never stop! Always increase the counter. Print count 3 times.',
    initialCode: "let count = 0;\nwhile (count < 3) {\n  console.log('Loop:', count);\n  count = count + 1; // DO NOT DELETE THIS LINE\n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs) => logs && logs.join(' ').includes('Loop: 2')
  },
  {
    id: 44,
    title: 'Level 44: Spinning in a Loop',
    description: 'Use a while loop to increase box.angle by 90, four times.',
    initialCode: "let count = 0;\nwhile (count < 4) {\n  box.angle = box.angle + 90;\n  count = count + 1;\n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.angle === 360
  },
  {
    id: 45,
    title: 'Level 45: Growing Walls',
    description: 'Use a while loop to add 5 to wall.borders 4 times.',
    initialCode: "let count = 0;\nwhile (count < 4) {\n  wall.borders = wall.borders + 5;\n  count = count + 1;\n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.borders === 20
  },

  // --- PART 10: FOR LOOPS (46-50) ---
  {
    id: 46,
    title: 'Level 46: The FOR Loop!',
    description: 'A FOR loop is a shorter while loop. It puts everything on one line! Increase box.x by 20 five times.',
    initialCode: "for (let i = 0; i < 5; i = i + 1) {\n  box.x = box.x + 20;\n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100
  },
  {
    id: 47,
    title: 'Level 47: Growing with FOR',
    description: 'Use a FOR loop to add 10 to box.borders exactly 5 times!',
    initialCode: "for (let i = 0; i < 5; i = i + 1) {\n  box.borders = box.borders + 10;\n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.borders === 50
  },
  {
    id: 48,
    title: 'Level 48: Status Countdown',
    description: 'Use a for loop to update status.text to the variable `i` 5 times.',
    initialCode: "for (let i = 0; i < 5; i++) {\n  status.text = i;\n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && String(status.text) === '4' // Ends on 4
  },
  {
    id: 49,
    title: 'Level 49: Moving Diagonal with FOR',
    description: 'Inside a FOR loop, add 10 to BOTH box.x and box.y. Run it 5 times!',
    initialCode: "for (let i = 0; i < 5; i++) {\n  \n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 50 && box.y === 50
  },
  {
    id: 50,
    title: 'Level 50: The Final Boss!',
    description: 'Use a FOR loop that runs 10 times. Every time, print "I am a JS Master!"',
    initialCode: "for (let i = 0; i < 10; i++) {\n  \n}",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs) => logs && logs.filter(l => l.includes('JS Master')).length >= 10
  },

  // --- PART 11: TIMERS & ANIMATIONS (51-55) ---
  {
    id: 51,
    title: 'Level 51: Wait for it...',
    description: 'Use setTimeout to wait 1000ms (1 second), then paint the wall red!',
    initialCode: "setTimeout(() => {\n  wall.color = 'red';\n  \n}, 1000);",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'red'
  },
  {
    id: 52,
    title: 'Level 52: Delayed Status Message',
    description: 'Use setTimeout to set status.text to "Surprise!" after 2000ms.',
    initialCode: "setTimeout(() => {\n  \n}, 2000);",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && status.text === 'Surprise!'
  },
  {
    id: 53,
    title: 'Level 53: The Pulse (Interval)',
    description: 'setInterval repeats forever! Add 10 to wall.borders every 500ms.',
    initialCode: "setInterval(() => {\n  wall.borders = wall.borders + 10;\n}, 500);",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.borders >= 30 // Will win after 3 ticks
  },
  {
    id: 54,
    title: 'Level 54: Spinning Animation',
    description: 'Animate the box! Add 15 to box.angle every 100ms. Watch it spin!',
    initialCode: "setInterval(() => {\n  box.angle = box.angle + 15;\n}, 100);",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.angle >= 90 // Wins when it reaches 90
  },
  {
    id: 55,
    title: 'Level 55: Diagonal Animation',
    description: 'Inside setInterval, add 5 to BOTH x and y every 50ms.',
    initialCode: "setInterval(() => {\n  \n}, 50);",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x >= 50 && box.y >= 50
  }
];
