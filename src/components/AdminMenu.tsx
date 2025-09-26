import { useState } from "react";
import { Eye, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ReportsModal } from "./ReportsModal";

interface AdminMenuProps {
  onClose: () => void;
  onOpenHiddenVotes: () => void;
}

export const AdminMenu = ({ onClose, onOpenHiddenVotes }: AdminMenuProps) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [showReportsModal, setShowReportsModal] = useState(false);

  const handleHiddenVotes = () => {
    onOpenHiddenVotes();
  };

  const handleAdminLogin = () => {
    console.log("관리자 모드 진입");
    setShowReportsModal(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="absolute top-16 right-4 min-w-[280px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-lg border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">관리 메뉴</h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* 숨긴 투표 보기 */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleHiddenVotes}
              >
                <Eye className="h-4 w-4 mr-2" />
                내가 숨긴 투표 보기
              </Button>

              {/* 관리자 모드 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Shield className="h-4 w-4" />
                  관리자 모드
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={handleAdminLogin}
                >
                  신고 목록 보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Modal */}
      <ReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
      />
    </div>
  );
};