export const formatTimeRemaining = (endTime: Date): string => {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return "종료됨";
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `종료까지 ${hours}시간 ${minutes}분 남음`;
  } else {
    return `종료까지 ${minutes}분 남음`;
  }
};

export const formatEndedTime = (endTime: Date, originalEndTime?: Date): string => {
  const endDate = endTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const endTimeStr = endTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  if (originalEndTime) {
    // Early ended
    const timeDiff = originalEndTime.getTime() - endTime.getTime();
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    let earlyText = "";
    if (hoursDiff > 0) {
      earlyText = `예정보다 ${hoursDiff}시간 ${minutesDiff}분 일찍`;
    } else if (minutesDiff > 0) {
      earlyText = `예정보다 ${minutesDiff}분 일찍`;
    }
    
    return `${endDate} ${endTimeStr}, ${earlyText}`;
  }
  
  return `${endDate} 종료됨`;
};