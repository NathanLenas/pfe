import axios from "axios";
import Canvas from './canvas';
import Connection from "./connection";
function App() {

  const API_URL = process.env.API_URL;
  
  const fetchBoard = async () => {
    try {
      const response = await axios(API_URL + "/api/place/board-bitmap");
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  }


  fetchBoard();
  return (
    <Canvas />
  );
}

export default App;
