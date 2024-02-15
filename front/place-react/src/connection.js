import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import DOMPurify from 'dompurify';
import api from './api_utils';

const Connection = () => {
  const [cookies, setCookie] = useCookies(['token']); // Initialize cookies
  const navigate = useNavigate();
  useEffect(() => {
     //API REQUEST fetch le token et le comparer au cookie.token dans le if
    if (cookies.token) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const sanitizedData = {
      name: DOMPurify.sanitize(formData.name),
      password: DOMPurify.sanitize(formData.password)
    };

    const token = api.login(sanitizedData.name, sanitizedData.password);

    console.log("token= " + token);
    setCookie('token', token, { path: '/' });
    navigate('/canvas');
    console.log('Form submitted:', formData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <p>Please enter your login and password</p>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Connect</button>
      </form>
      <button onClick={() => navigate('/register')}>Don't have an account?</button>
    </div>
  );
}

export default Connection;