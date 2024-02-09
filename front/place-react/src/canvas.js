import React, { useRef, useEffect, useState } from 'react';
const Canvas = () => {
    const canvasRef = useRef(null);
    //const [scale, setScale] = useState(1);
    const [ctx, setCtx] = useState(null);
    const [color, setColor] = useState("000000");

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      setCtx(context);
    }, []);
  
    useEffect(() => {
      if (ctx) {
        ctx.clearRect(0, 0, 1000, 1000); // Clear canvas
        ctx.save(); // Save the current state of the canvas context
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 1000, 1000); // Draw blue rectangle
        ctx.restore(); // Restore the previous state of the canvas context
      }
    }, [ctx]);


    const handleCanvasClick = (e) => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left));
      const y = Math.floor((e.clientY - rect.top));
      console.log('Clicked on pixel:', x, y);
      context.fillStyle = color;
      //console.log(Math.floor(x/10));
      context.fillRect(Math.floor(x/10)*10,Math.floor(y/10)*10,10,10)
      // You can perform actions based on the clicked pixel here
    };

    const changeColor = (newColor) =>{
      setColor(newColor);
      console.log(color);
    }

    return (
      <div>
        <div>
        </div>
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          style={{ border: '1px solid black' }}
          onClick={handleCanvasClick}
        />
        <div>
        <button onClick={()=>changeColor("#6d001a")}>
          dark red</button>
          <button onClick={()=>changeColor("#be0039")}> red</button>
          <button onClick={()=>changeColor("#ff4500")}>
          orange</button>
          <button onClick={()=>changeColor("#ffa800")}>
          gold</button>
          <button onClick={()=>changeColor("#ffd635")}>
          yellow</button>
          <button onClick={()=>changeColor("#fff8b8")}>
          pale yellow</button>
          <button onClick={()=>changeColor("#00a368")}>
          Dark Green</button>
          <button onClick={()=>changeColor("#00cc78")}>
          Green</button>
          <button onClick={()=>changeColor("#7eed56")}>
          Light Green</button>
          <button onClick={()=>changeColor("#00756f")}>
          Teal</button>
          <button onClick={()=>changeColor("#009eaa")}>
          Cyan</button>
          <button onClick={()=>changeColor("#00ccc0")}>
          Green</button>
          <button onClick={()=>changeColor("#2450a4")}>
          red</button>
          <button onClick={()=>changeColor("#3690ea")}>
          Green</button>
          <button onClick={()=>changeColor("#51e9f4")}>
          red</button>
          <button onClick={()=>changeColor("#493ac1")}>
          Green</button>
          <button onClick={()=>changeColor("#6a5cff")}>
          red</button>
          <button onClick={()=>changeColor("#94b3ff")}>
          red</button>
          <button onClick={()=>changeColor("#811e9f")}>
          Purple</button>
          <button onClick={()=>changeColor("#b44ac0")}>
          Light purple</button>
          <button onClick={()=>changeColor("#e4abff")}>
          Magenta</button>
          <button onClick={()=>changeColor("#de107f")}>
          BlackPink</button>
          <button onClick={()=>changeColor("#ff3881")}>
          Pink</button>
          <button onClick={()=>changeColor("#ff99aa")}>
          Light Pink</button>
          <button onClick={()=>changeColor("#6d482f")}>
          Dark Brown</button>
          <button onClick={()=>changeColor("#9c6926")}>
          Brown</button>
          <button onClick={()=>changeColor("#ffb470")}>
          Beige</button>
          <button onClick={()=>changeColor("#000000")}>
          Black</button>
          <button onClick={()=>changeColor("#515252")}>
          Dark Gray</button>
          <button onClick={()=>changeColor("#898d90")}>
          Gray</button>
          <button onClick={()=>changeColor("#d4d7d9")}>
          Light Gray</button>
          <button onClick={()=>changeColor("#ffffff")}>
          White</button>
        </div>
      </div>
    );
}
export default Canvas;