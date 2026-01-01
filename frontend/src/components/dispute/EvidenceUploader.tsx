import React, { useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

interface EvidenceUploaderProps {
    disputeId: number;
    onSuccess: () => void;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
    disputeId,
    onSuccess,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile: File) => {
        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Only JPG, PNG, WEBP, and PDF files are allowed');
            return;
        }

        if (selectedFile.size > maxSize) {
            setError('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            await axios.post(
                `${import.meta.env.VITE_API_URL}/disputes/${disputeId}/evidence`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            onSuccess();
            setFile(null);
            setDescription('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload evidence');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Evidence</h3>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Drag & Drop Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${dragActive
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    className="hidden"
                />

                {!file ? (
                    <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium mb-2">
                            Drag and drop your file here, or
                        </p>
                        <label
                            htmlFor="file-upload"
                            className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium"
                        >
                            browse to upload
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                            JPG, PNG, WEBP, or PDF (max 5MB)
                        </p>
                    </>
                ) : (
                    <div className="flex items-center justify-center gap-3">
                        {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-8 h-8 text-purple-600" />
                        ) : (
                            <FileText className="w-8 h-8 text-purple-600" />
                        )}
                        <div className="text-left">
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                )}
            </div>

            {/* Description */}
            {file && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Add a description for this evidence..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                </div>
            )}

            {/* Upload Button */}
            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? 'Uploading...' : 'Upload Evidence'}
                </button>
            )}

            <p className="text-xs text-gray-500 mt-4">
                Maximum 5 evidence files per dispute. Files cannot be deleted after the dispute is resolved.
            </p>
        </div>
    );
};
