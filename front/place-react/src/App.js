import logo from './logo.svg';
import './App.css';
import axios from "axios";
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
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
        
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          
        </a>
      </header>
    </div>
  );
}

export default App;
