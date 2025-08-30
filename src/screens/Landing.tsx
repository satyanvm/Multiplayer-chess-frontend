import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket.ts";
import { INIT_GAME } from "./Game.tsx";

export function Landing() {
  const navigate = useNavigate();
  return (  
    <div> 
      <div className="flex justify-center">
        <div className="pt-8 max-w-screen-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex justify-center">
              <img src={"/chessboardimage.jpeg"} className="max-w-96" />
            </div>
            <div className="pt-16">
              <div className=" flex justify-center">
                <h1 className="text-4xl font-bold text-white">
                  Play chess online on the #1 Site!
                </h1>
              </div>
              <div className="mt-4 flex justify-center">
                <button onClick = {
                  
                    () => {
                        navigate("/login")
                    }
                } className=" bg-green-500 hover-bg-green-700 text-2xl text-white font-bold rounded cursor-pointer">
                  Play online
                </button> 
              </div> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
