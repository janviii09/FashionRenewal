import { ShoppingBag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground">Track your rentals and purchases</p>
      </div>

      <Tabs defaultValue="renter">
        <TabsList>
          <TabsTrigger value="renter">As Renter</TabsTrigger>
          <TabsTrigger value="owner">As Owner</TabsTrigger>
        </TabsList>
        <TabsContent value="renter" className="mt-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
            <p className="mt-2 text-muted-foreground">Browse items to start renting</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
