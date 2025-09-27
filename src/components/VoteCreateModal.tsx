import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, X } from "lucide-react";
import { format, addMinutes } from "date-fns";
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
  const [duration, setDuration] = useState<string>("");
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [options, setOptions] = useState<VoteOption[]>([
    { id: "1", name: "찬성" },
    { id: "2", name: "보류" },
    { id: "3", name: "반대" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeOptions = [
    { value: "5", label: "5분" },
    { value: "10", label: "10분" },
    { value: "15", label: "15분" },
    { value: "30", label: "30분" },
    { value: "60", label: "1시간" },
    { value: "180", label: "3시간" },
    { value: "1440", label: "1일" },
    { value: "4320", label: "3일" },
    { value: "custom", label: "직접입력" }
  ];

  const handleDurationChange = (value: string) => {
    setDuration(value);
    setIsCustomInput(value === "custom");
    if (value !== "custom") {
      setCustomMinutes("");
    }
  };

  const getEndTime = () => {
    const now = new Date();
    let minutes = 0;
    
    if (duration === "custom") {
      minutes = parseInt(customMinutes) || 0;
    } else {
      minutes = parseInt(duration) || 0;
    }
    
    return addMinutes(now, minutes);
  };

  const getMinutesForDuration = () => {
    if (duration === "custom") {
      return parseInt(customMinutes) || 0;
    }
    return parseInt(duration) || 0;
  };

  const addOption = () => {
    const newOption: VoteOption = {
      id: Date.now().toString(),
      name: ""
    };
    setOptions([...options, newOption]);
  };

  const clearOption = (id: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, name: "" } : opt));
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
    
    if (!duration) {
      toast.error("투표 종료 시간을 선택해주세요.");
      return;
    }

    if (duration === "custom" && (!customMinutes || parseInt(customMinutes) <= 0)) {
      toast.error("직접입력 시간을 올바르게 입력해주세요.");
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
          expires_at: getEndTime().toISOString(),
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
      setDuration("");
      setCustomMinutes("");
      setIsCustomInput(false);
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

          {/* 종료 시간 */}
          <div className="space-y-2">
            <Label>투표 종료 시간 *</Label>
            <Select value={duration} onValueChange={handleDurationChange}>
              <SelectTrigger>
                <SelectValue placeholder="종료 시간을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isCustomInput && (
              <div className="space-y-2">
                <Label htmlFor="customMinutes">분 입력</Label>
                <Input
                  id="customMinutes"
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="분 입력"
                  min="1"
                />
              </div>
            )}
            
            {(duration && (duration !== "custom" || (duration === "custom" && customMinutes))) && (
              <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-md text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-medium">시간 설정</span>
                  <Clock className="h-4 w-4" />
                </div>
                <div>시작시간: {format(new Date(), "PPP p", { locale: ko })}</div>
                <div>종료시간: {format(getEndTime(), "PPP p", { locale: ko })}</div>
                <div className="text-xs">
                  ({getMinutesForDuration()}분 후 종료)
                </div>
              </div>
            )}
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
                      onClick={() => clearOption(option.id)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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