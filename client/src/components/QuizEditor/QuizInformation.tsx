import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuiz } from "@/context/QuizContext";

const quizLanguages = [
  { code: 'en', name: 'English' },
  { code: 'el', name: 'Greek (Ελληνικά)' }
];

export default function QuizInformation() {
  const { t } = useTranslation();
  const { 
    quizTitle, 
    setQuizTitle,
    quizDescription, 
    setQuizDescription,
    hideFooter,
    setHideFooter,
    stepByStep,
    setStepByStep,
    requireCorrectAnswer,
    setRequireCorrectAnswer,
    quizLanguage,
    setQuizLanguage
  } = useQuiz();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('quiz.create.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('quiz.create.name')}</Label>
          <Input
            id="title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder={t('quiz.create.namePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('quiz.create.description')}</Label>
          <Textarea
            id="description"
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            placeholder={t('quiz.create.descriptionPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quiz-language">{t('quiz.create.language')}</Label>
          <Select value={quizLanguage} onValueChange={setQuizLanguage}>
            <SelectTrigger id="quiz-language">
              <SelectValue placeholder={t('quiz.create.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {quizLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {t('quiz.create.languageDescription')}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="hide-footer" 
              checked={hideFooter} 
              onCheckedChange={setHideFooter} 
            />
            <Label htmlFor="hide-footer">
              {t('quiz.create.hideFooter')}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="step-by-step" 
              checked={stepByStep} 
              onCheckedChange={setStepByStep} 
            />
            <Label htmlFor="step-by-step">
              {t('quiz.create.stepByStep')}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="require-correct" 
              checked={requireCorrectAnswer} 
              onCheckedChange={setRequireCorrectAnswer}
              disabled={!stepByStep} 
            />
            <Label htmlFor="require-correct">
              {t('quiz.create.requireCorrect')}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
