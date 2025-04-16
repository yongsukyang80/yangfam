'use client';

import { useState } from 'react';
import { useCalendarStore } from '@/store/calendar';
import { useAuthStore } from '@/store/auth';
import AddEventModal from './AddEventModal';
import dayjs from 'dayjs';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const currentUser = useAuthStore((state) => state.currentUser);
  const events = useCalendarStore((state) => state.events);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleDateClick = (date: number) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      date
    );
    // Date를 YYYY-MM-DD 형식의 string으로 변환
    setSelectedDate(dayjs(selectedDate).format('YYYY-MM-DD'));
    setShowAddModal(true);
  };

  const getEventsForDate = (date: number) => {
    const dateStr = dayjs(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      date
    )).format('YYYY-MM-DD');
    
    return events.filter(event => event.date === dateStr);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="p-4">
      {/* 달력 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <div className="space-x-2">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            이전
          </button>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            다음
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div
            key={day}
            className="text-center font-medium py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-[100px] border rounded-lg p-2 ${
              day ? 'hover:bg-gray-50 cursor-pointer' : ''
            }`}
            onClick={() => day && handleDateClick(day)}
          >
            {day && (
              <>
                <div className="font-medium">{day}</div>
                <div className="space-y-1 mt-1">
                  {getEventsForDate(day).map((event, i) => (
                    <div
                      key={i}
                      className={`text-xs p-1 rounded ${
                        event.type === 'family' ? 'bg-blue-100' : 'bg-green-100'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 일정 추가 모달 */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
