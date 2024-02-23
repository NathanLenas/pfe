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
  const [timer, setTimer] = useState(0);
  const [date, setDate] = useState(Date.now());
  const [user, setUser] = useState(null);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [ws, setWs] = useState(null);
  const [cookies, setCookie] = useCookies(['token']); // Get and set cookies
  const navigate = useNavigate();

  const fetchBoard = async () => {
    try {
      let board = await api.get_api("/api/place/board-bitmap");
      console.log("Board fetched:");
      console.log(board);
      return board;
    } catch (error) {
      console.error("Error fetching board:", error);
      return null;
    }
  }


  useEffect(() => { // Define the timer function and set the user
    const getTime = () => {
      // api.get_api("/api/place/last-user-timestamp/").then((time) => {
      //   console.log("Time fetched:");
      //   console.log(time);
      //   setTimer(time);
      // });
      setTimer(Date.now() - date)
    }

    //API REQUEST fetch le token et le comparer au cookie.token dans le if
    if (cookies.token == null || cookies.token === undefined || cookies.token === "") {
      handleDisconnect();
    } else {
      //API REQUEST fetch le nom d'utilisateur
      setUser(cookies.token);
      getTime();
    }

  }, [cookies.token, date]);

  useEffect(() => { //Obtains the info from the canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);
  }, []);

  useEffect(() => { // Fetch the board data and draw the pixels
    if (ctx) {
      fetchBoard().then((boardData) => {
        // Clear the canvas
        ctx.clearRect(0, 0, 1000, 1000);

        // Set the fill style for the context
        ctx.fillStyle = '';

        if (boardData === undefined || boardData === null) {
          console.log("Board data is undefined or null");
          //throw new Error("Board data is undefined or null");
          handleDisconnect();
          return;
        }

        // Iterate through the board data and draw each pixel
        for (let i = 0; i < boardData.length; i++) {
          // Calculate the x and y position of the pixel
          const x = i % 100;
          const y = Math.floor(i / 100);

          // Convert the board data to a color
          const colorValue = translateNumberTocolor(boardData[i]);
          if (colorValue !== undefined && colorValue !== null) {
            ctx.fillStyle = colorValue;
            // Scale the x and y coordinates to match the canvas size
            ctx.fillRect(x * 10, y * 10, 10, 10);
          }
        }
      },
        ((error) => {
          console.log("Error fetching board data:");
          console.log(error);
          // Clear the canvas
          ctx.clearRect(0, 0, 1000, 1000);
          // Set the fill style to white
          ctx.fillStyle = '#FFFFFF';
          // Fill the canvas
          ctx.fillRect(0, 0, 1000, 1000);
          handleDisconnect();
        }));
    }
  }, [ctx]);

  // Define a function to handle incoming messages
  const handleMessage = (event) => {
    console.log("Message received:");
    console.log(event.data);
    const data = JSON.parse(event.data);
    // Assuming the data contains x, y, and color properties
    const { x, y, color } = data;

    console.log(`Updating pixel at (${x}, ${y}) to color ${color}`);
    const colorCode = translateNumberTocolor(color);
    if (colorCode !== -1) {

      // Update the canvas with the new pixel color
      console.log("Updating canvas");
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

    // Function to initialize the WebSocket connection
    const initializeWebSocket = () => {

      // Create a WebSocket connection to the server
      console.log("Creating WebSocket connection");
      const socket = api.get_websocket(cookies.token);

      socket.then((ws) => {
        // Add a listener for the open event
        ws.onopen = (event) => {
          // Store the WebSocket instance in state
          setWs(ws);
          console.log("WebSocket connection opened");
        };
        // Add a listener for the message event
        ws.onmessage = handleMessage;
        // Add a listener for the close event
        ws.onclose = (event) => {
          console.log("WebSocket connection closed");
        };
        // Add a listener for the error event
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


  const handleDisconnect = () => {
    // Remove the user cookie
    setCookie('user', null, { path: '/' })
    setCookie('token', null, { path: '/' })
    console.log("User and token cookies changed to : ", cookies.user, " ", cookies.token);
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
      numColor = 0;
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
      //console.log(timer)
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
              <td className='color'><button className='colorButton' style={{ backgroundColor: translateNumberTocolor(0) }} onClick={() => changeColor(translateNumberTocolor(0))} /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className='align'>
        <p>Next Click in :</p>
        <p>{minutes}</p>
        <span>Minutes</span>

        <p>{seconds}</p>
        <span>Seconds</span>

        <button className='connect' onClick={handleDisconnect}>Disconnect</button>
      </div>
    </div>

  );
}
export default Canvas;