'use client'
import React, { useState } from 'react';
import axios from 'axios';

interface Change {
    original: string;
    corrected: string;
    reason: string;
    category: string;
}

interface ProofreadResult {
    correctedText: string;
    changes: Change[];
    additionalComments?: string;
}

const Proofreading: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [result, setResult] = useState<ProofreadResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [highlightMode, setHighlightMode] = useState<boolean>(true);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {

            const response = await fetch('https://general-pisut-be.tu4rl4.easypanel.host/proofread', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: inputText }),
            });
            const data = await response.json();
            setResult(data);

        } catch (error) {
            console.error('Error:', error);
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.error);
            } else {
                setError('เกิดข้อผิดพลาดในการตรวจสอบข้อความ กรุณาลองใหม่อีกครั้ง');
            }
        }
        setIsLoading(false);
    };

    const highlightChanges = (text: string, changes: Change[]) => {
        let highlightedText = text;
        changes.forEach(change => {
            highlightedText = highlightedText.replace(
                change.corrected,
                `<span class="bg-green-200 px-1 rounded" title="${change.reason}">${change.corrected}</span>`
            );
        });
        return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedText(text);
                setTimeout(() => setCopiedText(null), 2000);
            })
            .catch(err => console.error('ไม่สามารถคัดลอกข้อความได้:', err));
    };

    const isTextPerfect = result && result.changes.length === 0;

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">PISUT</h1>
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="relative">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                        rows={8}
                        placeholder="กรอกข้อความที่ต้องการตรวจสอบ"
                    />
                    <button
                        type="button"
                        onClick={() => handleCopy(inputText)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-blue-500"
                        title="คัดลอกข้อความ"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                    </button>
                </div>
                <button
                    type="submit"
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 w-full"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            กำลังตรวจสอบ...
                        </span>
                    ) : (
                        'ตรวจสอบ'
                    )}
                </button>
            </form>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-green-600 flex items-center">
                            <svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            ผลลัพธ์
                        </h2>
                        <div className="flex items-center">
                            <span className="font-medium mr-2">Highlight</span>
                            <div
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${highlightMode ? 'bg-blue-500' : 'bg-gray-300'}`}
                                onClick={() => setHighlightMode(!highlightMode)}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${highlightMode ? 'translate-x-5' : ''}`}></div>
                            </div>
                        </div>
                    </div>
                    {isTextPerfect && (
                        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-r-lg">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p>ข้อความถูกต้อง 100% แล้ว!</p>
                            </div>
                        </div>
                    )}
                    <div className="mb-6 relative">
                        <h3 className="text-lg font-semibold mb-2">ข้อความที่แก้ไขแล้ว:</h3>
                        <div className="bg-gray-100 p-4 rounded-lg pr-10">
                            {highlightMode
                                ? highlightChanges(result.correctedText, result.changes)
                                : result.correctedText}
                        </div>
                        <button
                            onClick={() => handleCopy(result.correctedText)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-blue-500"
                            title="คัดลอกข้อความที่แก้ไขแล้ว"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                        </button>
                    </div>
                    {copiedText && (
                        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                            ข้อความถูกคัดลอกแล้ว!
                        </div>
                    )}
                    {!isTextPerfect && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">การแก้ไข:</h3>
                            <ul className="space-y-3">
                                {result.changes.map((change, index) => (
                                    <li key={index} className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-1">
                                            <span className="line-through text-red-500">{change.original}</span>
                                            <span className="mx-2">→</span>
                                            <span className="font-bold text-green-600">{change.corrected}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{change.reason}</p>
                                        <p className="text-xs text-blue-600 mt-1">หมวดหมู่: {change.category}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {result.additionalComments && (
                        <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-r-lg">
                            <h4 className="font-semibold">ข้อเสนอแนะเพิ่มเติม:</h4>
                            <p>{result.additionalComments}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Proofreading;