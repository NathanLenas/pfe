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

    fetchBoard();
  }, [cookies.token, date, navigate]);

  useEffect(() => { //Obtains the info from the canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);
  }, []);

  useEffect(() => { //Colorise the canvas
    if (ctx) {
      //API REQUEST fetch l'image en entier et la stocker dans baseImage
      const baseImage = translateNumberTocolor(0)
      ctx.clearRect(0, 0, 1000, 1000); // Clear canvas
      ctx.save(); // Save the current state of the canvas context
      ctx.fillStyle = baseImage;
      ctx.fillRect(0, 0, 1000, 1000); // Draw canvas
      ctx.restore(); // Restore the previous state of the canvas context
    }
  }, [ctx]);


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