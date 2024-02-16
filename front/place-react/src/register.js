import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import DOMPurify from 'dompurify';
import api from './api_utils';
import './canvas.css';

const Register = () => {
  const [cookies] = useCookies(['token']); // Initialize cookies
  const navigate = useNavigate();

  useEffect(() => {

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const sanitizedData = {
      name: DOMPurify.sanitize(formData.name),
      password: DOMPurify.sanitize(formData.password)
    };
    
    api.register(sanitizedData.name, sanitizedData.password);

    navigate('/');

  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <p>Create new account</p>
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
        <button className="connect" type="submit">Register</button>
      </form>
      <button onClick={() => navigate('/')}>Already have an account</button>
    </div>
  );
}

export default Register;