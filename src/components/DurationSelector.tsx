'use client';

import React from 'react';

interface DurationSelectorProps {
  expiresAt: Date | null;
  setExpiresAt: (date: Date | null) => void;
}

const quickOptions = [
  { label: '10분', minutes: 10 },
  { label: '1시간', minutes: 60 },
  { label: '6시간', minutes: 360 },
  { label: '24시간', minutes: 1440 },
];

export default function DurationSelector({ expiresAt, setExpiresAt }: DurationSelectorProps) {

  const handleQuickSelect = (minutes: number) => {
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + minutes * 60000);
    setExpiresAt(newExpiresAt);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setExpiresAt(new Date(dateValue));
    } else {
      setExpiresAt(null);
    }
  };

  const formatToDateTimeLocal = (date: Date | null) => {
    if (!date) return '';
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-800 mb-2">
        투표 기간 설정
      </label>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">빠른 선택</p>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map(({ label, minutes }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickSelect(minutes)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">직접 입력</p>
          <input
            type="datetime-local"
            value={formatToDateTimeLocal(expiresAt)}
            onChange={handleDateChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            min={formatToDateTimeLocal(new Date())}
          />
        </div>
      </div>
    </div>
  );
}
