import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles, RotateCcw, ChevronLeft, ChevronRight, Save, UserCircle, Box } from 'lucide-react';
import Editor, { useMonaco } from '@monaco-editor/react';
import './index.css';
import { SCENARIOS } from './scenarios.js';

const PROFILES = ['Tatino', 'Maminka', 'Radko', 'Filipko', 'Ninka', ];

const CREEPER_TEXTURE = [
  "D D B B B B D D",
  "D VD D VL VL B B D",
  "B E E B B E E B",
  "B E E B B E E B",
  "B B B M M B VL B",
  "B B M M M M B B",
  "B B M M M M B B",
  "D D M B B M D D",
  "D D B B B B D D",
  "B B L D B B B D",
  "B B L B D B B B",
  "B B L D D VL B D",
  "D D B GAP GAP B D D",
  "D D L GAP GAP L D D",
  "VD D D GAP GAP D VD VD",
  "VD VD VD GAP GAP VD VD VD"
].join(" ").split(" ");

const getCreeperPixelStyle = (shade, state, rowIndex) => {
  if (!state.legs && rowIndex >= 12) return { backgroundColor: 'transparent' };
  if (shade === 'GAP') return { backgroundColor: 'transparent' };
  
  if (shade === 'E' && !state.eyes) shade = 'B';
  if (shade === 'M' && !state.mouth) shade = 'B';
  
  if (shade === 'E' || shade === 'M') return { backgroundColor: '#111' };
  
  let overlay = 'rgba(0,0,0,0)';
  if (shade === 'VL') overlay = 'rgba(255,255,255,0.4)';
  if (shade === 'L') overlay = 'rgba(255,255,255,0.2)';
  if (shade === 'D') overlay = 'rgba(0,0,0,0.2)';
  if (shade === 'VD') overlay = 'rgba(0,0,0,0.4)';
  
  return {
    backgroundColor: state.color,
    backgroundImage: `linear-gradient(${overlay}, ${overlay})`
  };
};

const FACTORY_DEFAULT_BOX = { color: '#4ECDC4', width: 150, height: 150, x: 0, y: 0, eyes: true, mouth: false, nose: false, angle: 0, borders: 0, hands: false, legs: false, hair: false, ears: false, glasses: false, visible: true, text: '', onClick: null };
const FACTORY_DEFAULT_STATUS = { text: 'status', color: 'transparent', borders: 0, visible: true, x: 0, y: -350 };
const FACTORY_DEFAULT_WALL = { color: '#E8F8F5', borders: 0, visible: true };
const FACTORY_DEFAULT_BUTTON = { text: 'Click me!', color: '#4ECDC4', width: 120, height: 40, x: -400, y: 350, borders: 0, visible: true, onClick: null };
const FACTORY_DEFAULT_CREEPER = { color: '#27ae60', width: 100, height: 200, x: -250, y: 0, eyes: true, mouth: true, legs: true, angle: 0, borders: 0, visible: true, text: '', onClick: null };
const FACTORY_DEFAULT_IOFIELD = { text: '', color: '#4ECDC4', width: 250, height: 40, x: 0, y: 150, borders: 0, visible: true, onClick: null };

