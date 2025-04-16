import { create } from 'zustand';
import { ref, set as firebaseSet, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface CalendarEvent {
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
      const newEventRef = ref(db, `calendar/events/${Date.now()}`);
      
      const newEvent: CalendarEvent = {
        ...eventData,
        id: newEventRef.key!,
        createdAt: new Date().toISOString()
      };
      
      await firebaseSet(newEventRef, newEvent);
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
      const event = get().events.find(e => e.id === eventId);
      if (!event) return;

      const updatedEvent = {
        ...event,
        ...eventData
      };

      await firebaseSet(ref(db, `calendar/events/${eventId}`), updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const eventsRef = ref(db, 'calendar/events');
  onValue(eventsRef, (snapshot) => {
    const data = snapshot.val() || {};
    useCalendarStore.setState({
      events: Object.values(data)
    });
  });
}
