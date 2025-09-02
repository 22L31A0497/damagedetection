# Damage Prediction Project

This project is a **Next.js application** integrated with **Google AI Studio APIs** for object damage prediction. The system allows users to upload images, process them through the ML API, and return predictions with confidence levels.

---

## 🚀 Features

* **Next.js Backend API Routes** – Handles requests and communicates with the ML API.
* **File Upload Support** – Users can upload images for prediction.
* **ML Integration** – Uses Google AI Studio API for analyzing the uploaded image.
* **Prediction Response** – Returns damage classification with confidence levels.
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
     ├── components/                # Reusable frontend components (not included here)
     ├── page.tsx                   # Main entry page
     └── layout.tsx                 # Global layout
lib/
 └── connectDB.ts                   # Database connection utility (if used later)
```

---

## ⚙️ Workflow

1. **User Uploads an Image**

   * The app accepts an uploaded file via `formData`.

2. **API Processing**

   * File is passed to the backend (`api/analyze/route.ts`).
   * ML API (`generateContent`) is called with the uploaded image.

3. **Prediction Output**

   * The response contains:

     * **Damage Status** (e.g., "Damaged", "Not Damaged")
     * **Confidence Score (%)**

4. **Result Sent to Frontend**

   * JSON response is sent back to the client.

---

## 🔑 API Usage

* **Google AI Studio Key** is used for making requests.
* Model: `gemini-pro-vision` (supports vision-based predictions).
* Example request (simplified):

```ts
const formData = new FormData();
formData.append("file", file);

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
* Successfully tested predictions for damage detection.
* Implemented **error handling** for missing/invalid inputs.

---

## 📌 Next Steps

* Improve **confidence score accuracy** (data preprocessing / fine-tuning).
* Add **frontend UI styling** for better UX.
* Expand prediction categories if required.

---

