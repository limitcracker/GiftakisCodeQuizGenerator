// Quiz Types
export type QuestionType = 
  | 'code-order' 
  | 'jigsaw' 
  | 'fill-gaps' 
  | 'multiple-choice' 
  | 'single-choice'
  | 'find-errors'
  | 'image-choice'
  | 'video-choice'
  | 'fill-whole';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  explanation?: string;
  order: number;
  
  // Question control settings
  hideSolution?: boolean;  // If true, students cannot view the solution
  
  // Type-specific properties
  codeBlocks?: CodeOrderBlock[];  // For code-order questions
  options?: MultipleChoiceOption[];  // For multiple/single choice questions
  codeExample?: string;  // Optional code example for multiple/single choice
  
  // Fill in the gaps
  codeWithGaps?: string;
  gaps?: CodeGap[];
  availableSnippets?: string[];
  
  // Find errors
  code?: string;
  errorLines?: CodeErrorLine[];
  errors?: string[];
  
  // Jigsaw puzzle
  jigsawPieces?: JigsawPiece[];
  gridSize?: { rows: number; columns: number };
  jigsawDescription?: string;
  
  // Fill whole code blocks
  codePrefix?: string;  // Code that comes before the part to be filled
  codeSuffix?: string;  // Code that comes after the part to be filled
  solutionCode?: string;  // The expected solution code
  language?: string;  // Programming language for syntax highlighting
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

// Code Error Finding
export interface CodeErrorLine {
  lineNumber: number;
  code: string;
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
