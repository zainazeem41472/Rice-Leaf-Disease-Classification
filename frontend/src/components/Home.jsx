// src/components/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [showAgriModal, setShowAgriModal] = useState(false);
  const navigate = useNavigate();
  
  const showAgricultureDecision = () => setShowAgriModal(true);

  const AgricultureDecisionModal = () => (
    <div id="agriModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target.id === 'agriModal') setShowAgriModal(false); }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-green-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">🌾 Smart Agriculture Decisions</h2>
          <button onClick={() => setShowAgriModal(false)} className="text-white hover:text-yellow-200 text-3xl font-bold">&times;</button>
        </div>
        
        <div className="p-8">
          <p className="text-gray-700 mb-6 text-lg">Follow these expert recommendations to improve your rice farming:</p>
          
          <ul className="space-y-4">
            <li className="flex items-start bg-green-50 p-4 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl mr-3">🌱</span>
              <p className="text-gray-800">Choose high-yield rice varieties suitable for your soil type.</p>
            </li>
            <li className="flex items-start bg-green-50 p-4 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl mr-3">💧</span>
              <p className="text-gray-800">Use <strong>drip irrigation</strong> or controlled watering to save water.</p>
            </li>
            <li className="flex items-start bg-green-50 p-4 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl mr-3">🧪</span>
              <p className="text-gray-800">Apply fertilizers based on <strong>soil test results</strong>, not guessing.</p>
            </li>
            <li className="flex items-start bg-green-50 p-4 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl mr-3">🌦</span>
              <p className="text-gray-800">Check <strong>weather forecast</strong> before sowing and harvesting.</p>
            </li>
            <li className="flex items-start bg-green-50 p-4 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl mr-3">🪲</span>
              <p className="text-gray-800">Use <strong>pest-resistant seeds</strong> to reduce crop disease impact.</p>
            </li>
            <li className="flex items-start bg-green-50 p-4 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl mr-3">🔄</span>
              <p className="text-gray-800">Practice <strong>crop rotation</strong> to maintain soil nutrients.</p>
            </li>
            <li className="flex items-start bg-green-50 p-4 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl mr-3">🚜</span>
              <p className="text-gray-800">Ensure proper field <strong>drainage</strong> to prevent root damage.</p>
            </li>
            <li className="flex items-start bg-green-50 p-4 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl mr-3">🌿</span>
              <p className="text-gray-800">Use organic compost to improve soil structure.</p>
            </li>
          </ul>
          
          <div className="mt-8 text-center">
            <button onClick={() => setShowAgriModal(false)} className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-full transition">
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="text-center mt-20 text-black">
        <h2 className="text-3xl text-white font-bold drop-shadow-lg">Welcome to Our Website</h2>
        <p className="text-xl mt-2 bg-white bg-opacity-60 inline-block px-4 py-2 rounded-xl">
          This system classifies rice leaf diseases using AI.
        </p>
      </section>

      <div className="container mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
        <div className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-xl transform transition hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => navigate('/upload')}>
          <h3 className="text-2xl font-bold text-green-700">AI Detection</h3>
          <p className="mt-2 text-gray-700">Upload leaf images to automatically detect diseases.</p>
        </div>
        <div className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-xl transform transition hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={showAgricultureDecision}>
          <h3 className="text-2xl font-bold text-green-700">Farmer Support</h3>
          <p className="mt-2 text-gray-700">Helps farmers take better agriculture decisions.</p>
        </div>
        <div className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-xl transform transition hover:scale-105 hover:shadow-2xl cursor-pointer">
          <h3 className="text-2xl font-bold text-green-700">Disease Solution</h3>
          <p className="mt-2 text-gray-700">Get instant recommended treatment for detected issues.</p>
        </div>
      </div>
      
      {showAgriModal && <AgricultureDecisionModal />}
    </>
  );
};

export default Home;