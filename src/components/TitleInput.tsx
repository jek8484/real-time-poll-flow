'use client';

import React from 'react';

interface TitleInputProps {
  title: string;
  setTitle: (title: string) => void;
}

export default function TitleInput({ title, setTitle }: TitleInputProps) {
  return (
    <div>
      <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-2">
        투표 제목
      </label>
      <input
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="예: 오늘 저녁 메뉴는 무엇으로 할까요?"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        maxLength={100}
        required
      />
      <p className="text-sm text-gray-500 mt-1 text-right">{title.length} / 100</p>
    </div>
  );
}
