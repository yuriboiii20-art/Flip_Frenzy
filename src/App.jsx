import { useEffect, useState, useRef } from "react";
import Card from "./Card";
import { createCardsForLevel, LEVELS } from "./data";
import AuroraBackground from "./components/ui/aurora-background";
import "./index.css";

import flipSound from "./assets/card_flip.mp3";
import winSound from "./assets/win.mp3";
import failSound from "./assets/fail.mp3";
import victorySound from "./assets/victory.mp3";

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [lockBoard, setLockBoard] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [maxClearedLevel, setMaxClearedLevel] = useState(
    Number(localStorage.getItem("maxClearedLevel")) || 0
  );
  const [hasSavedGame, setHasSavedGame] = useState(
    !!localStorage.getItem("savedGameState")
  );
  const [bestTime, setBestTime] = useState(
    localStorage.getItem("bestTime") || null
  );
  const [saveStatus, setSaveStatus] = useState("");

  // Audio objects reference
  const audioRefs = useRef({});

  useEffect(() => {
    audioRefs.current = {
      flip: new Audio(flipSound),
      win: new Audio(winSound),
      fail: new Audio(failSound),
      victory: new Audio(victorySound),
    };
  }, []);

  const playSound = (soundKey) => {
    const audio = audioRefs.current[soundKey];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Handle browser autoplay policy restrictions silently
      });
    }
  };

  useEffect(() => {
    startLevel(currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    if (!timerOn) return;
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerOn]);

  const startLevel = (lvl = currentLevel) => {
    setCards(createCardsForLevel(lvl));
    setFlipped([]);
    setMoves(0);
    setWrongAttempts(0);
    setTime(0);
    setWon(false);
    setTimerOn(true);
    setLockBoard(false);
    setHintUsed(false);
  };

  const nextLevel = () => {
    if (currentLevel < LEVELS.length) {
      setCurrentLevel(prev => prev + 1);
    } else {
      startLevel(1);
    }
  };

  // Save game state to localStorage
  const saveGame = () => {
    const gameState = {
      currentLevel,
      cards,
      flipped,
      moves,
      wrongAttempts,
      time,
      hintUsed,
      won,
    };
    localStorage.setItem("savedGameState", JSON.stringify(gameState));
    setHasSavedGame(true);
    setSaveStatus("Game Saved! 💾");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  // Resume game state from localStorage
  const resumeGame = () => {
    const saved = localStorage.getItem("savedGameState");
    if (saved) {
      try {
        const gameState = JSON.parse(saved);
        if (gameState.currentLevel) setCurrentLevel(gameState.currentLevel);
        setCards(gameState.cards || []);
        setFlipped(gameState.flipped || []);
        setMoves(gameState.moves || 0);
        setWrongAttempts(gameState.wrongAttempts || 0);
        setTime(gameState.time || 0);
        setHintUsed(gameState.hintUsed || false);
        setWon(gameState.won || false);
        setTimerOn(!gameState.won);
        setLockBoard(false);
        setSaveStatus("Game Resumed! 🚀");
        setTimeout(() => setSaveStatus(""), 2000);
      } catch (err) {
        console.error("Failed to restore game", err);
      }
    }
  };

  const handleClick = (index) => {
    if (lockBoard) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    // Play flip sound on every card flip
    playSound("flip");

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLockBoard(true);
      setMoves(m => m + 1);

      const [a, b] = newFlipped;

      if (newCards[a].emoji === newCards[b].emoji) {
        newCards[a].isMatched = true;
        newCards[b].isMatched = true;
        setCards(newCards);
        setFlipped([]);
        setLockBoard(false);

        if (newCards.every(c => c.isMatched)) {
          setWon(true);
          setTimerOn(false);
          playSound("victory");

          // Update max cleared level for the Level Ladder
          if (currentLevel > maxClearedLevel) {
            setMaxClearedLevel(currentLevel);
            localStorage.setItem("maxClearedLevel", currentLevel);
          }

          if (!bestTime || time < bestTime) {
            localStorage.setItem("bestTime", time);
            setBestTime(time);
          }
        } else {
          playSound("win");
        }
      } else {
        const nextWrong = wrongAttempts + 1;
        setWrongAttempts(nextWrong);
        playSound("fail");

        if (nextWrong >= 3) {
          setTimeout(() => {
            setSaveStatus("3 Wrong Attempts! Reshuffling... 🔄");
            setCards(createCardsForLevel(currentLevel));
            setFlipped([]);
            setWrongAttempts(0);
            setLockBoard(false);
            setTimeout(() => setSaveStatus(""), 2500);
          }, 1000);
        } else {
          setTimeout(() => {
            newCards[a].isFlipped = false;
            newCards[b].isFlipped = false;
            setCards([...newCards]);
            setFlipped([]);
            setLockBoard(false);
          }, 900);
        }
      }
    }
  };

  const showHint = () => {
    if (hintUsed || lockBoard) return;

    setHintUsed(true);
    setLockBoard(true);

    const currentCards = cards.map(c => ({ ...c, isFlipped: true }));
    setCards(currentCards);

    setTimeout(() => {
      setCards(cards.map(c =>
        c.isMatched ? c : { ...c, isFlipped: false }
      ));
      setLockBoard(false);
    }, 1200);
  };

  const levelInfo = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];

  return (
    <AuroraBackground starCount={60} pulseDuration={10}>
      <div className="w-full max-w-6xl flex flex-col gap-4 relative">

        {/* Top Left Title Outside Container */}
        <div className="flex items-center px-2">
          <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 tracking-tight drop-shadow-md">
            FLIP FRENZY
          </h1>
        </div>

        {/* Main Section with Game Card Box & Right-Side Floating Level Ladder */}
        <div className="w-full flex flex-col lg:flex-row items-stretch justify-center gap-6">

          {/* Main Glass Game Box */}
          <div className="flex-1 p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl flex flex-col gap-6 relative">

            {/* Inner Box Top Bar: LEVEL N in Middle */}
            <div className="w-full flex items-center justify-between border-b border-slate-700/50 pb-4 px-2">
              <div className="w-24 text-xs font-semibold text-slate-400">
                Cards: {levelInfo.totalCards}
              </div>

              {/* Center Badge: LEVEL N */}
              <div className="px-5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-xs sm:text-sm font-bold text-indigo-300 tracking-wider shadow-inner">
                LEVEL {currentLevel}
              </div>

              {/* Toast / Status Right align */}
              <div className="min-w-[100px] flex justify-end">
                {saveStatus && (
                  <div className="py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold text-emerald-300 animate-pop">
                    {saveStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Layout Grid: Left Panel | Center Cards | Right Panel */}
            <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">

              {/* LEFT PANEL: Game Controls */}
              <div className="w-full lg:w-48 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex flex-col gap-3 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/50 pb-2">
                  ⚙️ Controls
                </h3>

                <button
                  onClick={showHint}
                  disabled={hintUsed || lockBoard}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 border shadow-md active:scale-95 cursor-pointer ${hintUsed
                    ? "bg-slate-800/30 text-slate-500 border-slate-700/30 cursor-not-allowed opacity-50"
                    : "bg-slate-800/80 hover:bg-slate-700/80 text-purple-300 border-purple-500/30 hover:border-purple-500/60"
                    }`}
                >
                  🔍 Hint {hintUsed ? "(Used)" : "(1x)"}
                </button>

                <button
                  onClick={() => startLevel(currentLevel)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  ↻ Restart
                </button>

                <button
                  onClick={saveGame}
                  disabled={won}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 border shadow-md active:scale-95 cursor-pointer ${won
                    ? "bg-slate-800/30 text-slate-500 border-slate-700/30 cursor-not-allowed"
                    : "bg-emerald-600/80 hover:bg-emerald-500 text-emerald-100 border-emerald-400/30"
                    }`}
                >
                  ⛊ Save Game
                </button>

                <button
                  onClick={resumeGame}
                  disabled={!hasSavedGame}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 border shadow-md active:scale-95 cursor-pointer ${!hasSavedGame
                    ? "bg-slate-800/30 text-slate-500 border-slate-700/30 cursor-not-allowed opacity-50"
                    : "bg-cyan-600/80 hover:bg-cyan-500 text-cyan-100 border-cyan-400/30"
                    }`}
                >
                  ▶︎ Resume
                </button>
              </div>

              {/* CENTER PANEL: Dynamic Cards Table */}
              <div className="flex flex-col items-center justify-center flex-1 w-full">
                <div className={`grid ${levelInfo.gridCols} gap-3 justify-items-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 shadow-inner`}>
                  {cards.map((card, index) => (
                    <Card
                      key={card.id}
                      card={card}
                      disabled={lockBoard}
                      onClick={() => handleClick(index)}
                    />
                  ))}
                </div>

                {/* Win & Next Level Banner */}
                {won && (
                  <div className="w-full mt-4 py-3 px-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-pop flex flex-col sm:flex-row items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-emerald-400">🎉 Level {currentLevel} Cleared!</h2>
                    <button
                      onClick={nextLevel}
                      className="py-2 px-5 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      {currentLevel < LEVELS.length ? `Next Level (${currentLevel + 1}) ➔` : "Play Again ↺"}
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT PANEL: Live Stats Dashboard */}
              <div className="w-full lg:w-48 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex flex-col gap-3 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/50 pb-2">
                  📊 Live Stats
                </h3>

                <div className="flex justify-between items-center px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700/40">
                  <span className="text-xs font-medium text-slate-300">⏱ Time:</span>
                  <span className="text-sm font-mono font-bold text-indigo-400">{time}s</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700/40">
                  <span className="text-xs font-medium text-slate-300">🎯 Moves:</span>
                  <span className="text-sm font-mono font-bold text-purple-400">{moves}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700/40">
                  <span className="text-xs font-medium text-slate-300">⚠️ Strikes:</span>
                  <span className={`text-sm font-mono font-bold ${wrongAttempts === 2 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                    {wrongAttempts}/3
                  </span>
                </div>

                {bestTime && (
                  <div className="flex justify-between items-center px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-700/40">
                    <span className="text-xs font-medium text-slate-300">🏆 Best:</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{bestTime}s</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* OUTSIDE RIGHT PANEL: Floating Level Buttons */}
          <div className="w-full lg:w-44 flex flex-col gap-3 items-center py-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300 pb-1 w-full text-center drop-shadow-md">
              🪜 LEVEL LADDER
            </h3>
            
            <div className="w-full flex flex-col-reverse gap-3 my-auto">
              {LEVELS.map(lvl => {
                const isCurrent = lvl.level === currentLevel;
                const isCleared = lvl.level <= maxClearedLevel;
                // Only allow clicking the exact next playable level (maxClearedLevel + 1)
                const isSelectable = lvl.level === maxClearedLevel + 1;

                return (
                  <button
                    key={lvl.level}
                    disabled={!isSelectable && !isCurrent}
                    onClick={() => isSelectable && setCurrentLevel(lvl.level)}
                    className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between border drop-shadow-lg ${
                      isCurrent
                        ? "bg-indigo-600 text-white border-indigo-400/90 ring-4 ring-indigo-500/30 shadow-indigo-500/40 scale-105 cursor-default"
                        : isCleared
                        ? "bg-slate-900/20 text-slate-500/60 border-slate-800/40 cursor-not-allowed opacity-50"
                        : isSelectable
                        ? "bg-emerald-950/40 backdrop-blur-md text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/50 cursor-pointer"
                        : "bg-slate-900/30 text-slate-600 border-slate-800/30 cursor-not-allowed opacity-40"
                    }`}
                  >
                    <span>Level {lvl.level}</span>
                    <span>{isCleared ? "✅" : isCurrent ? "⭐" : "🔒"}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </AuroraBackground>
  );
}
