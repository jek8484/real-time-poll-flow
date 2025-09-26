import { X, Flag, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReportedVote {
  id: string;
  title: string;
  description?: string;
  totalVotes: number;
  reportCount: number;
  reportReasons: string[];
  lastReported: Date;
  isAutoHidden: boolean;
}

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for reported votes
const mockReportedVotes: ReportedVote[] = [
  {
    id: "report-1",
    title: "부적절한 내용이 포함된 투표",
    description: "이 투표는 신고를 받은 투표입니다.",
    totalVotes: 45,
    reportCount: 8,
    reportReasons: ["부적절한 내용", "스팸", "혐오 발언"],
    lastReported: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isAutoHidden: true
  },
  {
    id: "report-2", 
    title: "스팸성 투표로 의심되는 항목",
    description: "반복적으로 올라오는 의미 없는 투표입니다.",
    totalVotes: 12,
    reportCount: 3,
    reportReasons: ["스팸", "의미 없는 내용"],
    lastReported: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isAutoHidden: false
  },
  {
    id: "report-3",
    title: "허위 정보가 포함된 투표",
    totalVotes: 89,
    reportCount: 12,
    reportReasons: ["허위 정보", "부적절한 내용", "혐오 발언", "기타"],
    lastReported: new Date(Date.now() - 30 * 60 * 1000),
    isAutoHidden: true
  }
];

export const ReportsModal = ({ isOpen, onClose }: ReportsModalProps) => {
  if (!isOpen) return null;

  const totalReports = mockReportedVotes.reduce((sum, vote) => sum + vote.reportCount, 0);
  const autoHiddenCount = mockReportedVotes.filter(vote => vote.isAutoHidden).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-card-border animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Flag className="h-5 w-5 text-warning" />
                신고 목록 관리
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  총 신고 수: {totalReports}건
                </span>
                <span>자동 숨김 처리: {autoHiddenCount}건</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {mockReportedVotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>신고된 투표가 없습니다.</p>
            </div>
          ) : (
            <>
              {mockReportedVotes.map((vote) => (
                <Card key={vote.id} className={`border ${vote.isAutoHidden ? 'border-warning/30 bg-warning/5' : 'border-card-border'}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{vote.title}</h3>
                          {vote.description && (
                            <p className="text-sm text-muted-foreground mt-1">{vote.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {vote.isAutoHidden && (
                            <Badge variant="secondary" className="bg-warning/10 text-warning">
                              자동 숨김
                            </Badge>
                          )}
                          <Badge variant="destructive">
                            {vote.reportCount}건 신고
                          </Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {vote.totalVotes}명 참여
                        </span>
                        <span>
                          최근 신고: {vote.lastReported.toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Report Reasons */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">신고 사유:</div>
                        <div className="flex flex-wrap gap-1">
                          {vote.reportReasons.map((reason, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          상세 보기
                        </Button>
                        {!vote.isAutoHidden && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                          >
                            숨기기
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Close Button */}
          <div className="pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full"
            >
              닫기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};