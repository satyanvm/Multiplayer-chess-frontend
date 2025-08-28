import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useRecoilState } from 'recoil';
import { userAtom } from '../Functionalities/user.ts';
import React from 'react';
const BACKEND_URL = 'http://localhost:3000';
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

const Login = () => { 
  const navigate = useNavigate();
  const guestName = useRef<HTMLInputElement>(null); 
  const [_, setUser] = useRecoilState(userAtom);  

  const loginAsGuest = async () => {
    const response = await fetch(`${BACKEND_URL}/auth/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: (guestName.current && guestName.current.value) || '',
      }),
    });
    const user = await response.json();
    setUser(user);
    navigate('/game/random');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-textMain">
      <h1 className="text-4xl font-bold mb-8 text-center text-green-500 drop-shadow-lg">
        Enter the Game World
      </h1>
      <div className="bg-bgAuxiliary2 rounded-lg shadow-lg p-8 flex flex-col md:flex-row">

        </div>
        <div className="flex flex-col items-center md:ml-8">
          <div className="flex items-center mb-4">
            <div className="bg-gray-600 h-1 w-12 mr-2"></div>
            <span className="text-gray-400">OR</span>
            <div className="bg-gray-600 h-1 w-12 ml-2"></div>
          </div>
          <input
            type="text"
            ref={guestName}
            placeholder="Username"
            className="border px-4 py-2 rounded-md mb-4 w-full md:w-64"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300"
            onClick={() => loginAsGuest()}
          >
            Enter as guest
          </button>
        </div>
      </div>
  );
};

export default Login;
