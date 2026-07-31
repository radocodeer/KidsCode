import React, { useState, useEffect } from 'react';
import './index.css';

export default function DutchGame() {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing'
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(Array.from({ length: 4 }, () => ''));
  const [players, setPlayers] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [round, setRound] = useState(1);

  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setSavedPlayers(data || []))
      .catch(err => console.error("Failed to load players", err));
  }, []);

  useEffect(() => {
    let interval = null;
    if (gameState === 'playing' && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNumPlayersChange = (e) => {
    const newNum = parseInt(e.target.value);
    setNumPlayers(newNum);
    setPlayerNames(prev => {
      if (newNum > prev.length) {
        return [...prev, ...Array.from({ length: newNum - prev.length }, () => '')];
      } else {
        return prev.slice(0, newNum);
      }
    });
  };

  // Setup Screen
  const handleStartGame = () => {
    const initialPlayers = playerNames.map((name, i) => ({
      id: i + 1,
      name: name.trim() || `Player ${i + 1}`,
      totalScore: 0,
      roundInput: ''
    }));

    // Save any custom names to backend
    initialPlayers.forEach(p => {
      if (p.name && !p.name.startsWith('Player ')) {
        fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: p.name })
        }).catch(err => console.error("Failed to save player", err));
      }
    });

    setPlayers(initialPlayers);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setRound(1);
    setGameState('playing');
  };

  const handleRoundInputChange = (id, value) => {
    // Allow numbers and a leading minus sign
    if (value !== '' && value !== '-' && isNaN(Number(value))) return;
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, roundInput: value } : p));
  };

  const handleFinishRound = () => {
    setPlayers(prev => prev.map(p => ({
      ...p,
      totalScore: p.totalScore + (parseInt(p.roundInput) || 0),
      roundInput: ''
    })));
    setRound(prev => prev + 1);
  };

  const handleResetGame = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = () => {
    setGameState('setup');
    setPlayers([]);
    setStartTime(null);
    setElapsedSeconds(0);
    setShowConfirmReset(false);
    setRound(1);
  };

  const cancelReset = () => {
    setShowConfirmReset(false);
  };

  // Calculations for Winner / Loser
  const scores = players.map(p => p.totalScore);
  const minScore = players.length > 0 ? Math.min(...scores) : 0;
  const maxScore = players.length > 0 ? Math.max(...scores) : 0;
  const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);
  const hasGameStarted = players.some(p => p.totalScore !== 0);
  const allEqual = players.length > 0 && scores.every(s => s === scores[0]);

  // CSS in JS to ensure it's fully self-contained and premium
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: "'Inter', 'Roboto', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      boxSizing: 'border-box'
    },
    header: {
      fontSize: '3.5rem',
      fontWeight: '800',
      marginBottom: '10px',
      background: 'linear-gradient(135deg, #4ECDC4 0%, #3b82f6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
      textAlign: 'center'
    },
    subtitle: {
      color: '#94a3b8',
      fontSize: '1.2rem',
      marginBottom: '40px',
      textAlign: 'center'
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      width: '100%',
      maxWidth: '1000px',
      position: 'relative'
    },
    setupContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '30px'
    },
    sliderLabel: {
      fontSize: '1.5rem',
      fontWeight: '600'
    },
    sliderValue: {
      fontSize: '4rem',
      fontWeight: 'bold',
      color: '#4ECDC4',
      textShadow: '0 0 20px rgba(78, 205, 196, 0.4)'
    },
    slider: {
      width: '100%',
      maxWidth: '400px',
      cursor: 'pointer',
      accentColor: '#4ECDC4',
      height: '8px',
      borderRadius: '4px'
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #4ECDC4 0%, #3b82f6 100%)',
      color: '#fff',
      border: 'none',
      padding: '16px 40px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 20px rgba(78, 205, 196, 0.3)'
    },
    buttonSecondary: {
      background: '#334155',
      color: '#f8fafc',
      border: 'none',
      padding: '12px 24px',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    buttonDanger: {
      background: '#ef4444',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)'
    },
    playerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    },
    playerCard: (isWinner, isLoser) => ({
      backgroundColor: isWinner ? 'rgba(16, 185, 129, 0.15)' : isLoser ? 'rgba(239, 68, 68, 0.15)' : '#0f172a',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      border: `4px solid ${isWinner ? '#10b981' : isLoser ? '#ef4444' : '#334155'}`,
      boxShadow: isWinner ? '0 0 50px rgba(16, 185, 129, 0.4)' : isLoser ? '0 0 50px rgba(239, 68, 68, 0.4)' : '0 4px 6px rgba(0,0,0,0.1)',
      transform: isWinner || isLoser ? 'scale(1.03)' : 'scale(1)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      zIndex: isWinner || isLoser ? 10 : 1
    }),
    playerName: {
      fontSize: '1.6rem',
      fontWeight: '800',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap',
      zIndex: 1,
      color: '#ffffff',
      wordBreak: 'break-word'
    },
    badge: (isWinner) => ({
      fontSize: '1.2rem',
      padding: '8px 16px',
      borderRadius: '24px',
      background: isWinner ? '#10b981' : '#ef4444',
      color: '#ffffff',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }),
    scoreDisplay: {
      fontSize: '3.5rem',
      fontWeight: '900',
      textAlign: 'center',
      margin: '10px 0',
      color: '#f8fafc',
      zIndex: 1
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 1
    },
    inputLabel: {
      fontSize: '1rem',
      color: '#94a3b8',
      fontWeight: '600'
    },
    inputField: {
      width: '100%',
      backgroundColor: '#1e293b',
      border: '2px solid #334155',
      color: '#f8fafc',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '1.2rem',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      fontWeight: '600'
    },
    actionBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '30px',
      paddingTop: '30px',
      borderTop: '1px solid #334155',
      flexWrap: 'wrap',
      gap: '20px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    },
    modalContent: {
      backgroundColor: '#1e293b',
      padding: '50px',
      borderRadius: '24px',
      maxWidth: '450px',
      textAlign: 'center',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
      border: '1px solid #334155'
    },
    modalTitle: {
      fontSize: '2rem',
      fontWeight: '800',
      marginBottom: '20px',
      color: '#f8fafc'
    },
    modalText: {
      color: '#94a3b8',
      marginBottom: '40px',
      fontSize: '1.1rem',
      lineHeight: '1.6'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation back to main app */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{ ...styles.buttonSecondary, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ⬅️ Back to Magic World
        </button>
      </div>

      <h1 style={styles.header}>Dutch Game</h1>
      <p style={styles.subtitle}>Premium Score Tracker</p>

      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto', alignItems: 'flex-start' }}>
        <div style={styles.card}>
          {gameState === 'setup' ? (
            <div style={styles.setupContainer}>
            <div style={styles.sliderLabel}>Number of Players</div>
            <div style={styles.sliderValue}>{numPlayers}</div>
            <input
              type="range"
              min="2"
              max="20"
              value={numPlayers}
              onChange={handleNumPlayersChange}
              style={styles.slider}
            />

            <datalist id="player-suggestions">
              {savedPlayers.map((p, i) => (
                <option key={i} value={p} />
              ))}
            </datalist>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', width: '100%', maxWidth: '800px', marginTop: '10px', marginBottom: '10px' }}>
              {playerNames.map((name, idx) => (
                <input
                  key={idx}
                  type="text"
                  list="player-suggestions"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[idx] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                  placeholder={`Player ${idx + 1}`}
                  style={{ ...styles.inputField, padding: '10px', fontSize: '1rem' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ECDC4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#334155';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>
            <button
              style={styles.buttonPrimary}
              onClick={handleStartGame}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 25px rgba(78, 205, 196, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(78, 205, 196, 0.3)';
              }}
            >
              Start Game 🚀
            </button>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px', fontSize: '1.5rem', color: '#94a3b8', fontWeight: '800' }}>
              <div>⏱️ Time: <span style={{ color: '#4ECDC4' }}>{formatTime(elapsedSeconds)}</span></div>
              <div>Round: <span style={{ color: '#4ECDC4' }}>{round}</span></div>
            </div>


            <div style={styles.playerGrid}>
              {players.map((player) => {
                const isWinner = hasGameStarted && !allEqual && player.totalScore === minScore;
                const isLoser = false; //hasGameStarted && !allEqual && player.totalScore === maxScore;

                return (
                  <div key={player.id} style={styles.playerCard(isWinner, isLoser)}>
                    {isWinner && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#10b981' }} />
                    )}
                    {isLoser && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ef4444' }} />
                    )}

                    <div style={styles.playerName}>
                      {player.name}
                    </div>
                    <div style={styles.scoreDisplay}>
                      {player.totalScore}
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>Points this Round</label>
                      <input
                        type="text"
                        value={player.roundInput}
                        onChange={(e) => handleRoundInputChange(player.id, e.target.value)}
                        placeholder="e.g. 15"
                        style={styles.inputField}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4ECDC4';
                          e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#334155';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    {(isWinner || isLoser) && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        {isWinner && <span style={styles.badge(true)}>Winner 🏆</span>}
                        {isLoser && <span style={styles.badge(false)}>Most Points</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={styles.actionBar}>
              <button
                style={styles.buttonDanger}
                onClick={handleResetGame}
                onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                Reset Game
              </button>
              <button
                style={styles.buttonPrimary}
                onClick={handleFinishRound}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 25px rgba(78, 205, 196, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(78, 205, 196, 0.3)';
                }}
              >
                Finish Round ✨
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Floating Leaderboard (Outside the card, only visible when playing) */}
      {gameState === 'playing' && (
        <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '100px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#f8fafc' }}>🏆 Leaderboard</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedPlayers.map((p, index) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: index === 0 && hasGameStarted ? 'rgba(16, 185, 129, 0.15)' : '#1e293b', padding: '10px 15px', borderRadius: '8px', border: index === 0 && hasGameStarted ? '1px solid #10b981' : '1px solid #334155', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: index === 0 && hasGameStarted ? '#10b981' : '#94a3b8' }}>#{index + 1}</span>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>{p.name}</span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#4ECDC4' }}>{p.totalScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

      {showConfirmReset && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Reset Game?</h2>
            <p style={styles.modalText}>Are you sure you want to reset the game? All current scores and players will be lost.</p>
            <div style={styles.modalActions}>
              <button
                style={styles.buttonSecondary}
                onClick={cancelReset}
                onMouseOver={(e) => e.currentTarget.style.background = '#475569'}
                onMouseOut={(e) => e.currentTarget.style.background = '#334155'}
              >
                Cancel
              </button>
              <button
                style={styles.buttonDanger}
                onClick={confirmReset}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
