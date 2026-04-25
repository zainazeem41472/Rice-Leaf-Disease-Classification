import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notice from './Notice';

/**
 * Upload Component
 * 
 * User Flow:
 * 1. User selects image file
 * 2. Preview displayed
 * 3. Click "Predict Disease" sends to Node backend
 * 4. Node forwards to Flask ML backend
 * 5. Flask returns prediction
 * 6. Node saves to MongoDB and returns record
 * 7. Frontend displays results
 */

const Upload = () => {
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (!file) {
            setImageFile(null);
            setPreviewUrl('');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setNotice({ 
                type: 'error', 
                message: 'Only JPG and PNG images are allowed!' 
            });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setNotice({ 
                type: 'error', 
                message: 'Image size must be less than 5MB!' 
            });
            return;
        }

        setImageFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewUrl(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const sendImage = async () => {
        if (!imageFile) {
            setNotice({ 
                type: 'warning', 
                message: 'Please select an image!' 
            });
            return;
        }

        // Check authentication
        const token = sessionStorage.getItem('token');
        if (!token) {
            setNotice({ 
                type: 'error', 
                message: 'You must be logged in to use this feature.' 
            });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        setIsLoading(true);

        try {
            // Create FormData with image
            const formData = new FormData();
            formData.append('image', imageFile);

            // Send to Node/Express backend
            // Node will:
            // 1. Save image locally
            // 2. Forward to Flask for prediction
            // 3. Save prediction to MongoDB
            // 4. Return disease record
            const { data } = await axios.post(
                '/api/disease/upload', 
                formData, 
                {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    },
                    timeout: 60000, // 60 seconds timeout for ML processing
                }
            );

            if (data.success && data.data) {
                const record = data.data;
                
                // Store result in localStorage for Result component
                localStorage.setItem('diseaseName', record.diseaseName || '');
                localStorage.setItem('confidence', record.confidence || '');
                localStorage.setItem('description', record.description || '');
                localStorage.setItem('treatment', record.treatment || '');
                localStorage.setItem('imagePath', record.imagePath || '');
                localStorage.setItem('recordId', record._id || '');

                setNotice({ 
                    type: 'success', 
                    message: 'Prediction completed! Redirecting...' 
                });

                // Redirect to results page
                setTimeout(() => navigate('/result'), 1500);
            } else {
                setNotice({ 
                    type: 'error', 
                    message: 'Unexpected server response' 
                });
            }

        } catch (error) {
            console.error('Upload error:', error);
            
            let errorMsg = 'Upload failed. Please try again.';
            
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message === 'Network Error') {
                errorMsg = 'Network error. Is the backend running?';
            } else if (error.code === 'ECONNABORTED') {
                errorMsg = 'Request timeout. ML processing took too long.';
            }

            setNotice({ 
                type: 'error', 
                message: errorMsg 
            });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-10" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                🌾 Rice Disease Detection
            </h1>
            <p className="text-white mb-8 drop-shadow-lg">
                Upload a leaf image to predict disease
            </p>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6 bg-opacity-95">
                {notice && (
                    <Notice 
                        type={notice.type} 
                        message={notice.message} 
                        onClose={() => setNotice(null)} 
                        autoHideMs={4000} 
                    />
                )}

                {/* File Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Select Image
                    </label>
                    <input 
                        type="file" 
                        id="imageInput" 
                        accept="image/jpeg,image/jpg,image/png" 
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 focus:outline-none focus:border-green-500 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500">
                        JPG or PNG, max 5MB
                    </p>
                </div>

                {/* Image Preview */}
                {previewUrl && (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Preview</p>
                        <img 
                            id="preview" 
                            src={previewUrl} 
                            alt="Preview"
                            className="w-full rounded-lg shadow-md border-2 border-green-200"
                        />
                    </div>
                )}

                {/* Predict Button */}
                <button 
                    id="predictBtn" 
                    onClick={sendImage}
                    disabled={!imageFile || isLoading}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 ${
                        isLoading || !imageFile
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-500 to-green-700 hover:shadow-lg active:scale-95'
                    }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Processing... (may take a moment)
                        </span>
                    ) : (
                        '🔍 Predict Disease'
                    )}
                </button>

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-700">
                        <strong>📝 Tip:</strong> Upload a clear photo of a rice leaf for best results.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Upload;