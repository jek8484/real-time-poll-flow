'use client';

import React from 'react';

export interface PollOption {
  id: number;
  name: string;
}

interface OptionsManagerProps {
  options: PollOption[];
  setOptions: React.Dispatch<React.SetStateAction<PollOption[]>>;
}

export default function OptionsManager({ options, setOptions }: OptionsManagerProps) {
  const handleOptionNameChange = (id: number, newName: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, name: newName } : option
    ));
  };

  const addOption = () => {
    if (options.length < 3) {
      const newId = options.length > 0 ? Math.max(...options.map(o => o.id)) + 1 : 1;
      setOptions([...options, { id: newId, name: '' }]);
    }
  };

  const removeOption = (id: number) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-lg font-semibold text-gray-800">
          선택지 (최소 2개, 최대 3개)
        </label>
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= 3}
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
        >
          추가
        </button>
      </div>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center space-x-2">
            <input
              type="text"
              value={option.name}
              onChange={(e) => handleOptionNameChange(option.id, e.target.value)}
              placeholder={`선택지 ${index + 1}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              maxLength={50}
              required
            />
            <button
              type="button"
              onClick={() => removeOption(option.id)}
              disabled={options.length <= 2}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
