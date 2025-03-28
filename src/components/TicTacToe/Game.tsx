"use client";

import { useState, useEffect, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import styles from "./Game.module.css";

type CellState = "X" | "O" | undefined;

// @todo: move this API key into an .env file
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
});

const winningCombinations = [
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

// @note: this is a bit gross but I was able to get the AI to win the odd time with this prompt and all the context
const AI_PROMPT_TEMPLATE = (gameState: CellState[], availableCells: number[]) =>
  `You are playing Tic Tac Toe. It's your turn, you are O. The game board is a 3x3 grid, our game state is an array of 9 elements which move from left to right starting with 0 in the top left and 8 in the bottom right; row 1 is 0,1,2, row 2 is 3,4,5, and row 3 is 6,7,8. Each element in the array is either X, O, or undefined (empty). X is playing against O, we need 3 instances of the same letter (ie. X,X,X or O,O,O) to meet a winning condition. The current board state is: ${gameState.join(
    ","
  )}. Your next available moves are at indices: ${availableCells.join(
    ","
  )}. To win, either X or O must occupy all 3 indexes in any of the arrays in ${winningCombinations
    .map((row) => row.join(","))
    .join(
      "\n"
    )}. Any turn that you can win you should try to win. If you don't have a winning move, you should try to block X from an immediate win on their next turn. If X has no winning opportunity on its next move, you can try to strategize for your next turn. Ensure the last character of your response is ONLY a single number (0-8) representing the index of your chosen move.`;

const getFinalGameStatus = (gameState: CellState[]) => {
  for (const [a, b, c] of winningCombinations) {
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      return `${gameState[a]} wins!`;
    }
  }
  if (gameState.every((cell) => cell !== undefined)) {
    return "It's a draw!";
  }
  return null;
};

export const Game = () => {
  const initialState: CellState[] = Array(9).fill(undefined);
  const [gameState, setGameState] = useState<CellState[]>(initialState);
  const [turn, setTurn] = useState<number>(0);
  const [finalGameStatus, setFinalGameStatus] = useState<string | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false);

  const isUsersTurn = turn % 2 === 0;

  const handleUserClick = (index: number) => {
    // check if the game is over
    if (finalGameStatus) return;

    // check if the cell is already taken
    if (gameState[index] !== undefined) return;

    const newGameState = gameState.map((value, i) => {
      if (i === index) {
        return "X";
      }
      return value;
    });
    setGameState(newGameState);
    setTurn(turn + 1);
  };

  const handleComputerChoice = useCallback(async () => {
    setIsComputerThinking(true);
    // finds the empty cells
    const availableCells = gameState
      .map((value, index) => (value === undefined ? index : -1))
      .filter((index) => index !== -1);

    // Use AI to make a move
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-thinking-exp-01-21",
      contents: AI_PROMPT_TEMPLATE(gameState, availableCells),
    });

    // @todo: remove this log, update the prompt so the AI only returns the
    // index, and update computerChoice to account for that
    // console.log(response.text);

    // @todo: consider handling an error here if a valid index is not returned
    const computerChoice = response.text
      ? parseInt(response.text.trim().slice(-1))
      : null;

    // updates the chosen cell with an "O"
    const newGameState = gameState.map((value, i) => {
      if (i === computerChoice) {
        return "O";
      }
      return value;
    });
    setGameState(newGameState);
    setIsComputerThinking(false);
    setTurn(turn + 1);
  }, [gameState, turn]);

  const handleResetGame = () => {
    setGameState(initialState);
    setTurn(0);
    setFinalGameStatus(null);
    setIsComputerThinking(false);
  };

  // @note: this effect handles both checking for winner and triggering computer's turn
  useEffect(() => {
    // First check for winner
    const winner = getFinalGameStatus(gameState);
    if (winner) {
      setFinalGameStatus(winner);
      return; // Exit early if there's a winner
    }

    // Then handle computer's turn if it's not user's turn
    if (!isUsersTurn) {
      handleComputerChoice();
    }
  }, [gameState, isUsersTurn, handleComputerChoice]);

  return (
    <>
      <div className={styles.game}>
        {isComputerThinking && (
          <div className={styles.loading}>
            <p className={styles.thinking}>Thinking</p>
          </div>
        )}
        <Board gameState={gameState} onCellClick={handleUserClick} />
      </div>
      {finalGameStatus && (
        <div className={styles.outcome}>
          <h2>{finalGameStatus}</h2>
          <button
            className={styles.playAgain}
            type="button"
            onClick={() => handleResetGame()}
          >
            Play again
          </button>
        </div>
      )}
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
