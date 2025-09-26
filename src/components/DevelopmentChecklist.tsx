import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Code, Database, Shield, Smartphone, Globe, Bug } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

export const DevelopmentChecklist = () => {
  const [checklist, setChecklist] = useState<ChecklistSection[]>([
    {
      id: 'frontend',
      title: '프론트엔드 개발',
      icon: <Code className="h-5 w-5" />,
      items: [
        { id: 'ui-components', title: 'UI 컴포넌트 구현', description: '투표 카드, 모달, 버튼 등', completed: true, priority: 'high' },
        { id: 'responsive', title: '반응형 디자인', description: '모바일, 태블릿, 데스크톱 지원', completed: false, priority: 'high' },
        { id: 'vote-creation', title: '투표 생성 기능', completed: false, priority: 'high' },
        { id: 'vote-participation', title: '투표 참여 기능', completed: false, priority: 'high' },
        { id: 'results-visualization', title: '결과 시각화', description: '차트, 그래프 구현', completed: false, priority: 'medium' },
        { id: 'real-time-updates', title: '실시간 업데이트', completed: false, priority: 'medium' },
        { id: 'dark-mode', title: '다크 모드 지원', completed: false, priority: 'low' },
        { id: 'animations', title: '애니메이션 및 트랜지션', completed: false, priority: 'low' }
      ]
    },
    {
      id: 'backend',
      title: '백엔드 & 데이터베이스',
      icon: <Database className="h-5 w-5" />,
      items: [
        { id: 'db-schema', title: '데이터베이스 스키마 설계', completed: true, priority: 'high' },
        { id: 'rls-policies', title: 'RLS 정책 구현', completed: true, priority: 'high' },
        { id: 'vote-crud', title: '투표 CRUD API', completed: false, priority: 'high' },
        { id: 'vote-counting', title: '투표 집계 로직', completed: false, priority: 'high' },
        { id: 'file-storage', title: '파일 저장소 설정', completed: false, priority: 'medium' },
        { id: 'caching', title: '캐싱 전략', completed: false, priority: 'medium' },
        { id: 'rate-limiting', title: '요청 제한', completed: false, priority: 'medium' },
        { id: 'backup-strategy', title: '백업 전략', completed: false, priority: 'low' }
      ]
    },
    {
      id: 'security',
      title: '보안 & 인증',
      icon: <Shield className="h-5 w-5" />,
      items: [
        { id: 'user-auth', title: '사용자 인증', completed: false, priority: 'high' },
        { id: 'vote-validation', title: '투표 유효성 검사', completed: false, priority: 'high' },
        { id: 'spam-prevention', title: '스팸 방지', completed: false, priority: 'high' },
        { id: 'report-system', title: '신고 시스템', completed: false, priority: 'medium' },
        { id: 'data-encryption', title: '데이터 암호화', completed: false, priority: 'medium' },
        { id: 'audit-logging', title: '감사 로깅', completed: false, priority: 'low' }
      ]
    },
    {
      id: 'testing',
      title: '테스팅 & QA',
      icon: <Bug className="h-5 w-5" />,
      items: [
        { id: 'unit-tests', title: '단위 테스트', completed: false, priority: 'high' },
        { id: 'integration-tests', title: '통합 테스트', completed: false, priority: 'medium' },
        { id: 'e2e-tests', title: 'E2E 테스트', completed: false, priority: 'medium' },
        { id: 'performance-tests', title: '성능 테스트', completed: false, priority: 'medium' },
        { id: 'accessibility-tests', title: '접근성 테스트', completed: false, priority: 'low' },
        { id: 'cross-browser', title: '크로스 브라우저 테스트', completed: false, priority: 'low' }
      ]
    },
    {
      id: 'deployment',
      title: '배포 & 운영',
      icon: <Globe className="h-5 w-5" />,
      items: [
        { id: 'ci-cd', title: 'CI/CD 파이프라인', completed: false, priority: 'high' },
        { id: 'environment-setup', title: '환경 설정', completed: false, priority: 'high' },
        { id: 'monitoring', title: '모니터링 설정', completed: false, priority: 'medium' },
        { id: 'error-tracking', title: '오류 추적', completed: false, priority: 'medium' },
        { id: 'analytics', title: '분석 도구 연동', completed: false, priority: 'medium' },
        { id: 'seo-optimization', title: 'SEO 최적화', completed: false, priority: 'low' },
        { id: 'cdn-setup', title: 'CDN 설정', completed: false, priority: 'low' }
      ]
    },
    {
      id: 'mobile',
      title: '모바일 최적화',
      icon: <Smartphone className="h-5 w-5" />,
      items: [
        { id: 'pwa', title: 'PWA 구현', completed: false, priority: 'medium' },
        { id: 'touch-gestures', title: '터치 제스처 지원', completed: false, priority: 'medium' },
        { id: 'offline-mode', title: '오프라인 모드', completed: false, priority: 'low' },
        { id: 'push-notifications', title: '푸시 알림', completed: false, priority: 'low' }
      ]
    }
  ]);

  const toggleItem = (sectionId: string, itemId: string) => {
    setChecklist(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return section;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const getCompletionStats = (section: ChecklistSection) => {
    const completed = section.items.filter(item => item.completed).length;
    const total = section.items.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const getOverallStats = () => {
    const allItems = checklist.flatMap(section => section.items);
    const completed = allItems.filter(item => item.completed).length;
    const total = allItems.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const overallStats = getOverallStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            개발 체크리스트
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>전체 진행률: {overallStats.percentage}%</span>
            <span>({overallStats.completed}/{overallStats.total})</span>
          </div>
        </CardHeader>
      </Card>

      {checklist.map((section) => {
        const stats = getCompletionStats(section);
        
        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{stats.percentage}%</span>
                  <span>({stats.completed}/{stats.total})</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(section.id, item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={item.id}
                            className={`text-sm font-medium cursor-pointer ${
                              item.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item.title}
                          </label>
                          <Badge variant={getPriorityColor(item.priority) as any} className="text-xs">
                            {getPriorityLabel(item.priority)}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < section.items.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};