'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  Combine,
  Trash2,
  Type,
  Calendar,
  ChevronDown,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Item, Destination } from '@/types/database';
import { toast } from 'sonner';

export type BulkAIAction = 'categorize' | 'merge' | 'cleanup' | 'improve' | 'schedule';

interface BulkAISuggestion {
  itemId: string;
  itemTitle: string;
  suggestion: string;
  destinationSlug?: string;
  confidence: number;
  reasoning: string;
  accepted?: boolean;
}

interface BulkAIActionsProps {
  items: Item[];
  destinations: Destination[];
  pageType: 'capture' | 'process' | 'commit';
  onApplySuggestions: (suggestions: BulkAISuggestion[]) => Promise<void>;
}

export function BulkAIActions({
  items,
  destinations,
  pageType,
  onApplySuggestions,
}: BulkAIActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentAction, setCurrentAction] = useState<BulkAIAction | null>(null);
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<BulkAISuggestion[]>([]);

  const actions = getActionsForPageType(pageType);

  const handleAction = async (action: BulkAIAction) => {
    if (items.length === 0) {
      toast.error('No items to process');
      return;
    }

    setCurrentAction(action);
    setIsProcessing(true);
    setProgress(0);
    setSuggestions([]);

    try {
      const response = await fetch('/api/ai/bulk-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            notes: item.notes,
            destination_id: item.destination_id,
            layer: item.layer,
          })),
          action,
          destinations: destinations.map(d => ({ id: d.id, slug: d.slug, name: d.name })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process items');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setProgress(100);
      setShowResults(true);
    } catch (error) {
      console.error('Bulk AI error:', error);
      toast.error('Failed to process items with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSuggestion = (itemId: string) => {
    setSuggestions(prev =>
      prev.map(s =>
        s.itemId === itemId ? { ...s, accepted: !s.accepted } : s
      )
    );
  };

  const handleApplySelected = async () => {
    const acceptedSuggestions = suggestions.filter(s => s.accepted !== false);
    if (acceptedSuggestions.length === 0) {
      toast.error('No suggestions selected');
      return;
    }

    setIsProcessing(true);
    try {
      await onApplySuggestions(acceptedSuggestions);
      setShowResults(false);
      setSuggestions([]);
      toast.success(`Applied ${acceptedSuggestions.length} suggestions`);
    } catch (error) {
      toast.error('Failed to apply suggestions');
    } finally {
      setIsProcessing(false);
    }
  };

  const actionLabels: Record<BulkAIAction, string> = {
    categorize: 'Suggest Destinations',
    merge: 'Find Similar Items',
    cleanup: 'Identify Deletable',
    improve: 'Improve Titles',
    schedule: 'Suggest Schedule',
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={items.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-primary" />
            )}
            AI Actions
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="gap-3"
            >
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </DropdownMenuItem>
          ))}
          {actions.length > 1 && <DropdownMenuSeparator />}
          <DropdownMenuItem
            onClick={() => {
              // Open global AI assistant
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', metaKey: true }));
            }}
            className="gap-3"
          >
            <Wand2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="text-xs text-muted-foreground">Open full assistant (⌘J)</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Suggestions - {currentAction && actionLabels[currentAction]}
            </DialogTitle>
            <DialogDescription>
              Review and select which suggestions to apply. {suggestions.length} suggestions generated.
            </DialogDescription>
          </DialogHeader>

          {isProcessing ? (
            <div className="py-8 space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                Processing {items.length} items...
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.itemId}
                      suggestion={suggestion}
                      onToggle={() => handleToggleSuggestion(suggestion.itemId)}
                    />
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {suggestions.filter(s => s.accepted !== false).length} of {suggestions.length} selected
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplySelected} disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Apply Selected
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SuggestionCard({
  suggestion,
  onToggle,
}: {
  suggestion: BulkAISuggestion;
  onToggle: () => void;
}) {
  const isAccepted = suggestion.accepted !== false;

  return (
    <motion.div
      layout
      className={cn(
        'rounded-lg border p-4 transition-colors cursor-pointer',
        isAccepted ? 'border-primary bg-primary/5' : 'border-border bg-card opacity-60'
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
            isAccepted ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
          )}
        >
          {isAccepted && <Check className="h-3 w-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{suggestion.itemTitle}</p>
          <p className="text-sm text-primary mt-1">{suggestion.suggestion}</p>
          <p className="text-xs text-muted-foreground mt-2">{suggestion.reasoning}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                suggestion.confidence >= 0.8
                  ? 'bg-green-500/10 text-green-500'
                  : suggestion.confidence >= 0.5
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-red-500/10 text-red-500'
              )}
            >
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getActionsForPageType(pageType: 'capture' | 'process' | 'commit') {
  const allActions = [
    {
      id: 'categorize' as const,
      label: 'Suggest Destinations',
      description: 'AI categorizes all items',
      icon: Sparkles,
      pages: ['capture', 'process'],
    },
    {
      id: 'merge' as const,
      label: 'Find Similar',
      description: 'Identify items to merge',
      icon: Combine,
      pages: ['capture', 'process'],
    },
    {
      id: 'cleanup' as const,
      label: 'Cleanup Suggestions',
      description: 'Find items to delete',
      icon: Trash2,
      pages: ['capture', 'process'],
    },
    {
      id: 'improve' as const,
      label: 'Improve Titles',
      description: 'Enhance item titles',
      icon: Type,
      pages: ['capture', 'process', 'commit'],
    },
    {
      id: 'schedule' as const,
      label: 'Suggest Schedule',
      description: 'Optimal time suggestions',
      icon: Calendar,
      pages: ['process', 'commit'],
    },
  ];

  return allActions.filter(action => action.pages.includes(pageType));
}
