import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles, RotateCcw, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import Editor from '@monaco-editor/react';
import './index.css';
import { SCENARIOS } from './scenarios.js';

function App() {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const scenario = SCENARIOS[currentScenarioIndex];
  
  const [code, setCode] = useState(scenario.initialCode);
  const defaultBox = { color: '#4ECDC4', width: 150, height: 150, x: 0, y: 0, eyes: true, smile: false, nose: false, angle: 0, borders: 0, hands: false, legs: false, hair: false, ears: false, glasses: false, visible: true };
  const defaultStatus = { text: '', color: 'transparent', borders: 0, visible: true };
  const defaultWall = { color: '#E8F8F5', borders: 0, visible: true };
  const defaultArr = Array(10).fill(null).map(() => ({ color: 'black', visible: true, width: 30, height: 30, x: 0, y: 0 }));
  
  const [boxState, setBoxState] = useState(defaultBox);
  const [statusState, setStatusState] = useState(defaultStatus);
  const [wallState, setWallState] = useState(defaultWall);
  const [arrState, setArrState] = useState(defaultArr);
  const [extraBoxes, setExtraBoxes] = useState([]);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [logs, setLogs] = useState([]);
  const intervalsRef = useRef([]);
  
  const [saveName, setSaveName] = useState('');
  const [savedFiles, setSavedFiles] = useState({});

  useEffect(() => {
    fetch('/api/load')
      .then(res => res.json())
      .then(data => setSavedFiles(data || {}))
      .catch(err => console.error("Failed to load saved codes", err));
  }, []);

  // Update code when scenario changes
  useEffect(() => {
    setCode(scenario.initialCode);
    handleReset();
  }, [currentScenarioIndex]);

  const handleReset = () => {
    setBoxState({ ...defaultBox });
    setStatusState({ ...defaultStatus });
    setWallState({ ...defaultWall });
    setArrState(defaultArr.map(item => ({ ...item })));
    setExtraBoxes([]);
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
      };
      declare class Box {
        constructor();
        color: string; width: number; height: number;
        x: number; y: number; angle: number; borders: number;
        eyes: boolean; smile: boolean; nose: boolean; hands: boolean; legs: boolean;
        hair: boolean; ears: boolean; glasses: boolean; visible: boolean;
      }
      declare var wall: { color: string; borders: number; visible: boolean; };
      declare var status: { text: string; color: string; borders: number; visible: boolean; };
      declare var arr: { color: string; visible: boolean; width: number; height: number; x: number; y: number; }[] & { amount: number };
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
    if (savedFiles[name]) {
      setCode(savedFiles[name]);
      setSaveName(name);
      setLogs(prev => [...prev, `📂 Loaded '${name}'!`]);
    }
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

      const createInnerProxy = (item, index) => new Proxy({ ...item }, {
        set: (t, p, v) => {
          if (!['color', 'visible', 'width', 'height', 'x', 'y'].includes(p)) throw new Error(`Oops! arr items only have 'color', 'visible', 'width', 'height', 'x', and 'y' properties`);
          t[p] = v;
          setArrState(prevArr => {
            const newArr = [...prevArr];
            newArr[index] = { ...t };
            return newArr;
          });
          
          if (scenario.checkWin(userBox, { ...scenario.environment }, logs, statusState, wallState)) {
            setShowConfetti(true);
          }
          return true;
        }
      });

      const innerProxies = arrState.map(createInnerProxy);
      
      const userArr = new Proxy(innerProxies, {
        set: (target, prop, value) => {
          if (prop === 'amount') {
            const amount = Math.min(Math.max(0, Number(value)), 400); // limit 400 squares max
            const newArr = Array(amount).fill(0).map((_, i) => arrState[i] || { color: 'black', visible: true, width: 30, height: 30, x: 0, y: 0 });
            
            // Synchronously update the proxy's target so subsequent code in the same block works!
            target.length = amount;
            for (let i = 0; i < amount; i++) {
              if (!target[i]) {
                target[i] = createInnerProxy({ color: 'black', visible: true, width: 30, height: 30, x: 0, y: 0 }, i);
              }
            }
            
            setArrState(newArr);
            return true;
          }
          throw new Error(`Oops! You can only change arr.amount, arr[i].color, or arr[i].visible`);
        },
        get: (target, prop) => {
          if (prop === 'amount') return arrState.length;
          
          if (typeof prop === 'string' && !isNaN(prop) && prop.trim() !== '') {
            const index = Number(prop);
            if (index >= target.length || index < 0) {
              throw new Error(`Oops! You tried to access arr[${index}], but that box doesn't exist yet. Try adding 'arr.amount = ${index + 1};' first!`);
            }
          }
          
          return target[prop];
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
      // The function expects parameters: box, status, wall, arr, console, env, Box
      const executeCode = new Function('box', 'status', 'wall', 'arr', 'console', 'env', 'Box', `
        with (env) {
          ${code}
        }
      `);
      
      // Run the code, passing the environment with our fake timers
      executeCode(userBox, userStatus, userWall, userArr, fakeConsole, env, Box);
      
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
                padding: { top: 10 }
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
                  top: '20px',
                  left: '50%',
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

              <div 
                className="magic-box"
                style={{
                  display: boxState.visible !== false ? 'block' : 'none',
                  backgroundColor: boxState.color,
                  width: `${boxState.width}px`,
                  height: `${boxState.height}px`,
                  transform: `translate(${boxState.x || 0}px, ${boxState.y || 0}px) rotate(${boxState.angle || 0}deg)`,
                  border: boxState.borders ? `${boxState.borders}px solid #2D3436` : 'none',
                  position: 'relative'
                }}
              >
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
                  style={{
                    display: ebox.visible !== false ? 'block' : 'none',
                    backgroundColor: ebox.color,
                    width: `${ebox.width}px`,
                    height: `${ebox.height}px`,
                    transform: `translate(${ebox.x || 0}px, ${ebox.y || 0}px) rotate(${ebox.angle || 0}deg)`,
                    border: ebox.borders ? `${ebox.borders}px solid #2D3436` : 'none',
                    position: 'absolute'
                  }}
                >
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

              {arrState.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '80%', zIndex: 0 }}>
                  {arrState.map((b, i) => (
                    <div 
                      key={`arr-${i}`}
                      style={{
                        visibility: b.visible !== false ? 'visible' : 'hidden',
                        backgroundColor: b.color,
                        width: `${b.width !== undefined ? b.width : 30}px`,
                        height: `${b.height !== undefined ? b.height : 30}px`,
                        transform: `translate(${b.x || 0}px, ${b.y || 0}px)`,
                        borderRadius: '4px'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Text Console */}
            <div className="text-console">
              <div className="console-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🖥️ Output</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="reset-btn"
                    onClick={() => window.location.href = '/test'}
                    style={{ backgroundColor: '#2a2a4a', borderColor: '#4ECDC4', color: '#4ECDC4' }}
                  >
                    🛠️ TEST UI
                  </button>
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
