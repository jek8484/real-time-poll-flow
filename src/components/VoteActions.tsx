import { QrCode, Share, EyeOff, Flag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Vote {
  id: string;
  title: string;
  isMyVote: boolean;
}

interface VoteActionsProps {
  vote: Vote;
  onClose: () => void;
}

export const VoteActions = ({ vote, onClose }: VoteActionsProps) => {
  const handleQRCode = () => {
    console.log("QR코드 보기:", vote.id);
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vote.title,
        url: window.location.href + `?vote=${vote.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `?vote=${vote.id}`);
      alert("링크가 복사되었습니다!");
    }
    onClose();
  };

  const handleHide = () => {
    console.log("투표 숨기기:", vote.id);
    onClose();
  };

  const handleReport = () => {
    console.log("투표 신고:", vote.id);
    alert("신고가 접수되었습니다.");
    onClose();
  };

  const handleDelete = () => {
    if (confirm("정말로 이 투표를 삭제하시겠습니까?")) {
      console.log("투표 삭제:", vote.id);
      onClose();
    }
  };

  return (
    <>
      {/* 백드롭 */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* 드롭다운 메뉴 */}
      <Card className="relative z-50 shadow-lg border-card-border bg-background min-w-[180px]">
        <CardContent className="p-2">
          <div className="space-y-1">
            {/* 공통 메뉴 */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 px-3"
              onClick={handleQRCode}
            >
              <QrCode className="h-4 w-4 flex-shrink-0" />
              <span>QR코드</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 px-3"
              onClick={handleShare}
            >
              <Share className="h-4 w-4 flex-shrink-0" />
              <span>공유하기</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 px-3"
              onClick={handleHide}
            >
              <EyeOff className="h-4 w-4 flex-shrink-0" />
              <span>숨기기</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 px-3 text-warning hover:text-warning-foreground hover:bg-warning/10"
              onClick={handleReport}
            >
              <Flag className="h-4 w-4 flex-shrink-0" />
              <span>신고하기</span>
            </Button>

            {/* 내 투표에만 표시 */}
            {vote.isMyVote && (
              <div className="border-t border-card-border pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 flex-shrink-0" />
                  <span>삭제하기</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};