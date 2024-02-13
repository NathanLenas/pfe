import axios from "axios";
import Canvas from './canvas';
import Connection from "./connection";
function App() {

  const fetchBoard = async () => {
    try {
        const response = await axios("http://localhost:81/api/place/board-bitmap");
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching board:", error);
    }
}


  fetchBoard();
  return (
    <Canvas/>
  );
}

export default App;
