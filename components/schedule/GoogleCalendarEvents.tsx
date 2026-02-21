'use client';

import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleEvent {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
  colorId?: string;
}

interface GoogleCalendarEventsProps {
  date: string; // ISO date string (YYYY-MM-DD)
}

export function GoogleCalendarEvents({ date }: GoogleCalendarEventsProps) {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const timeMin = new Date(`${date}T00:00:00`).toISOString();
      const timeMax = new Date(`${date}T23:59:59`).toISOString();

      const res = await fetch(
        `/api/integrations/google/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`
      );
      const data = await res.json();

      if (data.connected === false) {
        setConnected(false);
        setEvents([]);
      } else {
        setConnected(true);
        setEvents(data.events || []);
      }
    } catch {
      setConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [date]);

  if (connected === false || connected === null && !isLoading) {
    return null; // Don't show anything if not connected
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
          <Calendar className="h-3.5 w-3.5" />
          Google Calendar
        </div>
        <div className="animate-pulse space-y-1.5">
          <div className="h-8 rounded-lg bg-[var(--bg-hover)]" />
          <div className="h-8 rounded-lg bg-[var(--bg-hover)]" />
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
          <Calendar className="h-3.5 w-3.5" />
          Google Calendar
          <button onClick={fetchEvents} className="ml-auto">
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
        <p className="text-xs text-[var(--text-disabled)]">No events for this day</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
        <Calendar className="h-3.5 w-3.5" />
        Google Calendar
        <span className="ml-1 rounded-full bg-[var(--bg-hover)] px-1.5 py-0.5 text-[10px]">
          {events.length}
        </span>
        <button onClick={fetchEvents} className="ml-auto hover:text-[var(--text-secondary)] transition-colors">
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1">
        {events.map((event) => {
          const startTime = event.start?.dateTime
            ? new Date(event.start.dateTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'All day';
          const endTime = event.end?.dateTime
            ? new Date(event.end.dateTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';

          return (
            <a
              key={event.id}
              href={event.htmlLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'group flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2',
                'bg-blue-500/5 hover:bg-blue-500/10 transition-colors'
              )}
            >
              <div className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {event.summary || 'Untitled event'}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {startTime}
                  {endTime && ` - ${endTime}`}
                </p>
              </div>
              <ExternalLink className="h-3 w-3 text-[var(--text-disabled)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
