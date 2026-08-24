import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles, RotateCcw, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import Editor, { useMonaco } from '@monaco-editor/react';
import './index.css';
import { SCENARIOS } from './scenarios.js';

function App() {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const scenario = SCENARIOS[currentScenarioIndex];
  
  const [code, setCode] = useState(scenario.initialCode);
  const defaultBox = { color: '#4ECDC4', width: 150, height: 150, x: 0, y: 0, eyes: true, smile: false, nose: false, angle: 0, borders: 0, hands: false, legs: false, hair: false, ears: false, glasses: false, visible: true, text: '', onClick: null };
  const defaultStatus = { text: 'status', color: 'transparent', borders: 0, visible: true, x: 0, y: 0 };
  const defaultWall = { color: '#E8F8F5', borders: 0, visible: true };
  const defaultButton = { text: 'Click me!', color: '#4ECDC4', width: 120, height: 40, x: -450, y: 0, borders: 0, visible: true, onClick: null };
  
  const [boxState, setBoxState] = useState(defaultBox);
  const [statusState, setStatusState] = useState(defaultStatus);
  const [wallState, setWallState] = useState(defaultWall);
  const [buttonState, setButtonState] = useState(defaultButton);
  const [extraBoxes, setExtraBoxes] = useState([]);
  const [extraButtons, setExtraButtons] = useState([]);
  const [extraStatuses, setExtraStatuses] = useState([]);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [logs, setLogs] = useState([]);
  const intervalsRef = useRef([]);
  
  const [saveName, setSaveName] = useState('');
  const [savedFiles, setSavedFiles] = useState({});
  const monaco = useMonaco();
  const libDisposableRef = useRef(null);

  useEffect(() => {
    fetch('/api/load')
      .then(res => res.json())
      .then(data => setSavedFiles(data || {}))
      .catch(err => console.error("Failed to load saved codes", err));
  }, []);

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
    setExtraBoxes([]);
    setExtraButtons([]);
    setExtraStatuses([]);
    setError(null);
    setShowConfetti(false);
    setLogs([]);
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  };

  const handleEditorWillMount = (monaco) => {
    // Provide TypeScript definitions so the editor perfectly autocompletes our Magic World objects!
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true, // Don't complain about top-level await or missing variables
      noSyntaxValidation: false,
    });
    
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare var box: {
        color: string; width: number; height: number;
        x: number; y: number; angle: number; borders: number;
        eyes: boolean; smile: boolean; nose: boolean; hands: boolean; legs: boolean;
        hair: boolean; ears: boolean; glasses: boolean; visible: boolean;
        text: string; onClick: Function;
      };
      declare class Box {
        constructor();
        color: string; width: number; height: number;
        x: number; y: number; angle: number; borders: number;
        eyes: boolean; smile: boolean; nose: boolean; hands: boolean; legs: boolean;
        hair: boolean; ears: boolean; glasses: boolean; visible: boolean;
        text: string; onClick: Function;
      }
      declare var button: { text: string; color: string; width: number; height: number; x: number; y: number; borders: number; visible: boolean; onClick: Function; };
      declare class Button {
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
    `, 'filename/facts.d.ts');
  };

  const handleSaveCode = () => {
    if (!saveName.trim()) {
      setLogs(prev => [...prev, "❌ Please enter a name first! (e.g. RadkoCode)"]);
      return;
    }
    
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: saveName, code })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setSavedFiles(data.files);
        setLogs(prev => [...prev, `💾 Code saved to C:\\Code_R\\KidsCode\\src\\SavedCode\\savedCode.json as '${saveName}'!`]);
      }
    })
    .catch(err => {
      console.error(err);
      setLogs(prev => [...prev, "❌ Error saving code!"]);
    });
  };

  const handleLoadCode = (name) => {
    const currentName = saveName.trim() || 'AutoSave';
    
    // Auto-save the current code first
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: currentName, code })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setSavedFiles(data.files);
        
        // After auto-saving, load the new code
        const codeToLoad = data.files[name] !== undefined ? data.files[name] : savedFiles[name];
        if (codeToLoad !== undefined) {
          setCode(codeToLoad);
          setSaveName(name);
          setLogs(prev => [...prev, `💾 Auto-saved as '${currentName}'!`, `📂 Loaded '${name}'!`]);
        }
      }
    })
    .catch(err => {
      console.error("Auto-save failed before loading", err);
      // Even if auto-save fails, we should still try to load the file
      if (savedFiles[name]) {
        setCode(savedFiles[name]);
        setSaveName(name);
        setLogs(prev => [...prev, "❌ Error auto-saving!", `📂 Loaded '${name}'!`]);
      }
    });
  };

  const handleRunCode = () => {
    setError(null);
    setShowConfetti(false);
    setLogs([]);
    
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
          console.log("KIDS CODE:", ...args);
        }
      };

      const env = { 
        ...scenario.environment,
        Box,
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
      const executeCode = new Function('box', 'status', 'wall', 'button', 'console', 'env', 'Box', 'Button', 'Status', `
        with (env) {
          ${libraryCode}
          ${code}
        }
      `);
      
      // Run the code, passing the environment with our fake timers
      executeCode(userBox, userStatus, userWall, userButton, fakeConsole, env, Box, Button, Status);
      
      // Update the React state with whatever the user code changed
      setBoxState(userBox);
      
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

  return (
    <div className="app-container">
      <header className="header">
        <h1><Sparkles fill="#FF6B6B" color="#FF6B6B" /> Kids JS Magic</h1>
        
          <div className="scenario-selector" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              className={`scenario-btn ${currentScenarioIndex === 0 ? 'active' : ''}`}
              onClick={() => setCurrentScenarioIndex(0)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              Sandbox
            </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f1f2f6', padding: '5px', borderRadius: '12px' }}>
            <button 
              onClick={() => setCurrentScenarioIndex(prev => Math.max(1, prev - 1))}
              disabled={currentScenarioIndex <= 1}
              style={{ background: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '5px' }}
            >
              <ChevronLeft size={20} />
            </button>
            
            <select 
              value={currentScenarioIndex} 
              onChange={(e) => setCurrentScenarioIndex(Number(e.target.value))}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #dfe4ea', fontSize: '1rem', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
            >
              {SCENARIOS.map((s, idx) => (
                <option key={s.id} value={idx}>
                  {s.title}
                </option>
              ))}
            </select>

            <button 
              onClick={() => setCurrentScenarioIndex(prev => Math.min(SCENARIOS.length - 1, prev + 1))}
              disabled={currentScenarioIndex === 0 || currentScenarioIndex === SCENARIOS.length - 1}
              style={{ background: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '5px' }}
            >
              <ChevronRight size={20} />
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
                  top: `${20 + (statusState.y || 0)}px`,
                  left: `calc(50% + ${statusState.x || 0}px)`,
                  transform: 'translateX(-50%)',
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
                    top: `${20 + (estatus.y || 0)}px`,
                    left: `calc(50% + ${estatus.x || 0}px)`,
                    transform: 'translateX(-50%)',
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
                  transform: `translate(${boxState.x || 0}px, ${boxState.y || 0}px) rotate(${boxState.angle || 0}deg)`,
                  border: boxState.borders ? `${boxState.borders}px solid #2D3436` : 'none',
                  position: 'relative',
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
                  {boxState.smile && (
                    <div className="smile">
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
                    transform: `translate(${ebox.x || 0}px, ${ebox.y || 0}px) rotate(${ebox.angle || 0}deg)`,
                    border: ebox.borders ? `${ebox.borders}px solid #2D3436` : 'none',
                    position: 'absolute',
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
                    {ebox.smile && (
                      <div className="smile">
                        <div className="teeth"></div>
                        <div className="tongue"></div>
                      </div>
                    )}
                  </div>
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
                  transform: `translate(${buttonState.x || 0}px, ${buttonState.y || 0}px)`,
                  border: buttonState.borders ? `${buttonState.borders}px solid #2D3436` : 'none',
                  position: 'absolute',
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
                    transform: `translate(${ebtn.x || 0}px, ${ebtn.y || 0}px)`,
                    border: ebtn.borders ? `${ebtn.borders}px solid #2D3436` : 'none',
                    position: 'absolute',
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
                    onClick={handleReset} 
                  >
                    <RotateCcw size={18} /> RESET
                  </button>
                </div>
              </div>
              <div className="console-logs">
                {logs.length === 0 && <span style={{color: '#aaa', fontStyle: 'italic'}}>Waiting for logs...</span>}
                {logs.map((log, i) => <div key={i} className="log-line">👉 {log}</div>)}
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
