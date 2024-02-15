import axios from "axios";
import Canvas from './canvas';
import Connection from "./connection";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from "./register";
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
    <Router>
      <Routes>
        <Route path="/" element={<Connection />} />
        <Route path="/canvas" element={<Canvas />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
