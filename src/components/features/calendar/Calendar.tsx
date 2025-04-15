'use client';

import { useState } from 'react';
import { useCalendarStore } from '@/store/calendar';
import { useAuthStore } from '@/store/auth';
import AddEventModal from './AddEventModal';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const events = useCalendarStore(state => state.events);

  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDate = (date: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">가족 캘린더</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}
            className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            ←
          </button>
          <span className="text-lg font-medium">
            {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
          </span>
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}
            className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            →
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            일정 추가
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map(day => (
          <div key={`empty-${day}`} className="h-24 bg-gray-100 rounded-lg" />
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          return (
            <div
              key={day}
              className="h-24 bg-white rounded-lg shadow p-2 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
                setIsModalOpen(true);
              }}
            >
              <div className="font-medium">{day}</div>
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className="text-xs p-1 mt-1 rounded bg-blue-100 text-blue-800"
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
