
# Damage Prediction Project

This project is a **Next.js application** integrated with **Google AI Studio APIs** for object damage prediction.
The system allows users to upload one or more images of a car, enhance them for better clarity, process them through the ML API, and return predictions with confidence levels.

---

## 🚀 Features

* **Next.js Backend API Routes** – Handles requests and communicates with the ML API.
* **File Upload Support** – Users can upload **one or multiple images** for prediction.
* **Image Enhancement** – Pre-processing step using canvas to **resize, adjust brightness/contrast, and reduce noise** before analysis.
* **Smooth UX with Shimmer/Spinner** – Added artificial delay and shimmer UI while enhancing images for a smoother experience.
* **Separate Actions** – Users can choose to either **Enhance Images** or directly **Analyze Damage**, preventing auto-triggering of both actions.
* **ML Integration** – Uses Google AI Studio API for analyzing the uploaded (original or enhanced) images.
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
    │   └── MultiImageUpload.tsx   # Component for uploading, enhancing, and analyzing
    ├── page.tsx                   # Main entry page
    └── layout.tsx                 # Global layout
lib/
└── connectDB.ts                   # Database connection utility (if used later)
```

---

## ⚙️ Workflow

1. **User Uploads Images**

   * Users can select **one or more images**.
   * If no image is selected, a message is shown: *"Please select at least one image"*.

2. **Optional Image Enhancement**

   * Before analysis, users can click **Enhance Images**.
   * Images are pre-processed with resizing and noise reduction for better predictions.
   * A **loading shimmer/spinner** with delay provides smoother UX.

3. **Damage Analysis**

   * Users can click **Analyze Damage** to send images (original or enhanced) to the backend.
   * Each uploaded file is passed to the backend (`api/analyze/route.ts`).
   * ML API (`generateContent`) is called for every image.

4. **Prediction Output**

   * For each image, the response contains:

     * **Damage Status** (e.g., "Damaged", "Not Damaged")
     * **Confidence Score (%)**
   * When multiple images are uploaded, the system **calculates an average confidence score** to predict the overall damage status.

5. **Result Sent to Frontend**

   * JSON response is sent back to the client with per-image results + overall average analysis.

---

## 🔑 API Usage

* **Google AI Studio Key** is used for making requests.
* Model: `gemini-pro-vision` (supports vision-based predictions).
* Example request (simplified):

```ts
const formData = new FormData();
files.forEach(file => formData.append("file", file));

const res = await fetch("/api/analyze", {
  method: "POST",
  body: formData,
});
const result = await res.json();
```

---

## 🛠️ What Has Been Done So Far

* Set up **Next.js project structure**.
* Implemented **file upload & API route handling**.
* Integrated **Google AI Studio API** for ML predictions.
* Added **multi-image upload feature** with average analysis.
* Successfully tested predictions for damage detection.
* Implemented **error handling** for missing/invalid inputs.
* Added **image enhancement feature** using canvas.
* Improved **UX with shimmer/spinner** and artificial delay.
* Ensured **Enhance Images** and **Analyze Damage** actions work independently.

---

## 📌 Next Steps

* Improve **confidence score accuracy** (data preprocessing / fine-tuning).
* Add **more advanced enhancement filters** (sharpness, color balance).
* Expand prediction categories if required.
* Optionally, enhance support for **multi-angle analysis** to improve reliability.