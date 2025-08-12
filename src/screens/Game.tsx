// import React, { useEffect, useState } from "react";
// export const INIT_GAME = "init_game";
// import { ChessBoard } from "../components/ChessBoard.tsx";
// import { Chess, Move } from "chess.js";
// import { useSocket } from "../hooks/useSocket.ts";
// export const GAME_OVER = "game_over";
// export const MOVE = "move";
// export const Game = () => {
//   const [chess, setChess] = useState(new Chess());
//   const [board, setBoard] = useState(chess.board());

//     const socket = useSocket();

//   useEffect(() => {
//     if (!socket) {
//       console.log("returning because of no socket");
//       return;
//     }

//     socket.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       console.log("it should message" + message);
//       switch (message.type) {
//         case INIT_GAME:
//           setChess(new Chess());
//           setBoard(chess.board);
//           console.log("move mode");
//           break;

//         case MOVE:
//           const move = message.payload.move;
//           chess.move(move); 
//           setBoard(chess.board());
//           console.log("move made");

//         case GAME_OVER:
//           console.log("Game over");
//           break;

//       }
//     };
//   }, [socket]);

//   if (!socket) return <div> 
//     Connection to socket pending...
//      </div>;

//   return (
//     <div className="justify-center flex">
//       <div className="pt-8 max-w-screen-lg">
//         <div className="grid grid-cols-6 gap-4 w-full">
//           <div className="col-span-4 bg-red-200 w-full">
//             <ChessBoard chess = {chess} setBoard =  {setBoard} socket = {socket} board={board} />
//           </div>
//           <div className="col-span-2 bg-green-200 w-full">
//             <button
//               onClick={() => {
//                 socket.send(
//                   JSON.stringify({
//                     type: INIT_GAME,
//                   })
//                 );
//               }}
//               className="bg-green-800"
//             >   
//               Play
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };




import React, { useEffect, useState } from "react";
export const INIT_GAME = "init_game";
import { ChessBoard } from "../components/ChessBoard.tsx";
import { Chess, Move, Square } from "chess.js";
import { useSocket } from "../hooks/useSocket.ts";
export const GAME_OVER = "game_over";
export const MOVE = "move";

export const Game = () => {
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [error, setError] = useState<string | null>(null);

  const socket = useSocket();
  const [from, setFrom] = useState< null | Square>(null); 
  

  useEffect(() => {
    if (!socket) {
      console.log("returning because of no socket");
      return;
    }

    socket.onmessage = (event) => {
      console.log("socket.on message is triggered( here before try )")
      try {
        const message = JSON.parse(event.data);
        console.log("received message:", message);
        
        switch (message.type) {
          case INIT_GAME:
            try {
              const newChess = new Chess();
              setChess(newChess);
              setBoard(newChess.board()); // Fixed: use newChess instead of chess
              console.log("Game initialized");
              setError(null); // Clear any previous errors
            } catch (initError) {
              console.error("Error initializing game:", initError);
              setError("Failed to initialize game");
            }
            break;

          case MOVE:
            try {
              console.log("the incoming message.payload is  ", message.payload)   
              const move = (message.payload);
              if (!move) {
                throw new Error("Move data is missing");
              }
              
              const moveResult = chess.move(message.payload);
              if (!moveResult) {
                throw new Error("Invalid move attempted");
                setFrom(null);
              }
              
              setBoard(chess.board());
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
              // Add any game over logic here
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

    // Add error handler for WebSocket errors
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error occurred");
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
      if (event.code !== 1000) { // 1000 is normal closure
        setError("Connection lost unexpectedly");
      }

    };

  }, [socket, chess]); // Added chess to dependencies

  if (!socket) return <div>Connection to socket pending...</div>;

  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg">
        {/* Error display */}
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
            <ChessBoard 
              chess={chess} 
              setBoard={setBoard} 
              socket={socket} 
              board={board} 
              from = {from}
              setFrom = {setFrom}
            />
          </div>
          <div className="col-span-2 bg-green-200 w-full">
            <button
              onClick={() => {
                try {
                  const message = JSON.stringify({
                    type: INIT_GAME,
                  });
                  socket.send(message);
                  setError(null);
                } catch (sendError) {
                  console.error("Error sending init game message:", sendError);
                  setError("Failed to start game");
                }
              }}
              className="bg-green-800 text-white px-4 py-2 rounded"
            >   
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
