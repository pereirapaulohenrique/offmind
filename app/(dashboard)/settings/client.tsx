'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubscriptionStatus, PricingSection } from '@/components/subscription';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface SettingsPageClientProps {
  user: User;
  profile: Profile | null;
}

interface TelegramConnection {
  connected: boolean;
  username?: string;
  firstName?: string;
}

export function SettingsPageClient({ user, profile }: SettingsPageClientProps) {
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
                      <span className="text-2xl">✅</span>
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
                        Send <code>/connect {telegramCode}</code> to @MindBaseBot on Telegram
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
                        <span className="text-2xl">🔑</span>
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
    </div>
  );
}
