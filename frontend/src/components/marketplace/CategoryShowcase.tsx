import { CategoryCard } from './CategoryCard';

interface Category {
    id: string;
    title: string;
    image: string;
    link: string;
}

interface CategoryShowcaseProps {
    title?: string;
    subtitle?: string;
    categories: Category[];
}

export function CategoryShowcase({ title, subtitle, categories }: CategoryShowcaseProps) {
    return (
        <section className="py-12">
            {(title || subtitle) && (
                <div className="mb-8">
                    {title && (
                        <h2 className="text-3xl font-bold text-foreground">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="mt-2 text-lg text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        title={category.title}
                        image={category.image}
                        link={category.link}
                    />
                ))}
            </div>
        </section>
    );
}
