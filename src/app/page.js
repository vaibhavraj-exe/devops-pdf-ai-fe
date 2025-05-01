"use client";

import { useState } from "react";

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [maskSensitiveData, setMaskSensitiveData] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("pdf_file", pdfFile);
    formData.append("question", question);
    formData.append("mask_sensitive_data", maskSensitiveData.toString());

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/process-pdf/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const contentType = response.headers.get("Content-Type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Response data:", data);

        setAnswer(data.answer);

        if (data.processed_pdf) {
          const pdfBlob = new Blob(
            [new Uint8Array(atob(data.processed_pdf).split("").map((char) => char.charCodeAt(0)))],
            { type: "application/pdf" }
          );
          const pdfBlobUrl = URL.createObjectURL(pdfBlob);
          setPdfUrl(pdfBlobUrl);
        }
      } else {
        throw new Error("Unexpected content type.");
      }

      setPdfFile(null);
      setQuestion("");
      setMaskSensitiveData(false);
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950 text-white flex items-center justify-center p-6">
  <div className="bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-6xl w-full flex flex-col lg:flex-row gap-10">
    
    {/* Form Section */}
    <div className="flex-1 flex flex-col justify-center">
      <h1 className="text-5xl font-extrabold text-center mb-4 text-white">PDF.ai</h1>
      <p className="text-center text-gray-400 mb-10 text-lg">
        Upload your PDF & ask questions to get AI-powered insights.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-50 file:border-0 file:bg-emerald-600 file:hover:bg-emerald-700 file:text-white file:font-semibold file:px-5 file:py-3 file:rounded-xl cursor-pointer bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-2 transition"
          />
        </div>

        {/* Question Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Your Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is an API?"
            className="block w-full px-5 py-4 text-base bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-zinc-500 text-white transition"
          />
        </div>

        {/* Mask Checkbox */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={maskSensitiveData}
            onChange={(e) => setMaskSensitiveData(e.target.checked)}
            className="h-5 w-5 text-emerald-600 border-gray-600 rounded focus:ring-emerald-500"
          />
          <label className="text-sm text-gray-300">Mask sensitive data</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Submit"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-6 text-red-500 text-sm text-center">
          <p>{error}</p>
        </div>
      )}

      {/* Answer Box */}
      {answer && (
        <div className="mt-8 bg-gray-800/80 p-5 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-emerald-400">Answer:</h2>
          <p className="text-gray-200">{answer}</p>
        </div>
      )}
    </div>

    {/* PDF Display Section */}
    <div className="flex-1 flex flex-col">
      {pdfUrl ? (
        <>
          <h2 className="text-lg font-semibold text-white mb-3">Your PDF:</h2>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline mb-4"
          >
            Open in New Tab
          </a>
          <iframe
            src={pdfUrl}
            className="w-full h-[75vh] border-2 border-gray-700 rounded-2xl shadow-xl"
            title="Processed PDF"
            onError={() => alert("Failed to load the PDF. Please try again later.")}
          ></iframe>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
          <svg
            className="w-20 h-20 mb-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <p>No PDF uploaded yet.</p>
        </div>
      )}
    </div>

  </div>
</div>

  );
}
