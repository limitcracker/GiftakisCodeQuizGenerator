import React from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Timer } from 'lucide-react';

interface QuestionTimerSettingsProps {
  questionId: string;
  currentTimeLimit: number | null | undefined;
}

export default function QuestionTimerSettings({ 
  questionId, 
  currentTimeLimit 
}: QuestionTimerSettingsProps) {
  const { updateQuestionTimeLimit } = useQuiz();
  
  // Convert minutes to seconds for display
  const displayMinutes = currentTimeLimit ? Math.floor(currentTimeLimit / 60) : '';
  const displaySeconds = currentTimeLimit ? currentTimeLimit % 60 : '';
  
  // Handle timer changes
  const handleTimerChange = (minutes: string, seconds: string) => {
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    
    if (mins === 0 && secs === 0) {
      updateQuestionTimeLimit(questionId, null); // No time limit
    } else {
      const totalSeconds = (mins * 60) + secs;
      updateQuestionTimeLimit(questionId, totalSeconds);
    }
  };
  
  // Toggle timer on/off
  const handleToggleTimer = (enabled: boolean) => {
    if (!enabled) {
      updateQuestionTimeLimit(questionId, null);
    } else {
      // Default to 2 minutes if enabling
      updateQuestionTimeLimit(questionId, 120);
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-md mt-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <Label htmlFor={`enable-timer-${questionId}`} className="flex items-center gap-2">
          <Timer className="h-4 w-4" />
          <span>Question Time Limit</span>
        </Label>
        <Switch 
          id={`enable-timer-${questionId}`} 
          checked={currentTimeLimit !== null && currentTimeLimit !== undefined}
          onCheckedChange={handleToggleTimer}
        />
      </div>
      
      {currentTimeLimit !== null && currentTimeLimit !== undefined && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`timer-minutes-${questionId}`}>Minutes</Label>
            <Input 
              id={`timer-minutes-${questionId}`}
              type="number"
              min="0"
              value={displayMinutes}
              onChange={(e) => handleTimerChange(e.target.value, displaySeconds.toString())}
              placeholder="0"
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`timer-seconds-${questionId}`}>Seconds</Label>
            <Input 
              id={`timer-seconds-${questionId}`}
              type="number"
              min="0"
              max="59"
              value={displaySeconds}
              onChange={(e) => handleTimerChange(displayMinutes.toString(), e.target.value)}
              placeholder="0"
              className="h-8"
            />
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {(currentTimeLimit === null || currentTimeLimit === undefined) ? (
          <p>Using quiz default time limit (if any).</p>
        ) : (
          <p>Time limit: {Math.floor(currentTimeLimit / 60)} min {currentTimeLimit % 60} sec</p>
        )}
      </div>
    </div>
  );
}