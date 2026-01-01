import React from 'react';
import { Shield, CheckCircle, Phone, IdCard } from 'lucide-react';

interface VerificationBadgeProps {
    phoneVerified?: boolean;
    idVerified?: boolean;
    trustedLender?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabels?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
    phoneVerified = false,
    idVerified = false,
    trustedLender = false,
    size = 'md',
    showLabels = false,
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const iconSize = sizeClasses[size];

    const badges = [];

    if (trustedLender) {
        badges.push({
            icon: Shield,
            label: 'Trusted Lender',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            tooltip: 'Verified trusted lender with 5+ successful rentals',
        });
    }

    if (phoneVerified) {
        badges.push({
            icon: Phone,
            label: 'Phone Verified',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            tooltip: 'Phone number verified',
        });
    }

    if (idVerified) {
        badges.push({
            icon: IdCard,
            label: 'ID Verified',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            tooltip: 'Government ID verified',
        });
    }

    if (badges.length === 0) return null;

    if (showLabels) {
        return (
            <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                        <div
                            key={index}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.bgColor}`}
                            title={badge.tooltip}
                        >
                            <Icon className={`${iconSize} ${badge.color}`} />
                            <span className={`text-sm font-medium ${badge.color}`}>
                                {badge.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                    <div
                        key={index}
                        className={`p-1 rounded-full ${badge.bgColor}`}
                        title={badge.tooltip}
                    >
                        <Icon className={`${iconSize} ${badge.color}`} />
                    </div>
                );
            })}
        </div>
    );
};
