from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io

# ---------------- APP ----------------
app = Flask(__name__)
CORS(app)

# ---------------- CONFIG ----------------
MODEL_PATH = "./rice_model.h5"
IMG_SIZE = (224, 224)
CONF_THRESHOLD = 60   # adjust 50–70

CLASSES = [
    'Hispa',
    'Ragged Stunt Virus',
    'Sheath Rot',
    'Stem Rot',
    'Tungro',
    'bacterial_leaf_blight',
    'brown_spot',
    'healthy',
    'irrelevant_pics',   # ✅ kept
    'leaf_blast',
    'leaf_scald',
    'narrow_brown_spot'
]

# ---------------- LOAD MODEL ----------------
def focal_loss(gamma=2., alpha=0.25):
    import tensorflow as tf
    def loss(y_true, y_pred):
        ce = tf.keras.losses.categorical_crossentropy(y_true, y_pred)
        pt = tf.exp(-ce)
        return alpha * (1 - pt)**gamma * ce
    return loss

try:
    model = load_model(MODEL_PATH, custom_objects={'loss': focal_loss()})
    print("✅ Model loaded")
except Exception as e:
    print("❌ Model load failed:", e)
    model = None

# ---------------- DISEASE INFO ----------------
disease_info = {
    'Hispa': {'description': 'Insect damage on leaves.', 'treatment': 'Use insecticide.'},
    'Ragged Stunt Virus': {'description': 'Viral disease.', 'treatment': 'Control vectors.'},
    'Sheath Rot': {'description': 'Fungal infection.', 'treatment': 'Use fungicide.'},
    'Stem Rot': {'description': 'Stem decay disease.', 'treatment': 'Improve drainage.'},
    'Tungro': {'description': 'Viral infection.', 'treatment': 'Control leafhoppers.'},
    'bacterial_leaf_blight': {'description': 'Bacterial infection.', 'treatment': 'Resistant varieties.'},
    'brown_spot': {'description': 'Brown lesions.', 'treatment': 'Apply fungicide.'},
    'healthy': {'description': 'No disease.', 'treatment': 'No action needed.'},
    'irrelevant_pics': {
        'description': 'Image is not a rice leaf.',
        'treatment': 'Upload a proper rice leaf image.'
    },
    'leaf_blast': {'description': 'Diamond lesions.', 'treatment': 'Use Tricyclazole.'},
    'leaf_scald': {'description': 'Irregular lesions.', 'treatment': 'Crop rotation.'},
    'narrow_brown_spot': {'description': 'Narrow streaks.', 'treatment': 'Use Propiconazole.'}
}

# ---------------- PREPROCESS ----------------
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# ---------------- HEALTH ----------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "model_loaded": model is not None})

# ---------------- PREDICT ----------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image_bytes = request.files["image"].read()
        img_array = preprocess_image(image_bytes)

        prediction = model.predict(img_array, verbose=0)[0]

        # 🔥 Top-3 predictions
        top3_idx = prediction.argsort()[-3:][::-1]
        top3 = [(CLASSES[i], float(prediction[i])) for i in top3_idx]

        best_idx = top3_idx[0]
        best_class = CLASSES[best_idx]
        confidence = float(prediction[best_idx]) * 100

        # 🔥 SPECIAL HANDLING FOR irrelevant_pics
        if best_class == "irrelevant_pics" and confidence < 80:
            final_class = "Uncertain"
        elif confidence < CONF_THRESHOLD:
            final_class = "Uncertain"
        else:
            final_class = best_class

        info = disease_info.get(final_class, {
            "description": "Model is not confident. Try another image.",
            "treatment": "Upload clearer image."
        })

        return jsonify({
            "diseaseName": final_class,
            "confidence": round(confidence, 2),
            "top3_predictions": [
                {"class": c, "confidence": round(p*100, 2)} for c, p in top3
            ],
            "description": info.get("description"),
            "treatment": info.get("treatment")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)