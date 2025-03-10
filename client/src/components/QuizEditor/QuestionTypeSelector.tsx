import { Button } from '@/components/ui/button';
import type { QuestionType } from '@/types';
import { 
  MoveVertical, 
  Code, 
  CheckSquare, 
  Circle, 
  FileCode,
  AlignLeft,
  TextQuote,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuiz } from '@/context/QuizContext';
import { useEffect } from 'react';

const questionTypes = [
  { 
    type: 'code-order' as QuestionType, 
    icon: MoveVertical, 
    translationKey: 'quiz.types.Order Code Blocks'
  },
  { 
    type: 'jigsaw' as QuestionType, 
    icon: Code, // Using Code icon for now until we find a better one
    translationKey: 'quiz.types.2D Jigsaw Puzzle'
  },
  { 
    type: 'fill-gaps' as QuestionType, 
    icon: Code, 
    translationKey: 'quiz.types.Fill in the Gaps'
  },
  { 
    type: 'fill-whole' as QuestionType, 
    icon: FileCode, 
    translationKey: 'quiz.types.Complete Code Block'
  },
  { 
    type: 'multiple-choice' as QuestionType, 
    icon: CheckSquare, 
    translationKey: 'quiz.types.Multiple Choice'
  },
  { 
    type: 'single-choice' as QuestionType, 
    icon: Circle, 
    translationKey: 'quiz.types.Single Choice'
  },
  { 
    type: 'text' as QuestionType, 
    icon: TextQuote, 
    translationKey: 'quiz.types.Text Question'
  },
  {
    type: 'find-code-errors' as QuestionType,
    icon: AlertTriangle,
    translationKey: 'quiz.types.Find and Fix Code Errors'
  }
];

interface QuestionTypeSelectorProps {
  selectedType: QuestionType | null;
  onSelectType: (type: QuestionType) => void;
}

export default function QuestionTypeSelector({
  selectedType,
  onSelectType
}: QuestionTypeSelectorProps) {
  const { t, i18n } = useTranslation();
  const { quizLanguage } = useQuiz();

  // Force language update when quiz language changes
  useEffect(() => {
    console.log('QuestionTypeSelector: Setting language to:', quizLanguage);
    i18n.changeLanguage(quizLanguage).then(() => {
      console.log('QuestionTypeSelector: Language changed successfully');
    }).catch((error) => {
      console.error('QuestionTypeSelector: Failed to change language:', error);
    });
  }, [quizLanguage, i18n]);

  const translatedQuestionTypes = questionTypes.map((type) => {
    const label = t(type.translationKey, { lng: quizLanguage });
    console.log(`Translation for ${type.translationKey}:`, label);
    return {
      ...type,
      label
    };
  });

  return (
    <ul className="space-y-2 font-medium text-sm">
      {translatedQuestionTypes.map((type) => {
        const IconComponent = type.icon;
        return (
          <li key={type.type} className="rounded-md transition cursor-pointer">
            <Button
              variant="ghost"
              className={`w-full text-left px-3 py-2 rounded justify-start ${
                selectedType === type.type
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectType(type.type)}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {type.label}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
