import { create } from 'zustand';
import { CalendarEvent } from '@/types';

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('calendar_events') || '[]')
    : [],

  addEvent: (eventData) => set((state) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const newEvents = [...state.events, newEvent];
    localStorage.setItem('calendar_events', JSON.stringify(newEvents));
    return { events: newEvents };
  }),

  removeEvent: (id) => set((state) => {
    const newEvents = state.events.filter(event => event.id !== id);
    localStorage.setItem('calendar_events', JSON.stringify(newEvents));
    return { events: newEvents };
  }),

  updateEvent: (id, eventData) => set((state) => {
    const newEvents = state.events.map(event =>
      event.id === id ? { ...event, ...eventData } : event
    );
    localStorage.setItem('calendar_events', JSON.stringify(newEvents));
    return { events: newEvents };
  })
}));
