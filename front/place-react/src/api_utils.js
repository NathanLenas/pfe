import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
  
const fetchBoard = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/place/board-bitmap`);
    console.log("Board fetched:", response.data);
    console.log("API_URL:", API_URL);
  } catch (error) {
    console.error("Error fetching board:", error);
  }
}


const get_api = async (url) => {
    try {
        const response = await axios.get(`${API_URL}${url}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching board:", error);
    }
}
const post_api = async (url, data) => {
    try {
        const response = await axios.post(`${API_URL}${url}`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching board:", error);
    }
}


const register = async (name, password) => {
    try {
        const formData = new FormData();
        formData.append('username', name);
        formData.append('password', password);

        const response = await axios.post(`${API_URL}/auth/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error registering:", error);
    }
}

const login = async (name, password) => {
    try {
        const formData = new FormData();
        formData.append('username', name);
        formData.append('password', password);

        const response = await axios.post(`${API_URL}/auth/login`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error registering:", error);
    }
}


const api = {
    fetchBoard,
    get_api,
    post_api,
    register
  };
  
export default api;