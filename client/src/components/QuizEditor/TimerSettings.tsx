import React from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Clock, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TimerSettings() {
  const { quizTimeLimit, setQuizTimeLimit, quizLanguage } = useQuiz();
  const { t } = useTranslation();
  
  // Convert minutes to seconds for display
  const displayMinutes = quizTimeLimit ? Math.floor(quizTimeLimit / 60) : '';
  const displaySeconds = quizTimeLimit ? quizTimeLimit % 60 : '';
  
  // Handle timer changes
  const handleTimerChange = (minutes: string, seconds: string) => {
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    
    if (mins === 0 && secs === 0) {
      setQuizTimeLimit(null); // No time limit
    } else {
      const totalSeconds = (mins * 60) + secs;
      setQuizTimeLimit(totalSeconds);
    }
  };
  
  // Toggle timer on/off
  const handleToggleTimer = (enabled: boolean) => {
    if (!enabled) {
      setQuizTimeLimit(null);
    } else {
      // Default to 5 minutes if enabling
      setQuizTimeLimit(300);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>{t('quiz.preview.timeSettings', { lng: quizLanguage })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-timer" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>{t('quiz.preview.enableQuizTimer', { lng: quizLanguage })}</span>
            </Label>
            <Switch 
              id="enable-timer" 
              checked={quizTimeLimit !== null}
              onCheckedChange={handleToggleTimer}
            />
          </div>
          
          {quizTimeLimit !== null && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timer-minutes">{t('quiz.editor.findAndFixErrors.labels.minutes', { lng: quizLanguage })}</Label>
                <Input 
                  id="timer-minutes"
                  type="number"
                  min="0"
                  value={displayMinutes}
                  onChange={(e) => handleTimerChange(e.target.value, displaySeconds.toString())}
                  placeholder="0"
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
                  placeholder="0"
                />
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            {quizTimeLimit === null ? (
              <p>{t('quiz.preview.noTimeLimit', { lng: quizLanguage })}</p>
            ) : (
              <p>{t('quiz.editor.findAndFixErrors.messages.timeLimit', { minutes: Math.floor(quizTimeLimit / 60), seconds: quizTimeLimit % 60, lng: quizLanguage })}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}