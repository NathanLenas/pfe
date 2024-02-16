import React, { useRef, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from "axios";
import './canvas.css';
import { useNavigate } from 'react-router-dom';
import {translateNumberTocolor, translatecolorToNumber} from './translate';
import api from './api_utils';
const Canvas = () => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [color, setColor] = useState("000000");
  const [timer, setTimer] = useState(0);
  const [date, setDate] = useState(Date.now());
  const [user, setUser] = useState(null);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [ws, setWs] = useState(null);

  
  const [cookies, removeCookie] = useCookies(['token']); // Get and set cookies
  const navigate = useNavigate();
  const fetchBoard = async () => {
    let board = await api.get_api("/api/place/board-bitmap");
    console.log("Board fetched:");
    console.log(board);
    return board;
  }

  
 
  useEffect(() => {//Vérifie que l'utilisateur
    const getTime = () => {
      // api.get_api("/api/place/last-user-timestamp/").then((time) => {
      //   console.log("Time fetched:");
      //   console.log(time);
      //   setTimer(time);
      // });
      //REQUEST API POUR SET date à la valeur de dernier pixel de l'utilisateur
      setTimer(Date.now() - date)
    }

     //API REQUEST fetch le token et le comparer au cookie.token dans le if
    if (!cookies.token) {
      navigate('/');
    } else {
      //API REQUEST fetch le nom d'utilisateur grâce au token (le cookie)
      setUser(cookies.token);
      getTime();
    }

  }, [cookies.token, date, navigate]);

  useEffect(() => { //Obtains the info from the canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);
  }, []);

  useEffect(() => {
    if (ctx) {
      fetchBoard().then((boardData) => {
        // Clear the canvas
        ctx.clearRect(0,  0,  1000,  1000);
  
        // Set the fill style for the context
        ctx.fillStyle = '';
  
        // Iterate through the board data and draw each pixel
        for (let i =  0; i < boardData.length; i++) {
          // Calculate the x and y position of the pixel
          const x = i %  100;
          const y = Math.floor(i /  100);
  
          // Convert the board data to a color
          const colorValue = translateNumberTocolor(boardData[i]);
          if (colorValue !== undefined && colorValue !== null) {
            ctx.fillStyle = colorValue;
            // Scale the x and y coordinates to match the canvas size
            ctx.fillRect(x *  10, y *  10,  10,  10);
          }
        }
      });
    }
  }, [ctx]);
  
  useEffect(() => {
    // Create a WebSocket connection to the server
    // const socket = api.get_websocket("api/place/board-bitmap/ws");
  
    // // Define a function to handle incoming messages
    // const handleMessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   // Assuming the data contains x, y, and color properties
    //   const { x, y, color } = data;
  
    //   // Convert the color to a numerical value
    //   const numColor = translatecolorToNumber(color);
    //   if (numColor !== -1) {
    //     // Update the canvas with the new pixel color
    //     if (ctx) {
    //       ctx.fillStyle = color;
    //       ctx.fillRect(x *  10, y *  10,  10,  10);
    //     }
    //   }
    // };
  
    // // Add the message handler to the WebSocket instance
    // socket.addEventListener('message', handleMessage);
  
    // // Store the WebSocket instance in state
    // setWs(socket);
  
    // // Cleanup the WebSocket connection when the component unmounts
    // return () => {
    //   socket.removeEventListener('message', handleMessage);
    //   socket.close();
    // };
  }, [ctx]); // Dependency array includes ctx to reinitialize if the canvas context changes
  

  const handleDisconnect = () => {
    // Remove the user cookie
    removeCookie('user', { path: '/' });
    removeCookie('token', { path: '/' });
    console.log(cookies.user);
    navigate("/");
  };

  const handleCanvasClick = (event) => {
    if (timer < 999) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width; // Get the scale in X direction
      const scaleY = canvas.height / rect.height; // Get the scale in Y direction
      const x = Math.floor(((event.clientX - rect.left) * scaleX) / 10);
      const y = Math.floor(((event.clientY - rect.top) * scaleY) / 10);
      console.log(`Clicked at (${x}, ${y})`);
      const context = canvas.getContext('2d');
      context.fillStyle = color;
      context.fillRect(x * 10, y * 10, 10, 10);
      setDate(Date.now());
      // setTimer(300000);
      updateDB(x, y, date);
    } else {
      console.log("Delay not over yet!")
    }
  };

  const updateDB = (x, y, date) => {
    let numColor = translatecolorToNumber(color);
    if (numColor === -1) {
      numColor =  0;
    }
    console.log("numColor: " + numColor);
  
    api.post_api("/api/place/draw", {
      x: x,
      y: y,
      color: numColor
    }).catch(error => {
      console.error("Error updating pixel:", error);
    });
  };
  


  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log(timer)
      if (timer > 999) {

        setTimer(timer - 1000);
        setMinutes(Math.floor((timer / 1000 / 60) % 60));
        setSeconds(Math.floor((timer / 1000) % 60));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer]); // Re-run effect when seconds change


  const changeColor = (newColor) => {
    setColor(newColor);
    console.log(color);
  }

  return (
    <div className="container">
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        style={{ border: '1px solid black' }}
        onClick={handleCanvasClick}
      />
      <div className='choiceColor'>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#6a5cff' }} onClick={() => changeColor("#6a5cff")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#94b3ff' }} onClick={() => changeColor("#94b3ff")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#811e9f' }} onClick={() => changeColor("#811e9f")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#b44ac0' }} onClick={() => changeColor("#b44ac0")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#e4abff' }} onClick={() => changeColor("#e4abff")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#de107f' }} onClick={() => changeColor("#de107f")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#ff3881' }} onClick={() => changeColor("#ff3881")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#ff99aa' }} onClick={() => changeColor("#ff99aa")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#6d482f' }} onClick={() => changeColor("#6d482f")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#9c6926' }} onClick={() => changeColor("#9c6926")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#ffb470' }} onClick={() => changeColor("#ffb470")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#000000' }} onClick={() => changeColor("#000000")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#515252' }} onClick={() => changeColor("#515252")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#898d90' }} onClick={() => changeColor("#898d90")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#d4d7d9' }} onClick={() => changeColor("#d4d7d9")} /></div>
        <div className='color'><button className='colorButton' style={{ backgroundColor: '#ffffff' }} onClick={() => changeColor("#ffffff")} /></div>
      </div>

      <p>{minutes}</p>
      <span>Minutes</span>

      <p>{seconds}</p>
      <span>Seconds</span>

      <button onClick={handleDisconnect}>Disconnect</button>

    </div>

  );
}
export default Canvas;