import { useState, useEffect } from 'react';
import { Shirt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddItemDialog } from '@/components/items/AddItemDialog';
import { ItemCard } from '@/components/items/ItemCard';
import { useToast } from '@/hooks/use-toast';
import { wardrobeApi } from '@/lib/api';
import type { WardrobeItem } from '@/types';
import { ItemAvailability } from '@/types';

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await wardrobeApi.getMyWardrobe();
      setItems(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load wardrobe',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const personalItems = items.filter((item) => item.availability === ItemAvailability.PERSONAL_ONLY);
  const availableItems = items.filter((item) => item.availability !== ItemAvailability.PERSONAL_ONLY);

  const handleItemAdded = () => {
    fetchItems();
    toast({
      title: 'Success',
      description: 'Item added to your wardrobe',
    });
  };

  const handleItemDeleted = async (id: number) => {
    try {
      await wardrobeApi.deleteItem(id);
      setItems(items.filter((item) => item.id !== id));
      toast({
        title: 'Success',
        description: 'Item deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
      <Shirt className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold">{message}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Add items to your personal wardrobe or make them available to rent/sell
      </p>
      <AddItemDialog
        onItemAdded={handleItemAdded}
        trigger={
          <Button variant="gradient" className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Item
          </Button>
        }
      />
    </div>
  );

  const ItemsGrid = ({ items }: { items: WardrobeItem[] }) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          showActions
          onDelete={() => handleItemDeleted(item.id)}
          onUpdate={fetchItems}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Wardrobe</h1>
          <p className="text-muted-foreground">
            Manage your personal items and listings
          </p>
        </div>
        <AddItemDialog onItemAdded={handleItemAdded} />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
          <TabsTrigger value="personal">Personal Only ({personalItems.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {items.length > 0 ? (
            <ItemsGrid items={items} />
          ) : (
            <EmptyState message="No items yet" />
          )}
        </TabsContent>

        <TabsContent value="personal" className="mt-6">
          {personalItems.length > 0 ? (
            <ItemsGrid items={personalItems} />
          ) : (
            <EmptyState message="No personal items" />
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {availableItems.length > 0 ? (
            <ItemsGrid items={availableItems} />
          ) : (
            <EmptyState message="No items available for rent/sale" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
