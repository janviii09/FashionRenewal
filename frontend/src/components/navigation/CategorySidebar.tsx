import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface SubCategory {
    name: string;
    items: string[];
}

interface Category {
    id: string;
    name: string;
    subCategories: SubCategory[];
}

const categories: Category[] = [
    {
        id: 'women',
        name: 'Women',
        subCategories: [
            {
                name: 'Indian & Fusion Wear',
                items: [
                    'Kurtas & Suits',
                    'Kurtis, Tunics & Tops',
                    'Sarees',
                    'Ethnic Wear',
                    'Leggings, Salwars & Churidars',
                    'Skirts & Palazzos',
                    'Dress Materials',
                    'Lehenga Cholis',
                    'Dupattas & Shawls',
                    'Jackets',
                ],
            },
            {
                name: 'Western Wear',
                items: [
                    'Dresses',
                    'Tops',
                    'T-shirts',
                    'Jeans',
                    'Trousers & Capris',
                    'Shorts & Skirts',
                    'Co-ords',
                    'Playsuits',
                    'Jumpsuits',
                    'Shrugs',
                    'Sweaters & Sweatshirts',
                    'Jackets & Coats',
                    'Blazers & Waistcoats',
                ],
            },
            {
                name: 'Footwear',
                items: [
                    'Flats',
                    'Casual Shoes',
                    'Heels',
                    'Boots',
                    'Sports Shoes & Floaters',
                ],
            },
            {
                name: 'Accessories & More',
                items: [
                    'Sunglasses & Frames',
                    'Belts, Scarves & More',
                    'Watches & Wearables',
                ],
            },
            {
                name: 'Sports & Active Wear',
                items: [
                    'Clothing',
                    'Footwear',
                    'Sports Accessories',
                    'Sports Equipment',
                ],
            },
        ],
    },
    {
        id: 'men',
        name: 'Men',
        subCategories: [
            {
                name: 'Topwear',
                items: [
                    'T-Shirts',
                    'Casual Shirts',
                    'Formal Shirts',
                    'Sweatshirts',
                    'Sweaters',
                    'Jackets',
                    'Blazers & Coats',
                    'Suits',
                    'Rain Jackets',
                ],
            },
            {
                name: 'Indian & Festive Wear',
                items: [
                    'Kurtas & Kurta Sets',
                    'Sherwanis',
                    'Nehru Jackets',
                    'Dhotis',
                ],
            },
            {
                name: 'Bottomwear',
                items: [
                    'Jeans',
                    'Casual Trousers',
                    'Formal Trousers',
                    'Shorts',
                    'Track Pants & Joggers',
                ],
            },
            {
                name: 'Footwear',
                items: [
                    'Casual Shoes',
                    'Sports Shoes',
                    'Formal Shoes',
                    'Sneakers',
                    'Sandals & Floaters',
                    'Flip Flops',
                    'Socks',
                ],
            },
            {
                name: 'Sports & Active Wear',
                items: [
                    'Sports Shoes',
                    'Sports Sandals',
                    'Active T-Shirts',
                    'Track Pants & Shorts',
                    'Tracksuits',
                    'Jackets & Sweatshirts',
                    'Sports Accessories',
                    'Swimwear',
                ],
            },
            {
                name: 'Accessories',
                items: [
                    'Watches',
                    'Belts',
                    'Wallets',
                    'Sunglasses',
                    'Bags',
                    'Luggages',
                    'Caps & Hats',
                ],
            },
        ],
    },
    {
        id: 'kids',
        name: 'Kids',
        subCategories: [
            {
                name: 'Boys Clothing',
                items: [
                    'T-Shirts',
                    'Shirts',
                    'Shorts',
                    'Jeans',
                    'Trousers',
                    'Clothing Sets',
                    'Ethnic Wear',
                    'Track Pants & Pyjamas',
                    'Jacket, Sweater & Sweatshirts',
                    'Party Wear',
                    'Innerwear & Thermals',
                    'Nightwear & Loungewear',
                    'Value Packs',
                ],
            },
            {
                name: 'Girls Clothing',
                items: [
                    'Dresses',
                    'Tops',
                    'T-Shirts',
                    'Clothing Sets',
                    'Lehenga Choli',
                    'Kurta Sets',
                    'Party Wear',
                    'Dungarees & Jumpsuits',
                    'Skirts & Shorts',
                    'Tights & Leggings',
                    'Jeans, Trousers & Capris',
                    'Jacket, Sweater & Sweatshirts',
                    'Innerwear & Thermals',
                    'Nightwear & Loungewear',
                    'Value Packs',
                ],
            },
            {
                name: 'Footwear',
                items: [
                    'Casual Shoes',
                    'Flipflops',
                    'Sports Shoes',
                    'Flats',
                    'Sandals',
                    'Heels',
                    'Socks',
                ],
            },
            {
                name: 'Toys & Games',
                items: [
                    'Learning & Development',
                    'Activity Toys',
                    'Soft Toys',
                    'Action Figure / Play set',
                ],
            },
            {
                name: 'Infants',
                items: [
                    'Bodysuits',
                    'Rompers & Sleepsuits',
                    'Clothing Sets',
                    'Tshirts & Tops',
                    'Dresses',
                    'Bottom Wear',
                    'Winter Wear',
                    'Innerwear & Sleepwear',
                    'Infant Care',
                ],
            },
            {
                name: 'Kids Accessories',
                items: [
                    'Bags & Backpacks',
                    'Watches',
                    'Jewellery & Hair accessory',
                    'Sunglasses',
                    'Caps & Hats',
                ],
            },
        ],
    },
];

