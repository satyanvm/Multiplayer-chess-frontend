import { useEffect, useState } from "react";
import React from "react";
import { Color, PieceSymbol, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { chessMove, GAME_JOINED, GAME_OVER, INIT_GAME } from "../screens/Game.tsx";
import { useSocket } from "../hooks/useSocket.ts";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { movesAtom } from "../Functionalities/UserAtoms.ts";

const MOVE = "move";
export const JOIN_ROOM = "join_room"
export const ChessBoard = ({}) => { 
  const socket = useSocket();
  const [movesWhite, setMovesWhite] = useState<chessMove[]>([]);
  const [moves, setMoves] = useRecoilState(movesAtom);
  const [movesBlack, setMovesBlack] = useState<chessMove[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [x, setX] = useState<number>(0);
  const [from, setFrom] = useState<null | Square>(null); 
  const [to, setTo] = useState<null | Square>(null);
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const { gameId } = useParams(); 
  const navigate = useNavigate();

  
   function isPromoting(chess: Chess, from: Square, to: Square) {
  if (!from) {
    return false;
  }

  const piece = chess.get(from);

  if (piece?.type !== 'p') {
    return false;
  }

  if (piece.color !== chess.turn()) {
    return false;
  }

  if (!['1', '8'].some((it) => to.endsWith(it))) {
    return false;
  }

  return chess
    .history({ verbose: true })
    .map((it) => it.to)
    .includes(to);
}


  useEffect(() => {
    if (!socket) { 
      console.log("returning because of no socket");
      return;
    }

    socket.onmessage = (event) => {
      console.log("socket.on message is triggered( here before try )");
      try {
        const message = JSON.parse(event.data);    
        console.log("received message:", message);  
        
        switch (message.type) {

          case GAME_JOINED:
            
          console.log("game.joined is triggered here"); 
          console.log("messages is ", message);
          // console.log("message.moves is ", message.data.moves);
          if(message.payload.moves){ 
            console.log("entered message.moves , it is" + message.payload.moves); 
          message.payload.moves.map((x: any) => {
            if (isPromoting(chess, x.from, x.to)) {
              chess.move({ ...x, promotion: 'q' });
            } else {
              chess.move(x);  
            } 
          });
          setMoves(message.payload.moves); 
          setFen(chess.fen());
      }  

          navigate(`/game/${message.payload.gameId}`);
          break; 
          
         case INIT_GAME:
            try {
              const newChess = new Chess();  
              setChess(newChess);
              setBoard(newChess.board());
              console.log("Game initialized");
              setError(null);
            } catch (initError) {
              console.error("Error initializing game:", initError);
              setError("Failed to initialize game");
            }
            break;

          case MOVE: 
            try {
              console.log("the incoming message.payload is  ", message.payload);
              const move = message.payload;
              if (!move) {
                throw new Error("Move data is missing");
              }

              let moveResult: any = chess.move(message.payload);
              if (!moveResult) {
                throw new Error("Invalid move attempted");
                setFrom(null);
              }

              setBoard(chess.board());
              if(chess.turn() === "b"){
                     moveResult =  setMovesWhite((prev: any) => [...prev, move]);

              } else{
                     moveResult = setMovesBlack((prev: any) => [...prev, move]);
              }

              console.log("Move made successfully:", moveResult);
              setError(null);
            } catch (moveError) {
              console.error("Error making move:", moveError);
              //@ts-ignore
              setError(`Move failed: ${moveError.message}`);
            }
            break;

          case GAME_OVER:
            try {
              console.log("Game over");
              setError(null);
            } catch (gameOverError) {
              console.error("Error handling game over:", gameOverError);
              setError("Error ending game");
            }
            break;

          default:
            console.warn("Unknown message type:", message.type);
        }  
      } catch (parseError) {
        console.error("Error parsing message:", parseError);
        setError("Failed to parse server message");
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error occurred");
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
      if (event.code !== 1000) {
        setError("Connection lost unexpectedly");
      }
    };

    if(gameId !== 'random'){
      socket.send(JSON.stringify({
        type: JOIN_ROOM,
          payload: {
            gameId
          }
      }))      
    }
      
  }, [socket, chess]);

  if (!socket) return <div>Connection to socket pending...</div>;

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    console.log("ondrop is called here")
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
    });

    if (move === null) {
      console.log("Illegal move! The piece will snap back.");
      return false;
    }

    console.log("Move successful! Updating board and sending move...");
    setBoard(chess.board()); 
    console.log("the move is ", move); 

    const isWhiteMove = chess.turn() === "b";
    if (isWhiteMove) {
      setMovesWhite((prev: any) => [...prev, move]);
      console.log("white moves updated");
    } else {
      setMovesBlack((prev: any) => [...prev, move]);
      console.log("black moves updated");
    }

    //
    try { 
      if (!socket) {
        console.log("socket is nulll");
        return false; 
      }  
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            from: sourceSquare,
            to: targetSquare,
          },
        })
      );
      console.log("Move sent successfully:", {
        from: sourceSquare,
        to: targetSquare,
      });
    } catch (error) {
      console.error("Error sending move over WebSocket:", error);
    }

    return true;
  }

  function onSquareClick(square: Square) {
    if (!from) {
      setFrom(square);
    } else {
      const move = chess.move({
        from: from,
        to: square,
        promotion: "q",
      });

      if (move === null) {
        console.log("Illegal move! The piece will snap back.");
        setFrom(null);
        return false;
      }

      console.log("Move successful! Updating board and sending move...");
      setBoard(chess.board());

      try {
        if(!socket){
          console.log("socket is null")
          return;
        }
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
        setFrom(null);
        setTo(null);
      } catch (error) {
        console.error("Error sending move over WebSocket:", error);
      }
    }
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4 bg-gray-900 text-white">
      <div style={{ width: "90vmin", maxWidth: "800px" }}>
        <div className="justify-center flex">
          <div className="pt-8 max-w-screen-lg">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-sm underline"
                >
                  Dismiss
                </button> 
              </div>
            )}

            <div className="grid grid-cols-6 gap-4 w-full">
              <div className="col-span-4 bg-red-200 w-full">
                <Chessboard
                  id="drag-and-drop-board"
                  position={chess.fen()}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                />
              </div>
              <div className="col-span-2 bg-green-200 w-full">
               {gameId === 'random' && ( <button
                  onClick={() => {    
                    try {
                      const message = JSON.stringify({
                        type: INIT_GAME,
                      });
                      socket.send(message);
                       setError(null);
                      
                     } catch (sendError) {
                      console.error(
                        "Error sending init game message:",
                        sendError
                      );
                      setError("Failed to start game");
                    }
                  }}
                  className="bg-green-800 text-white px-4 py-2 rounded"
                >
                  Play
                </button>
               )}
                <div className="flex p-4 gap-8">
                  <div>
                    Black
                    <div>
                      
                      {movesBlack.map((move, index) => (
                        <li key={`black-${index}`}> 
                          {index + 1}. {move.from} to {move.to}
                        </li>
                      ))}
                    </div>
                  </div>
                  <div> 
                    White
                    <div>
                        {movesWhite.map((move, index) => (
                          <li key={`white-${index}`}>  
                            {index + 1}. {move.from} to {move.to}
                          </li>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
