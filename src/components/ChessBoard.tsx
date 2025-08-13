import { useEffect, useState } from "react";
import React from "react";
import { Color, PieceSymbol, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Chess } from 'chess.js';
import { chessMove } from "../screens/Game.tsx";

const MOVE = "move";



export const ChessBoard = ({
  socket,
  setBoard,
  chess,
 setMovesWhite,
 setMovesBlack
}: {

  socket: WebSocket;
  chess: Chess;
  setBoard: React.Dispatch<React.SetStateAction<({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]>>;
  setMovesWhite: any;
setMovesBlack :any
}) => {
  
const [x, setX ] = useState<number>(0);
const [from, setFrom] = useState< null | Square>(null); 
const [to, setTo] = useState<null | Square>(null);




   function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare
      // promotion: 'q', 
    });

    if (move === null) {
      console.log('Illegal move! The piece will snap back.');
      return false;
    }

    console.log("Move successful! Updating board and sending move...");
    setBoard(chess.board());
      console.log("the move is " , move);
     
    const isWhiteMove = chess.turn() === 'b';  
    if (isWhiteMove) {
      setMovesWhite((prev: any) => [...prev, move]);
      console.log("white moves updated");
    } else {
      setMovesBlack((prev: any) => [...prev, move]);
      console.log("black moves updated");
    }


    //
    try {
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            from: sourceSquare,
            to: targetSquare,
          },
        })
      );
      console.log("Move sent successfully:", { from: sourceSquare, to: targetSquare });
    } catch (error) {
      console.error("Error sending move over WebSocket:", error);
    }
    
    return true;
  }

  function onSquareClick(square: Square){
    if(!from){
      setFrom(square)
    } else{
     
       const move = chess.move({
      from: from,
      to: square,
      promotion: 'q',
    });

    if (move === null) {
      console.log('Illegal move! The piece will snap back.');
      setFrom(null);
      return false;
    }

    console.log("Move successful! Updating board and sending move...");
    setBoard(chess.board());
    
    try {
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            from: from,
            to: to,
          },
        })
      );
      console.log("Move sent successfully:", { from: from, to: to });
      setFrom(null)
      setTo(null)
    } catch (error) {
      console.error("Error sending move over WebSocket:", error);
    }
  }
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4 bg-gray-900 text-white">
      <div style={{ width: "90vmin", maxWidth: "800px" }}>
        <Chessboard
          id="drag-and-drop-board"
          position={chess.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
        />
      </div>
    </div>
  );
};

export default ChessBoard;
