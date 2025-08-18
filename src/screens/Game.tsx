


import React, { useEffect, useState } from "react";
export const INIT_GAME = "init_game";
import { ChessBoard } from "../components/ChessBoard.tsx";
import { Chess, Move, Square } from "chess.js";
import { useSocket } from "../hooks/useSocket.ts";
export const GAME_OVER = "game_over";
export const MOVE = "move";

export interface chessMove{
    from: Square;
  to: Square;
}

export const Game = () => {


  return (
        <div>
            <ChessBoard 

            />
          </div>
  )
};



