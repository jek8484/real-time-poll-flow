import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoteCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoteCreated?: () => void;
}

interface VoteOption {
  id: string;
  name: string;
}

export const VoteCreateModal = ({ isOpen, onClose, onVoteCreated }: VoteCreateModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date>();
  const [options, setOptions] = useState<VoteOption[]>([
    { id: "1", name: "찬성" },
    { id: "2", name: "보류" },
    { id: "3", name: "반대" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    const newOption: VoteOption = {
      id: Date.now().toString(),
      name: ""
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOption = (id: string, name: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, name } : opt));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    
    if (!endDate) {
      toast.error("투표 종료일을 선택해주세요.");
      return;
    }
    
    const validOptions = options.filter(opt => opt.name.trim());
    if (validOptions.length < 2) {
      toast.error("최소 2개의 선택지를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          title: title.trim(),
          content: description.trim() || null,
          expires_at: endDate.toISOString(),
          options: validOptions.map(opt => ({
            name: opt.name.trim(),
            vote_count: 0
          })),
          status: 'active'
        });

      if (error) {
        console.error('Error creating vote:', error);
        toast.error("투표 생성에 실패했습니다.");
        return;
      }

      toast.success("투표가 성공적으로 생성되었습니다!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setEndDate(undefined);
      setOptions([
        { id: "1", name: "찬성" },
        { id: "2", name: "보류" },
        { id: "3", name: "반대" }
      ]);
      
      onClose();
      onVoteCreated?.();
    } catch (error) {
      console.error('Error creating vote:', error);
      toast.error("투표 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 투표 만들기</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="투표 제목을 입력하세요"
              maxLength={100}
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="투표에 대한 자세한 설명을 입력하세요 (선택사항)"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* 종료일 */}
          <div className="space-y-2">
            <Label>투표 종료일 *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: ko }) : "날짜를 선택하세요"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 선택지 */}
          <div className="space-y-2">
            <Label>선택지 *</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={option.id} className="flex gap-2">
                  <Input
                    value={option.name}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`선택지 ${index + 1}`}
                    maxLength={50}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(option.id)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                선택지 추가
              </Button>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "생성 중..." : "투표 생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};