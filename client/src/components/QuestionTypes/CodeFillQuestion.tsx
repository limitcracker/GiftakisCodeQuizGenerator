import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PencilIcon } from 'lucide-react';
import { Question, CodeGap } from '@/types';

interface CodeFillQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function CodeFillQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: CodeFillQuestionProps) {
  const [localTitle, setLocalTitle] = useState(question.title);
  const [localExplanation, setLocalExplanation] = useState(question.explanation || '');
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [codeWithGaps, setCodeWithGaps] = useState(question.codeWithGaps || '');
  const [gaps, setGaps] = useState<CodeGap[]>(
    question.gaps as CodeGap[] || []
  );
  const [availableSnippets, setAvailableSnippets] = useState<string[]>(
    question.availableSnippets as string[] || []
  );
  const [newSnippet, setNewSnippet] = useState('');

  const handleSave = () => {
    onUpdate({
      ...question,
      title: localTitle,
      explanation: localExplanation,
      codeWithGaps: codeWithGaps,
      gaps: gaps,
      availableSnippets: availableSnippets
    });
  };

  const handleAddSnippet = () => {
    if (newSnippet.trim()) {
      setAvailableSnippets([...availableSnippets, newSnippet.trim()]);
      setNewSnippet('');
    }
  };

  const handleRemoveSnippet = (index: number) => {
    const updatedSnippets = [...availableSnippets];
    updatedSnippets.splice(index, 1);
    setAvailableSnippets(updatedSnippets);
  };

  // Temporarily removed drag-and-drop functionality due to React 18 compatibility issues
  const moveSnippet = (fromIndex: number, toIndex: number) => {
    const updatedSnippets = [...availableSnippets];
    const [movedItem] = updatedSnippets.splice(fromIndex, 1);
    updatedSnippets.splice(toIndex, 0, movedItem);
    setAvailableSnippets(updatedSnippets);
  };

  const parseCodeWithVisualGaps = () => {
    let displayCode = codeWithGaps;
    gaps.forEach((gap, index) => {
      const gapPlaceholder = `<span class="bg-blue-600 px-2 py-1 rounded text-white">${gap.answer}</span>`;
      displayCode = displayCode.replace(`[GAP_${index + 1}]`, gapPlaceholder);
    });
    return displayCode;
  };

  // Function to process code with gaps when editing is done
  const saveCodeWithGaps = (code: string) => {
    const gapPattern = /\[GAP_(\d+):(.*?)\]/g;
    let match;
    const newGaps: CodeGap[] = [];
    let cleanCode = code;

    while ((match = gapPattern.exec(code)) !== null) {
      const gapNumber = parseInt(match[1]);
      const gapAnswer = match[2];
      
      newGaps.push({
        id: `gap-${gapNumber}`,
        position: gapNumber,
        answer: gapAnswer
      });
      
      // Replace the pattern with a simple gap marker for the clean code
      cleanCode = cleanCode.replace(match[0], `[GAP_${gapNumber}]`);
    }

    setGaps(newGaps);
    setCodeWithGaps(cleanCode);
    setIsEditingCode(false);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Question {question.order} <span className="text-sm font-normal text-gray-500">(Fill in the Gaps)</span>
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onMoveUp}>
              Move Up
            </Button>
            <Button variant="outline" size="sm" onClick={onMoveDown}>
              Move Down
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor={`title-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">Question Title</Label>
            <Input
              id={`title-${question.id}`}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Enter question title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="block text-sm font-medium text-gray-700">Code with Gaps</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingCode(!isEditingCode)}
                className="flex items-center text-xs"
              >
                <PencilIcon className="h-3 w-3 mr-1" /> 
                {isEditingCode ? 'View' : 'Edit'}
              </Button>
            </div>
            
            {isEditingCode ? (
              <div>
                <Textarea
                  value={codeWithGaps}
                  onChange={(e) => setCodeWithGaps(e.target.value)}
                  className="w-full h-32 px-3 py-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Use [GAP_1:correctAnswer] syntax to create gaps. Example: const x = [GAP_1:10];"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use [GAP_n:answer] syntax, where n is the gap number and answer is the correct value.
                </p>
                <Button 
                  onClick={() => saveCodeWithGaps(codeWithGaps)}
                  size="sm"
                  className="mt-2"
                >
                  Apply Gaps
                </Button>
              </div>
            ) : (
              <div 
                className="w-full h-32 px-3 py-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 overflow-auto"
                dangerouslySetInnerHTML={{ __html: parseCodeWithVisualGaps() }}
              />
            )}
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Available Snippets</Label>
            <div className="flex mb-2">
              <Input
                value={newSnippet}
                onChange={(e) => setNewSnippet(e.target.value)}
                placeholder="Add a code snippet..."
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <Button 
                onClick={handleAddSnippet}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 p-3 min-h-12 border border-dashed border-gray-300 rounded-md">
              {availableSnippets.map((snippet, index) => (
                <div 
                  key={index}
                  className="relative border border-gray-300 rounded bg-white px-3 py-1 font-mono text-sm group"
                >
                  {snippet}
                  <button
                    onClick={() => handleRemoveSnippet(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="flex mt-1 space-x-1">
                    <button
                      onClick={() => index > 0 && moveSnippet(index, index - 1)}
                      disabled={index === 0}
                      className={`text-xs px-1 ${index === 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => index < availableSnippets.length - 1 && moveSnippet(index, index + 1)}
                      disabled={index === availableSnippets.length - 1}
                      className={`text-xs px-1 ${index === availableSnippets.length - 1 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</Label>
            <Textarea
              id={`explanation-${question.id}`}
              value={localExplanation}
              onChange={(e) => setLocalExplanation(e.target.value)}
              placeholder="Add explanation for correct answer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <Button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              Save Question
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
