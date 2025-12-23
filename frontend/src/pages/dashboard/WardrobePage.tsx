import { Plus, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WardrobePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Wardrobe</h1>
          <p className="text-muted-foreground">Manage your listed items</p>
        </div>
        <Button variant="gradient">
          <Plus className="mr-2 h-5 w-5" />
          Add Item
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="rented">Rented Out</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Shirt className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No items yet</h3>
            <p className="mt-2 text-muted-foreground">Add your first item to start earning</p>
            <Button variant="gradient" className="mt-4">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Item
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
