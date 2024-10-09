// src/components/routes/Other/Header/Header.js

import React, { useRef, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import "./Header.css";

const Header = () => {
    const fileInputRef = useRef(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate(); 

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            alert("Please enter a search term."); 
            return;
        }

        navigate(`/customers/search?query=${encodeURIComponent(searchQuery)}`);
    };

    // Handle the Enter key press for search
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = file.type;
            const allowedTypes = [
                "application/vnd.ms-excel", // .xls
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
                "text/csv" // .csv
            ];

            if (allowedTypes.includes(fileType)) {
                setSelectedFileName(file.name);
                console.log("File selected:", file);
            } else {
                setSelectedFileName("");
                alert("Please select a valid CSV or Excel file.");
            }
        }
    };

    // Trigger the file input on icon click
    const handleIconClick = () => {
        fileInputRef.current.click();
    };

    // Handle logout
    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            try {
                const token = localStorage.getItem("token");
    
                // Call the logout endpoint with the token
                const response = await fetch('http://localhost:4000/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Pass the token for auth
                        'Content-Type': 'application/json',
                    },
                });
    
                if (response.ok) {
                    // If successful, remove the token and navigate to login
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    alert("Error during logout, please try again.");
                }
            } catch (error) {
                console.error("Logout error:", error);
                alert("Failed to logout. Please try again later.");
            }
        }
    };
    

    // Check if the user is logged in
    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <div className="header-container">
                <img 
                    src="/uploads/logo.webp"
                    className="logo"
                    alt="logo"
                    aria-label="Logo"
                />
            <div className="header-right">
                {isLoggedIn ? (
                    <>
                        <div className="header-search">
                            <input
                                type="text"
                                className="form-control form-cont"
                                aria-label="Search input"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <img 
                                src="/uploads/search.svg"
                                className="srch-icon"
                                alt="search-icon"
                                onClick={handleSearch}
                            />
                        </div>

                        <div className="file-upload-section">
                            <img 
                                src="/uploads/file.svg"
                                className="file-icon"
                                alt="file upload icon"
                                aria-label="Upload file"
                                onClick={handleIconClick}
                            />
                            {selectedFileName && <span>{selectedFileName}</span>}
                            <span className="file-upl">File Upload</span>
                            
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                accept=".csv, .xls, .xlsx"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Profile Icon and Logout Option */}
                        <div className="profile-section">
                            <img 
                                src="/uploads/profile.svg"
                                className="pro-icon"
                                alt="profile icon"
                                aria-label="Profile"
                                onClick={handleLogout} // Logout on click
                            />
                            <span onClick={handleLogout} style={{ cursor: 'pointer', marginLeft: '8px', fontSize: '0.85rem', color: '#666' }}>Logout</span>
                        </div>
                    </>
                ) : (
                    <Link to="/login">
                        <img 
                            src="/uploads/profile.svg"
                            className="pro-icon"
                            alt="profile icon"
                            aria-label="Profile"
                        />
                    </Link>
                )}
            </div> 
        </div>
    );
};

export default Header;
