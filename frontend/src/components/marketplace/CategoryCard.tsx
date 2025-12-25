import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
    title: string;
    image: string;
    link: string;
    className?: string;
    overlay?: boolean;
}

export function CategoryCard({ title, image, link, className, overlay = true }: CategoryCardProps) {
    return (
        <Link
            to={link}
            className={cn(
                'group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl',
                className
            )}
        >
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient overlay */}
                {overlay && (
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                )}
            </div>

            {/* Title overlay */}
            <div className="absolute inset-0 flex items-end p-6">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg transition-transform duration-300 group-hover:translate-y-[-4px]">
                    {title}
                </h3>
            </div>

            {/* Hover effect border */}
            <div className="absolute inset-0 border-2 border-transparent transition-colors duration-300 group-hover:border-primary/50 rounded-2xl" />
        </Link>
    );
}
