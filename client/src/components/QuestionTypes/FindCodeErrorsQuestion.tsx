import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Plus, X } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { Question } from '@/types';
import QuestionTimerSettings from '@/components/QuizEditor/QuestionTimerSettings';
import { useTranslation } from 'react-i18next';
import { useQuiz } from '@/context/QuizContext';

interface FindCodeErrorsQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function FindCodeErrorsQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: FindCodeErrorsQuestionProps) {
  const { t } = useTranslation();
  const { quizLanguage } = useQuiz();
  const [showPreview, setShowPreview] = useState(false);

  const handleTitleChange = (title: string) => {
    onUpdate({ ...question, title });
  };

  const handleCodeWithErrorsChange = (codeWithErrors: string) => {
    onUpdate({ ...question, codeWithErrors });
  };

  const handleCorrectCodeChange = (correctCode: string) => {
    onUpdate({ ...question, correctCode });
  };

  const handleLanguageChange = (language: string) => {
    onUpdate({ ...question, language });
  };

  const handleHintChange = (hintComment: string) => {
    onUpdate({ ...question, hintComment });
  };

  const handleAddErrorDescription = () => {
    const errorDescriptions = [...(question.errorDescriptions || []), ''];
    onUpdate({ ...question, errorDescriptions });
  };

  const handleErrorDescriptionChange = (index: number, description: string) => {
    const errorDescriptions = [...(question.errorDescriptions || [])];
    errorDescriptions[index] = description;
    onUpdate({ ...question, errorDescriptions });
  };

  const handleRemoveErrorDescription = (index: number) => {
    const errorDescriptions = [...(question.errorDescriptions || [])];
    errorDescriptions.splice(index, 1);
    onUpdate({ ...question, errorDescriptions });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">{t('quiz.editor.findAndFixErrors.labels.questionTitle', { lng: quizLanguage })}</Label>
            <Input
              id="title"
              value={question.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1"
              placeholder={t('quiz.editor.findAndFixErrors.placeholders.questionTitle', { lng: quizLanguage })}
            />
          </div>

          {/* Code with Errors */}
          <div>
            <Label htmlFor="codeWithErrors">{t('quiz.editor.findAndFixErrors.labels.codeWithErrors', { lng: quizLanguage })}</Label>
            <Textarea
              id="codeWithErrors"
              value={question.codeWithErrors || ''}
              onChange={(e) => handleCodeWithErrorsChange(e.target.value)}
              className="font-mono mt-1 min-h-[150px]"
            />
          </div>

          {/* Correct Code */}
          <div>
            <Label htmlFor="correctCode">{t('quiz.editor.findAndFixErrors.labels.correctCode', { lng: quizLanguage })}</Label>
            <Textarea
              id="correctCode"
              value={question.correctCode || ''}
              onChange={(e) => handleCorrectCodeChange(e.target.value)}
              className="font-mono mt-1 min-h-[150px]"
            />
          </div>

          {/* Programming Language */}
          <div>
            <Label htmlFor="language">{t('quiz.editor.findAndFixErrors.labels.programmingLanguage', { lng: quizLanguage })}</Label>
            <Input
              id="language"
              value={question.language || 'javascript'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Error Descriptions */}
          <div>
            <Label>{t('quiz.editor.findAndFixErrors.labels.errorDescriptions', { lng: quizLanguage })}</Label>
            <div className="space-y-2 mt-1">
              {(question.errorDescriptions || []).map((description, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={description}
                    onChange={(e) => handleErrorDescriptionChange(index, e.target.value)}
                    placeholder={t('quiz.editor.findAndFixErrors.placeholders.errorDescription', { lng: quizLanguage })}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveErrorDescription(index)}
                    title={t('quiz.editor.findAndFixErrors.buttons.removeError', { lng: quizLanguage })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddErrorDescription}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('quiz.editor.findAndFixErrors.buttons.addError', { lng: quizLanguage })}
              </Button>
            </div>
          </div>

          {/* Hint */}
          <div>
            <Label htmlFor="hint">{t('quiz.editor.findAndFixErrors.labels.hint', { lng: quizLanguage })}</Label>
            <Textarea
              id="hint"
              value={question.hintComment || ''}
              onChange={(e) => handleHintChange(e.target.value)}
              className="mt-1"
              placeholder={t('quiz.editor.findAndFixErrors.placeholders.hint', { lng: quizLanguage })}
            />
          </div>

          {/* Timer Settings */}
          <QuestionTimerSettings
            timeLimit={question.timeLimit}
            onChange={(timeLimit) => onUpdate({ ...question, timeLimit })}
          />

          {/* Preview */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">{t('quiz.editor.findAndFixErrors.labels.preview', { lng: quizLanguage })}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center"
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                {showPreview 
                  ? t('quiz.editor.findAndFixErrors.buttons.hidePreview', { lng: quizLanguage })
                  : t('quiz.editor.findAndFixErrors.buttons.showPreview', { lng: quizLanguage })
                }
              </Button>
            </div>

            {showPreview && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">{t('quiz.editor.findAndFixErrors.labels.codeWithErrors', { lng: quizLanguage })}:</h4>
                  <div className="bg-[#1E293B] p-4 rounded-md">
                    <CodeBlock 
                      code={question.codeWithErrors || ''} 
                      language={question.language || 'javascript'} 
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">{t('quiz.editor.findAndFixErrors.labels.correctCode', { lng: quizLanguage })}:</h4>
                  <div className="bg-[#1E293B] p-4 rounded-md">
                    <CodeBlock 
                      code={question.correctCode || ''} 
                      language={question.language || 'javascript'} 
                    />
                  </div>
                </div>

                {question.errorDescriptions && question.errorDescriptions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('quiz.editor.findAndFixErrors.labels.errorDescriptions', { lng: quizLanguage })}:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {question.errorDescriptions.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Question Controls */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onMoveUp}
                title={t('quiz.editor.findAndFixErrors.buttons.moveUp', { lng: quizLanguage })}
              >
                {t('quiz.editor.findAndFixErrors.buttons.moveUp', { lng: quizLanguage })}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onMoveDown}
                title={t('quiz.editor.findAndFixErrors.buttons.moveDown', { lng: quizLanguage })}
              >
                {t('quiz.editor.findAndFixErrors.buttons.moveDown', { lng: quizLanguage })}
              </Button>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onDelete}
              title={t('quiz.editor.findAndFixErrors.buttons.delete', { lng: quizLanguage })}
            >
              {t('quiz.editor.findAndFixErrors.buttons.delete', { lng: quizLanguage })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 