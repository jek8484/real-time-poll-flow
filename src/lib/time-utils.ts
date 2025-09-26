export const formatTimeRemaining = (endTime: Date): string => {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return "종료됨";
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `종료까지 ${hours}시간 ${minutes}분 남음`;
  } else if (minutes > 0) {
    return `종료까지 ${minutes}분 남음`;
  } else {
    return `종료까지 ${seconds}초 남음`;
  }
};

export const formatEndedTime = (endTime: Date, originalEndTime?: Date, startTime?: Date): string => {
  const endDate = endTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const endTimeStr = endTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  if (originalEndTime && startTime) {
    // Early ended - show actual duration
    const actualDuration = endTime.getTime() - startTime.getTime();
    const hoursDuration = Math.floor(actualDuration / (1000 * 60 * 60));
    const minutesDuration = Math.floor((actualDuration % (1000 * 60 * 60)) / (1000 * 60));
    
    let durationText = "";
    if (hoursDuration > 0) {
      durationText = `${hoursDuration}시간 ${minutesDuration}분동안 투표 진행 했음`;
    } else if (minutesDuration > 0) {
      durationText = `${minutesDuration}분동안 투표 진행 했음`;
    } else {
      durationText = "투표 진행 후 바로 종료";
    }
    
    return `${endDate} ${endTimeStr}, ${durationText}`;
  }
  
  return `${endDate} 종료됨`;
};