function App() {
  const [profile, setProfile] = useState(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const scenario = SCENARIOS[currentScenarioIndex];
  
  const [code, setCode] = useState(scenario.initialCode);
  
  const [defaults, setDefaults] = useState({
    box: { ...FACTORY_DEFAULT_BOX },
    status: { ...FACTORY_DEFAULT_STATUS },
    wall: { ...FACTORY_DEFAULT_WALL },
    button: { ...FACTORY_DEFAULT_BUTTON },
    creeper: { ...FACTORY_DEFAULT_CREEPER },
    ioField: { ...FACTORY_DEFAULT_IOFIELD }
  });
  
  const defaultBox = defaults.box;
  const defaultStatus = defaults.status;
  const defaultWall = defaults.wall;
  const defaultButton = defaults.button;
  const defaultCreeper = defaults.creeper;
  const defaultIoField = defaults.ioField;
  
  const [boxState, setBoxState] = useState(defaultBox);
  const [statusState, setStatusState] = useState(defaultStatus);
  const [wallState, setWallState] = useState(defaultWall);
  const [buttonState, setButtonState] = useState(defaultButton);
  const [creeperState, setCreeperState] = useState(defaultCreeper);
  const [ioFieldState, setIoFieldState] = useState(defaultIoField);
  const currentIoFieldTextRef = useRef('');
  const [extraBoxes, setExtraBoxes] = useState([]);
  const [extraButtons, setExtraButtons] = useState([]);
  const [extraStatuses, setExtraStatuses] = useState([]);
  const [extraCreepers, setExtraCreepers] = useState([]);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [logs, setLogs] = useState([]);
  const [fancyLogs, setFancyLogs] = useState([]);
  const intervalsRef = useRef([]);
  
  const [saveName, setSaveName] = useState('');
  const [savedFiles, setSavedFiles] = useState({});
  const monaco = useMonaco();
  const libDisposableRef = useRef(null);

  const applyDefaults = (files) => {
    const box = { ...FACTORY_DEFAULT_BOX };
    const status = { ...FACTORY_DEFAULT_STATUS };
    const wall = { ...FACTORY_DEFAULT_WALL };
    const button = { ...FACTORY_DEFAULT_BUTTON };
    const creeper = { ...FACTORY_DEFAULT_CREEPER };
    const ioField = { ...FACTORY_DEFAULT_IOFIELD };
    
    if (files && files['FirstScan'] && files['FirstScan'].trim() !== '') {
        try {
            const initFn = new Function('box', 'status', 'wall', 'button', 'creeper', 'ioField', files['FirstScan']);
            initFn(box, status, wall, button, creeper, ioField);
        } catch (e) {
            console.error("FirstScan Error:", e);
        }
    }
    
    setDefaults({ box, status, wall, button, creeper, ioField });
    setBoxState({ ...box });
    setStatusState({ ...status });
    setWallState({ ...wall });
    setButtonState({ ...button });
    setCreeperState({ ...creeper });
    setIoFieldState({ ...ioField });
    currentIoFieldTextRef.current = ioField.text;
    setExtraBoxes([]);
    setExtraButtons([]);
    setExtraStatuses([]);
    setExtraCreepers([]);
  };

  useEffect(() => {
    if (!profile) return;
    fetch(`/api/load?profile=${profile}`)
      .then(res => res.json())
      .then(data => {
        const files = data || {};
        setSavedFiles(files);
        applyDefaults(files);
        
        if (!saveName) {
           setCode("// Prosím vytvor nový kód, alebo načítaj existujúci z ponuky vyššie!\n");
        }
      })
      .catch(err => console.error("Failed to load saved codes", err));
  }, [profile]);

  useEffect(() => {
    if (monaco && savedFiles['Library']) {
      const libraryCode = savedFiles['Library'];
      const regex = /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(([^)]*)\)/g;
      let typings = '';
      let match;
      while ((match = regex.exec(libraryCode)) !== null) {
        const name = match[1];
        const args = match[2].split(',').map(a => a.trim()).filter(a => a).map(a => `${a}: any`).join(', ');
        typings += `declare function ${name}(${args}): any;\n`;
      }
      
      if (libDisposableRef.current) {
        libDisposableRef.current.dispose();
      }
      libDisposableRef.current = monaco.languages.typescript.javascriptDefaults.addExtraLib(typings, 'filename/dynamic-library.d.ts');
    }
    
    return () => {
      if (libDisposableRef.current) {
        libDisposableRef.current.dispose();
        libDisposableRef.current = null;
      }
    };
  }, [monaco, savedFiles['Library']]);

  // Update code when scenario changes
  useEffect(() => {
    setCode(scenario.initialCode);
    handleReset();
  }, [currentScenarioIndex]);

  const handleReset = () => {
    setBoxState({ ...defaultBox });
    setStatusState({ ...defaultStatus });
    setWallState({ ...defaultWall });
    setButtonState({ ...defaultButton });
    setCreeperState({ ...defaultCreeper });
    setIoFieldState({ ...defaultIoField });
    currentIoFieldTextRef.current = defaultIoField.text;
    setExtraBoxes([]);
    setExtraButtons([]);
    setExtraStatuses([]);
    setExtraCreepers([]);
    setError(null);
    setShowConfetti(false);
    setLogs([]);
    setFancyLogs([]);
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  };

  const handleResetConsole = () => {
    setLogs([]);
    setFancyLogs([]);
  };

  const handleEditorWillMount = (monaco) => {
    // Provide TypeScript definitions so the editor perfectly autocompletes our Magic World objects!
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true, // Don't complain about top-level await or missing variables
      noSyntaxValidation: false,
    });
    
    // Exclude DOM lib so 'status' is not treated as the deprecated window.status (which is a string)
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true,
      lib: ["es2015"]
    });
    
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare var box: {
        color: string; width: number; height: number;
        x: number; y: number; angle: number; borders: number;
        eyes: boolean; mouth: boolean; nose: boolean; hands: boolean; legs: boolean;
        hair: boolean; ears: boolean; glasses: boolean; visible: boolean;
        text: string; onClick: Function;
      };
      declare class Box {
        constructor();
        color: string; width: number; height: number;
        x: number; y: number; angle: number; borders: number;
        eyes: boolean; mouth: boolean; nose: boolean; hands: boolean; legs: boolean;
        hair: boolean; ears: boolean; glasses: boolean; visible: boolean;
        text: string; onClick: Function;
      }
      declare var creeper: {
        color: string; width: number; height: number;
        x: number; y: number; angle: number; borders: number;
        eyes: boolean; mouth: boolean; legs: boolean; visible: boolean;
        text: string; onClick: Function;
      };
      declare class Creeper {
        constructor();
        color: string; width: number; height: number;
        x: number; y: number; angle: number; borders: number;
        eyes: boolean; mouth: boolean; legs: boolean; visible: boolean;
        text: string; onClick: Function;
      }
      declare var button: { text: string; color: string; width: number; height: number; x: number; y: number; borders: number; visible: boolean; onClick: Function; };
      declare class Button {
        constructor();
        text: string; color: string; width: number; height: number;
        x: number; y: number; borders: number; visible: boolean;
        onClick: Function;
      }
      declare var ioField: { text: string; color: string; width: number; height: number; x: number; y: number; borders: number; visible: boolean; onClick: Function; };
      declare class IoField {
        constructor();
        text: string; color: string; width: number; height: number;
        x: number; y: number; borders: number; visible: boolean;
        onClick: Function;
      }
      declare var wall: { color: string; borders: number; visible: boolean; };
      declare var status: { text: string; color: string; borders: number; visible: boolean; x: number; y: number; };
      declare class Status {
        constructor();
        text: string; color: string; borders: number; visible: boolean; x: number; y: number;
      }
      declare var isSunny: boolean; declare var isRaining: boolean; declare var isNight: boolean;
      declare function setInterval(callback: Function, ms: number): number;
      declare function setTimeout(callback: Function, ms: number): number;
      declare var console: { log(...args: any[]): void; };
    `, 'filename/facts.d.ts');
  };

  const handleEditorDidMount = (editor, monaco) => {
    const forceLayout = () => {
      monaco.editor.remeasureFonts();
      editor.layout();
    };
    
    document.fonts.ready.then(forceLayout);
    // Extra fallbacks in case fonts load slightly after ready event
    setTimeout(forceLayout, 500);
    setTimeout(forceLayout, 2000);
  };

  const handleSaveCode = () => {
    if (!saveName.trim()) {
      setLogs(prev => [...prev, "❌ Please enter a name first! (e.g. RadkoCode)"]);
      return;
    }
    
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, name: saveName, code })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setSavedFiles(data.files);
        setLogs(prev => [...prev, `💾 Code saved to C:\\Code_R\\KidsCode\\src\\SavedCode\\${profile}\\savedCode.json as '${saveName}'!`]);
      }
    })
    .catch(err => {
      console.error(err);
      setLogs(prev => [...prev, "❌ Error saving code!"]);
    });
  };

  const handleLoadCode = (name) => {
    const currentName = saveName.trim();
    
    const loadCodeAfterSave = (files) => {
      const codeToLoad = files[name] !== undefined ? files[name] : savedFiles[name];
      if (codeToLoad !== undefined) {
        setCode(codeToLoad);
        setSaveName(name);
        setLogs(prev => [...prev, `📂 Loaded '${name}'!`]);
      }
    };
    
    if (currentName) {
      // Auto-save the current code first
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, name: currentName, code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSavedFiles(data.files);
          setLogs(prev => [...prev, `💾 Auto-saved as '${currentName}'!`]);
          loadCodeAfterSave(data.files);
        }
      })
      .catch(err => {
        console.error("Auto-save failed before loading", err);
        setLogs(prev => [...prev, "❌ Error auto-saving!"]);
        loadCodeAfterSave(savedFiles);
      });
    } else {
      loadCodeAfterSave(savedFiles);
    }
  };

  const handleRunCode = () => {
    setError(null);
    setShowConfetti(false);
    setLogs([]);
    setFancyLogs([]);
    
    try {
      const currentExtraBoxes = [];
      class Box {
        constructor() {
          const id = Date.now() + Math.random();
          const initialBox = { ...defaultBox, id };
          
          const boxProxy = new Proxy(initialBox, {
            set: (target, prop, value) => {
              if (!(prop in defaultBox) && prop !== 'id') throw new Error(`Oops! Box does not have a property named '${String(prop)}'`);
              target[prop] = value;
              setExtraBoxes([...currentExtraBoxes]);
              
              if (scenario.checkWin(userBox, { ...scenario.environment }, logs, statusState, wallState, currentExtraBoxes)) {
                setShowConfetti(true);
              }
              return true;
            }
          });
          currentExtraBoxes.push(boxProxy);
          setExtraBoxes([...currentExtraBoxes]);
          return boxProxy;
        }
      }

      const currentExtraButtons = [];
      class Button {
        constructor() {
          const id = Date.now() + Math.random();
          const initialBtn = { ...defaultButton, id, visible: true };
          
          const btnProxy = new Proxy(initialBtn, {
            set: (target, prop, value) => {
              if (!(prop in defaultButton) && prop !== 'id') throw new Error(`Oops! Button does not have a property named '${String(prop)}'`);
              target[prop] = value;
              setExtraButtons([...currentExtraButtons]);
              return true;
            }
          });
          currentExtraButtons.push(btnProxy);
          setExtraButtons([...currentExtraButtons]);
          return btnProxy;
        }
      }

      const currentExtraStatuses = [];
      class Status {
        constructor() {
          const id = Date.now() + Math.random();
          const initialStatus = { ...defaultStatus, id, visible: true };
          
          const statusProxy = new Proxy(initialStatus, {
            set: (target, prop, value) => {
              if (!(prop in defaultStatus) && prop !== 'id') throw new Error(`Oops! Status does not have a property named '${String(prop)}'`);
              target[prop] = value;
              setExtraStatuses([...currentExtraStatuses]);
              return true;
            }
          });
          currentExtraStatuses.push(statusProxy);
          setExtraStatuses([...currentExtraStatuses]);
          return statusProxy;
        }
      }

      const currentExtraCreepers = [];
      class Creeper {
        constructor() {
          const id = Date.now() + Math.random();
          const initialCreeper = { ...defaultCreeper, id };
          
          const creeperProxy = new Proxy(initialCreeper, {
            set: (target, prop, value) => {
              if (!(prop in defaultCreeper) && prop !== 'id') throw new Error(`Oops! Creeper does not have a property named '${String(prop)}'`);
              target[prop] = value;
              setExtraCreepers([...currentExtraCreepers]);
              return true;
            }
          });
          currentExtraCreepers.push(creeperProxy);
          setExtraCreepers([...currentExtraCreepers]);
          return creeperProxy;
        }
      }

      const currentExtraIoFields = [];
      class IoField {
        constructor() {
          const id = Date.now() + Math.random();
          const initialIo = { ...defaultIoField, id, visible: true };
          
          const ioProxy = new Proxy(initialIo, {
            get: (target, prop) => target[prop], // We don't support typing into extra IoFields for now
            set: (target, prop, value) => {
              if (!(prop in defaultIoField) && prop !== 'id') throw new Error(`Oops! IoField does not have a property named '${String(prop)}'`);
              target[prop] = value;
              // we don't have setExtraIoFields yet, but we will return it.
              return true;
            }
          });
          currentExtraIoFields.push(ioProxy);
          return ioProxy;
        }
      }

      // Create proxies so async changes trigger re-renders
      const userBox = new Proxy({ ...defaultBox, ...boxState }, {
        set: (target, prop, value) => {
          if (!(prop in defaultBox)) throw new Error(`Oops! 'box' does not have a property named '${String(prop)}'`);
          target[prop] = value;
          setBoxState({ ...target });
          
          if (scenario.checkWin(target, { ...scenario.environment }, logs, statusState, wallState)) {
            setShowConfetti(true);
          }
          return true;
        }
      });
      
      const userStatus = new Proxy({ ...defaultStatus, ...statusState }, {
        set: (target, prop, value) => {
          if (!(prop in defaultStatus)) throw new Error(`Oops! 'status' does not have a property named '${String(prop)}'`);
          target[prop] = value;
          setStatusState({ ...target });
          
          if (scenario.checkWin(userBox, { ...scenario.environment }, logs, target, wallState)) {
            setShowConfetti(true);
          }
          return true;
        }
      });

      const userWall = new Proxy({ ...defaultWall, ...wallState }, {
        set: (target, prop, value) => {
          if (!(prop in defaultWall)) throw new Error(`Oops! 'wall' does not have a property named '${String(prop)}'`);
          target[prop] = value;
          setWallState({ ...target });
          
          if (scenario.checkWin(userBox, { ...scenario.environment }, logs, statusState, target)) {
            setShowConfetti(true);
          }
          return true;
        }
      });

      const userButton = new Proxy({ ...defaultButton, ...buttonState }, {
        set: (target, prop, value) => {
          if (!(prop in defaultButton)) throw new Error(`Oops! 'button' does not have a property named '${String(prop)}'`);
          target[prop] = value;
          setButtonState({ ...target });
          return true;
        }
      });
      
      const userCreeper = new Proxy({ ...defaultCreeper, ...creeperState }, {
        set: (target, prop, value) => {
          if (!(prop in defaultCreeper)) throw new Error(`Oops! 'creeper' does not have a property named '${String(prop)}'`);
          target[prop] = value;
          setCreeperState({ ...target });
          return true;
        }
      });
      
      const userIoField = new Proxy({ ...defaultIoField, ...ioFieldState }, {
        get: (target, prop) => {
          if (prop === 'text') return currentIoFieldTextRef.current;
          return target[prop];
        },
        set: (target, prop, value) => {
          if (!(prop in defaultIoField)) throw new Error(`Oops! 'ioField' does not have a property named '${String(prop)}'`);
          if (prop === 'text') currentIoFieldTextRef.current = value;
          target[prop] = value;
          setIoFieldState({ ...target });
          return true;
        }
      });
      
      const fakeConsole = {
        log: (...args) => {
          const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          setLogs(prev => {
            const newLogs = [...prev, message];
            if (scenario.checkWin(userBox, { ...scenario.environment }, newLogs, userStatus, userWall)) {
              setShowConfetti(true);
            }
            return newLogs;
          });
          setFancyLogs(prev => [...prev, args]);
          console.log("KIDS CODE:", ...args);
        }
      };

      const env = { 
        ...scenario.environment,
        Box,
        Creeper,
        Button,
        Status,
        IoField,
        setInterval: (cb, ms) => {
          const id = setInterval(() => {
            try { cb(); } catch (e) { 
              setError(e.message); 
              setLogs(prev => [...prev, "❌ ERROR: " + e.message]);
              clearInterval(id); 
            }
          }, ms);
          intervalsRef.current.push(id);
          return id;
        },
        setTimeout: (cb, ms) => {
          const id = setTimeout(() => {
            try { cb(); } catch (e) { 
              setError(e.message); 
              setLogs(prev => [...prev, "❌ ERROR: " + e.message]);
            }
          }, ms);
          intervalsRef.current.push(id);
          return id;
        }
      };
      
      // We create a safe execution context using 'with' to allow variable shadowing
      // The function expects parameters: box, status, wall, button, console, env, Box, Button, Status
      const libraryCode = (savedFiles['Library'] && saveName !== 'Library') ? savedFiles['Library'] : '';
      const executeCode = new Function('box', 'creeper', 'status', 'wall', 'button', 'ioField', 'console', 'env', 'Box', 'Button', 'Status', 'Creeper', 'IoField', `
        with (env) {
          ${libraryCode}
          ${code}
        }
      `);
      
      // Run the code, passing the environment with our fake timers
      executeCode(userBox, userCreeper, userStatus, userWall, userButton, userIoField, fakeConsole, env, Box, Button, Status, Creeper, IoField);
      
      // Update the React state with whatever the user code changed
      setBoxState(userBox);
      setCreeperState(userCreeper);
      
      // Check if they won the scenario
      if (scenario.checkWin(userBox, { ...scenario.environment }, logs, userStatus, userWall, currentExtraBoxes)) {
        setTimeout(() => setShowConfetti(true), 300);
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Oops! There is a little mistake in the code. Keep trying!");
      setLogs(prev => [...prev, "❌ ERROR: " + (err.message || "Oops! Check your code!")]);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!profile) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f6fa' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '40px', color: '#2D3436' }}>
          <Sparkles fill="#FF6B6B" color="#FF6B6B" size={48} style={{ verticalAlign: 'middle', marginRight: '15px' }} />
          Kto sa ide učiť programovať?
        </h1>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px' }}>
          {PROFILES.map(p => (
            <button
              key={p}
              onClick={() => setProfile(p)}
              style={{
                padding: '20px 40px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                borderRadius: '16px',
                border: 'none',
                background: '#4ECDC4',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1 style={{ display: 'flex', alignItems: 'center' }}>
          <Sparkles fill="#FF6B6B" color="#FF6B6B" /> Kids JS Magic ({profile})
          <button 
            onClick={() => { setProfile(null); setCode(''); setSaveName(''); }} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              marginLeft: '20px', padding: '8px 16px', borderRadius: '12px', 
              cursor: 'pointer', background: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)', 
              color: '#2d3436', border: 'none', fontWeight: '800', fontSize: '1.1rem',
              boxShadow: '0 4px 0 #e1b12c', transition: 'all 0.2s ease'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0px 0 #e1b12c'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #e1b12c'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #e1b12c'; }}
          >
            <UserCircle size={20} /> Zmeň hráča
          </button>
        </h1>
        
          <div className="scenario-selector" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => setCurrentScenarioIndex(0)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: '900',
                border: 'none', cursor: 'pointer',
                background: currentScenarioIndex === 0 ? 'linear-gradient(135deg, #4ECDC4, #16a085)' : '#f1f2f6',
                color: currentScenarioIndex === 0 ? 'white' : '#2d3436',
                boxShadow: currentScenarioIndex === 0 ? '0 4px 0 #0e6655' : '0 4px 0 #dfe4ea',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase', letterSpacing: '1px'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = `0 0px 0 ${currentScenarioIndex === 0 ? '#0e6655' : '#dfe4ea'}`; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 0 ${currentScenarioIndex === 0 ? '#0e6655' : '#dfe4ea'}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 0 ${currentScenarioIndex === 0 ? '#0e6655' : '#dfe4ea'}`; }}
            >
              <Box size={22} strokeWidth={2.5} /> Sandbox
            </button>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'white', padding: '8px', borderRadius: '16px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '2px solid #f1f2f6'
          }}>
            <button 
              onClick={() => setCurrentScenarioIndex(prev => Math.max(1, prev - 1))}
              disabled={currentScenarioIndex <= 1}
              style={{ 
                background: currentScenarioIndex <= 1 ? '#f1f2f6' : '#FF6B6B', 
                color: currentScenarioIndex <= 1 ? '#a4b0be' : 'white',
                border: 'none', borderRadius: '10px', cursor: currentScenarioIndex <= 1 ? 'not-allowed' : 'pointer', 
                padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: currentScenarioIndex <= 1 ? 'none' : '0 4px 0 #d63031'
              }}
              onMouseDown={e => { if(currentScenarioIndex > 1) { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0px 0 #d63031'; } }}
              onMouseUp={e => { if(currentScenarioIndex > 1) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #d63031'; } }}
              onMouseLeave={e => { if(currentScenarioIndex > 1) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #d63031'; } }}
            >
              <ChevronLeft size={22} strokeWidth={3} />
            </button>
            
            <div style={{ position: 'relative' }}>
              <select 
                value={currentScenarioIndex} 
                onChange={(e) => setCurrentScenarioIndex(Number(e.target.value))}
                style={{ 
                  appearance: 'none',
                  padding: '10px 40px 10px 20px', 
                  borderRadius: '10px', 
                  border: '2px solid #dfe4ea', 
                  fontSize: '1.1rem', 
                  fontWeight: '800', 
                  color: '#2d3436',
                  background: '#f8f9fa',
                  outline: 'none', 
                  cursor: 'pointer',
                  minWidth: '220px',
                  transition: 'all 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#4ECDC4'}
                onBlur={e => e.currentTarget.style.borderColor = '#dfe4ea'}
              >
                {SCENARIOS.map((s, idx) => (
                  <option key={s.id} value={idx}>
                    {idx === 0 ? "🌍 " + s.title : "⭐ Level " + idx + ": " + s.title}
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#b2bec3' }}>
                ▼
              </div>
            </div>

            <button 
              onClick={() => setCurrentScenarioIndex(prev => Math.min(SCENARIOS.length - 1, prev + 1))}
              disabled={currentScenarioIndex === 0 || currentScenarioIndex === SCENARIOS.length - 1}
              style={{ 
                background: (currentScenarioIndex === 0 || currentScenarioIndex === SCENARIOS.length - 1) ? '#f1f2f6' : '#FF6B6B', 
                color: (currentScenarioIndex === 0 || currentScenarioIndex === SCENARIOS.length - 1) ? '#a4b0be' : 'white',
                border: 'none', borderRadius: '10px', cursor: (currentScenarioIndex === 0 || currentScenarioIndex === SCENARIOS.length - 1) ? 'not-allowed' : 'pointer', 
                padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: (currentScenarioIndex === 0 || currentScenarioIndex === SCENARIOS.length - 1) ? 'none' : '0 4px 0 #d63031'
              }}
              onMouseDown={e => { if(currentScenarioIndex !== 0 && currentScenarioIndex !== SCENARIOS.length - 1) { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0px 0 #d63031'; } }}
              onMouseUp={e => { if(currentScenarioIndex !== 0 && currentScenarioIndex !== SCENARIOS.length - 1) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #d63031'; } }}
              onMouseLeave={e => { if(currentScenarioIndex !== 0 && currentScenarioIndex !== SCENARIOS.length - 1) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #d63031'; } }}
            >
              <ChevronRight size={22} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Left Panel: Editor */}
        <div className="editor-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📝 Write Your Code Here!</span>
            {currentScenarioIndex === 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {Object.keys(savedFiles).length > 0 && (
                  <select 
                    onChange={(e) => handleLoadCode(e.target.value)}
                    value=""
                    style={{ padding: '6px', borderRadius: '6px', border: '2px solid #dfe4ea', outline: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#2D3436' }}
                  >
                    <option value="" disabled>Load File...</option>
                    {Object.keys(savedFiles).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                )}
                
                <input 
                  type="text" 
                  placeholder="Name (e.g. Radko)" 
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  style={{ padding: '6px', borderRadius: '6px', border: '2px solid #dfe4ea', width: '130px', outline: 'none', fontWeight: 'bold' }}
                />
                <button 
                  onClick={handleSaveCode}
                  style={{
                    background: '#2bcbba',
                    border: 'none',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  <Save size={16} /> SAVE
                </button>
              </div>
            )}
          </div>
          <div style={{ padding: '15px 20px', background: '#FFF3CD', borderBottom: '2px solid #FFE69C', fontWeight: 'bold' }}>
            Goal: {scenario.description}
          </div>
          <div className="code-area">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              beforeMount={handleEditorWillMount}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 18,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                fontFamily: "'Fira Code', monospace",
                suggestOnTriggerCharacters: true,
                padding: { top: 10 },
                showDeprecated: false
              }}
              theme="vs-dark"
            />
            <button className="run-btn" onClick={handleRunCode}>
              <Play fill="white" size={24} /> RUN CODE!
            </button>
          </div>
        </div>

        {/* Right Panel: GUI Console */}
        <div className="gui-console">
          <div className="gui-header">
            🎮 The Magic World
          </div>
          <div className="gui-split">
            <div 
              className="canvas-area"
              style={{
                backgroundColor: wallState.visible !== false ? wallState.color : 'transparent',
                border: wallState.borders ? `${wallState.borders}px solid #2D3436` : 'none',
                boxSizing: 'border-box'
              }}
            >
              {showConfetti && (
                <div className="success-confetti">
                  <h1 style={{ textAlign: 'center', marginTop: '40px', fontSize: '3rem', color: '#FF6B6B', textShadow: '2px 2px white' }}>
                    Great Job! 🎉
                  </h1>
                </div>
              )}
              


              <div 
                className="status-banner"
                style={{
                  display: statusState.visible !== false ? 'block' : 'none',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${statusState.x || 0}px), calc(-50% + ${statusState.y || 0}px))`,
                  backgroundColor: statusState.color,
                  border: statusState.borders ? `${statusState.borders}px solid #2D3436` : 'none',
                  padding: statusState.text ? '10px 20px' : '0',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  color: '#2D3436',
                  zIndex: 5,
                  minWidth: statusState.text ? '100px' : '0',
                  textAlign: 'center',
                  boxShadow: statusState.text ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {statusState.text}
              </div>

              {extraStatuses.map((estatus) => (
                <div 
                  key={estatus.id}
                  className="status-banner"
                  style={{
                    display: estatus.visible !== false ? 'block' : 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${estatus.x || 0}px), calc(-50% + ${estatus.y || 0}px))`,
                    backgroundColor: estatus.color,
                    border: estatus.borders ? `${estatus.borders}px solid #2D3436` : 'none',
                    padding: estatus.text ? '10px 20px' : '0',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    color: '#2D3436',
                    zIndex: 5,
                    minWidth: estatus.text ? '100px' : '0',
                    textAlign: 'center',
                    boxShadow: estatus.text ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {estatus.text}
                </div>
              ))}

              <div 
                className="magic-box"
                onClick={() => boxState.onClick && typeof boxState.onClick === 'function' && boxState.onClick()}
                style={{
                  display: boxState.visible !== false ? 'block' : 'none',
                  backgroundColor: boxState.color,
                  width: `${boxState.width}px`,
                  height: `${boxState.height}px`,
                  transform: `translate(calc(-50% + ${boxState.x || 0}px), calc(-50% + ${boxState.y || 0}px)) rotate(${boxState.angle || 0}deg)`,
                  border: boxState.borders ? `${boxState.borders}px solid #2D3436` : 'none',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  cursor: boxState.onClick ? 'pointer' : 'default'
                }}
              >
                {boxState.text && (
                  <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '5px 10px', borderRadius: '10px', border: '2px solid #2D3436', fontWeight: 'bold', color: '#2D3436', whiteSpace: 'nowrap', zIndex: 10 }}>
                    {boxState.text}
                    <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #2D3436' }}></div>
                    <div style={{ position: 'absolute', bottom: '-3px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid white' }}></div>
                  </div>
                )}
                {boxState.hair && (
                  <div className="hairs-container">
                    <div className="hair spike-1"></div>
                    <div className="hair spike-2"></div>
                    <div className="hair spike-3"></div>
                    <div className="hair spike-4"></div>
                    <div className="hair spike-5"></div>
                  </div>
                )}
                {boxState.ears && <div className="ear left-ear"></div>}
                {boxState.ears && <div className="ear right-ear"></div>}
                {boxState.hands && <div className="hand left-hand"></div>}
                {boxState.hands && <div className="hand right-hand"></div>}
                {boxState.legs && <div className="leg left-leg"></div>}
                {boxState.legs && <div className="leg right-leg"></div>}

                <div className="face-container">
                  {boxState.eyes && (
                    <div className="eyes">
                      <div className="eye"><div className="pupil"></div></div>
                      <div className="eye"><div className="pupil"></div></div>
                    </div>
                  )}
                  {boxState.glasses && (
                    <div className="glasses-container">
                      <div className="glass-lens left-lens"></div>
                      <div className="glass-bridge"></div>
                      <div className="glass-lens right-lens"></div>
                    </div>
                  )}
                  {boxState.nose && <div className="nose"></div>}
                  {boxState.mouth && (
                    <div className="mouth">
                      <div className="teeth"></div>
                      <div className="tongue"></div>
                    </div>
                  )}
                </div>
              </div>

              {extraBoxes.map((ebox) => (
                <div 
                  key={ebox.id}
                  className="magic-box"
                  onClick={() => ebox.onClick && typeof ebox.onClick === 'function' && ebox.onClick()}
                  style={{
                    display: ebox.visible !== false ? 'block' : 'none',
                    backgroundColor: ebox.color,
                    width: `${ebox.width}px`,
                    height: `${ebox.height}px`,
                    transform: `translate(calc(-50% + ${ebox.x || 0}px), calc(-50% + ${ebox.y || 0}px)) rotate(${ebox.angle || 0}deg)`,
                    border: ebox.borders ? `${ebox.borders}px solid #2D3436` : 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    cursor: ebox.onClick ? 'pointer' : 'default'
                  }}
                >
                  {ebox.text && (
                    <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '5px 10px', borderRadius: '10px', border: '2px solid #2D3436', fontWeight: 'bold', color: '#2D3436', whiteSpace: 'nowrap', zIndex: 10 }}>
                      {ebox.text}
                      <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #2D3436' }}></div>
                      <div style={{ position: 'absolute', bottom: '-3px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid white' }}></div>
                    </div>
                  )}
                  {ebox.hair && (
                    <div className="hairs-container">
                      <div className="hair spike-1"></div>
                      <div className="hair spike-2"></div>
                      <div className="hair spike-3"></div>
                      <div className="hair spike-4"></div>
                      <div className="hair spike-5"></div>
                    </div>
                  )}
                  {ebox.ears && <div className="ear left-ear"></div>}
                  {ebox.ears && <div className="ear right-ear"></div>}
                  {ebox.hands && <div className="hand left-hand"></div>}
                  {ebox.hands && <div className="hand right-hand"></div>}
                  {ebox.legs && <div className="leg left-leg"></div>}
                  {ebox.legs && <div className="leg right-leg"></div>}

                  <div className="face-container">
                    {ebox.eyes && (
                      <div className="eyes">
                        <div className="eye"><div className="pupil"></div></div>
                        <div className="eye"><div className="pupil"></div></div>
                      </div>
                    )}
                    {ebox.glasses && (
                      <div className="glasses-container">
                        <div className="glass-lens left-lens"></div>
                        <div className="glass-bridge"></div>
                        <div className="glass-lens right-lens"></div>
                      </div>
                    )}
                    {ebox.nose && <div className="nose"></div>}
                    {ebox.mouth && (
                      <div className="mouth">
                        <div className="teeth"></div>
                        <div className="tongue"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div 
                className="magic-creeper"
                onClick={() => creeperState.onClick && typeof creeperState.onClick === 'function' && creeperState.onClick()}
                style={{
                  display: creeperState.visible !== false ? 'grid' : 'none',
                  width: `${creeperState.width}px`,
                  height: `${creeperState.height}px`,
                  transform: `translate(calc(-50% + ${creeperState.x || 0}px), calc(-50% + ${creeperState.y || 0}px)) rotate(${creeperState.angle || 0}deg)`,
                  border: creeperState.borders ? `${creeperState.borders}px solid #2D3436` : 'none',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                }}
              >
                {creeperState.text && (
                  <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '5px 10px', borderRadius: '10px', border: '2px solid #2D3436', fontWeight: 'bold', color: '#2D3436', whiteSpace: 'nowrap', zIndex: 10 }}>
                    {creeperState.text}
                    <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #2D3436' }}></div>
                    <div style={{ position: 'absolute', bottom: '-3px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid white' }}></div>
                  </div>
                )}
                {CREEPER_TEXTURE.map((shade, i) => (
                  <div key={i} className="creeper-pixel" style={getCreeperPixelStyle(shade, creeperState, Math.floor(i / 8))} />
                ))}
              </div>

              {extraCreepers.map((ecreeper) => (
                <div 
                  key={ecreeper.id}
                  className="magic-creeper"
                  onClick={() => ecreeper.onClick && typeof ecreeper.onClick === 'function' && ecreeper.onClick()}
                  style={{
                    display: ecreeper.visible !== false ? 'grid' : 'none',
                    width: `${ecreeper.width}px`,
                    height: `${ecreeper.height}px`,
                    transform: `translate(calc(-50% + ${ecreeper.x || 0}px), calc(-50% + ${ecreeper.y || 0}px)) rotate(${ecreeper.angle || 0}deg)`,
                    border: ecreeper.borders ? `${ecreeper.borders}px solid #2D3436` : 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                  }}
                >
                  {ecreeper.text && (
                    <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '5px 10px', borderRadius: '10px', border: '2px solid #2D3436', fontWeight: 'bold', color: '#2D3436', whiteSpace: 'nowrap', zIndex: 10 }}>
                      {ecreeper.text}
                      <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #2D3436' }}></div>
                      <div style={{ position: 'absolute', bottom: '-3px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid white' }}></div>
                    </div>
                  )}
                  {CREEPER_TEXTURE.map((shade, i) => (
                    <div key={i} className="creeper-pixel" style={getCreeperPixelStyle(shade, ecreeper, Math.floor(i / 8))} />
                  ))}
                </div>
              ))}

              <div 
                className="magic-button"
                onClick={() => buttonState.onClick && typeof buttonState.onClick === 'function' && buttonState.onClick()}
                style={{
                  display: buttonState.visible !== false ? 'flex' : 'none',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: buttonState.color,
                  width: `${buttonState.width}px`,
                  height: `${buttonState.height}px`,
                  transform: `translate(calc(-50% + ${buttonState.x || 0}px), calc(-50% + ${buttonState.y || 0}px))`,
                  border: buttonState.borders ? `${buttonState.borders}px solid #2D3436` : 'none',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  cursor: buttonState.onClick ? 'pointer' : 'default',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  userSelect: 'none'
                }}
              >
                {buttonState.text}
              </div>

              <div 
                className="magic-iofield"
                style={{
                  display: ioFieldState.visible !== false ? 'flex' : 'none',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  width: `${ioFieldState.width}px`,
                  height: `${ioFieldState.height}px`,
                  transform: `translate(calc(-50% + ${ioFieldState.x || 0}px), calc(-50% + ${ioFieldState.y || 0}px))`,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  borderRadius: '10px',
                  border: ioFieldState.borders ? `${ioFieldState.borders}px solid #2D3436` : 'none',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <input 
                  type="text" 
                  value={ioFieldState.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setIoFieldState(prev => ({ ...prev, text: newText }));
                    currentIoFieldTextRef.current = newText;
                  }}
                  style={{
                    flex: 1,
                    padding: '0 15px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#2D3436'
                  }}
                  placeholder="Type here..."
                />
                <button 
                  onClick={() => ioFieldState.onClick && typeof ioFieldState.onClick === 'function' && ioFieldState.onClick()}
                  style={{
                    backgroundColor: ioFieldState.color,
                    border: 'none',
                    padding: '0 20px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    cursor: ioFieldState.onClick ? 'pointer' : 'default',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseDown={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseUp={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Submit
                </button>
              </div>

              {extraButtons.map((ebtn) => (
                <div 
                  key={ebtn.id}
                  className="magic-button"
                  onClick={() => ebtn.onClick && typeof ebtn.onClick === 'function' && ebtn.onClick()}
                  style={{
                    display: ebtn.visible !== false ? 'flex' : 'none',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: ebtn.color,
                    width: `${ebtn.width}px`,
                    height: `${ebtn.height}px`,
                    transform: `translate(calc(-50% + ${ebtn.x || 0}px), calc(-50% + ${ebtn.y || 0}px))`,
                    border: ebtn.borders ? `${ebtn.borders}px solid #2D3436` : 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    cursor: ebtn.onClick ? 'pointer' : 'default',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    userSelect: 'none'
                  }}
                >
                  {ebtn.text}
                </div>
              ))}
            </div>
            
            {/* Text Console */}
            <div className="text-console">
              <div className="console-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🖥️ Output</span>
                <div style={{ display: 'flex', gap: '10px' }}>

                  <button 
                    className="reset-btn"
                    onClick={handleResetConsole} 
                    style={{ background: '#34495e', boxShadow: '0 4px 0 #2c3e50', fontSize: '1rem', padding: '6px 12px' }}
                  >
                    <RotateCcw size={16} /> Reset Console
                  </button>
                  <button 
                    className="reset-btn"
                    onClick={handleReset} 
                    style={{ fontSize: '1rem', padding: '6px 12px' }}
                  >
                    <RotateCcw size={16} /> Reset Code
                  </button>
                </div>
              </div>
              <div className="console-logs">
                {fancyLogs.length === 0 && <span style={{color: '#aaa', fontStyle: 'italic'}}>Waiting for logs...</span>}
                {fancyLogs.map((logArgs, i) => (
                  <div key={i} className="log-line" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span style={{ marginRight: '4px' }}>👉</span>
                    {logArgs.map((arg, j) => {
                      const isVariable = j % 2 === 1;
                      let text = typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                      let color = isVariable ? '#FFD93D' : '#2bcbba';
                      if (typeof arg === 'number') color = '#a29bfe';
                      if (typeof arg === 'boolean') color = '#fd79a8';
                      return (
                        <span 
                          key={j} 
                          style={{ 
                            color: color,
                            backgroundColor: isVariable ? 'rgba(255, 217, 61, 0.1)' : 'transparent',
                            padding: isVariable ? '2px 8px' : '0',
                            borderRadius: '6px',
                            fontWeight: isVariable ? 'bold' : 'normal',
                            fontFamily: isVariable ? 'monospace' : 'inherit'
                          }}
                        >
                          {text}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-toast">{error}</div>}
    </div>
  );
}

export default App;
