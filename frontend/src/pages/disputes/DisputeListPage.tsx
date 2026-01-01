import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import axios from 'axios';

interface Dispute {
    id: number;
    orderId: number;
    reason: string;
    status: string;
    createdAt: string;
    responseDeadline: string;
    raisedBy: { id: number; name: string };
    against: { id: number; name: string };
    order: {
        item: {
            title: string;
            images: string[];
        };
    };
    _count: {
        evidence: number;
        responses: number;
    };
}

const STATUS_CONFIG = {
    OPEN: { label: 'Open', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    RESPONDED: { label: 'Responded', color: 'bg-blue-100 text-blue-800', icon: FileText },
    UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
    ESCALATED: { label: 'Escalated', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export const DisputeListPage: React.FC = () => {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/disputes/my-disputes`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setDisputes(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load disputes');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isDeadlineNear = (deadline: string) => {
        const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
        return hoursLeft > 0 && hoursLeft < 24;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading disputes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Disputes</h1>
                    <p className="text-gray-600 mt-2">
                        View and manage your active and resolved disputes
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Disputes List */}
                {disputes.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Disputes</h3>
                        <p className="text-gray-600">
                            You don't have any active or past disputes.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((dispute) => {
                            const statusConfig = STATUS_CONFIG[dispute.status as keyof typeof STATUS_CONFIG];
                            const StatusIcon = statusConfig.icon;
                            const deadlineNear = isDeadlineNear(dispute.responseDeadline);

                            return (
                                <div
                                    key={dispute.id}
                                    onClick={() => navigate(`/disputes/${dispute.id}`)}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
                                >
                                    <div className="flex gap-6">
                                        {/* Item Image */}
                                        <img
                                            src={dispute.order.item.images[0]}
                                            alt={dispute.order.item.title}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-lg">
                                                        {dispute.order.item.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Dispute #{dispute.id} • Order #{dispute.orderId}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} flex items-center gap-1`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {statusConfig.label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Reason:</span>
                                                    <span className="ml-2 font-medium text-gray-900">
                                                        {dispute.reason.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Created:</span>
                                                    <span className="ml-2 font-medium text-gray-900">
                                                        {formatDate(dispute.createdAt)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Evidence:</span>
                                                    <span className="ml-2 font-medium text-gray-900">
                                                        {dispute._count.evidence} file(s)
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Responses:</span>
                                                    <span className="ml-2 font-medium text-gray-900">
                                                        {dispute._count.responses}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Deadline Warning */}
                                            {deadlineNear && dispute.status === 'OPEN' && (
                                                <div className="mt-3 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        Response deadline: {formatDate(dispute.responseDeadline)} (less than 24 hours)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
