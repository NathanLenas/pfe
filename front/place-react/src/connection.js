import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import DOMPurify from 'dompurify';
import api from './api_utils';
import './connection.css';

const Connection = () => {
  const [cookies, setCookie] = useCookies(['token']); // Initialize cookies
  const navigate = useNavigate();
  useEffect(() => {
     //API REQUEST fetch le token et le comparer au cookie.token dans le if
     console.log("Le token vaut : ", cookies.token)
    if (cookies.token != null) {
      navigate('/canvas');
    }
  }, [cookies.token, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });

  const handleChange = (e) => { //updates user and password according to what the user typed
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedData = {
      name: DOMPurify.sanitize(formData.name),
      password: DOMPurify.sanitize(formData.password)
    };

    const token = await api.login(sanitizedData.name, sanitizedData.password);
    if (token != null){
      setCookie('token', token, { path: '/' });
      navigate('/canvas');
    }
    

  };

  return (
    <div>
      <h1>
        EISTI/Place 
      </h1>
      <form onSubmit={handleSubmit}>
        <p>Please enter your login and password</p>
        <label>
          Name: <br/>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
        <label>
          Password: <br/>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <button className="connect" type="submit">Connect</button>
      </form>
      <button onClick={() => navigate('/register')}>Don't have an account?</button>
    </div>
  );
}

export default Connection;