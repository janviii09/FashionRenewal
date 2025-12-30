import { ChevronDown } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface SortOption {
    field: string;
    order: 'asc' | 'desc';
    label: string;
}

export const sortOptions: SortOption[] = [
    { field: 'createdAt', order: 'desc', label: 'Latest First' },
    { field: 'rentPricePerDay', order: 'asc', label: 'Price: Low to High' },
    { field: 'rentPricePerDay', order: 'desc', label: 'Price: High to Low' },
    { field: 'views', order: 'desc', label: 'Most Popular' },
];

interface SortDropdownProps {
    value: SortOption;
    onChange: (option: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
    const handleChange = (optionLabel: string) => {
        const option = sortOptions.find(opt => opt.label === optionLabel);
        if (option) {
            onChange(option);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select value={value.label} onValueChange={handleChange}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map((option) => (
                        <SelectItem key={option.label} value={option.label}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
