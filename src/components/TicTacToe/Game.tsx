"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./Game.module.css";

type CellState = "X" | "O" | undefined;

const returnGameWinner = (gameState: CellState[]) => {
  // @note: not going to lie, I looked up how to check who would win and was
  // embarrassed to realize it was this easy

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

  let winner = null;
  combinations.forEach(([a, b, c]) => {
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      winner = gameState[a];
    }
  });
  return winner;
};

export const Game = () => {
  const initialState: CellState[] = Array(9).fill(undefined);
  const [gameState, setGameState] = useState<CellState[]>(initialState);
  const [turn, setTurn] = useState<number>(0);
  const [winner, setWinner] = useState<CellState | null>(null);

  const isUsersTurn = turn % 2 === 0;

  const handleUserClick = (index: number) => {
    // check if the game is over
    if (winner) {
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
    if (!isUsersTurn && !winner) {
      handleComputerChoice();
    }
  }, [isUsersTurn, gameState, winner, handleComputerChoice]);

  // @note: this effect checks if there is a winner after each turn
  useEffect(() => {
    const winner = returnGameWinner(gameState);
    if (winner) {
      setWinner(winner);
    }
  }, [gameState]);

  return (
    <>
      <div className={styles.game}>
        <Board gameState={gameState} onCellClick={handleUserClick} />
      </div>
      {winner && <h2 className={styles.winner}>{winner} wins!</h2>}
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
