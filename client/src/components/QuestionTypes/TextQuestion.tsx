import { useState } from 'react';
import { Question } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SyntaxHighlighterWrapper } from '@/lib/syntaxHighlighter';
import { AlignLeft, Code, FileCode, TextQuote } from 'lucide-react';

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
  const [isMarkdown, setIsMarkdown] = useState(question.isMarkdown || false);
  const [supportCodeBlocks, setSupportCodeBlocks] = useState(question.supportCodeBlocks || false);
  const [minLength, setMinLength] = useState(question.minLength || 0);
  const [maxLength, setMaxLength] = useState(question.maxLength || 0);
  const [hintComment, setHintComment] = useState(question.hintComment || '');

  // Determine if it's a short or long text question
  const isShort = question.type === 'text-short';

  const handleUpdate = () => {
    const updatedQuestion: Question = {
      ...question,
      title,
      explanation,
      textAnswer,
      isMarkdown,
      supportCodeBlocks,
      minLength: minLength > 0 ? minLength : undefined,
      maxLength: maxLength > 0 ? maxLength : undefined,
      hintComment: hintComment || undefined
    };
    onUpdate(updatedQuestion);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white">
      <div className="flex items-center mb-4">
        {isShort ? (
          <AlignLeft className="w-5 h-5 mr-2 text-blue-500" />
        ) : (
          <TextQuote className="w-5 h-5 mr-2 text-purple-500" />
        )}
        <h3 className="text-lg font-semibold">
          {isShort ? 'Short Answer Question' : 'Long Answer Question'}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="question-title">Question Title</Label>
          <Input
            id="question-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdate}
            placeholder="Enter the question title"
            className="w-full mt-1"
          />
        </div>

        <div>
          <Label htmlFor="expected-answer">Expected Answer (for instructor reference)</Label>
          {isShort ? (
            <Input
              id="expected-answer"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onBlur={handleUpdate}
              placeholder="Enter the expected answer"
              className="w-full mt-1"
            />
          ) : (
            <Textarea
              id="expected-answer"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onBlur={handleUpdate}
              placeholder="Enter the expected answer"
              className="w-full mt-1 min-h-[150px]"
            />
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="markdown-support"
              checked={isMarkdown}
              onCheckedChange={(checked) => {
                setIsMarkdown(checked);
                setTimeout(handleUpdate, 0);
              }}
            />
            <Label htmlFor="markdown-support" className="cursor-pointer">
              Enable Markdown Formatting
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="code-blocks"
              checked={supportCodeBlocks}
              onCheckedChange={(checked) => {
                setSupportCodeBlocks(checked);
                setTimeout(handleUpdate, 0);
              }}
            />
            <Label htmlFor="code-blocks" className="cursor-pointer flex items-center">
              <Code className="h-4 w-4 mr-1" />
              Support Code Blocks
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min-length">Minimum Characters</Label>
            <Input
              id="min-length"
              type="number"
              value={minLength || ""}
              onChange={(e) => {
                const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                setMinLength(value);
              }}
              onBlur={handleUpdate}
              placeholder="0"
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="max-length">Maximum Characters</Label>
            <Input
              id="max-length"
              type="number"
              value={maxLength || ""}
              onChange={(e) => {
                const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                setMaxLength(value);
              }}
              onBlur={handleUpdate}
              placeholder="0 (unlimited)"
              className="w-full mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="hint-comment">Hint (optional)</Label>
          <Input
            id="hint-comment"
            value={hintComment}
            onChange={(e) => setHintComment(e.target.value)}
            onBlur={handleUpdate}
            placeholder="Enter a hint for the student"
            className="w-full mt-1"
          />
        </div>

        <div>
          <Label htmlFor="explanation">Explanation (optional, shown after submission)</Label>
          <Textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            onBlur={handleUpdate}
            placeholder="Provide an explanation for the answer"
            className="w-full mt-1"
          />
        </div>

        {supportCodeBlocks && textAnswer && (
          <div className="mt-4 border rounded-md p-3 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Answer Preview (with code formatting):</h4>
            <SyntaxHighlighterWrapper 
              code={textAnswer} 
              language="javascript" 
              showLineNumbers={false} 
            />
          </div>
        )}

        <div className="flex justify-between pt-4">
          <div>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-red-500">
              Delete
            </Button>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={onMoveUp}>
              Move Up
            </Button>
            <Button variant="outline" size="sm" onClick={onMoveDown}>
              Move Down
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}