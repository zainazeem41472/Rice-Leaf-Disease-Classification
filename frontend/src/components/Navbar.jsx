// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { isLoggedIn, updateLoginStatus } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        updateLoginStatus(false);
        navigate('/login');
    }

    return (
        <nav className="bg-green-700 bg-opacity-90 text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">🌾 Rice Vision</Link>
                <ul className="flex space-x-6">
                    <li><Link to="/" className="hover:text-yellow-200">Home</Link></li>
                    {isLoggedIn ? (
                        <>
                            <li><Link to="/upload" className="hover:text-yellow-200">Upload</Link></li>
                            <li><button onClick={handleLogout} className="hover:text-yellow-200">Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className="hover:text-yellow-200">Login</Link></li>
                            <li><Link to="/signup" className="hover:text-yellow-200">Signup</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;