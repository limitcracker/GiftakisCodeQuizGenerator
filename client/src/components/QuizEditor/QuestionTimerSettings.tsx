import React from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuestionTimerSettingsProps {
  timeLimit: number | null | undefined;
  onChange: (timeLimit: number | null) => void;
}

export default function QuestionTimerSettings({ timeLimit, onChange }: QuestionTimerSettingsProps) {
  const { t } = useTranslation();
  const { quizLanguage } = useQuiz();

  // Convert minutes to seconds for display
  const displayMinutes = timeLimit ? Math.floor(timeLimit / 60) : '';
  const displaySeconds = timeLimit ? timeLimit % 60 : '';
  
  // Handle timer changes
  const handleTimerChange = (minutes: string, seconds: string) => {
    const mins = minutes ? parseInt(minutes, 10) : 0;
    const secs = seconds ? parseInt(seconds, 10) : 0;
    
    if (mins === 0 && secs === 0) {
      onChange(null); // No time limit
    } else {
      const totalSeconds = (mins * 60) + secs;
      onChange(totalSeconds);
    }
  };
  
  // Toggle timer on/off
  const handleToggleTimer = (enabled: boolean) => {
    if (!enabled) {
      onChange(null);
    } else {
      // Default to 2 minutes if enabling
      onChange(120);
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-md mt-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <Label htmlFor="timeLimit" className="flex items-center gap-2">
          <Timer className="h-4 w-4" />
          <span>{t('quiz.editor.findAndFixErrors.labels.questionTimeLimit', { lng: quizLanguage })}</span>
        </Label>
        <Switch 
          id="timeLimit" 
          checked={timeLimit !== null && timeLimit !== undefined}
          onCheckedChange={handleToggleTimer}
        />
      </div>
      
      {timeLimit !== null && timeLimit !== undefined && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="timer-minutes">{t('quiz.editor.findAndFixErrors.labels.minutes', { lng: quizLanguage })}</Label>
            <Input 
              id="timer-minutes"
              type="number"
              min="0"
              value={displayMinutes}
              onChange={(e) => handleTimerChange(e.target.value, displaySeconds.toString())}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timer-seconds">{t('quiz.editor.findAndFixErrors.labels.seconds', { lng: quizLanguage })}</Label>
            <Input 
              id="timer-seconds"
              type="number"
              min="0"
              max="59"
              value={displaySeconds}
              onChange={(e) => handleTimerChange(displayMinutes.toString(), e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {(timeLimit === null || timeLimit === undefined) ? (
          <p>{t('quiz.editor.findAndFixErrors.messages.usingQuizDefaultTimeLimit', { lng: quizLanguage })}</p>
        ) : (
          <p>{t('quiz.editor.findAndFixErrors.messages.timeLimit', { lng: quizLanguage, minutes: Math.floor(timeLimit / 60), seconds: timeLimit % 60 })}</p>
        )}
      </div>
    </div>
  );
}