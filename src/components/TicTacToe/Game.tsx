"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./Game.module.css";

type CellState = "X" | "O" | undefined;

const getFinalGameStatus = (gameState: CellState[]) => {
  const combinations = [
    // horizontal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // vertical
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonal
    [0, 4, 8],
    [2, 4, 6],
  ];

  let finalGameStatus = null;
  combinations.forEach(([a, b, c]) => {
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      finalGameStatus = `${gameState[a]} wins!`;
    }
  });
  if (gameState.every((cell) => cell !== undefined)) {
    finalGameStatus = "It's a draw!";
  }
  return finalGameStatus;
};

export const Game = () => {
  const initialState: CellState[] = Array(9).fill(undefined);
  const [gameState, setGameState] = useState<CellState[]>(initialState);
  const [turn, setTurn] = useState<number>(0);
  // const [winner, setWinner] = useState<CellState | null>(null);
  const [finalGameStatus, setFinalGameStatus] = useState<string | null>(null);

  const isUsersTurn = turn % 2 === 0;

  const handleUserClick = (index: number) => {
    // check if the game is over
    if (finalGameStatus) {
      return;
    }
    // check if the cell is already taken
    if (gameState[index] !== undefined) {
      // @todo: consider showing error message
      return;
    }
    const newGameState = gameState.map((value, i) => {
      if (i === index) {
        return "X";
      }
      return value;
    });
    setGameState(newGameState);
    setTurn(turn + 1);
  };

  const handleComputerChoice = useCallback(() => {
    // finds the empty cells
    const availableCells = gameState
      .map((value, index) => (value === undefined ? index : -1))
      .filter((index) => index !== -1);

    // randomly picks an empty cell
    const randomIndex =
      availableCells[Math.floor(Math.random() * availableCells.length)];

    // updates the randomly picked empty cell with an "O"
    const newGameState = gameState.map((value, i) => {
      if (i === randomIndex) {
        return "O";
      }
      return value;
    });
    setGameState(newGameState);
    setTurn(turn + 1);
  }, [gameState, turn]);

  // @note: this effect triggers the computer's action
  useEffect(() => {
    // @todo: improve this logic to check if the game is over
    if (!isUsersTurn && !finalGameStatus) {
      handleComputerChoice();
    }
  }, [isUsersTurn, gameState, finalGameStatus, handleComputerChoice]);

  // @note: this effect checks if there is a winner after each turn
  useEffect(() => {
    const winner = getFinalGameStatus(gameState);
    if (winner) {
      setFinalGameStatus(winner);
    }
  }, [gameState]);

  return (
    <>
      <div className={styles.game}>
        <Board gameState={gameState} onCellClick={handleUserClick} />
      </div>
      {finalGameStatus && <h2 className={styles.winner}>{finalGameStatus}</h2>}
    </>
  );
};

export const Board = ({
  gameState,
  onCellClick,
}: {
  gameState: CellState[];
  onCellClick: (index: number) => void;
}) => {
  return (
    <div className={styles.board}>
      {gameState.map((value, index) => (
        <Cell
          key={index}
          value={value}
          onSquareClick={() => onCellClick(index)}
        />
      ))}
    </div>
  );
};

export const Cell = ({
  value,
  onSquareClick,
}: {
  value: CellState;
  onSquareClick: () => void;
}) => {
  return (
    <button type="button" className={styles.cell} onClick={onSquareClick}>
      {value}
    </button>
  );
};
