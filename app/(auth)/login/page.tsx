'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, KeyRound } from 'lucide-react';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create client lazily to avoid SSR issues
  const getSupabase = () => createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'Check your email for the magic link!',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please enter your email and password' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        router.push('/inbox');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Background gradient */}
      <div className="gradient-mesh absolute inset-0 opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <OffMindLogo size={48} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your OffMind account
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-black/5 backdrop-blur-sm">
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-5">
              <TabsTrigger value="password" className="gap-2 text-xs">
                <KeyRound className="h-3.5 w-3.5" />
                Password
              </TabsTrigger>
              <TabsTrigger value="magic" className="gap-2 text-xs">
                <Mail className="h-3.5 w-3.5" />
                Magic Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-password" className="text-xs">Email</Label>
                  <Input
                    id="email-password"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    autoFocus
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-10"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-magic" className="text-xs">Email</Label>
                  <Input
                    id="email-magic"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    className="h-10"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-lg p-3 text-sm ${
                message.type === 'success'
                  ? 'bg-success-subtle text-success'
                  : 'bg-error-subtle text-error'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
