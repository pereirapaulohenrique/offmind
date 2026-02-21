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
  X,
  Users,
  UserPlus,
  Loader2,
  Sparkles,
  Download,
  AlertTriangle,
  MessageSquare,
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
import { useContacts } from '@/hooks/useContacts';
import { FeedbackWidget } from '@/components/shared/FeedbackWidget';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@supabase/supabase-js';
import type { Profile, Destination, Contact } from '@/types/database';
import type { CustomFieldDefinition } from '@/types';

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
    custom_fields: [] as CustomFieldDefinition[],
  });
  const [isDestSaving, setIsDestSaving] = useState(false);

  // Contacts state
  const { contacts, isLoading: isContactsLoading, addContact, updateContact, deleteContact } = useContacts(user.id);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [isContactSaving, setIsContactSaving] = useState(false);

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ migrated: number; total: number } | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
      custom_fields: [],
    });
  };

  const openCreateDestination = () => {
    setEditingDest(null);
    resetDestForm();
    setIsDestDialogOpen(true);
  };

  const openEditDestination = (dest: Destination) => {
    setEditingDest(dest);
    const fields = Array.isArray(dest.custom_fields)
      ? (dest.custom_fields as unknown as CustomFieldDefinition[])
      : [];
    setDestForm({
      name: dest.name,
      slug: dest.slug,
      icon: dest.icon,
      color: dest.color,
      description: '',
      custom_fields: fields,
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
            custom_fields: destForm.custom_fields,
          } as any)
          .eq('id', editingDest.id);

        if (error) throw error;

        setDestinations(destinations.map(d =>
          d.id === editingDest.id
            ? { ...d, name: destForm.name.trim(), slug, icon: destForm.icon, color: destForm.color, custom_fields: destForm.custom_fields as any }
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

  // Contact management functions
  const resetContactForm = () => setContactForm({ name: '', email: '', phone: '', notes: '' });

  const openCreateContact = () => {
    setEditingContact(null);
    resetContactForm();
    setIsContactDialogOpen(true);
  };

  const openEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      notes: contact.notes || '',
    });
    setIsContactDialogOpen(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.name.trim()) { toast.error('Name is required'); return; }
    setIsContactSaving(true);
    try {
      if (editingContact) {
        await updateContact(editingContact.id, {
          name: contactForm.name.trim(),
          email: contactForm.email || null,
          phone: contactForm.phone || null,
          notes: contactForm.notes || null,
        });
        toast.success('Contact updated');
      } else {
        await addContact({
          name: contactForm.name.trim(),
          email: contactForm.email || null,
          phone: contactForm.phone || null,
          notes: contactForm.notes || null,
        });
        toast.success('Contact added');
      }
      setIsContactDialogOpen(false);
      resetContactForm();
      setEditingContact(null);
    } catch {
      toast.error('Failed to save contact');
    } finally {
      setIsContactSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact(id);
      toast.success('Contact deleted');
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const handleMigrateTitles = async () => {
    if (!confirm('This will move existing title content to notes and generate new AI titles. Only items without notes will be affected. Continue?')) return;

    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await fetch('/api/ai/migrate-titles', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Migration failed');
      setMigrationResult({ migrated: data.migrated, total: data.total });
      toast.success(`Migrated ${data.migrated} items`);
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed. Check console for details.');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offmind-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE MY ACCOUNT' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Deletion failed');
      }

      toast.success('Account deleted. Goodbye.');
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-5 sm:px-8" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>Settings</h1>
        <p className="hidden text-sm text-[var(--text-muted)] sm:block">
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
            <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-6">
              {isLoadingTelegram ? (
                <div className="animate-pulse">
                  <div className="h-4 w-32 rounded bg-[var(--bg-hover)]" />
                </div>
              ) : telegramConnection?.connected ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Connected</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
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
                  <p className="text-sm text-[var(--text-muted)]">
                    Connect Telegram to capture items instantly by sending messages to our bot.
                  </p>
                  {telegramCode ? (
                    <div className="space-y-2">
                      <p className="text-sm">Your connection code:</p>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-[var(--bg-hover)] px-4 py-2 text-2xl font-mono font-bold tracking-widest">
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
                      <p className="text-xs text-[var(--text-muted)]">
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
            <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-6">
              {isLoadingExtension ? (
                <div className="animate-pulse">
                  <div className="h-4 w-32 rounded bg-[var(--bg-hover)]" />
                </div>
              ) : extensionApiKey ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        <span className="font-medium">API Key Active</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Copy this key to your browser extension
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleDeleteExtensionKey}>
                      Revoke
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-[var(--bg-hover)] px-3 py-2 font-mono text-xs break-all">
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
                  <p className="text-sm text-[var(--text-muted)]">
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
            <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-6">
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
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
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

          {/* People */}
          <section>
            <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] border border-[var(--border-subtle)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[var(--text-muted)]" />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">People</h2>
                </div>
                <Button
                  size="sm"
                  onClick={openCreateContact}
                  className="gap-2 rounded-xl bg-[var(--accent-base)] text-white hover:bg-[var(--accent-hover)]"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Person
                </Button>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Manage contacts for waiting-for references and @mentions.
              </p>

              {isContactsLoading ? (
                <div className="text-sm text-[var(--text-muted)]">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border-default)] p-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-[var(--text-disabled)] mb-2" />
                  <p className="text-sm text-[var(--text-muted)]">No contacts yet. Add people you work with.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{contact.name}</p>
                        {contact.email && (
                          <p className="text-xs text-[var(--text-muted)] truncate">{contact.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          onClick={() => openEditContact(contact)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[var(--text-muted)] hover:text-red-400"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] overflow-hidden">
              {destinations.length === 0 ? (
                <div className="p-6 text-center text-[var(--text-muted)]">
                  No destinations yet. Create your first destination to organize your items.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {destinations.map((dest) => {
                    const Icon = ICON_MAP[dest.icon] || ICON_MAP['list-todo'];
                    const colorOption = COLOR_PALETTE.find(c => c.value === dest.color);

                    return (
                      <div
                        key={dest.id}
                        className="flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors duration-200"
                      >
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
                        )}>
                          <Icon className={cn('h-5 w-5', colorOption?.text || 'text-[var(--text-muted)]')} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{dest.name}</span>
                            {dest.is_system && (
                              <span className="rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                                System
                              </span>
                            )}
                            {dest.is_default && (
                              <span className="rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-xs text-[var(--accent-base)]">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">
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

          {/* Data Migration */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Data Migration</h2>
            <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="font-medium text-[var(--text-primary)]">Migrate Titles to Notes</h3>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Move captured content from titles to notes and generate new AI-powered titles.
                Only affects items that don&apos;t already have notes.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleMigrateTitles}
                  disabled={isMigrating}
                  className="gap-2"
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    'Migrate Titles → Notes'
                  )}
                </Button>
                {migrationResult && (
                  <p className="text-sm text-emerald-400">
                    {migrationResult.migrated} of {migrationResult.total} items migrated
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Your Data */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Your Data</h2>
            <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Export All Data</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Download all your items, projects, spaces, pages, contacts, and settings as JSON.
                  </p>
                </div>
                <Button onClick={handleExportData} disabled={isExporting} className="gap-2">
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Feedback</h2>
            <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Send Feedback</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Report a bug, request a feature, or share your thoughts.
                  </p>
                </div>
                <Button onClick={() => setShowFeedback(true)} className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </Button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-red-500">Danger Zone</h2>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>

              <div className="border-t border-red-500/20 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="font-medium text-red-500">Delete Account</h3>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                  </div>
                  {!showDeleteConfirm ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Account
                    </Button>
                  ) : null}
                </div>

                {showDeleteConfirm && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
                    <p className="text-sm font-medium text-red-400">
                      This will permanently delete:
                    </p>
                    <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-5">
                      <li>All your items, projects, spaces, and pages</li>
                      <li>All contacts and destinations</li>
                      <li>All uploaded files and recordings</li>
                      <li>Your subscription (will be canceled)</li>
                      <li>Your account credentials</li>
                    </ul>
                    <p className="text-sm text-[var(--text-muted)]">
                      We recommend exporting your data first.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="delete-confirm" className="text-sm text-red-400">
                        Type <strong>DELETE MY ACCOUNT</strong> to confirm
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        className="border-red-500/30 bg-red-500/5"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                        className="gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Permanently Delete'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
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

            {/* Custom Fields */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Custom Fields</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    const newField: CustomFieldDefinition = {
                      id: crypto.randomUUID(),
                      name: '',
                      type: 'text',
                    };
                    setDestForm({
                      ...destForm,
                      custom_fields: [...destForm.custom_fields, newField],
                    });
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Add Field
                </Button>
              </div>

              {destForm.custom_fields.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] py-2">
                  No custom fields. Add fields to collect extra info for items in this destination.
                </p>
              ) : (
                <div className="space-y-2">
                  {destForm.custom_fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 rounded-xl bg-[var(--bg-hover)] p-2.5"
                    >
                      <Input
                        value={field.name}
                        onChange={(e) => {
                          const updated = [...destForm.custom_fields];
                          updated[idx] = { ...field, name: e.target.value };
                          setDestForm({ ...destForm, custom_fields: updated });
                        }}
                        placeholder="Field name"
                        className="h-8 text-xs flex-1"
                      />
                      <Select
                        value={field.type}
                        onValueChange={(val) => {
                          const updated = [...destForm.custom_fields];
                          updated[idx] = { ...field, type: val as CustomFieldDefinition['type'] };
                          setDestForm({ ...destForm, custom_fields: updated });
                        }}
                      >
                        <SelectTrigger className="h-8 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="longtext">Long Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="dropdown">Dropdown</SelectItem>
                          <SelectItem value="multiselect">Multi-select</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-[var(--text-muted)] hover:text-destructive"
                        onClick={() => {
                          setDestForm({
                            ...destForm,
                            custom_fields: destForm.custom_fields.filter((_, i) => i !== idx),
                          });
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Feedback Widget */}
      <FeedbackWidget open={showFeedback} onOpenChange={setShowFeedback} />

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={(open) => { if (!open) { setIsContactDialogOpen(false); setEditingContact(null); resetContactForm(); } }}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">Name *</Label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                className="rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">Email</Label>
              <Input
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
                type="email"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">Phone</Label>
              <Input
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 234 567 890"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">Notes</Label>
              <Textarea
                value={contactForm.notes}
                onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any notes about this person..."
                className="rounded-xl min-h-[80px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsContactDialogOpen(false); setEditingContact(null); resetContactForm(); }} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSaveContact}
              disabled={isContactSaving || !contactForm.name.trim()}
              className="rounded-xl bg-[var(--accent-base)] text-white hover:bg-[var(--accent-hover)]"
            >
              {isContactSaving ? 'Saving...' : editingContact ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