interface CategorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileSubcategories, setShowMobileSubcategories] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setExpandedCategory(null);
            setShowMobileSubcategories(false);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleCategoryClick = (categoryId: string) => {
        if (isMobile) {
            setExpandedCategory(categoryId);
            setShowMobileSubcategories(true);
        } else {
            setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
        }
    };

    const handleBackToCategories = () => {
        setShowMobileSubcategories(false);
        setExpandedCategory(null);
    };

    const handleItemClick = () => {
        onClose();
    };

    const expandedCategoryData = categories.find((cat) => cat.id === expandedCategory);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full bg-white z-50 transition-transform duration-300 ease-in-out',
                    'w-full md:w-80 shadow-2xl',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
                role="navigation"
                aria-label="Category navigation"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    {isMobile && showMobileSubcategories ? (
                        <button
                            onClick={handleBackToCategories}
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                            aria-label="Back to categories"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back</span>
                        </button>
                    ) : (
                        <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="h-[calc(100%-65px)] overflow-y-auto">
                    {/* Mobile: Show subcategories view */}
                    {isMobile && showMobileSubcategories && expandedCategoryData ? (
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {expandedCategoryData.name}
                            </h3>
                            <div className="space-y-6">
                                {expandedCategoryData.subCategories.map((subCat, idx) => (
                                    <div key={idx}>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                            {subCat.name}
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {subCat.items.map((item, itemIdx) => (
                                                <li key={itemIdx}>
                                                    <Link
                                                        to={`/browse?category=${encodeURIComponent(item)}`}
                                                        onClick={handleItemClick}
                                                        className="block py-1.5 text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all"
                                                    >
                                                        {item}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Desktop & Mobile: Main categories list */
                        <div className="py-2">
                            {categories.map((category) => (
                                <div key={category.id} className="border-b border-gray-100 last:border-0">
                                    {/* Category Header */}
                                    <button
                                        onClick={() => handleCategoryClick(category.id)}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                                        aria-expanded={expandedCategory === category.id}
                                        aria-controls={`category-${category.id}`}
                                    >
                                        <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                            {category.name}
                                        </span>
                                        {expandedCategory === category.id && !isMobile ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                        )}
                                    </button>

                                    {/* Subcategories (Desktop only) */}
                                    {!isMobile && expandedCategory === category.id && (
                                        <div
                                            id={`category-${category.id}`}
                                            className="px-4 pb-4 pt-2 bg-gray-50/50"
                                        >
                                            <div className="grid grid-cols-1 gap-4">
                                                {category.subCategories.map((subCat, idx) => (
                                                    <div key={idx}>
                                                        <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                                            {subCat.name}
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {subCat.items.map((item, itemIdx) => (
                                                                <li key={itemIdx}>
                                                                    <Link
                                                                        to={`/browse?category=${encodeURIComponent(item)}`}
                                                                        onClick={handleItemClick}
                                                                        className="block py-1 text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all"
                                                                    >
                                                                        {item}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
