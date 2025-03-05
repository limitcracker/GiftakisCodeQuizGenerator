import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Quiz, Question, QuestionType } from '@/types';

// Helper to generate a unique ID
const generateId = (): string => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create a fresh quiz
const createDefaultQuiz = (): Quiz => ({
  id: generateId(),
  title: 'JavaScript Basics Quiz',
  description: 'Test your JavaScript knowledge with this quiz',
  questions: []
});

// Context type
type QuizContextType = {
  quiz: Quiz;
  questions: Question[];
  selectedQuestionType: QuestionType | null;
  setSelectedQuestionType: (type: QuestionType | null) => void;
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  quizDescription: string;
  setQuizDescription: (description: string) => void;
  addQuestion: () => void;
  updateQuestion: (updatedQuestion: Question) => void;
  deleteQuestion: (questionId: string) => void;
  moveQuestionUp: (questionId: string) => void;
  moveQuestionDown: (questionId: string) => void;
  resetQuiz: () => void;
};

// Create the context
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Provider component
export const QuizProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Quiz state
  const [quiz, setQuiz] = useState<Quiz>(createDefaultQuiz());
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>('code-order');

  // Helper function to generate default titles based on question type
  const getDefaultTitle = (type: QuestionType): string => {
    switch (type) {
      case 'code-order':
        return 'Put the following code blocks in the correct order to create a function that calculates the factorial of a number:';
      case 'multiple-choice':
        return 'Which of the following are valid ways to declare a variable in JavaScript? (Select all that apply)';
      case 'single-choice':
        return 'What is the correct way to declare a constant in JavaScript?';
      case 'fill-gaps':
        return 'Complete the JavaScript function that filters an array to return only even numbers:';
      case 'find-errors':
        return 'Find and select the lines that contain errors in this Python code:';
      case 'jigsaw':
        return 'Arrange the code blocks to form a valid function:';
      case 'image-choice':
        return 'Which image shows the correct output of this code?';
      case 'video-choice':
        return 'After watching the video, which approach is correct?';
      default:
        return 'New Question';
    }
  };

  // Add a new question
  const addQuestion = () => {
    if (!selectedQuestionType) return;
    
    console.log('Adding new question with type:', selectedQuestionType);
    
    const newQuestion: Question = {
      id: generateId(),
      type: selectedQuestionType,
      title: getDefaultTitle(selectedQuestionType),
      order: quiz.questions.length + 1,
      // Type-specific properties
      ...(selectedQuestionType === 'code-order' && {
        codeBlocks: [
          { id: generateId(), content: 'function factorial(n) {', correctPosition: 1, language: 'javascript' },
          { id: generateId(), content: '  if (n <= 1) {\n    return 1;\n  }', correctPosition: 2, language: 'javascript' },
          { id: generateId(), content: '  return n * factorial(n - 1);', correctPosition: 3, language: 'javascript' },
          { id: generateId(), content: '}', correctPosition: 4, language: 'javascript' }
        ]
      }),
      ...(selectedQuestionType === 'multiple-choice' && {
        options: [
          { id: generateId(), text: 'let x = 10;', isCorrect: true, feedback: 'Correct! \'let\' is the modern way to declare block-scoped variables in JavaScript.' },
          { id: generateId(), text: 'const y = 20;', isCorrect: true, feedback: 'Correct! \'const\' is used for values that won\'t be reassigned.' },
          { id: generateId(), text: 'var z = 30;', isCorrect: true, feedback: 'Correct! \'var\' is the traditional way to declare variables in JavaScript.' },
          { id: generateId(), text: 'variable a = 40;', isCorrect: false, feedback: 'Incorrect. JavaScript doesn\'t use the \'variable\' keyword for declarations.' }
        ],
        codeExample: '// Examples of variable declarations\nlet x = 10;\nconst PI = 3.14;\nvar name = "JavaScript";'
      }),
      ...(selectedQuestionType === 'fill-gaps' && {
        codeWithGaps: 'function filterEvenNumbers(numbers) {\n  return numbers.[GAP_1](function(num) {\n    return [GAP_2];\n  });\n}',
        gaps: [
          { id: generateId(), position: 1, answer: 'filter' },
          { id: generateId(), position: 2, answer: 'num % 2 === 0' }
        ],
        availableSnippets: ['filter', 'map', 'forEach', 'reduce', 'num % 2 === 0', 'num % 2 !== 0', 'num > 0']
      }),
      ...(selectedQuestionType === 'find-errors' && {
        code: 'def calculate_average(numbers):\n    total = 0\n    count = 0\n    for num in numers:\n        total += num\n        count += 1\n    return total / Count\n    \nnums = [1, 2, 3, 4, 5]\nprint(calculate_average(nums))',
        errorLines: [
          { lineNumber: 4, code: '    for num in numers:' },
          { lineNumber: 7, code: '    return total / Count' }
        ],
        errors: [
          'Line 4: Variable name typo (numers)',
          'Line 7: Case sensitivity error (Count)',
          'Line 9: Missing colon after nums declaration' 
        ]
      }),
      ...(selectedQuestionType === 'jigsaw' && {
        jigsawPieces: [
          // For if/else structure with two columns - more 2D in nature
          { id: generateId(), content: 'if (age < 13) {', correctRow: 0, correctColumn: 0, language: 'javascript' },
          { id: generateId(), content: '  console.log("Child");', correctRow: 1, correctColumn: 0, language: 'javascript' },
          { id: generateId(), content: '} else if (age < 20) {', correctRow: 0, correctColumn: 1, language: 'javascript' },
          { id: generateId(), content: '  console.log("Teenager");', correctRow: 1, correctColumn: 1, language: 'javascript' },
          { id: generateId(), content: '} else {', correctRow: 0, correctColumn: 2, language: 'javascript' },
          { id: generateId(), content: '  console.log("Adult");', correctRow: 1, correctColumn: 2, language: 'javascript' },
          { id: generateId(), content: '}', correctRow: 2, correctColumn: 1, language: 'javascript' },
        ],
        gridSize: { rows: 3, columns: 3 },
        jigsawDescription: 'Arrange the code blocks to form a valid age checking condition structure'
      })
    };
    
    setQuiz(prevQuiz => {
      const updatedQuiz = {
        ...prevQuiz,
        questions: [...prevQuiz.questions, newQuestion]
      };
      console.log('Updated quiz with new question:', updatedQuiz);
      return updatedQuiz;
    });
  };
  
  // Update an existing question
  const updateQuestion = (updatedQuestion: Question) => {
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: prevQuiz.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    }));
  };
  
  // Delete a question
  const deleteQuestion = (questionId: string) => {
    setQuiz(prevQuiz => {
      const filteredQuestions = prevQuiz.questions.filter(q => q.id !== questionId);
      // Reorder the remaining questions
      const reorderedQuestions = filteredQuestions.map((q, index) => ({
        ...q,
        order: index + 1
      }));
      
      return {
        ...prevQuiz,
        questions: reorderedQuestions
      };
    });
  };
  
  // Move a question up in the order
  const moveQuestionUp = (questionId: string) => {
    setQuiz(prevQuiz => {
      const questions = [...prevQuiz.questions];
      const questionIndex = questions.findIndex(q => q.id === questionId);
      if (questionIndex <= 0) return prevQuiz; // Can't move up if it's already at the top
      
      // Swap positions
      const temp = questions[questionIndex];
      questions[questionIndex] = questions[questionIndex - 1];
      questions[questionIndex - 1] = temp;
      
      // Update order numbers
      const reorderedQuestions = questions.map((q, index) => ({
        ...q,
        order: index + 1
      }));
      
      return {
        ...prevQuiz,
        questions: reorderedQuestions
      };
    });
  };
  
  // Move a question down in the order
  const moveQuestionDown = (questionId: string) => {
    setQuiz(prevQuiz => {
      const questions = [...prevQuiz.questions];
      const questionIndex = questions.findIndex(q => q.id === questionId);
      if (questionIndex >= questions.length - 1) return prevQuiz; // Can't move down if it's already at the bottom
      
      // Swap positions
      const temp = questions[questionIndex];
      questions[questionIndex] = questions[questionIndex + 1];
      questions[questionIndex + 1] = temp;
      
      // Update order numbers
      const reorderedQuestions = questions.map((q, index) => ({
        ...q,
        order: index + 1
      }));
      
      return {
        ...prevQuiz,
        questions: reorderedQuestions
      };
    });
  };

  // Reset quiz to default
  const resetQuiz = () => {
    console.log('Resetting quiz to default');
    setQuiz(createDefaultQuiz());
  };
  
  // Expose the context
  const contextValue: QuizContextType = {
    quiz,
    questions: quiz.questions,
    selectedQuestionType,
    setSelectedQuestionType,
    quizTitle: quiz.title,
    setQuizTitle: (title) => setQuiz(prev => ({ ...prev, title })),
    quizDescription: quiz.description,
    setQuizDescription: (description) => setQuiz(prev => ({ ...prev, description })),
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestionUp,
    moveQuestionDown,
    resetQuiz
  };
  
  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
};

// Hook to use the quiz context
export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};