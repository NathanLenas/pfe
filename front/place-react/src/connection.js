import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import DOMPurify from 'dompurify';

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
    //API REQUEST comparer les logins à ceux de la db pour vérifier que les logins sont bons

    //API REQUEST obtenir un token qu'on puisse assigner au cookie (à la place de sanitizedData.name)
    setCookie('token', JSON.stringify(sanitizedData.name), { path: '/' });
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