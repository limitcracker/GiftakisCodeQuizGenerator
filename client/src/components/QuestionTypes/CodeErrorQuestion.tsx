import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Question, CodeErrorLine } from '@/types';

interface CodeErrorQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function CodeErrorQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: CodeErrorQuestionProps) {
  const [localTitle, setLocalTitle] = useState(question.title);
  const [localExplanation, setLocalExplanation] = useState(question.explanation || '');
  const [codeString, setCodeString] = useState(question.code || '');
  const [errorLines, setErrorLines] = useState<CodeErrorLine[]>(
    question.errorLines as CodeErrorLine[] || []
  );
  const [errors, setErrors] = useState<string[]>(
    question.errors as string[] || []
  );
  const [newError, setNewError] = useState('');

  const handleSave = () => {
    onUpdate({
      ...question,
      title: localTitle,
      explanation: localExplanation,
      code: codeString,
      errorLines: errorLines,
      errors: errors
    });
  };

  const handleAddError = () => {
    if (newError.trim()) {
      setErrors([...errors, newError.trim()]);
      setNewError('');
    }
  };

  const handleRemoveError = (index: number) => {
    const updatedErrors = [...errors];
    updatedErrors.splice(index, 1);
    setErrors(updatedErrors);
  };

  const toggleErrorLine = (lineNum: number) => {
    // Find if the line is already marked as an error
    const existingIndex = errorLines.findIndex(line => line.lineNumber === lineNum);
    
    if (existingIndex >= 0) {
      // Remove the line from errors
      const updatedErrorLines = [...errorLines];
      updatedErrorLines.splice(existingIndex, 1);
      setErrorLines(updatedErrorLines);
    } else {
      // Add the line to errors
      const newErrorLine: CodeErrorLine = {
        lineNumber: lineNum,
        code: getCodeLine(lineNum)
      };
      setErrorLines([...errorLines, newErrorLine]);
    }
  };

  const getCodeLine = (lineNum: number): string => {
    const lines = codeString.split('\n');
    return lineNum <= lines.length ? lines[lineNum - 1] : '';
  };

  const isErrorLine = (lineNum: number): boolean => {
    return errorLines.some(line => line.lineNumber === lineNum);
  };

  const toggleErrorCheckbox = (index: number, checked: boolean) => {
    const updatedErrors = [...errors];
    updatedErrors[index] = {
      ...updatedErrors[index],
      isCorrect: checked
    } as any;
    setErrors(updatedErrors);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Question {question.order} <span className="text-sm font-normal text-gray-500">(Find Code Errors)</span>
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onMoveUp}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m18 15-6-6-6 6"/></svg>
            </Button>
            <Button variant="ghost" size="icon" onClick={onMoveDown}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor={`question-title-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">Question</Label>
            <Input
              id={`question-title-${question.id}`}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Code with Errors</h3>
            
            <div className="mb-4">
              <Textarea
                value={codeString}
                onChange={(e) => setCodeString(e.target.value)}
                className="font-mono text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-2"
                rows={10}
                placeholder="Enter your code here. Then click on the line numbers to mark lines that contain errors."
              />
            </div>
            
            <div className="bg-[#1E293B] p-4 rounded-md font-mono text-sm text-[#E5E7EB] overflow-auto">
              <div className="flex">
                <div className="pr-3 text-gray-500 select-none border-r border-gray-700 mr-3">
                  {codeString.split('\n').map((_, i) => (
                    <div 
                      key={i} 
                      className="cursor-pointer hover:text-white"
                      onClick={() => toggleErrorLine(i + 1)}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  {codeString.split('\n').map((line, i) => {
                    const lineNumber = i + 1;
                    const isError = isErrorLine(lineNumber);
                    return (
                      <div 
                        key={i}
                        className={`hover:bg-slate-700 px-2 rounded ${isError ? 'bg-red-900/20' : ''} flex items-center`}
                      >
                        {isError && <Checkbox checked={true} className="mr-2" />}
                        <span>{line}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm mb-2">Errors to Find: <span className="text-gray-500">(Select all that apply)</span></h4>
                <div className="flex">
                  <Input
                    value={newError}
                    onChange={(e) => setNewError(e.target.value)}
                    placeholder="New error description"
                    className="mr-2 h-8 text-sm"
                  />
                  <Button onClick={handleAddError} size="sm" className="h-8">Add</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div className="flex items-center">
                      <Checkbox 
                        id={`error-${index}`} 
                        checked={error.isCorrect}
                        onCheckedChange={(checked) => toggleErrorCheckbox(index, checked as boolean)}
                        className="h-4 w-4 text-blue-600 rounded" 
                      />
                      <Label htmlFor={`error-${index}`} className="ml-2 text-sm text-gray-700">{error}</Label>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveError(index)}
                      className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </Button>
                  </div>
                ))}
              </div>
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
