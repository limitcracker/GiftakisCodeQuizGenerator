// Quiz Types
export type QuestionType = 
  | 'code-order' 
  | 'jigsaw' 
  | 'fill-gaps' 
  | 'multiple-choice' 
  | 'single-choice'
  | 'fill-whole'
  | 'text'
  | 'find-code-errors';

export interface QuizStyle {
  primaryColor?: string; // Main color for buttons, headers, and UI elements
  secondaryColor?: string; // Secondary color for accents and highlights
  backgroundColor?: string; // Background color of the quiz container
  textColor?: string; // Main text color 
  fontFamily?: string; // Font family for the quiz (e.g., 'Arial, sans-serif')
  borderRadius?: number; // Border radius in pixels for rounded corners
  buttonStyle?: 'rounded' | 'square' | 'pill'; // Button shape style
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number | null; // Overall quiz time limit in seconds (null = no limit)
  hideFooter?: boolean; // Option to hide the "Powered by" footer
  style?: QuizStyle; // Custom styling options for the quiz
  stepByStep?: boolean; // Whether to show questions one at a time
  requireCorrectAnswer?: boolean; // Whether to require correct answers before proceeding
  language: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  explanation?: string;
  order: number;
  
  // Question control settings
  hideSolution?: boolean;  // If true, students cannot view the solution
  timeLimit?: number | null;  // Time limit in seconds (null = no limit)
  
  // Type-specific properties
  codeBlocks?: CodeOrderBlock[];  // For code-order questions
  options?: MultipleChoiceOption[];  // For multiple/single choice questions
  codeExample?: string;  // Optional code example for multiple/single choice
  
  // Find Code Errors specific properties
  codeWithErrors?: string;  // The code containing errors
  correctCode?: string;    // The correct version of the code
  errorDescriptions?: string[];  // List of error descriptions to help students
  
  // Fill in the gaps
  codeWithGaps?: string;
  gaps?: CodeGap[];
  availableSnippets?: string[];
  
  // Jigsaw puzzle
  jigsawPieces?: JigsawPiece[];
  gridSize?: { rows: number; columns: number };
  jigsawDescription?: string;
  
  // Fill whole code blocks
  codePrefix?: string;  // Code that comes before the part to be filled
  codeSuffix?: string;  // Code that comes after the part to be filled
  solutionCode?: string;  // The expected solution code
  
  // Text questions (short/long)
  textAnswer?: string;           // Expected answer for text questions
  isMarkdown?: boolean;          // Whether to enable markdown/code formatting in answers
  supportCodeBlocks?: boolean;   // Whether code blocks should be supported in the editor
  minLength?: number;            // Minimum character length for answers
  maxLength?: number;            // Maximum character length for answers
  
  language: string;  // Programming language for syntax highlighting
  hintComment?: string;  // Optional hint to show in comments
}

// Code Ordering
export interface CodeOrderBlock {
  id: string;
  content: string;
  correctPosition: number;
  language: string;
}

// Multiple Choice
export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

// Code Gap Filling
export interface CodeGap {
  id: string;
  position: number;
  answer: string;
}

// Jigsaw Puzzle
export interface JigsawPiece {
  id: string;
  content: string;
  correctRow: number;
  correctColumn: number;
  language: string;
}

// Code Quiz Storage in Database
export interface StoredQuiz {
  id: number;
  title: string;
  description: string;
  content: string; // JSON-stringified quiz content
  createdAt: Date;
  updatedAt: Date;
}
