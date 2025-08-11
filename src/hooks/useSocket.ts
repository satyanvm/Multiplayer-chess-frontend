
import { useState } from "react"
import { useEffect } from "react";

const WS_URL = "ws://localhost:8080";

export const useSocket = () => {

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => { 
        try{
                const ws = new WebSocket(WS_URL);
        ws.onopen = () => {
            console.log("connected");
            
            setSocket(ws);
        }
        ws.onclose = () => {
            console.log("disconnedted");
            setSocket(null); 
        }
    }catch(e){
        console.error("error is " + e);
        return;
    }
       
    }, [])
    return socket;
}

