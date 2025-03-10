import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useQuiz } from '@/context/QuizContext';

interface QuizInformationProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

export default function QuizInformation({
  title,
  setTitle,
  description,
  setDescription
}: QuizInformationProps) {
  const { 
    hideFooter, 
    setHideFooter, 
    stepByStep, 
    setStepByStep, 
    requireCorrectAnswer, 
    setRequireCorrectAnswer 
  } = useQuiz();
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Quiz Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</Label>
          <Input
            type="text"
            id="quizTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="JavaScript Basics Quiz"
          />
        </div>
        <div>
          <Label htmlFor="quizDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
          <Textarea
            id="quizDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Test your JavaScript knowledge with this quiz"
            rows={3}
          />
        </div>
        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="hide-footer" 
              checked={hideFooter} 
              onCheckedChange={setHideFooter} 
            />
            <Label htmlFor="hide-footer" className="text-sm font-medium text-gray-700">
              Hide "Powered by" footer
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="step-by-step" 
              checked={stepByStep} 
              onCheckedChange={setStepByStep} 
            />
            <Label htmlFor="step-by-step" className="text-sm font-medium text-gray-700">
              Show questions one at a time
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="require-correct" 
              checked={requireCorrectAnswer} 
              onCheckedChange={setRequireCorrectAnswer}
              disabled={!stepByStep} 
            />
            <Label htmlFor="require-correct" className="text-sm font-medium text-gray-700">
              Require correct answers before proceeding
            </Label>
            {!stepByStep && (
              <span className="text-sm text-gray-500 ml-2">(Enable step-by-step mode first)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
