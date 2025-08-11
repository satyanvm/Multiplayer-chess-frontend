import {useState} from "react";
import React from "react";
import { Color, PieceSymbol, Square } from "chess.js";
import { MOVE } from "../screens/Game.tsx";
export const ChessBoard = ({
  board,
  socket,
  setBoard,
  chess
}: {
  socket: WebSocket,
  chess: any,
  setBoard: any
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    }) => {

        // const [from, setFrom] = useState<null | Square>(null);
        // const [to, setTo] useState< null | Square > (null);
const [from, setFrom] = useState< null | Square>(null); 
const [to, setTo] = useState<null | Square>(null);

  return (
    <div className="text-white-200">   
      {board.map((row, i) => {
        return (
          <div key={i} className="flex">
            {row.map((square, j) => {  
              const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8-i) as Square;  
              return ( 

                <div onClick = {
                    () => {
                        if(!from) {
                            setFrom(squareRepresentation);
                        } else{

                          setFrom(null);
                          chess.move({
                            from,
                            to: squareRepresentation
                          })
                          console.log("we are here just befoe setting the board to latest")
                          setBoard(chess.board());
                      //  try {
                          console.log("inside of try block");
                          
                          const moveData = {
                            from,
                            to: squareRepresentation
                          };
                          
                          console.log("Sending move data:", moveData);
                          try{
                            console.log("inside of socket.send try block")
                          socket.send(JSON.stringify({
                            type: MOVE,  
                            payload: {
                              from,
                              to: squareRepresentation
                            }
                          }));
                        } catch (error) {
                          console.error("Error sending move:", error);
                        }

 
                          }
                        
                    }
                }
                  key={j}
                  className={`w-16 h-16 ${
                    (i + j) % 2 === 0 ? "bg-green-500" : "bg-white"
                  }`}
                >
                  <div className="w-full justify-center flex">
                    {square ? square.type : ""}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
