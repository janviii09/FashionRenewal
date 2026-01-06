import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Plus, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { wardrobeApi } from '@/lib/api';
import { ItemCondition, ItemAvailability } from '@/types';

const conditions: { value: ItemCondition; label: string }[] = [
    { value: ItemCondition.NEW, label: 'New with tags' },
    { value: ItemCondition.LIKE_NEW, label: 'Like New' },
    { value: ItemCondition.GOOD, label: 'Good' },
    { value: ItemCondition.FAIR, label: 'Fair' },
    { value: ItemCondition.WORN, label: 'Worn' },
];

const addItemSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().optional(),
    brand: z.string().min(1, 'Brand is required').max(50).optional(),
    category: z.string().min(1, 'Category is required'),
    size: z.string().optional(),
    condition: z.nativeEnum(ItemCondition),
    availability: z.nativeEnum(ItemAvailability).default(ItemAvailability.PERSONAL_ONLY),
    rentPricePerDay: z.coerce.number().min(1).optional(),
    sellPrice: z.coerce.number().min(1).optional(),
}).refine((data) => {
    if (data.availability === ItemAvailability.AVAILABLE_FOR_RENT && !data.rentPricePerDay) {
        return false;
    }
    return true;
}, {
    message: 'Rent price is required when available for rent',
    path: ['rentPricePerDay'],
}).refine((data) => {
    if (data.availability === ItemAvailability.AVAILABLE_FOR_SALE && !data.sellPrice) {
        return false;
    }
    return true;
}, {
    message: 'Sell price is required when available for sale',
    path: ['sellPrice'],
});

type AddItemFormData = z.infer<typeof addItemSchema>;

interface AddItemDialogProps {
    trigger?: React.ReactNode;
    onItemAdded?: () => void;
}

export function AddItemDialog({ trigger, onItemAdded }: AddItemDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [imageValidationError, setImageValidationError] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<AddItemFormData>({
        resolver: zodResolver(addItemSchema),
        defaultValues: {
            title: '',
            description: '',
            brand: '',
            category: '',
            size: '',
            condition: ItemCondition.GOOD,
            availability: ItemAvailability.PERSONAL_ONLY, // CRITICAL: Default to PERSONAL_ONLY
            rentPricePerDay: undefined,
            sellPrice: undefined,
        },
    });

    const watchAvailability = form.watch('availability');

    // Validate images whenever availability or image count changes
    useEffect(() => {
        const marketplaceTypes = [
            ItemAvailability.AVAILABLE_FOR_RENT,
            ItemAvailability.AVAILABLE_FOR_SALE,
            ItemAvailability.AVAILABLE_FOR_SWAP,
        ];

        const requiresMinImages = marketplaceTypes.includes(watchAvailability);

        if (requiresMinImages && images.length < 4) {
            setImageValidationError(`At least 4 images required for ${watchAvailability.toLowerCase().replace('_', ' ')} (${images.length} / 4)`);
        } else {
            setImageValidationError(null);
        }
    }, [watchAvailability, images.length]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (images.length + files.length > 5) {
            toast({
                title: 'Too many images',
                description: 'You can upload a maximum of 5 images',
                variant: 'destructive',
            });
            return;
        }

        Array.from(files).forEach((file) => {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Each image must be less than 5MB',
                    variant: 'destructive',
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImages((prev) => [...prev, result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: AddItemFormData) => {
        // Final client-side validation for images
        const marketplaceTypes = [
            ItemAvailability.AVAILABLE_FOR_RENT,
            ItemAvailability.AVAILABLE_FOR_SALE,
            ItemAvailability.AVAILABLE_FOR_SWAP,
        ];

        if (marketplaceTypes.includes(data.availability) && images.length < 4) {
            toast({
                title: 'Validation Error',
                description: 'At least 4 images are required for rent, sell, or exchange listings',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsLoading(true);

            await wardrobeApi.createItem({
                title: data.title,
                category: data.category,
                condition: data.condition,
                images,
                description: data.description,
                brand: data.brand,
                size: data.size,
                availability: data.availability,
                rentPricePerDay: data.rentPricePerDay,
                sellPrice: data.sellPrice,
            });

            toast({
                title: 'Success',
                description: 'Item added to your wardrobe',
            });

            setOpen(false);
            form.reset();
            setImages([]);
            setImageValidationError(null);
            onItemAdded?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to add item',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="gradient">
                        <Plus className="mr-2 h-5 w-5" />
                        Add Item
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Add New Item</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>
                                    Images
                                    {watchAvailability !== ItemAvailability.PERSONAL_ONLY && (
                                        <span className="ml-1 text-destructive">*</span>
                                    )}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {images.length} / 5
                                    {watchAvailability !== ItemAvailability.PERSONAL_ONLY && (
                                        <span className="ml-1 font-medium text-primary">
                                            (4+ required for marketplace)
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {images.map((image, index) => (
                                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                                        <img src={image} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                                            aria-label={`Remove image ${index + 1}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:border-primary">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <span className="mt-1 text-xs text-muted-foreground">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            aria-label="Upload images"
                                        />
                                    </label>
                                )}
                            </div>
                            {imageValidationError && (
                                <p className="text-sm font-medium text-destructive" role="alert">
                                    {imageValidationError}
                                </p>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Title *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Designer Leather Jacket" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Nike, Zara" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Jacket, Dress" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Size</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., M, L, XL" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="condition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Condition *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select condition" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {conditions.map((cond) => (
                                                    <SelectItem key={cond.value} value={cond.value}>
                                                        {cond.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add details about your item (optional)..."
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        You can add this later if you want
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Availability - CRITICAL SECTION */}
                        <FormField
                            control={form.control}
                            name="availability"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Availability *</FormLabel>
                                    <FormDescription>
                                        Keep items private or make them available later — totally up to you.
                                    </FormDescription>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid gap-3 sm:grid-cols-2"
                                        >
                                            <div className="flex items-center space-x-2 rounded-lg border p-3">
                                                <RadioGroupItem value={ItemAvailability.PERSONAL_ONLY} id="personal" />
                                                <Label htmlFor="personal" className="cursor-pointer font-normal">
                                                    Personal Only (Private)
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-lg border p-3">
                                                <RadioGroupItem value={ItemAvailability.AVAILABLE_FOR_RENT} id="rent" />
                                                <Label htmlFor="rent" className="cursor-pointer font-normal">
                                                    Available for Rent
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-lg border p-3">
                                                <RadioGroupItem value={ItemAvailability.AVAILABLE_FOR_SALE} id="sale" />
                                                <Label htmlFor="sale" className="cursor-pointer font-normal">
                                                    Available for Sale
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-lg border p-3">
                                                <RadioGroupItem value={ItemAvailability.AVAILABLE_FOR_SWAP} id="swap" />
                                                <Label htmlFor="swap" className="cursor-pointer font-normal">
                                                    Available for Swap
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Pricing */}
                        {watchAvailability === ItemAvailability.AVAILABLE_FOR_RENT && (
                            <FormField
                                control={form.control}
                                name="rentPricePerDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rent Price (per day) *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="pl-7"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {watchAvailability === ItemAvailability.AVAILABLE_FOR_SALE && (
                            <FormField
                                control={form.control}
                                name="sellPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sell Price *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="pl-7"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="gradient" disabled={isLoading || !!imageValidationError}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Adding...' : 'Add Item'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
