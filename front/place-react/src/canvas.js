import React, { useRef, useEffect, useState } from 'react';
const Canvas = () => {
    const canvasRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [ctx, setCtx] = useState(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      setCtx(context);
    }, []);
  
    useEffect(() => {
      if (ctx) {
        ctx.clearRect(0, 0, 100, 100); // Clear canvas
        ctx.save(); // Save the current state of the canvas context
        ctx.scale(scale, scale); // Scale the canvas
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, 100, 100); // Draw blue rectangle
        ctx.restore(); // Restore the previous state of the canvas context
      }
    }, [scale, ctx]);
    const changeColor = () =>{

    }
    const handleCanvasClick = (e) => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / scale);
      const y = Math.floor((e.clientY - rect.top) / scale);
      console.log('Clicked on pixel:', x, y);
      context.fillStyle = 'black';
      ctx.fillRect(x,y,1,1)
      // You can perform actions based on the clicked pixel here
    };
  
    return (
      <div>
        <div>
        </div>
        <canvas
          ref={canvasRef}
          width={100}
          height={100}
          style={{ border: '1px solid black' }}
          onClick={handleCanvasClick}
        />
        <button onClick={changeColor}>blue</button>
      </div>
    );
  };
  
  export default Canvas;