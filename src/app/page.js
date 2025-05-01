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
      const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_IP}:8000/process-pdf/`, {
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
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 shadow-xl rounded-lg p-8 max-w-5xl w-full flex flex-col lg:flex-row space-x-8">
        {/* Form Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-100">Upload PDF and Ask a Question</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload PDF</label>
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-50 file:border-0 file:bg-blue-600 file:text-white file:font-semibold file:px-4 file:py-2 file:rounded-lg cursor-pointer bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-1 rounded-xl"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5.121 19.121a4 4 0 015.657 0L12 21l1.222-1.879a4 4 0 115.657-5.657l-6.364-6.364a4 4 0 00-5.657 0l-6.364 6.364a4 4 0 010 5.657z"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question"
                className="block w-full px-4 py-3 text-sm bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 transition-all ease-in-out duration-300 hover:border-gray-500 focus:ring-offset-2 text-slate-50"
              />
            </div>

            <div className="flex items-center text-gray-300">
              <input
                type="checkbox"
                checked={maskSensitiveData}
                onChange={(e) => setMaskSensitiveData(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm">Mask sensitive data</label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Submit"}
            </button>
          </form>

          {error && (
            <div className="mt-6 text-red-500 text-sm">
              <p>{error}</p>
            </div>
          )}

          {answer && (
            <div className="mt-6 bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold">Answer:</h2>
              <p>{answer}</p>
            </div>
          )}
        </div>

        {/* PDF Display Section */}
        <div className="flex-1">
          {pdfUrl && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-100">Processed PDF:</h2>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block mb-4"
              >
                Open Processed PDF
              </a>
              <iframe
                src={pdfUrl}
                className="w-full h-[80vh] border-2 border-gray-600 rounded-lg shadow-lg"
                title="Processed PDF"
                onError={() => alert("Failed to load the PDF. Please try again later.")}
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
