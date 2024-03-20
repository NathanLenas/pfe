import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}

const get_api = async (url) => {
    try {
        console.log("get:" + `${API_URL}${url}`);
        console.log("getCookie('token'):" + getCookie('token'));
        const response = await axios.get(`${API_URL}${url}`, {
            headers: {
                Authorization: `${getCookie('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching board:", error);
    }
}

const post_api = async (url, data) => {
    try {
        console.log("post:" + `${API_URL}${url}`);
        console.log("data:" + JSON.stringify(data));
        const response = await axios.post(`${API_URL}${url}`, data, {
            headers: {
                Authorization: `${getCookie('token')}`
            }
        });
        console.log("post:" + `${API_URL}${url}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching :", error);
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

        const response = await axios.post(`${API_URL}/auth/token`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 200) {
            console.log("Logged in:", response.data);
            // Extract the JSON object from the response data
            const accessToken = response.data.access_token;
            return accessToken;
        } else {
            console.error("Invalid credentials");
            return null;
        }
    } catch (error) {
        console.error("Error logging in:", error);
        return null;
    }
}

const get_websocket = async () => {
    try {

        const ws = new WebSocket(`${API_URL.replace("http", "ws")}/api/place/board-bitmap/ws`, [], {
            headers: {'Authorization': token }});
        console.log("get " + `${API_URL.replace("http", "ws")}/api/place/board-bitmap/ws`);

        return ws;
    } catch (error) {
        console.error("Error creating websocket:", error);
        return null;
    }
}

const api = {
    get_api,
    post_api,
    register,
    login,
    get_websocket
};

export default api;