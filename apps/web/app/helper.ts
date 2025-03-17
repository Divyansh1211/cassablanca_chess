import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { BACKEND_URL } from "./config";
import { Chess } from "chess.js";

export interface IGameData {
  lobbyId: string;
  fen: string;
  pgn: string;
  user: any;
  color: "WHITE" | "BLACK";
}

export function moveFormatter(
  pgn: string,
  setWhiteMoves: Dispatch<SetStateAction<string[]>>,
  setBlackMoves: Dispatch<SetStateAction<string[]>>
) {
  const moves: string[] = pgn.split(/\s+/).filter(Boolean); // Ensure no empty spaces
  let white: string[] = [];
  let black: string[] = [];

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]?.includes(".") ? moves[i]?.split(".")[1] : moves[i];
    if (i % 2 === 0) {
      white.push(move!);
    } else {
      black.push(move!);
    }
  }
  setWhiteMoves(white);
  setBlackMoves(black);
}

function setGameMetaData(
  setGame: Dispatch<SetStateAction<Chess | undefined>>,
  setGameData: Dispatch<SetStateAction<IGameData | null>>,
  setGamePosition: Dispatch<SetStateAction<string | undefined>>,
  setWhiteMoves: Dispatch<SetStateAction<string[]>>,
  setBlackMoves: Dispatch<SetStateAction<string[]>>,
  res: any
) {
  //   console.log(res);
  const newGame = new Chess();
  newGame.load(res.fen);
  setGameData(res);
  setGame(newGame);
  moveFormatter(res.pgn, setWhiteMoves, setBlackMoves);
  setGamePosition(newGame.fen());
}

export async function getRandomGame(
  setGame: Dispatch<SetStateAction<Chess | undefined>>,
  setGameData: Dispatch<SetStateAction<IGameData | null>>,
  setGamePosition: Dispatch<SetStateAction<string | undefined>>,
  setWhiteMoves: Dispatch<SetStateAction<string[]>>,
  setBlackMoves: Dispatch<SetStateAction<string[]>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  const activeGame = await getActiveGame();
  if (activeGame) {
    setIsLoading(false);
    return setGameMetaData(
      setGame,
      setGameData,
      setGamePosition,
      setWhiteMoves,
      setBlackMoves,
      activeGame
    );
  }
  const existingGame = await checkExistingGame();
  if (existingGame) {
    setIsLoading(false);
    return setGameMetaData(
      setGame,
      setGameData,
      setGamePosition,
      setWhiteMoves,
      setBlackMoves,
      existingGame
    );
  }
  const res = await axios.get(`${BACKEND_URL}/loadRandomGame`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 200) {
    setIsLoading(false);
    return setGameMetaData(
      setGame,
      setGameData,
      setGamePosition,
      setWhiteMoves,
      setBlackMoves,
      res.data
    );
  }
}

export async function getActiveGame() {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  const res = await axios.get(`${BACKEND_URL}/active`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 200) {
    return res.data;
  } else {
    return null;
  }
}

export async function checkExistingGame() {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  try {
    const res = await axios.get(`${BACKEND_URL}/checkExisting`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 200) {
      return res.data;
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
  }
}
