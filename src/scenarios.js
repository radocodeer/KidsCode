export const SCENARIOS = [
  {
    id: 0,
    title: 'Pieskovisko (Voľná hra)',
    description: 'Vitaj v Pieskovisku! Uprav si svoju postavičku, vymaľuj stenu a píš správy!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: () => false
  },
  // --- PART 1: APPEARANCE (1-5) ---
  {
    id: 1,
    title: 'Level 1: Prvé kúzlo',
    description: 'Zmeň farbu krabice na modrú! Napíš: box.color = \'blue\';',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.color === 'blue'
  },
  {
    id: 2,
    title: 'Level 2: Vymaľuj stenu',
    description: 'Zmeň farbu steny v pozadí na ružovú!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'pink'
  },
  {
    id: 3,
    title: 'Level 3: Ahoj Status',
    description: 'Zmeň text statusu na "Hello!" (Ahoj!)',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && status.text === 'Hello!'
  },
  {
    id: 4,
    title: 'Level 4: Zatoč s ňou! (Uhol)',
    description: 'Otoč krabicu! Nastav box.angle na 45.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.angle === 45
  },
  {
    id: 5,
    title: 'Level 5: Okraje krabice',
    description: 'Pridaj krabici hrubý okraj! Nastav box.borders na 10.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.borders === 10
  },

  // --- PART 2: THE WORLD & DIMENSIONS (6-10) ---
  {
    id: 6,
    title: 'Level 6: Okraje steny',
    description: 'Stena potrebuje rám! Nastav wall.borders na 20.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.borders === 20
  },
  {
    id: 7,
    title: 'Level 7: Zvýrazni status',
    description: 'Zmeň status.color na žltú a pridaj status.borders = 4.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && status.color === 'yellow' && status.borders === 4
  },
  {
    id: 8,
    title: 'Level 8: Rastieme do výšky',
    description: 'Zmeň výšku krabice (box.height) na 250.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.height === 250
  },
  {
    id: 9,
    title: 'Level 9: Super vysoká',
    description: 'Nastav výšku (height) na 400 a šírku (width) na 10.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.height === 400 && box.width === 10
  },
  {
    id: 10,
    title: 'Level 10: Obrovský štvorec',
    description: 'Nastav šírku aj výšku na 300.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.width === 300 && box.height === 300
  },

  // --- PART 3: MOVEMENT (11-15) ---
  {
    id: 11,
    title: 'Level 11: Pohyb doprava',
    description: 'Nastav box.x na 100, aby si ju posunul doprava!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100
  },
  {
    id: 12,
    title: 'Level 12: Pohyb nadol',
    description: 'Nastav box.y na 150, aby si ju posunul nadol!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.y === 150
  },
  {
    id: 13,
    title: 'Level 13: Pohyb doľava (Mínus!)',
    description: 'Môžeš použiť aj záporné čísla! Nastav box.x na -100.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === -100
  },
  {
    id: 14,
    title: 'Level 14: Pohyb šikmo',
    description: 'Nastav x na 100 aj y na 100.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100 && box.y === 100
  },
  {
    id: 15,
    title: 'Level 15: Schovaj krabicu',
    description: 'Nastav x na 500, aby sa krabica presunula úplne mimo steny!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 500
  },

  // --- PART 4: MATH (16-20) ---
  {
    id: 16,
    title: 'Level 16: Matematické kúzla (+)',
    description: 'Použi matematiku! Nastav šírku krabice na 100 + 100.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.width === 200
  },
  {
    id: 17,
    title: 'Level 17: Zmenšovanie (-)',
    description: 'Nastav výšku krabice na 200 - 150.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.height === 50
  },
  {
    id: 18,
    title: 'Level 18: Násobenie (*)',
    description: 'Nastav x na 50 * 2.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100
  },
  {
    id: 19,
    title: 'Level 19: Delenie (/)',
    description: 'Nastav y na 200 / 2.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.y === 100
  },
  {
    id: 20,
    title: 'Level 20: Mega matematika',
    description: 'Nastav okraje steny (wall.borders) na (10 + 10) * 2.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.borders === 40
  },

  // --- PART 5: BOOLEANS & BODY PARTS (21-25) ---
  {
    id: 21,
    title: 'Level 21: Ahoj konzola!',
    description: 'Vypíš "Hello!" do konzoly.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs) => logs && logs.includes('Hello!')
  },
  {
    id: 22,
    title: 'Level 22: Pravda alebo Lož (Úsmev)',
    description: 'Hodnoty (Booleans) môžu byť "true" (pravda) alebo "false" (lož). Nastav box.smile na true!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.smile === true
  },
  {
    id: 23,
    title: 'Level 23: Pridaj ruky!',
    description: 'Zapni ruky! Nastav box.hands na true.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.hands === true
  },
  {
    id: 24,
    title: 'Level 24: Celé telo',
    description: 'Pridaj krabici nohy a nos! Nastav ich oboje na true.',
    initialCode: "",
    environment: { isRaining: false, isSunny: false, isNight: true },
    checkWin: (box) => box.legs === true && box.nose === true
  },
  {
    id: 25,
    title: 'Level 25: Zatvor oči',
    description: 'Môžeš veci aj vypnúť! Nastav box.eyes na false.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: (box) => box.eyes === false
  },

  // --- PART 6: IF STATEMENTS (26-30) ---
  {
    id: 26,
    title: 'Level 26: Prvé IF (Ak)',
    description: 'Ak je slnečno (isSunny), zmeň farbu steny na žltú.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'yellow'
  },
  {
    id: 27,
    title: 'Level 27: Nočný režim',
    description: 'Ak je noc (isNight), zmeň farbu steny na čiernu a status.text na "Spooky!" (Strašidelné!)',
    initialCode: "",
    environment: { isRaining: false, isSunny: false, isNight: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'black' && status && status.text === 'Spooky!'
  },
  {
    id: 28,
    title: 'Level 28: Smútok v daždi',
    description: 'Ak prší (isRaining), vypni úsmev (nastav box.smile na false).',
    initialCode: "",
    environment: { isRaining: true, isSunny: false, isNight: false },
    checkWin: (box) => box.smile === false
  },
  {
    id: 29,
    title: 'Level 29: Veľký, ak je slnečno',
    description: 'Ak je slnečno (isSunny), nastav šírku (width) na 200.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: (box) => box.width === 200
  },
  {
    id: 30,
    title: 'Level 30: Dvojité problémy',
    description: 'Ak je noc (isNight), zmeň farbu na čiernu A pridaj mu nos!',
    initialCode: "",
    environment: { isRaining: false, isSunny: false, isNight: true },
    checkWin: (box) => box.color === 'black' && box.nose === true
  },

  // --- PART 7: IF / ELSE & LOGIC (31-35) ---
  {
    id: 31,
    title: 'Level 31: Upršaný deň - Inak (Else)',
    description: 'Ak prší (isRaining), zmeň farbu steny na modrú. Inak (else), zmeň ju na oranžovú. (Teraz prší!)',
    initialCode: "",
    environment: { isRaining: true, isSunny: false, isNight: false },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'blue'
  },
  {
    id: 32,
    title: 'Level 32: Slnečný deň - Inak (Else)',
    description: 'Ak prší, nastav status.text na "Wet" (Mokré). Inak, na "Dry" (Suché). (Teraz NEPRŠÍ!)',
    initialCode: "",
    environment: { isRaining: false, isSunny: true, isNight: false },
    checkWin: (box, env, logs, status) => status && status.text === 'Dry'
  },
  {
    id: 33,
    title: 'Level 33: Pohyb - Inak (Else)',
    description: 'Ak je noc (isNight), presuň x na -100, inak presuň x na 100. (Je Noc!)',
    initialCode: "",
    environment: { isRaining: false, isSunny: false, isNight: true },
    checkWin: (box) => box.x === -100
  },
  {
    id: 34,
    title: 'Level 34: Logické A (&&)',
    description: 'Ak prší (isRaining) A je noc (isNight), pridaj ruky. (Napíš: isRaining && isNight)',
    initialCode: "",
    environment: { isRaining: true, isSunny: false, isNight: true },
    checkWin: (box) => box.hands === true
  },
  {
    id: 35,
    title: 'Level 35: Logické ALEBO (||)',
    description: 'Ak je slnečno (isSunny) ALEBO prší (isRaining), nastav box.borders na 10. (Napíš: isSunny || isRaining)',
    initialCode: "",
    environment: { isRaining: true, isSunny: false, isNight: false },
    checkWin: (box) => box.borders === 10
  },

  // --- PART 8: VARIABLES (36-40) ---
  {
    id: 36,
    title: 'Level 36: Vytváranie premenných',
    description: 'Vytvor premennú: let myColor = "pink"; a potom nastav wall.color na myColor.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'pink'
  },
  {
    id: 37,
    title: 'Level 37: Moja správa',
    description: 'Vytvor: let msg = "Winner!"; a potom nastav status.text na msg.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && status.text === 'Winner!'
  },
  {
    id: 38,
    title: 'Level 38: Matematika s premennými',
    description: 'let a = 50; let b = 50; Nastav box.x na a + b.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100
  },
  {
    id: 39,
    title: 'Level 39: Ignorujeme dážď',
    description: 'Vytvor premennú let isRaining = false; Potom, ak isRaining je false, zmeň stenu na zelenú.',
    initialCode: "",
    environment: { isRaining: true, isSunny: false },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'green'
  },
  {
    id: 40,
    title: 'Level 40: Vlastná nálada',
    description: 'Vytvor premennú let isHappy = true; Vypíš ju do konzoly!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs) => logs && logs.includes('true')
  },

  // --- PART 9: WHILE LOOPS (41-45) ---
  {
    id: 41,
    title: 'Level 41: Cyklus While (Kým)',
    description: 'Cyklus opakuje kód! Vytvor cyklus, ktorý bude pripočítavať 10 k box.x, kým nedosiahne 50.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 50
  },
  {
    id: 42,
    title: 'Level 42: Zábava s cyklom While',
    description: 'Pridaj 20 k box.y 3-krát pomocou cyklu while.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.y === 60
  },
  {
    id: 43,
    title: 'Level 43: Pozor na nekonečný cyklus!',
    description: 'Cykly môžu zaseknúť počítač, ak nikdy neskončia! Vždy zvyšuj počítadlo (count). Vypíš count 3-krát.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs) => logs && logs.join(' ').includes('Loop: 2')
  },
  {
    id: 44,
    title: 'Level 44: Točenie v cykle',
    description: 'Použi cyklus while, aby si zväčšil box.angle o 90, štyrikrát.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.angle === 360
  },
  {
    id: 45,
    title: 'Level 45: Rastúce steny',
    description: 'Použi cyklus while na pridanie 5 k wall.borders 4-krát.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.borders === 20
  },

  // --- PART 10: FOR LOOPS (46-50) ---
  {
    id: 46,
    title: 'Level 46: Cyklus FOR (Pre)!',
    description: 'Cyklus FOR je kratší while cyklus. Dá všetko na jeden riadok! Zvyšuj box.x o 20 päťkrát.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 100
  },
  {
    id: 47,
    title: 'Level 47: Rast s FOR',
    description: 'Použi cyklus FOR na pridanie 10 k box.borders presne 5-krát!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.borders === 50
  },
  {
    id: 48,
    title: 'Level 48: Odpočítavanie statusu',
    description: 'Použi cyklus for na to, aby si nastavil status.text na premennú `i` 5-krát.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && String(status.text) === '4' // Ends on 4
  },
  {
    id: 49,
    title: 'Level 49: Šikmý pohyb s FOR',
    description: 'Vnútri cyklu FOR pridaj 10 k OBOBOM box.x aj box.y. Spusti ho 5-krát!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x === 50 && box.y === 50
  },
  {
    id: 50,
    title: 'Level 50: Finálny Boss!',
    description: 'Použi cyklus FOR, ktorý pobeží 10-krát. Zakaždým vypíš "I am a JS Master!" (Som majster JS!)',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs) => logs && logs.filter(l => l.includes('JS Master')).length >= 10
  },

  // --- PART 11: TIMERS & ANIMATIONS (51-55) ---
  {
    id: 51,
    title: 'Level 51: Počkaj si...',
    description: 'Použi setTimeout, aby si počkal 1000ms (1 sekundu) a potom zafarbil stenu na červeno!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.color === 'red'
  },
  {
    id: 52,
    title: 'Level 52: Oneskorená správa',
    description: 'Použi setTimeout, aby si po 2000ms zmenil status.text na "Surprise!" (Prekvapenie!)',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status) => status && status.text === 'Surprise!'
  },
  {
    id: 53,
    title: 'Level 53: Pulzovanie (Interval)',
    description: 'setInterval sa opakuje navždy! Pridaj 10 k wall.borders každých 500ms.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall) => wall && wall.borders >= 30 // Will win after 3 ticks
  },
  {
    id: 54,
    title: 'Level 54: Točiaca animácia',
    description: 'Animuj krabicu! Pridaj 15 k box.angle každých 100ms. Sleduj, ako sa točí!',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.angle >= 90 // Wins when it reaches 90
  },
  {
    id: 55,
    title: 'Level 55: Šikmá animácia',
    description: 'Vo vnútri setInterval pridaj 5 k OBOM x aj y každých 50ms.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box) => box.x >= 50 && box.y >= 50
  },
  
  // --- PART 12: OBJECT ORIENTED MAGIC (56-58) ---
  {
    id: 56,
    title: 'Level 56: Tvoj prvý klon',
    description: 'Použi konštruktor Box, aby si vyrobil novú krabicu! Napíš: let box1 = new Box(); a potom ju sprav modrú.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall, extraBoxes) => extraBoxes && extraBoxes.length > 0 && extraBoxes[0].color === 'blue'
  },
  {
    id: 57,
    title: 'Level 57: Dvojičky',
    description: 'Vytvor dve krabice! let b1 = new Box(); let b2 = new Box(); Presuň b1 na x=-100 a b2 na x=100.',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall, extraBoxes) => {
      if (!extraBoxes || extraBoxes.length < 2) return false;
      const b1 = extraBoxes.find(b => b.x === -100);
      const b2 = extraBoxes.find(b => b.x === 100);
      return b1 && b2;
    }
  },
  {
    id: 58,
    title: 'Level 58: Armáda krabíc (Pokročilé)',
    description: 'Použi cyklus FOR na vytvorenie 5 krabíc! Vo vnútri cyklu: let b = new Box();',
    initialCode: "",
    environment: { isRaining: false, isSunny: true },
    checkWin: (box, env, logs, status, wall, extraBoxes) => extraBoxes && extraBoxes.length >= 5
  }
];
