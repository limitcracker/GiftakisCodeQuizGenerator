import React from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Clock, Timer } from 'lucide-react';

export default function TimerSettings() {
  const { quizTimeLimit, setQuizTimeLimit } = useQuiz();
  
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
          <span>Time Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-timer" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>Enable Quiz Timer</span>
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
                <Label htmlFor="timer-minutes">Minutes</Label>
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
                <Label htmlFor="timer-seconds">Seconds</Label>
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
              <p>No time limit set for this quiz.</p>
            ) : (
              <p>Quiz time limit: {Math.floor(quizTimeLimit / 60)} minutes and {quizTimeLimit % 60} seconds.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}