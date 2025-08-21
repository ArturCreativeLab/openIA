import React, { useState, useEffect, useCallback } from 'react';
import Window from './Window';
import { MinesweeperIcon } from './icons';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = {
  hasMine: boolean;
  adjacentMines: number;
  isRevealed: boolean;
  isFlagged: boolean;
};

type GameState = 'playing' | 'won' | 'lost';

const MinesweeperApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [board, setBoard] = useState<CellState[][]>([]);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [timer, setTimer] = useState(0);

  const createBoard = useCallback(() => {
    // 1. Initialize empty board
    const newBoard: CellState[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        hasMine: false,
        adjacentMines: 0,
        isRevealed: false,
        isFlagged: false,
      }))
    );

    // 2. Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!newBoard[row][col].hasMine) {
        newBoard[row][col].hasMine = true;
        minesPlaced++;
      }
    }

    // 3. Calculate adjacent mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newBoard[r][c].hasMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].hasMine) {
              count++;
            }
          }
        }
        newBoard[r][c].adjacentMines = count;
      }
    }
    return newBoard;
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createBoard());
    setGameState('playing');
    setTimer(0);
  }, [createBoard]);
  
  useEffect(resetGame, [resetGame]);

  useEffect(() => {
    let interval: number | undefined;
    if (gameState === 'playing' && timer < 999) {
      interval = window.setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timer]);

  const revealCell = (r: number, c: number, currentBoard: CellState[][]): CellState[][] => {
    const boardCopy = currentBoard.map(row => [...row]);
    const cell = boardCopy[r][c];

    if (cell.isRevealed || cell.isFlagged) return boardCopy;
    
    cell.isRevealed = true;

    if (cell.adjacentMines === 0 && !cell.hasMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            revealCell(nr, nc, boardCopy); // recursive call on the copy
          }
        }
      }
    }
    return boardCopy;
  };
  
  const checkWinCondition = (board: CellState[][]) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        if (!cell.hasMine && !cell.isRevealed) {
          return; // Game not won yet
        }
      }
    }
    setGameState('won');
  };

  const handleClick = (r: number, c: number) => {
    if (gameState !== 'playing') return;

    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    if (cell.hasMine) {
      setGameState('lost');
      // Reveal all mines
      const newBoard = board.map(row => row.map(cell => ({...cell, isRevealed: cell.hasMine ? true : cell.isRevealed })));
      setBoard(newBoard);
      return;
    }
    
    const newBoard = revealCell(r, c, board);
    setBoard(newBoard);
    checkWinCondition(newBoard);
  };
  
  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== 'playing') return;
    
    const newBoard = [...board];
    const cell = newBoard[r][c];

    if (!cell.isRevealed) {
      cell.isFlagged = !cell.isFlagged;
      setBoard(newBoard);
    }
  };
  
  const faceEmoji = {'playing': '🙂', 'won': '😎', 'lost': '😵'}[gameState];
  
  const renderCell = (cell: CellState, r: number, c: number) => {
    const key = `${r}-${c}`;
    if (!cell.isRevealed) {
        return (
            <button key={key} onClick={() => handleClick(r, c)} onContextMenu={(e) => handleRightClick(e, r,c)}
                className="w-6 h-6 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black text-black font-bold flex items-center justify-center"
            >
              {cell.isFlagged ? '🚩' : ''}
            </button>
        )
    }
    
    // Revealed cell
    let content = <>&nbsp;</>;
    let textColor = '';
    if (cell.hasMine) {
        content = <>💣</>;
    } else if (cell.adjacentMines > 0) {
        content = <>{cell.adjacentMines}</>;
        textColor = ['text-blue-700', 'text-green-700', 'text-red-700', 'text-blue-900', 'text-red-900', 'text-cyan-700', 'text-black', 'text-gray-500'][cell.adjacentMines - 1];
    }

    return (
        <div key={key} className={`w-6 h-6 border border-[#808080] flex items-center justify-center font-bold ${textColor}`}>
            {content}
        </div>
    )
  }

  return (
    <Window 
        title="Buscaminas" 
        icon={<MinesweeperIcon />} 
        onClose={onClose}
        initialSize={{ width: 'auto' }}
        initialPosition={{ x: 250, y: 100 }}
        className="h-auto"
    >
      <div className="bg-[#C0C0C0] p-2 flex flex-col">
        <div className="flex justify-between items-center p-1 mb-2 border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white">
          <div className="bg-black text-red-500 font-mono px-1">{String(MINES - board.flat().filter(c => c.isFlagged).length).padStart(3, '0')}</div>
          <button onClick={resetGame} className="w-8 h-8 text-2xl bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black flex items-center justify-center active:border-l-black active:border-t-black">
            {faceEmoji}
          </button>
          <div className="bg-black text-red-500 font-mono px-1">{String(timer).padStart(3, '0')}</div>
        </div>
        <div className="border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => renderCell(cell, r, c))}
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
};

export default MinesweeperApp;