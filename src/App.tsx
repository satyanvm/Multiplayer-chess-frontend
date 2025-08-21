import { BrowserRouter, Route, Routes } from "react-router-dom";

import React from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useState } from "react";
import { Landing } from "./screens/Landing.tsx";
import { Game } from "./screens/Game.tsx";
import ChessBoard from "./components/ChessBoard.tsx";
function App() {
  // const  [count, setCount] = useState(0);

  return (
    <div className="h-screen bg-black">
      <BrowserRouter> 
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path = "/game/:gameId" element = {<ChessBoard/>}></Route>
        </Routes>
      </BrowserRouter>
    </div> 
  );
}

export default App;
