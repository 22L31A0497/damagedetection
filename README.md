
```markdown
# Damage Prediction Project

This project is a **Next.js application** integrated with **Google AI Studio APIs** for object damage prediction.  
The system allows users to upload one or more images of a car, process them through the ML API, and return predictions with confidence levels.

---

## 🚀 Features

* **Next.js Backend API Routes** – Handles requests and communicates with the ML API.
* **File Upload Support** – Users can upload **one or multiple images** for prediction.
* **ML Integration** – Uses Google AI Studio API for analyzing the uploaded images.
* **Prediction Response** – Returns damage classification with confidence levels.
* **Multi-Image Support** – Accepts multiple images, processes them one by one, and calculates the **average prediction** for better accuracy.
* **Error Handling** – Includes proper error responses for missing/invalid files.

---

## 📂 Project Structure

```

src/
└── app/
├── api/
│   ├── analyze/route.ts       # ML analysis endpoint
│   ├── upload/route.ts        # Handles file upload
│   └── ... other APIs
├── components/
│   └── MultiImageUpload.tsx   # Component for uploading multiple images
├── page.tsx                   # Main entry page
└── layout.tsx                 # Global layout
lib/
└── connectDB.ts                   # Database connection utility (if used later)

````

## ⚙️ Workflow

1. **User Uploads Images**

   * Users can select **one or more images**.
   * If no image is selected, a message is shown: *"Please select at least one image"*.

2. **API Processing**

   * Each uploaded file is passed to the backend (`api/analyze/route.ts`).
   * ML API (`generateContent`) is called for every image.

3. **Prediction Output**

   * For each image, the response contains:
     * **Damage Status** (e.g., "Damaged", "Not Damaged")
     * **Confidence Score (%)**

   * When multiple images are uploaded, the system **calculates an average confidence score** to predict the overall damage status.

4. **Result Sent to Frontend**

   * JSON response is sent back to the client with per-image results + average analysis.



## 🔑 API Usage

* **Google AI Studio Key** is used for making requests.
* Model: `gemini-pro-vision` (supports vision-based predictions).
* Example request (simplified):

const formData = new FormData();
files.forEach(file => formData.append("file", file));

const res = await fetch("/api/analyze", {
  method: "POST",
  body: formData,
});
const result = await res.json();


## 🛠️ What Has Been Done So Far

* Set up **Next.js project structure**.
* Implemented **file upload & API route handling**.
* Integrated **Google AI Studio API** for ML predictions.
* Added **multi-image upload feature** with average analysis.
* Successfully tested predictions for damage detection.
* Implemented **error handling** for missing/invalid inputs.

---

## 📌 Next Steps

* Improve **confidence score accuracy** (data preprocessing / fine-tuning).
* Add **frontend UI styling** for better UX.
* Expand prediction categories if required.
* Optionally, enhance support for **multi-angle analysis** to improve reliability.

---


