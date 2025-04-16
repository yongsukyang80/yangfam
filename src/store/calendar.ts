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
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, event: Partial<CalendarEvent>) => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],

  addEvent: async (eventData) => {
    const eventsRef = ref(db, 'calendar/events');
    const newEventRef = push(eventsRef);
    const newEvent = {
      ...eventData,
      id: newEventRef.key!,
      createdAt: new Date().toISOString()
    };
    
    await set(newEventRef, newEvent);
  },

  removeEvent: async (eventId) => {
    await remove(ref(db, `calendar/events/${eventId}`));
  },

  updateEvent: async (eventId, eventData) => {
    await set(ref(db, `calendar/events/${eventId}`), {
      ...get().events.find(e => e.id === eventId),
      ...eventData
    });
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const eventsRef = ref(db, 'calendar/events');
  onValue(eventsRef, (snapshot) => {
    const data = snapshot.val();
    const events = data ? Object.values(data) : [];
    useCalendarStore.setState({ events });
  });
}
