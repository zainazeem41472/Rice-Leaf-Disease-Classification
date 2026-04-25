// src/components/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import Notice from './Notice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { updateLoginStatus } = useContext(AuthContext);

    const [notice, setNotice] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            const token = data?.token;
            if (token) {
                sessionStorage.setItem('token', token);
                updateLoginStatus(true);
                navigate('/upload');
            } else {
                setNotice({ type: 'error', message: 'Login failed: token missing' });
            }
        } catch (err) {
            setNotice({ type: 'error', message: err.response?.data?.message || err.message || 'Login failed' });
        }
    };

    return (
        <div className="flex justify-center items-center h-[calc(100vh-6rem)]">
                        <div className="bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-96 space-y-3">
                                {notice && (
                                    <Notice
                                        type={notice.type}
                                        message={notice.message}
                                        onClose={() => setNotice(null)}
                                        autoHideMs={3000}
                                    />
                                )}
                <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Login</h2>

                <form onSubmit={handleSubmit}>
                    <label className="font-semibold">Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email" 
                        className="w-full p-2 border rounded-md mt-1 mb-4"
                        required
                    />

                    <label className="font-semibold">Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password" 
                        className="w-full p-2 border rounded-md mt-1 mb-4"
                        required
                    />

                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold transition-all">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;