import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <div className="max-w-xl rounded-xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={user?.name || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={user?.email || ''} disabled />
              </div>
              <Button variant="gradient">Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <div className="max-w-xl rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Current Plan: Basic</h3>
            <p className="mt-2 text-muted-foreground">3/5 rentals used this month</p>
            <Button variant="gradient" className="mt-4">Upgrade to Premium</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
