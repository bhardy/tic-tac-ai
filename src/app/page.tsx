import { Game } from "@/components/TicTacToe/Game";
import styles from "./page.module.css";

export default function TicTacAi() {
  return (
    <div className={styles.page}>
      <h1>Tic Tac Ai</h1>
      <Game />
    </div>
  );
}
