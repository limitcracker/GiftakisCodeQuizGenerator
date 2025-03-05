import { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Question } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">
              {question.type === 'text-short' ? 'Short Text Question' : 'Long Text Question'}
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
                className="min-h-[200px] font-mono"
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