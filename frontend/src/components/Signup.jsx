// src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notice from './Notice';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [notice, setNotice] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Name optional in existing UI; pass email prefix as fallback
            const name = email?.split('@')[0] || 'User';
            await axios.post('/api/auth/signup', { name, email, password });
            setNotice({ type: 'success', message: 'Signup successful! Redirecting to login...' });
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            setNotice({ type: 'error', message: err.response?.data?.message || err.message || 'Signup failed' });
        }
    };

    return (
        <div className="flex justify-center items-center h-[calc(100vh-6rem)]">
            <div className="bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-96 space-y-3">
                {notice && (
                  <Notice type={notice.type} message={notice.message} onClose={() => setNotice(null)} autoHideMs={3000} />
                )}
                <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Signup</h2>

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
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;