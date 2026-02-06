'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  CheckCircle2,
  Key,
  MoreHorizontal,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SubscriptionStatus, PricingSection } from '@/components/subscription';
import { IconPicker } from '@/components/shared/IconPicker';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { ICON_MAP, COLOR_PALETTE, getSuggestedColor } from '@/components/icons';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import type { Profile, Destination } from '@/types/database';

interface SettingsPageClientProps {
  user: User;
  profile: Profile | null;
  destinations: Destination[];
}

interface TelegramConnection {
  connected: boolean;
  username?: string;
  firstName?: string;
}

export function SettingsPageClient({ user, profile, destinations: initialDestinations }: SettingsPageClientProps) {
  const getSupabase = () => createClient();
  const searchParams = useSearchParams();
  const { isExpired, isTrial, refresh } = useSubscription();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [telegramConnection, setTelegramConnection] = useState<TelegramConnection | null>(null);
  const [telegramCode, setTelegramCode] = useState<string | null>(null);
  const [isLoadingTelegram, setIsLoadingTelegram] = useState(true);
  const [extensionApiKey, setExtensionApiKey] = useState<string | null>(null);
  const [isLoadingExtension, setIsLoadingExtension] = useState(true);

  // Destinations state
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [isDestDialogOpen, setIsDestDialogOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const suggestedColor = getSuggestedColor(destinations.length);
  const [destForm, setDestForm] = useState({
    name: '',
    slug: '',
    icon: 'list-todo',
    color: suggestedColor.value,
    description: '',
  });
  const [isDestSaving, setIsDestSaving] = useState(false);

  // Handle checkout result
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated! Thank you for your support.');
      refresh();
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout canceled');
    }
  }, [searchParams, refresh]);

  // Fetch Telegram connection status
  const fetchTelegramStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/telegram/connect');
      const data = await res.json();
      setTelegramConnection(data);
    } catch (error) {
      console.error('Failed to fetch Telegram status');
    } finally {
      setIsLoadingTelegram(false);
    }
  }, []);

  useEffect(() => {
    fetchTelegramStatus();
  }, [fetchTelegramStatus]);

  // Generate Telegram connection code
  const handleGenerateTelegramCode = async () => {
    try {
      const res = await fetch('/api/telegram/connect', { method: 'POST' });
      const data = await res.json();
      if (data.code) {
        setTelegramCode(data.code);
        toast.success('Connection code generated!');
      }
    } catch (error) {
      toast.error('Failed to generate code');
    }
  };

  // Disconnect Telegram
  const handleDisconnectTelegram = async () => {
    if (!confirm('Disconnect Telegram? You will need to reconnect to capture via Telegram.')) return;

    try {
      await fetch('/api/telegram/connect', { method: 'DELETE' });
      setTelegramConnection({ connected: false });
      toast.success('Telegram disconnected');
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  // Fetch extension API key status
  const fetchExtensionKey = useCallback(async () => {
    try {
      const res = await fetch('/api/extension/key');
      const data = await res.json();
      if (data.apiKey) {
        setExtensionApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Failed to fetch extension key');
    } finally {
      setIsLoadingExtension(false);
    }
  }, []);

  useEffect(() => {
    fetchExtensionKey();
  }, [fetchExtensionKey]);

  // Generate extension API key
  const handleGenerateExtensionKey = async () => {
    try {
      const res = await fetch('/api/extension/key', { method: 'POST' });
      const data = await res.json();
      if (data.apiKey) {
        setExtensionApiKey(data.apiKey);
        toast.success('API key generated!');
      }
    } catch (error) {
      toast.error('Failed to generate key');
    }
  };

  // Delete extension API key
  const handleDeleteExtensionKey = async () => {
    if (!confirm('Delete API key? The extension will stop working until you generate a new one.')) return;

    try {
      await fetch('/api/extension/key', { method: 'DELETE' });
      setExtensionApiKey(null);
      toast.success('API key deleted');
    } catch (error) {
      toast.error('Failed to delete key');
    }
  };

  // Destination management functions
  const resetDestForm = () => {
    const newSuggestedColor = getSuggestedColor(destinations.length);
    setDestForm({
      name: '',
      slug: '',
      icon: 'list-todo',
      color: newSuggestedColor.value,
      description: '',
    });
  };

  const openCreateDestination = () => {
    setEditingDest(null);
    resetDestForm();
    setIsDestDialogOpen(true);
  };

  const openEditDestination = (dest: Destination) => {
    setEditingDest(dest);
    setDestForm({
      name: dest.name,
      slug: dest.slug,
      icon: dest.icon,
      color: dest.color,
      description: '', // We'll add description to schema later if needed
    });
    setIsDestDialogOpen(true);
  };

  const handleSaveDestination = async () => {
    if (!destForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsDestSaving(true);
    const supabase = getSupabase();

    try {
      // Generate slug from name if not editing
      const slug = destForm.slug || destForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      if (editingDest) {
        // Update existing destination
        const { error } = await supabase
          .from('destinations')
          .update({
            name: destForm.name.trim(),
            slug,
            icon: destForm.icon,
            color: destForm.color,
          } as any)
          .eq('id', editingDest.id);

        if (error) throw error;

        setDestinations(destinations.map(d =>
          d.id === editingDest.id
            ? { ...d, name: destForm.name.trim(), slug, icon: destForm.icon, color: destForm.color }
            : d
        ));
        toast.success('Destination updated');
      } else {
        // Create new destination
        const { data, error } = await supabase
          .from('destinations')
          .insert({
            user_id: user.id,
            name: destForm.name.trim(),
            slug,
            icon: destForm.icon,
            color: destForm.color,
            is_default: false,
            is_system: false,
            sort_order: destinations.length,
          } as any)
          .select()
          .single();

        if (error) throw error;

        setDestinations([...destinations, data as Destination]);
        toast.success('Destination created');
      }

      setIsDestDialogOpen(false);
      setEditingDest(null);
      resetDestForm();
    } catch (error) {
      console.error('Error saving destination:', error);
      toast.error('Failed to save destination');
    } finally {
      setIsDestSaving(false);
    }
  };

  const handleDeleteDestination = async (destId: string) => {
    const dest = destinations.find(d => d.id === destId);
    if (dest?.is_system) {
      toast.error('Cannot delete system destinations');
      return;
    }

    if (!confirm('Delete this destination? Items will be unassigned.')) return;

    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destId);

      if (error) throw error;

      setDestinations(destinations.filter(d => d.id !== destId));
      toast.success('Destination deleted');
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast.error('Failed to delete destination');
    }
  };

  const handleSaveProfile = async () => {
    const supabase = getSupabase();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName } as any)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Subscription Status */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Subscription</h2>
            <SubscriptionStatus />
          </section>

          {/* Pricing (show if trial or expired) */}
          {(isTrial || isExpired) && (
            <section>
              <PricingSection />
            </section>
          )}

          {/* Telegram Integration */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Telegram Bot</h2>
            <div className="rounded-lg border bg-card p-6">
              {isLoadingTelegram ? (
                <div className="animate-pulse">
                  <div className="h-4 w-32 rounded bg-muted" />
                </div>
              ) : telegramConnection?.connected ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Connected</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {telegramConnection.firstName}
                      {telegramConnection.username && ` (@${telegramConnection.username})`}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDisconnectTelegram}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect Telegram to capture items instantly by sending messages to our bot.
                  </p>
                  {telegramCode ? (
                    <div className="space-y-2">
                      <p className="text-sm">Your connection code:</p>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-4 py-2 text-2xl font-mono font-bold tracking-widest">
                          {telegramCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(telegramCode);
                            toast.success('Copied!');
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Send <code>/connect {telegramCode}</code> to @OffMindBot on Telegram
                      </p>
                    </div>
                  ) : (
                    <Button onClick={handleGenerateTelegramCode}>
                      Generate Connection Code
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Browser Extension */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Browser Extension</h2>
            <div className="rounded-lg border bg-card p-6">
              {isLoadingExtension ? (
                <div className="animate-pulse">
                  <div className="h-4 w-32 rounded bg-muted" />
                </div>
              ) : extensionApiKey ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        <span className="font-medium">API Key Active</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Copy this key to your browser extension
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleDeleteExtensionKey}>
                      Revoke
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-xs break-all">
                      {extensionApiKey}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(extensionApiKey);
                        toast.success('Copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Generate an API key to use the browser extension for quick capture.
                  </p>
                  <Button onClick={handleGenerateExtensionKey}>
                    Generate API Key
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Profile Settings */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Profile</h2>
            <div className="rounded-lg border bg-card p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Contact support to change your email
                  </p>
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </section>

          {/* Destinations Management */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Destinations</h2>
              <Button size="sm" onClick={openCreateDestination}>
                <Plus className="mr-2 h-4 w-4" />
                Add Destination
              </Button>
            </div>
            <div className="rounded-lg border bg-card">
              {destinations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No destinations yet. Create your first destination to organize your items.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {destinations.map((dest) => {
                    const Icon = ICON_MAP[dest.icon] || ICON_MAP['list-todo'];
                    const colorOption = COLOR_PALETTE.find(c => c.value === dest.color);

                    return (
                      <div
                        key={dest.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          colorOption?.bgSubtle || 'bg-muted'
                        )}>
                          <Icon className={cn('h-5 w-5', colorOption?.text || 'text-muted-foreground')} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{dest.name}</span>
                            {dest.is_system && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                System
                              </span>
                            )}
                            {dest.is_default && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {dest.slug}
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDestination(dest)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {!dest.is_system && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteDestination(dest.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-red-500">Danger Zone</h2>
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Destination Create/Edit Dialog */}
      <Dialog open={isDestDialogOpen} onOpenChange={setIsDestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDest ? 'Edit Destination' : 'Create Destination'}
            </DialogTitle>
            <DialogDescription>
              {editingDest
                ? 'Update your destination details.'
                : 'Create a new destination to organize your items.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dest-name">Name</Label>
              <Input
                id="dest-name"
                value={destForm.name}
                onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                placeholder="e.g., Ideas, Research, Someday"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconPicker
                  value={destForm.icon}
                  onChange={(icon) => setDestForm({ ...destForm, icon })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <ColorPicker
                  value={destForm.color}
                  onChange={(color) => setDestForm({ ...destForm, color })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDestination} disabled={isDestSaving}>
              {isDestSaving ? 'Saving...' : editingDest ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
