import { useState } from 'react';
import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronUp, ChevronDown, Trash2, Eye, EyeOff, Lightbulb, Code } from 'lucide-react';
import { SyntaxHighlighterWrapper } from '@/lib/syntaxHighlighter';
import { useTranslation } from 'react-i18next';
import { useQuiz } from '@/context/QuizContext';

interface FillWholeQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function FillWholeQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: FillWholeQuestionProps) {
  const { t } = useTranslation();
  const { quizLanguage } = useQuiz();
  const [showSolution, setShowSolution] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Initialize properties if not present
  if (!question.language) {
    question = {
      ...question,
      language: 'javascript',
      codePrefix: '// Implement a function to calculate the factorial of a number\nfunction factorial(n) {\n  // Your code here\n',
      codeSuffix: '\n}\n\nconsole.log(factorial(5)); // Should output: 120',
      solutionCode: '  if (n <= 1) return 1;\n  return n * factorial(n - 1);',
      hintComment: 'Remember that factorial(0) = 1 and factorial(n) = n * factorial(n-1) for n > 0'
    };
    onUpdate(question);
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      title: e.target.value
    });
  };

  const handleCodePrefixChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      codePrefix: e.target.value
    });
  };

  const handleCodeSuffixChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      codeSuffix: e.target.value
    });
  };

  const handleSolutionCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      solutionCode: e.target.value
    });
  };

  const handleHintCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      hintComment: e.target.value
    });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...question,
      language: e.target.value
    });
  };

  // Combine all parts to preview the full code
  const generateFullCode = () => {
    const prefix = question.codePrefix || '';
    const solution = question.solutionCode || '';
    const suffix = question.codeSuffix || '';
    
    return `${prefix}${showSolution ? solution : '  // Student will write code here'}${suffix}`;
  };

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center text-lg font-medium">
            <span className="bg-emerald-500 text-white px-2 py-1 rounded-md text-xs mr-2">
              Question {question.order}
            </span>
            <Input 
              value={question.title} 
              onChange={handleTitleChange}
              className="bg-transparent border-none h-auto p-0 text-lg font-medium shadow-none focus-visible:ring-0"
              placeholder={t('quiz.editor.completeCodeBlock.placeholders.questionTitle', { lng: quizLanguage })}
            />
          </CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMoveUp} 
            title={t('quiz.editor.completeCodeBlock.buttons.moveUp', { lng: quizLanguage })}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMoveDown} 
            title={t('quiz.editor.completeCodeBlock.buttons.moveDown', { lng: quizLanguage })}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDelete} 
            title={t('quiz.editor.completeCodeBlock.buttons.delete', { lng: quizLanguage })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Language Selection */}
        <div className="flex items-center">
          <Label htmlFor="language" className="mr-3">
            {t('quiz.editor.completeCodeBlock.labels.programmingLanguage', { lng: quizLanguage })}
          </Label>
          <select
            id="language"
            value={question.language}
            onChange={handleLanguageChange}
            className="border border-slate-200 rounded px-3 py-1 text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="swift">Swift</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        {/* Code Sections */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="codePrefix" className="mb-2 block">
              {t('quiz.editor.completeCodeBlock.labels.codeBefore', { lng: quizLanguage })}
            </Label>
            <Textarea
              id="codePrefix"
              value={question.codePrefix || ''}
              onChange={handleCodePrefixChange}
              className="font-mono text-sm h-24"
              placeholder={t('quiz.editor.completeCodeBlock.placeholders.codeBefore', { lng: quizLanguage })}
            />
          </div>
          
          <div className="border-l-4 border-l-emerald-400 pl-4 py-1">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="solutionCode" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                {t('quiz.editor.completeCodeBlock.labels.solutionCode', { lng: quizLanguage })}
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSolution(!showSolution)}
                className="text-xs"
              >
                {showSolution ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {showSolution 
                  ? t('quiz.editor.completeCodeBlock.buttons.hidePreview', { lng: quizLanguage })
                  : t('quiz.editor.completeCodeBlock.buttons.showPreview', { lng: quizLanguage })
                }
              </Button>
            </div>
            <Textarea
              id="solutionCode"
              value={question.solutionCode || ''}
              onChange={handleSolutionCodeChange}
              className="font-mono text-sm h-28 bg-emerald-50"
              placeholder={t('quiz.editor.completeCodeBlock.placeholders.solutionCode', { lng: quizLanguage })}
            />
          </div>

          <div>
            <Label htmlFor="codeSuffix" className="mb-2 block">
              {t('quiz.editor.completeCodeBlock.labels.codeAfter', { lng: quizLanguage })}
            </Label>
            <Textarea
              id="codeSuffix"
              value={question.codeSuffix || ''}
              onChange={handleCodeSuffixChange}
              className="font-mono text-sm h-24"
              placeholder={t('quiz.editor.completeCodeBlock.placeholders.codeAfter', { lng: quizLanguage })}
            />
          </div>
        </div>

        {/* Question Settings */}
        <div className="space-y-4 border border-slate-200 p-4 rounded-lg bg-slate-50">
          <h3 className="text-sm font-medium">
            {t('quiz.editor.completeCodeBlock.labels.questionSettings', { lng: quizLanguage })}
          </h3>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="hideSolution" 
              checked={question.hideSolution || false}
              onChange={(e) => onUpdate({
                ...question,
                hideSolution: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <Label htmlFor="hideSolution" className="text-sm cursor-pointer">
              {t('quiz.editor.completeCodeBlock.labels.hideSolutionButton', { lng: quizLanguage })}
            </Label>
          </div>
        </div>
        
        {/* Hint */}
        <div className="space-y-2 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <Label htmlFor="hintComment" className="flex items-center text-amber-800">
            <Lightbulb className="h-4 w-4 mr-2 text-amber-600" />
            {t('quiz.editor.completeCodeBlock.labels.hintComment', { lng: quizLanguage })}
          </Label>
          <Textarea
            id="hintComment"
            value={question.hintComment || ''}
            onChange={handleHintCommentChange}
            className="text-sm border-amber-200"
            placeholder={t('quiz.editor.completeCodeBlock.placeholders.hintComment', { lng: quizLanguage })}
          />
        </div>

        {/* Full Code Preview */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">
              {t('quiz.editor.completeCodeBlock.labels.completeCodePreview', { lng: quizLanguage })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullPreview(!showFullPreview)}
              className="flex items-center"
            >
              {showFullPreview ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
              {showFullPreview 
                ? t('quiz.editor.completeCodeBlock.buttons.hidePreview', { lng: quizLanguage })
                : t('quiz.editor.completeCodeBlock.buttons.showPreview', { lng: quizLanguage })
              }
            </Button>
          </div>
          
          {showFullPreview && (
            <div className="mt-4">
              <div className="bg-slate-100 p-3 rounded-lg mb-3">
                <p className="text-sm text-slate-600">
                  {showSolution 
                    ? t('quiz.editor.completeCodeBlock.messages.previewWithSolution', { lng: quizLanguage })
                    : t('quiz.editor.completeCodeBlock.messages.previewInitial', { lng: quizLanguage })}
                </p>
              </div>
              <div className="border border-slate-200 rounded overflow-hidden bg-white">
                <SyntaxHighlighterWrapper 
                  code={generateFullCode()} 
                  language={question.language || 'javascript'} 
                  showLineNumbers={true} 
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}