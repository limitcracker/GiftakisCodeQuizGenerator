import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PencilIcon } from 'lucide-react';
import { Question, CodeGap } from '@/types';
import { useTranslation } from 'react-i18next';
import { useQuiz } from '@/context/QuizContext';

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
  const { t } = useTranslation();
  const { quizLanguage } = useQuiz();
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
            {t('quiz.editor.fillGaps.messages.questionType', { number: question.order })}
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onMoveUp}>
              {t('quiz.editor.fillGaps.buttons.moveUp', { lng: quizLanguage })}
            </Button>
            <Button variant="outline" size="sm" onClick={onMoveDown}>
              {t('quiz.editor.fillGaps.buttons.moveDown', { lng: quizLanguage })}
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              {t('quiz.editor.fillGaps.buttons.delete', { lng: quizLanguage })}
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor={`title-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              {t('quiz.editor.fillGaps.labels.questionTitle', { lng: quizLanguage })}
            </Label>
            <Input
              id={`title-${question.id}`}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder={t('quiz.editor.fillGaps.placeholders.questionTitle', { lng: quizLanguage })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="block text-sm font-medium text-gray-700">
                {t('quiz.editor.fillGaps.labels.codeWithGaps', { lng: quizLanguage })}
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingCode(!isEditingCode)}
                className="flex items-center text-xs"
              >
                <PencilIcon className="h-3 w-3 mr-1" /> 
                {isEditingCode ? t('quiz.editor.fillGaps.buttons.view', { lng: quizLanguage }) : t('quiz.editor.fillGaps.buttons.edit', { lng: quizLanguage })}
              </Button>
            </div>
            
            {isEditingCode ? (
              <div>
                <Textarea
                  value={codeWithGaps}
                  onChange={(e) => setCodeWithGaps(e.target.value)}
                  className="w-full h-32 px-3 py-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('quiz.editor.fillGaps.placeholders.codeWithGaps', { lng: quizLanguage })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('quiz.editor.fillGaps.labels.gapSyntaxHelp', { lng: quizLanguage })}
                </p>
                <Button 
                  onClick={() => saveCodeWithGaps(codeWithGaps)}
                  size="sm"
                  className="mt-2"
                >
                  {t('quiz.editor.fillGaps.buttons.applyGaps', { lng: quizLanguage })}
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
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              {t('quiz.editor.fillGaps.labels.availableSnippets', { lng: quizLanguage })}
            </Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                value={newSnippet}
                onChange={(e) => setNewSnippet(e.target.value)}
                placeholder={t('quiz.editor.fillGaps.placeholders.addSnippet', { lng: quizLanguage })}
                className="flex-1"
              />
              <Button onClick={handleAddSnippet}>
                {t('quiz.editor.fillGaps.buttons.add', { lng: quizLanguage })}
              </Button>
            </div>
            <div className="space-y-2">
              {availableSnippets.map((snippet, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <code className="text-sm">{snippet}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSnippet(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              {t('quiz.editor.fillGaps.labels.explanation', { lng: quizLanguage })}
            </Label>
            <Textarea
              id={`explanation-${question.id}`}
              value={localExplanation}
              onChange={(e) => setLocalExplanation(e.target.value)}
              placeholder={t('quiz.editor.fillGaps.placeholders.explanation', { lng: quizLanguage })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
