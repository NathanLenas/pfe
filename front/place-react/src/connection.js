import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Connection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //TODO COMMUNICATION AVEC L'API
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