// src/components/routes/Sign/Logout/Logout.js

import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Send a logout request to the server
            await axios.post("http://localhost:4000/logout");
            // Remove the token from local storage
            localStorage.removeItem("token");
            // Redirect to login page
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;
