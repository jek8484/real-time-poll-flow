import { supabase } from "@/integrations/supabase/client";

// 디바이스 ID 생성
export const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 디바이스 ID 가져오기 (없으면 생성)
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// 현재 사용자 정보 가져오기 (디바이스 ID 기반)
export const getCurrentUser = async () => {
  const deviceId = getDeviceId();
  
  // 기존 사용자 확인
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('device_id', deviceId)
    .single();
  
  if (existingUser) {
    return existingUser;
  }
  
  // 새 사용자 생성
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      device_id: deviceId
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  
  return newUser;
};

// 헤더에 디바이스 ID 설정
export const setDeviceIdHeader = () => {
  const deviceId = getDeviceId();
  // Supabase 클라이언트 요청 시 헤더에 디바이스 ID 포함
  return {
    'device-id': deviceId
  };
};