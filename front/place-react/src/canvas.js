import React, { useRef, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from "axios";
import './canvas.css';
import { useNavigate } from 'react-router-dom';
import { translateNumberTocolor, translatecolorToNumber } from './translate';
import api from './api_utils';

const Canvas = () => {
 const canvasRef = useRef(null);
 const [ctx, setCtx] = useState(null);
 const [color, setColor] = useState("#000000");
 const [user, setUser] = useState(null);
 const [ws, setWs] = useState(null);
 // Delay between each pixel update
 const [delay, setDelay] = useState(20);
 const [timer, setTimer] = useState(null);
 const [cookies, setCookie] = useCookies(['token']); // Get and set cookies
 const navigate = useNavigate();


 const fetchBoard = async () => {
    try {
      let board = await api.get_api("/api/place/board-bitmap");
      return board;
    } catch (error) {
      console.error("Error fetching board:", error);
      return null;
    }
 }

 useEffect(() => { // Get the delay from the server
    const getDelay = async () => {
      try {
        let delay = await api.get_api("/api/place/delay");
        setDelay(delay.delay + 1);
      
      } catch (error) {
        console.error("Error fetching delay:", error);
      }
    };

    getDelay();
  }, []);

 useEffect(() => { // Define the user and fetch board data
    if (cookies.token == null || cookies.token === undefined || cookies.token === "") {
      handleDisconnect();
    } else {
      setUser(cookies.token);
      fetchBoard();
    }
 }, [cookies.token]);

 useEffect(() => { //Obtains the info from the canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);
 }, []);

 useEffect(() => { // Fetch the board data and draw the pixels
    if (ctx) {
      fetchBoard().then((boardData) => {
        ctx.clearRect(0, 0, 1000, 1000);
        ctx.fillStyle = '';

        if (boardData === undefined || boardData === null) {
          console.log("Board data is undefined or null");
          handleDisconnect();
          return;
        }

        for (let i = 0; i < boardData.length; i++) {
          const x = i % 100;
          const y = Math.floor(i / 100);
          const colorValue = translateNumberTocolor(boardData[i]);
          if (colorValue !== undefined && colorValue !== null) {
            ctx.fillStyle = colorValue;
            ctx.fillRect(x * 10, y * 10, 10, 10);
          }
        }
      },
        ((error) => {
          console.log("Error fetching board data:");
          console.log(error);
          ctx.clearRect(0, 0, 1000, 1000);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 1000, 1000);
          handleDisconnect();
        }));
    }
 }, [ctx]);

 const handleMessage = (event) => {
    const data = JSON.parse(event.data);
    // print  precise timestamp of the message
    // console.log("Message received at: ", new Date().toISOString());
    const { x, y, color } = data;
    const colorCode = translateNumberTocolor(color);
    if (colorCode !== -1) {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const context = canvas.getContext('2d');
      context.fillStyle = colorCode;
      context.fillRect(x * 10, y * 10, 10, 10);
    }
 };

 useEffect(() => { // Initialize the WebSocket connection
    const initializeWebSocket = () => {
      console.log("Creating WebSocket connection");
      const socket = api.get_websocket(cookies.token);

      socket.then((ws) => {
        ws.onopen = (event) => {
          setWs(ws);
          console.log("WebSocket connection opened");
        };
        ws.onmessage = handleMessage;
        ws.onclose = (event) => {
          console.log("WebSocket connection closed");
        };
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      });
    };

    console.log("Calling initializeWebSocket");
    initializeWebSocket();
    return () => {
      if (ws) {
        console.log("WebSocket already opened : closing connection");
        ws.close();
      }
    };
 }, []);

//timer effect
 useEffect(() => {
  // Set up the interval to update the timer every second
  const interval = setInterval(() => {
    setTimer((prevTimer) => { if( prevTimer - 1 > 0 ) { return prevTimer - 1 } else { return 0 } });
  }, 1000);

  // Clear the interval when the component unmounts
  return () => clearInterval(interval);
}, []);

 const handleDisconnect = () => {
    setCookie('user', null, { path: '/' })
    setCookie('token', null, { path: '/' })
    // console.log("User and token cookies changed to : ", cookies.user, " ", cookies.token);
    navigate("/");
 };

 const handleCanvasClick = (event) => {
  if (timer == 0) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor(((event.clientX - rect.left) * scaleX) / 10);
    const y = Math.floor(((event.clientY - rect.top) * scaleY) / 10);
  
    if(updateDB(x, y))
    {
      console.log(`Clicked at (${x}, ${y})`);
      const context = canvas.getContext('2d');
      context.fillStyle = color;
      context.fillRect(x * 10, y * 10, 10, 10);
    }
  }
 };

 const updateDB = (x, y) => {
   

    let numColor = translatecolorToNumber(color);
    if (numColor === -1) {
      numColor = 0;
    }
    // console.log("numColor: " + numColor);
    api.post_api("/api/place/draw", {
      x: x,
      y: y,
      color: numColor
    }).catch(error => {
      console.error("Error updating pixel:", error);
      return false;
    }).then(() => {
      setTimer(delay);
      return true;
    });
 };

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

      <div className='container'>
        <table className='colorTable'>
          <tbody>
            <tr>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(15) }} onClick={() => changeColor(translateNumberTocolor(15))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(14) }} onClick={() => changeColor(translateNumberTocolor(14))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(13) }} onClick={() => changeColor(translateNumberTocolor(13))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(12) }} onClick={() => changeColor(translateNumberTocolor(12))} /></td>
            </tr>
            <tr>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(11) }} onClick={() => changeColor(translateNumberTocolor(11))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(10) }} onClick={() => changeColor(translateNumberTocolor(10))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(9) }} onClick={() => changeColor(translateNumberTocolor(9))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(8) }} onClick={() => changeColor(translateNumberTocolor(8))} /></td>
            </tr>
            <tr>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(7) }} onClick={() => changeColor(translateNumberTocolor(7))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(6) }} onClick={() => changeColor(translateNumberTocolor(6))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(5) }} onClick={() => changeColor(translateNumberTocolor(5))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(4) }} onClick={() => changeColor(translateNumberTocolor(4))} /></td>
            </tr>
            <tr>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(3) }} onClick={() => changeColor(translateNumberTocolor(3))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(2) }} onClick={() => changeColor(translateNumberTocolor(2))} /></td>
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(1) }} onClick={() => changeColor(translateNumberTocolor(1))} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className='align'>
        <p><br/><br/><br/></p>
        
        <p>Next Click in :</p>
        <p> {Math.floor(timer / 60)} </p>
        <span>Minutes</span>

        <p>{timer % 60}</p>
        <span>Seconds</span>

        <button className='connect' onClick={handleDisconnect}>Disconnect</button>
      </div>
    </div>
 );
};

export default Canvas;
