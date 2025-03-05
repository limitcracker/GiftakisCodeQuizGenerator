import { Button } from '@/components/ui/button';
import { QuestionType } from '@/types';
import { 
  MoveVertical, 
  Code, 
  CheckSquare, 
  Circle, 
  Bug, 
  Image, 
  Video,
  FileCode,
  AlignLeft,
  TextQuote
} from 'lucide-react';

const questionTypes = [
  { 
    type: 'code-order' as QuestionType, 
    icon: MoveVertical, 
    label: 'Order Code Blocks' 
  },
  { 
    type: 'jigsaw' as QuestionType, 
    icon: Code, // Using Code icon for now until we find a better one
    label: '2D Jigsaw Puzzle' 
  },
  { 
    type: 'fill-gaps' as QuestionType, 
    icon: Code, 
    label: 'Fill in the Gaps' 
  },
  { 
    type: 'fill-whole' as QuestionType, 
    icon: FileCode, 
    label: 'Complete Code Block' 
  },
  { 
    type: 'multiple-choice' as QuestionType, 
    icon: CheckSquare, 
    label: 'Multiple Choice' 
  },
  { 
    type: 'single-choice' as QuestionType, 
    icon: Circle, 
    label: 'Single Choice' 
  },
  { 
    type: 'find-errors' as QuestionType, 
    icon: Bug, 
    label: 'Find Code Errors' 
  },
  { 
    type: 'text-short' as QuestionType, 
    icon: AlignLeft, 
    label: 'Short Answer Text' 
  },
  { 
    type: 'text-long' as QuestionType, 
    icon: TextQuote, 
    label: 'Long Answer Text' 
  },
  { 
    type: 'image-choice' as QuestionType, 
    icon: Image, 
    label: 'Image Based Questions' 
  },
  { 
    type: 'video-choice' as QuestionType, 
    icon: Video, 
    label: 'Video Based Questions' 
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
  return (
    <ul className="space-y-2 font-medium text-sm">
      {questionTypes.map((type) => {
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
