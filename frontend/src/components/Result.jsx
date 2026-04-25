// src/components/Result.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Result = () => {
    const [diseaseName, setDiseaseName] = useState('Loading...');
    const [confidence, setConfidence] = useState('Loading...');
    const [description, setDescription] = useState('');

    useEffect(() => {
        // Fetching data from Local Storage (from script.js)
        const name = localStorage.getItem("diseaseName") || "Disease Not Found";
        const conf = localStorage.getItem("confidence") || "0%";
        const desc = localStorage.getItem("description") || "No detailed description available.";

        setDiseaseName(name);
        setConfidence("Confidence: " + conf);
        setDescription(desc);
    }, []);

    const imagePath = localStorage.getItem('imagePath') || '';
    return (
        <div className="flex justify-center items-center h-[calc(100vh-6rem)]">
            <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-xl text-center bg-opacity-95">
                <h1 className="text-3xl font-bold text-green-700 mb-4">Prediction Result</h1>
                {imagePath ? (
                  <img src={imagePath} alt="Uploaded leaf" className="mx-auto mb-4 max-h-64 rounded" />
                ) : null}
                <h2 id="diseaseName" className="text-xl font-semibold text-gray-700 mb-2">{diseaseName}</h2>
                <p id="confidence" className="text-gray-600 mb-4">{confidence}</p>
                <p id="description" className="text-gray-700">{description}</p>
                <div className="mt-6 flex flex-col gap-3">
                    <Link to="/upload" className="bg-green-700 text-white py-2 rounded-lg hover:bg-green-800">Try Again</Link>
                    <Link to="/" className="bg-gray-800 text-white py-2 rounded-lg hover:bg-black">Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Result;