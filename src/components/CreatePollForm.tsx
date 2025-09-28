import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import TitleInput from './TitleInput';
import DescriptionInput from './DescriptionInput';
import OptionsManager, { PollOption } from './OptionsManager';
import DurationSelector from './DurationSelector';

// DB에 삽입할 데이터 타입을 정의합니다.
interface NewPollData {
  title: string;
  content?: string; // description -> content 로 변경
  options: { id: number; name: string; vote_count: number; color: string; }[];
  expires_at: string;
  status: "active"; // Add status
}

// 투표를 생성하는 비동기 함수입니다.
const addPoll = async (pollData: NewPollData) => {
  const { data, error } = await supabase.from('votes').insert(pollData).select();
  if (error) throw new Error(error.message);
  return data;
};

const optionColors = ['#10b981', '#ef4444', '#3b82f6'];

export default function CreatePollForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOption[]>([{ id: 1, name: '' }, { id: 2, name: '' }]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({ 
    mutationFn: addPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      navigate('/');
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (title.trim() === '' || options.some(opt => opt.name.trim() === '') || !expiresAt) {
      setError('제목, 모든 선택지, 종료 시간은 필수 입력 항목입니다.');
      return;
    }

    const pollData: NewPollData = {
      title,
      content: description, // description -> content 로 변경
      options: options.map((opt, index) => ({
        ...opt,
        vote_count: 0,
        color: optionColors[index] || '#6b7280'
      })),
      expires_at: expiresAt.toISOString(),
      status: "active", // Explicitly set status to active
    };

    mutation.mutate(pollData);
  };

  const isFormInvalid = title.trim() === '' || options.some(opt => opt.name.trim() === '') || !expiresAt || mutation.isPending;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">새로운 투표 만들기</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <TitleInput title={title} setTitle={setTitle} />
        <DescriptionInput description={description} setDescription={setDescription} />
        <OptionsManager options={options} setOptions={setOptions} />
        <DurationSelector expiresAt={expiresAt} setExpiresAt={setExpiresAt} />

        {error && (
          <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isFormInvalid}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {mutation.isPending ? '생성 중...' : '투표 만들기'}
        </button>
      </form>
    </div>
  );
}
