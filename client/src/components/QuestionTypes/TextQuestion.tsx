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
              Text Question
            </span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onMoveUp}>Move Up</Button>
            <Button variant="outline" size="sm" onClick={onMoveDown}>Move Down</Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-title">Question Title</Label>
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
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="sample-answer">Sample Answer</TabsTrigger>
            <TabsTrigger value="help">Hint & Explanation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <QuestionTimerSettings 
                questionId={question.id} 
                currentTimeLimit={question.timeLimit} 
              />
              
              <div className="space-y-2">
                <Label className="font-semibold">Answer Format</Label>
                <RadioGroup 
                  defaultValue={isLongFormat ? 'long' : 'short'} 
                  onValueChange={handleFormatChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="format-short" />
                    <Label htmlFor="format-short">Short Answer (Single line)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="format-long" />
                    <Label htmlFor="format-long">Long Answer (Multi-line)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold">Character Limits</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="min-length">Minimum Length</Label>
                    <Input 
                      id="min-length" 
                      type="number" 
                      min="0"
                      value={minLength} 
                      onChange={(e) => setMinLength(parseInt(e.target.value) || 0)}
                      onBlur={handleUpdate}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="max-length">Maximum Length</Label>
                    <Input 
                      id="max-length" 
                      type="number" 
                      min="0"
                      value={maxLength} 
                      onChange={(e) => setMaxLength(parseInt(e.target.value) || 0)}
                      onBlur={handleUpdate}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLongFormat 
                    ? "For long answers, recommended max length is between 500-2000 characters." 
                    : "For short answers, recommended max length is between 50-100 characters."}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold">Format Options</Label>
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
                    <Label htmlFor="is-markdown">Enable Markdown formatting in answer</Label>
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
                    <Label htmlFor="support-code">Support code blocks in answer</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sample-answer" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-answer">Sample Answer</Label>
              <Textarea
                id="text-answer"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onBlur={handleUpdate}
                className={isLongFormat ? "min-h-[200px] font-mono" : "min-h-[80px] font-mono"}
                placeholder="Enter a sample answer that will be shown when the student clicks 'Show Solution'"
              />
              <p className="text-sm text-muted-foreground">
                {isMarkdown && "Markdown is enabled. Use **bold**, *italic*, and ```code blocks``` for formatting."}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hint-text">Hint</Label>
              <Textarea
                id="hint-text"
                value={hintComment}
                onChange={(e) => setHintComment(e.target.value)}
                onBlur={handleUpdate}
                className="min-h-[100px]"
                placeholder="Provide a hint that can be shown to help students"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="explanation-text">Explanation</Label>
              <Textarea
                id="explanation-text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                onBlur={handleUpdate}
                className="min-h-[100px]"
                placeholder="Provide a detailed explanation of the answer"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}