import { create } from 'zustand';
import { ref, set, get, onValue, push, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'family' | 'personal';
  createdBy: string;
  createdAt: string;
}

interface CalendarStore {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<void>;
  removeEvent: (eventId: string) => Promise<void>;
  updateEvent: (eventId: string, event: Partial<CalendarEvent>) => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>()((set, get) => ({
  events: [],

  addEvent: async (eventData) => {
    try {
      const eventsRef = ref(db, 'calendar/events');
      const newEventRef = push(eventsRef);
      const newEvent = {
        ...eventData,
        id: newEventRef.key!,
        createdAt: new Date().toISOString()
      };
      
      await set(newEventRef, newEvent);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  },

  removeEvent: async (eventId) => {
    try {
      await remove(ref(db, `calendar/events/${eventId}`));
    } catch (error) {
      console.error('Error removing event:', error);
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      const currentEvents = get().events;
      const existingEvent = currentEvents.find(e => e.id === eventId);
      if (!existingEvent) return;

      const updatedEvent = {
        ...existingEvent,
        ...eventData
      };

      await set(ref(db, `calendar/events/${eventId}`), updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const eventsRef = ref(db, 'calendar/events');
  onValue(eventsRef, (snapshot) => {
    try {
      const data = snapshot.val();
      const events = data ? Object.values(data) : [];
      useCalendarStore.setState({ events });
    } catch (error) {
      console.error('Error syncing calendar events:', error);
    }
  });
}
