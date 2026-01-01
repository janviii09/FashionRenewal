import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface RaiseDisputeModalProps {
    orderId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DISPUTE_REASONS = [
    { value: 'ITEM_NOT_AS_DESCRIBED', label: 'Item Not As Described' },
    { value: 'ITEM_DAMAGED', label: 'Item Damaged' },
    { value: 'LATE_DELIVERY', label: 'Late Delivery' },
    { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'FRAUD', label: 'Fraud' },
    { value: 'OTHER', label: 'Other' },
];

export const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({
    orderId,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (description.length < 20) {
            setError('Description must be at least 20 characters');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/disputes`,
                {
                    orderId,
                    reason,
                    description,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            onSuccess();
            onClose();
            setReason('');
            setDescription('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create dispute');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Raise a Dispute</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Dispute *
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Select a reason</option>
                            {DISPUTE_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description * (min 20 characters)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            minLength={20}
                            maxLength={2000}
                            rows={6}
                            placeholder="Please provide detailed information about the issue..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {description.length}/2000 characters
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• The other party will be notified and has 3 days to respond</li>
                            <li>• You can upload evidence to support your claim</li>
                            <li>• If unresolved, the dispute will be escalated to admin review</li>
                            <li>• Both parties' trust scores may be affected by the outcome</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !reason || description.length < 20}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Dispute'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
