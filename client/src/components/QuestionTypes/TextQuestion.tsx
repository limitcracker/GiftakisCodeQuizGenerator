import { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import QuestionTimerSettings from '../QuizEditor/QuestionTimerSettings';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { useQuiz } from '@/context/QuizContext';

interface TextQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function TextQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: TextQuestionProps) {
  const { t } = useTranslation();
  const { quizLanguage } = useQuiz();
  const [title, setTitle] = useState(question.title);
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [textAnswer, setTextAnswer] = useState(question.textAnswer || '');
  const [hintComment, setHintComment] = useState(question.hintComment || '');
  const [isMarkdown, setIsMarkdown] = useState(question.isMarkdown || false);
  const [supportCodeBlocks, setSupportCodeBlocks] = useState(question.supportCodeBlocks || false);
  const [minLength, setMinLength] = useState(question.minLength || 0);
  const [maxLength, setMaxLength] = useState(question.maxLength || 500);
  // Default to long format if maxLength is greater than 100, otherwise short
  const [isLongFormat, setIsLongFormat] = useState(question.maxLength ? question.maxLength > 100 : true);
  
  const handleUpdate = useCallback(() => {
    const updatedQuestion: Question = {
      ...question,
      title,
      explanation,
      textAnswer,
      hintComment,
      isMarkdown,
      supportCodeBlocks,
      minLength,
      maxLength
    };
    onUpdate(updatedQuestion);
  }, [
    question, title, explanation, textAnswer, hintComment, 
    isMarkdown, supportCodeBlocks, minLength, maxLength, onUpdate
  ]);
  
  const handleFormatChange = (format: string) => {
    const isLong = format === 'long';
    setIsLongFormat(isLong);
    
    // Update default min/max lengths based on format
    if (isLong && maxLength < 100) {
      setMaxLength(1000);
      setMinLength(Math.min(minLength, 50));
      handleUpdate();
    } else if (!isLong && maxLength > 100) {
      setMaxLength(100);
      setMinLength(Math.min(minLength, 5));
      handleUpdate();
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">
              {t('quiz.types.Text Question', { lng: quizLanguage })}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onMoveUp}
              title={t('quiz.editor.textQuestion.buttons.moveUp', { lng: quizLanguage })}
            >
              {t('quiz.editor.textQuestion.buttons.moveUp', { lng: quizLanguage })}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onMoveDown}
              title={t('quiz.editor.textQuestion.buttons.moveDown', { lng: quizLanguage })}
            >
              {t('quiz.editor.textQuestion.buttons.moveDown', { lng: quizLanguage })}
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onDelete}
              title={t('quiz.editor.textQuestion.buttons.delete', { lng: quizLanguage })}
            >
              {t('quiz.editor.textQuestion.buttons.delete', { lng: quizLanguage })}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-title">
            {t('quiz.editor.question', { lng: quizLanguage })}
          </Label>
          <Textarea 
            id="question-title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdate}
            className="min-h-[100px]"
          />
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="settings">{t('quiz.editor.settings', { lng: quizLanguage })}</TabsTrigger>
            <TabsTrigger value="sample-answer">{t('quiz.editor.sampleAnswer', { lng: quizLanguage })}</TabsTrigger>
            <TabsTrigger value="help">{t('quiz.editor.hintAndExplanation', { lng: quizLanguage })}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <QuestionTimerSettings 
                timeLimit={question.timeLimit}
                onChange={(timeLimit) => onUpdate({ ...question, timeLimit })}
              />
              
              <div className="space-y-2">
                <Label className="font-semibold">
                  {t('quiz.editor.answerFormat', { lng: quizLanguage })}
                </Label>
                <RadioGroup 
                  defaultValue={isLongFormat ? 'long' : 'short'} 
                  onValueChange={handleFormatChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="format-short" />
                    <Label htmlFor="format-short">
                      {t('quiz.editor.shortAnswer', { lng: quizLanguage })}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="format-long" />
                    <Label htmlFor="format-long">
                      {t('quiz.editor.longAnswer', { lng: quizLanguage })}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold">
                  {t('quiz.editor.formatOptions', { lng: quizLanguage })}
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="is-markdown" 
                      checked={isMarkdown}
                      onCheckedChange={(checked) => {
                        setIsMarkdown(checked);
                        handleUpdate();
                      }}
                    />
                    <Label htmlFor="is-markdown">
                      {t('quiz.editor.enableMarkdown', { lng: quizLanguage })}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="support-code" 
                      checked={supportCodeBlocks}
                      onCheckedChange={(checked) => {
                        setSupportCodeBlocks(checked);
                        handleUpdate();
                      }}
                    />
                    <Label htmlFor="support-code">
                      {t('quiz.editor.enableCodeBlocks', { lng: quizLanguage })}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sample-answer" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-answer">
                {t('quiz.editor.sampleAnswer', { lng: quizLanguage })}
              </Label>
              <Textarea
                id="text-answer"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onBlur={handleUpdate}
                className={isLongFormat ? "min-h-[200px] font-mono" : "min-h-[80px] font-mono"}
                placeholder={t('quiz.editor.sampleAnswerPlaceholder', { lng: quizLanguage })}
              />
              <p className="text-sm text-muted-foreground">
                {isMarkdown && "Markdown is enabled. Use **bold**, *italic*, and ```code blocks``` for formatting."}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hint-text">
                {t('quiz.editor.hint', { lng: quizLanguage })}
              </Label>
              <Textarea
                id="hint-text"
                value={hintComment}
                onChange={(e) => setHintComment(e.target.value)}
                onBlur={handleUpdate}
                className="min-h-[100px]"
                placeholder={t('quiz.editor.hintPlaceholder', { lng: quizLanguage })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="explanation-text">
                {t('quiz.editor.explanation', { lng: quizLanguage })}
              </Label>
              <Textarea
                id="explanation-text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                onBlur={handleUpdate}
                className="min-h-[100px]"
                placeholder={t('quiz.editor.explanationPlaceholder', { lng: quizLanguage })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}