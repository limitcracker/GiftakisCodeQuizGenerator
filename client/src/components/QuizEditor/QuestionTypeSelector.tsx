import { Button } from '@/components/ui/button';
import { QuestionType } from '@/types';

const questionTypes = [
  { 
    type: 'code-order' as QuestionType, 
    icon: 'fa-sort', 
    label: 'Order Code Blocks' 
  },
  { 
    type: 'jigsaw' as QuestionType, 
    icon: 'fa-puzzle-piece', 
    label: '2D Jigsaw Puzzle' 
  },
  { 
    type: 'fill-gaps' as QuestionType, 
    icon: 'fa-code', 
    label: 'Fill in the Gaps' 
  },
  { 
    type: 'multiple-choice' as QuestionType, 
    icon: 'fa-list-check', 
    label: 'Multiple Choice' 
  },
  { 
    type: 'single-choice' as QuestionType, 
    icon: 'fa-circle-dot', 
    label: 'Single Choice' 
  },
  { 
    type: 'find-errors' as QuestionType, 
    icon: 'fa-bug', 
    label: 'Find Code Errors' 
  },
  { 
    type: 'image-choice' as QuestionType, 
    icon: 'fa-image', 
    label: 'Image Based Questions' 
  },
  { 
    type: 'video-choice' as QuestionType, 
    icon: 'fa-video', 
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
      {questionTypes.map((type) => (
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
            <i className={`fas ${type.icon} mr-2`}></i>
            {type.label}
          </Button>
        </li>
      ))}
    </ul>
  );
}
