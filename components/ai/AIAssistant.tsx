'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ListTodo,
  FileText,
  Clock,
  Brain,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: (input?: string) => Promise<void>;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quick actions
  const actions: AIAction[] = [
    {
      id: 'capture-smart',
      label: 'Smart Capture',
      description: 'Capture and auto-categorize an item',
      icon: ListTodo,
      action: async (input) => {
        if (!input?.trim()) {
          toast.error('Please enter something to capture');
          return;
        }
        setIsProcessing(true);
        try {
          const response = await fetch('/api/ai/smart-capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input }),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          setResult(`Captured "${data.title}" to ${data.destination}`);
          toast.success('Item captured and categorized!');
          setInput('');
        } catch (error) {
          toast.error('Failed to capture item');
        } finally {
          setIsProcessing(false);
        }
      },
    },
    {
      id: 'expand-notes',
      label: 'Expand Notes',
      description: 'Expand brief notes into detailed content',
      icon: FileText,
      action: async (input) => {
        if (!input?.trim()) {
          toast.error('Please enter notes to expand');
          return;
        }
        setIsProcessing(true);
        try {
          const response = await fetch('/api/ai/expand-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: input }),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          setResult(data.expanded);
        } catch (error) {
          toast.error('Failed to expand notes');
        } finally {
          setIsProcessing(false);
        }
      },
    },
    {
      id: 'extract-date',
      label: 'Extract Date',
      description: 'Extract date/time from natural language',
      icon: Clock,
      action: async (input) => {
        if (!input?.trim()) {
          toast.error('Please enter text with a date');
          return;
        }
        setIsProcessing(true);
        try {
          const response = await fetch('/api/ai/extract-date', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input }),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          if (data.has_date) {
            setResult(`Date: ${data.date}${data.time ? ` at ${data.time}` : ''}\nClean text: ${data.cleaned_text}`);
          } else {
            setResult('No date found in the text');
          }
        } catch (error) {
          toast.error('Failed to extract date');
        } finally {
          setIsProcessing(false);
        }
      },
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      description: 'Generate ideas around a topic',
      icon: Lightbulb,
      action: async (input) => {
        if (!input?.trim()) {
          toast.error('Please enter a topic to brainstorm');
          return;
        }
        setIsProcessing(true);
        try {
          const response = await fetch('/api/ai/brainstorm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: input }),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          setResult(data.ideas);
        } catch (error) {
          toast.error('Failed to brainstorm');
        } finally {
          setIsProcessing(false);
        }
      },
    },
  ];

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setInput('');
      setResult(null);
      setSelectedAction(null);
    }
  }, [isOpen]);

  const handleActionClick = (action: AIAction) => {
    setSelectedAction(action.id);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = async () => {
    const action = actions.find((a) => a.id === selectedAction);
    if (action) {
      await action.action(input);
    } else {
      toast.info('Select an action first');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div className="rounded-xl border border-border bg-card shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">AI Assistant</h2>
                    <p className="text-xs text-muted-foreground">Press ⌘J to toggle</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Quick Actions */}
                {!selectedAction && !result && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">What would you like to do?</p>
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <action.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{action.label}</p>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Input area */}
                {selectedAction && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAction(null);
                          setResult(null);
                        }}
                      >
                        ← Back
                      </Button>
                      <span className="font-medium">
                        {actions.find((a) => a.id === selectedAction)?.label}
                      </span>
                    </div>

                    <div className="relative">
                      <Textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type here..."
                        className="min-h-[80px] resize-none pr-12"
                        disabled={isProcessing}
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2"
                        onClick={handleSubmit}
                        disabled={isProcessing || !input.trim()}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Result */}
                    {result && (
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Result:</p>
                        <p className="whitespace-pre-wrap">{result}</p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(result);
                              toast.success('Copied!');
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setResult(null);
                              setInput('');
                            }}
                          >
                            New
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
