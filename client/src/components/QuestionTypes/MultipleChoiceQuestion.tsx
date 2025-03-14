import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusIcon, XIcon, EyeOffIcon } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { Question, MultipleChoiceOption } from '@/types';
import QuestionTimerSettings from '@/components/QuizEditor/QuestionTimerSettings';
import { useTranslation } from 'react-i18next';
import { useQuiz } from '@/context/QuizContext';

interface MultipleChoiceQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function MultipleChoiceQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: MultipleChoiceQuestionProps) {
  const { t } = useTranslation();
  const { quizLanguage } = useQuiz();
  const [localTitle, setLocalTitle] = useState(question.title);
  const [localExplanation, setLocalExplanation] = useState(question.explanation || '');
  const [localCodeExample, setLocalCodeExample] = useState(question.codeExample || '');
  const [options, setOptions] = useState<MultipleChoiceOption[]>(
    question.options as MultipleChoiceOption[] || []
  );

  const handleSave = () => {
    onUpdate({
      ...question,
      title: localTitle,
      explanation: localExplanation,
      codeExample: localCodeExample,
      options: options
    });
  };

  const handleAddOption = () => {
    const newOption: MultipleChoiceOption = {
      id: `option-${Date.now()}`,
      text: '',
      isCorrect: false,
      feedback: ''
    };
    setOptions([...options, newOption]);
  };

  const handleDeleteOption = (id: string) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleOptionChange = (id: string, field: keyof MultipleChoiceOption, value: any) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t('quiz.editor.question', { lng: quizLanguage })} {question.order} <span className="text-sm font-normal text-gray-500">(Multiple Choice)</span>
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
            <Label htmlFor={`question-title-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              {t('quiz.editor.question', { lng: quizLanguage })}
            </Label>
            <Input
              id={`question-title-${question.id}`}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <Label htmlFor={`code-example-${question.id}`} className="block text-sm font-medium text-gray-700 mb-2">
              {t('quiz.editor.codeExample', { lng: quizLanguage })}
            </Label>
            <div className="relative">
              <Textarea
                id={`code-example-${question.id}`}
                value={localCodeExample}
                onChange={(e) => setLocalCodeExample(e.target.value)}
                className="font-mono text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
              {localCodeExample && (
                <div className="mt-2 border rounded-md bg-[#1E293B] p-3 font-mono text-sm text-[#E5E7EB]">
                  <CodeBlock code={localCodeExample} language="javascript" />
                </div>
              )}
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">{t('quiz.editor.answerOptions', { lng: quizLanguage })}</h3>
              <Button 
                variant="ghost" 
                onClick={handleAddOption}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-sm h-8">
                <PlusIcon className="w-4 h-4 mr-1" />
                {t('quiz.editor.addOption', { lng: quizLanguage })}
              </Button>
            </div>
            
            {options.map((option, index) => (
              <div key={option.id} className="bg-white border border-gray-200 rounded-md mb-3 last:mb-0 p-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 flex-shrink-0">
                    <Checkbox 
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => handleOptionChange(option.id, 'isCorrect', checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteOption(option.id)}
                      className="text-red-500 hover:text-red-700 p-1 h-8 w-8">
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 ml-9">
                  <Label htmlFor={`feedback-${option.id}`} className="block text-xs font-medium text-gray-500 mb-1">
                    {t('quiz.editor.feedback', { lng: quizLanguage })}
                  </Label>
                  <Input
                    id={`feedback-${option.id}`}
                    value={option.feedback}
                    onChange={(e) => handleOptionChange(option.id, 'feedback', e.target.value)}
                    placeholder={t('quiz.editor.feedbackPlaceholder', { lng: quizLanguage })}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Question Settings */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
            <h3 className="font-medium">{t('quiz.editor.questionSettings', { lng: quizLanguage })}</h3>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id={`hideSolution-${question.id}`}
                checked={question.hideSolution || false}
                onChange={(e) => onUpdate({
                  ...question,
                  hideSolution: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <Label htmlFor={`hideSolution-${question.id}`} className="text-sm cursor-pointer flex items-center">
                <EyeOffIcon className="h-3 w-3 mr-1 text-gray-500" />
                {t('quiz.editor.hideCorrectAnswers', { lng: quizLanguage })}
              </Label>
            </div>
            
            <p className="text-xs text-gray-500 ml-6">
              {t('quiz.editor.hideCorrectAnswersDescription', { lng: quizLanguage })}
            </p>
            
            {/* Question Timer Settings */}
            <QuestionTimerSettings 
              questionId={question.id} 
              currentTimeLimit={question.timeLimit} 
            />
          </div>
          
          <div>
            <Label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              {t('quiz.editor.explanation', { lng: quizLanguage })}
            </Label>
            <Textarea
              id={`explanation-${question.id}`}
              value={localExplanation}
              onChange={(e) => setLocalExplanation(e.target.value)}
              placeholder={t('quiz.editor.explanationPlaceholder', { lng: quizLanguage })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <Button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              {t('quiz.editor.saveQuestion', { lng: quizLanguage })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
