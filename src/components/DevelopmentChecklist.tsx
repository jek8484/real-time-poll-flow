import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

export const DevelopmentChecklist = () => {
  const checklistText = `
# 투표 앱 개발 체크리스트

## 프론트엔드 개발
✅ UI 컴포넌트 구현 (투표 카드, 모달, 버튼 등)
⬜ 반응형 디자인 (모바일, 태블릿, 데스크톱 지원)
⬜ 투표 생성 기능
⬜ 투표 참여 기능
⬜ 결과 시각화 (차트, 그래프 구현)
⬜ 실시간 업데이트
⬜ 다크 모드 지원
⬜ 애니메이션 및 트랜지션

## 백엔드 & 데이터베이스
✅ 데이터베이스 스키마 설계
✅ RLS 정책 구현
⬜ 투표 CRUD API
⬜ 투표 집계 로직
⬜ 파일 저장소 설정
⬜ 캐싱 전략
⬜ 요청 제한
⬜ 백업 전략

## 보안 & 인증
⬜ 사용자 인증
⬜ 투표 유효성 검사
⬜ 스팸 방지
⬜ 신고 시스템
⬜ 데이터 암호화
⬜ 감사 로깅

## 테스팅 & QA
⬜ 단위 테스트
⬜ 통합 테스트
⬜ E2E 테스트
⬜ 성능 테스트
⬜ 접근성 테스트
⬜ 크로스 브라우저 테스트

## 배포 & 운영
⬜ CI/CD 파이프라인
⬜ 환경 설정
⬜ 모니터링 설정
⬜ 오류 추적
⬜ 분석 도구 연동
⬜ SEO 최적화
⬜ CDN 설정

## 모바일 최적화
⬜ PWA 구현
⬜ 터치 제스처 지원
⬜ 오프라인 모드
⬜ 푸시 알림

---

✅ 완료
⬜ 미완료

전체 진행률: 3/37 (8%)
`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          개발 체크리스트
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-sm font-mono whitespace-pre-wrap text-foreground leading-relaxed">
          {checklistText.trim()}
        </pre>
      </CardContent>
    </Card>
  );
};