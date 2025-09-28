'use client';

import React from 'react';

interface DescriptionInputProps {
  description: string;
  setDescription: (description: string) => void;
}

export default function DescriptionInput({ description, setDescription }: DescriptionInputProps) {
  return (
    <div>
      <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-2">
        상세 설명 <span className="text-sm font-normal text-gray-500">(선택)</span>
      </label>
      <textarea
        id="description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="투표에 대한 배경이나 추가 정보를 입력해주세요."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        maxLength={500}
      />
      <p className="text-sm text-gray-500 mt-1 text-right">{description.length} / 500</p>
    </div>
  );
}
