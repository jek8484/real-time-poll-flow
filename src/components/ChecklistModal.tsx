import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DevelopmentChecklist } from "@/components/DevelopmentChecklist";

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChecklistModal = ({ isOpen, onClose }: ChecklistModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>개발 체크리스트</DialogTitle>
        </DialogHeader>
        <DevelopmentChecklist />
      </DialogContent>
    </Dialog>
  );
};