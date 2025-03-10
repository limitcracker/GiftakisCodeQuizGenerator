import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Quiz, Question, QuestionType, QuizStyle } from '@/types';
import { useTranslation } from 'react-i18next';

// Helper to generate a unique ID
const generateId = (): string => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default style for the quiz
const defaultQuizStyle: QuizStyle = {
  primaryColor: '#3b82f6', // Blue
  secondaryColor: '#10b981', // Green
  backgroundColor: '#ffffff', // White
  textColor: '#1f2937', // Dark gray
  fontFamily: 'Arial, sans-serif',
  borderRadius: 6,
  buttonStyle: 'rounded',
};

// Create a fresh quiz
const createDefaultQuiz = (): Quiz => ({
  id: generateId(),
  title: 'JavaScript Basics Quiz',
  description: 'Test your JavaScript knowledge with this quiz',
  questions: [],
  timeLimit: null, // No time limit by default
  hideFooter: false, // Show footer by default
  style: defaultQuizStyle, // Default styling
  language: 'el', // Set default language to Greek
  stepByStep: false,
  requireCorrectAnswer: false
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
  quizTimeLimit: number | null;
  setQuizTimeLimit: (timeLimit: number | null) => void;
  hideFooter: boolean;
  setHideFooter: (hide: boolean) => void;
  quizStyle: QuizStyle;
  updateQuizStyle: (style: Partial<QuizStyle>) => void;
  resetQuizStyle: () => void;
  addQuestion: () => void;
  updateQuestion: (updatedQuestion: Question) => void;
  updateQuestionTimeLimit: (questionId: string, timeLimit: number | null) => void;
  deleteQuestion: (questionId: string) => void;
  moveQuestionUp: (questionId: string) => void;
  moveQuestionDown: (questionId: string) => void;
  resetQuiz: () => void;
  stepByStep: boolean;
  setStepByStep: (enabled: boolean) => void;
  requireCorrectAnswer: boolean;
  setRequireCorrectAnswer: (required: boolean) => void;
  quizLanguage: string;
  setQuizLanguage: (language: string) => void;
  exportQuiz: () => void;
};

// Create the context
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Provider component
export const QuizProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [quiz, setQuiz] = useState<Quiz>(createDefaultQuiz());
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>('code-order');
  const [quizLanguage, setQuizLanguage] = useState<string>('el');

  // Update quiz language
  useEffect(() => {
    console.log('QuizContext: Changing language to:', quizLanguage);
    i18n.changeLanguage(quizLanguage).then(() => {
      console.log('QuizContext: Language changed successfully');
    }).catch((error) => {
      console.error('QuizContext: Failed to change language:', error);
    });

    setQuiz(prev => ({
      ...prev,
      language: quizLanguage,
      questions: prev.questions.map(q => ({
        ...q,
        language: quizLanguage,
        title: getDefaultTitle(q.type) // Update existing question titles
      }))
    }));
  }, [quizLanguage, i18n]);

  // Helper function to generate default titles based on question type
  const getDefaultTitle = (type: QuestionType): string => {
    const titles = {
      'code-order': t('quiz.questions.codeOrder.title', 'Put the following code blocks in the correct order to create a function that calculates the factorial of a number:', { lng: quizLanguage }),
      'multiple-choice': t('quiz.questions.multipleChoice.title', 'Which of the following are valid ways to declare a variable in JavaScript? (Select all that apply)', { lng: quizLanguage }),
      'single-choice': t('quiz.questions.singleChoice.title', 'What is the correct way to declare a constant in JavaScript?', { lng: quizLanguage }),
      'fill-gaps': t('quiz.questions.fillGaps.title', 'Complete the JavaScript function that filters an array to return only even numbers:', { lng: quizLanguage }),
      'jigsaw': t('quiz.questions.jigsaw.title', 'Arrange the code blocks to form a valid function:', { lng: quizLanguage }),
      'fill-whole': t('quiz.questions.fillWhole.title', 'Implement the missing code section to complete this function:', { lng: quizLanguage }),
      'text': t('quiz.questions.text.title', 'What programming language is primarily used for front-end web development?', { lng: quizLanguage }),
      'find-code-errors': t('quiz.questions.findErrors.title', 'Find and fix the errors in the following code:', { lng: quizLanguage })
    };
    return titles[type] || t('quiz.questions.default.title', 'New Question', { lng: quizLanguage });
  };

  // Add a new question
  const addQuestion = () => {
    if (!selectedQuestionType) return;
    
    console.log('Adding new question with type:', selectedQuestionType);
    console.log('Current quiz language:', quizLanguage);
    
    const newQuestion: Question = {
      id: generateId(),
      type: selectedQuestionType,
      title: getDefaultTitle(selectedQuestionType),
      order: quiz.questions.length + 1,
      language: quizLanguage,
      // Type-specific properties
      ...(selectedQuestionType === 'code-order' && {
        codeBlocks: [
          { id: generateId(), content: 'function factorial(n) {', correctPosition: 1, language: 'javascript' },
          { id: generateId(), content: '  if (n <= 1) {\n    return 1;\n  }', correctPosition: 2, language: 'javascript' },
          { id: generateId(), content: '  return n * factorial(n - 1);', correctPosition: 3, language: 'javascript' },
          { id: generateId(), content: '}', correctPosition: 4, language: 'javascript' }
        ]
      }),
      ...(selectedQuestionType === 'find-code-errors' && {
        codeWithErrors: `function calculateAverage(numbers) {
  let sum == 0;
  for (i in numbers) {
    sum += numbers[i]
  }
  return sum / numbers.length();
}`,
        correctCode: `function calculateAverage(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum / numbers.length;
}`,
        errorDescriptions: [
          'Assignment operator uses == instead of =',
          'Loop variable i is not properly declared with let/const',
          'Missing semicolon after array access',
          'length is a property, not a method'
        ],
        language: 'javascript'
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
      ...(selectedQuestionType === 'single-choice' && {
        options: [
          { id: generateId(), text: 'Option 1', isCorrect: true, feedback: 'This is the correct answer!' },
          { id: generateId(), text: 'Option 2', isCorrect: false, feedback: 'This is incorrect. Try again.' },
          { id: generateId(), text: 'Option 3', isCorrect: false, feedback: 'This is incorrect. Try again.' },
          { id: generateId(), text: 'Option 4', isCorrect: false, feedback: 'This is incorrect. Try again.' }
        ]
      }),
      ...(selectedQuestionType === 'fill-gaps' && {
        codeWithGaps: 'function filterEvenNumbers(numbers) {\n  return numbers.[GAP_1](function(num) {\n    return [GAP_2];\n  });\n}',
        gaps: [
          { id: generateId(), position: 1, answer: 'filter' },
          { id: generateId(), position: 2, answer: 'num % 2 === 0' }
        ],
        availableSnippets: ['filter', 'map', 'forEach', 'reduce', 'num % 2 === 0', 'num % 2 !== 0', 'num > 0']
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
      }),
      ...(selectedQuestionType === 'fill-whole' && {
        codePrefix: '// Implement a function to calculate the factorial of a number\nfunction factorial(n) {\n  // Your code here\n',
        codeSuffix: '\n}\n\nconsole.log(factorial(5)); // Should output: 120',
        solutionCode: '  if (n <= 1) return 1;\n  return n * factorial(n - 1);',
        language: 'javascript',
        hintComment: 'Remember that factorial(0) = 1 and factorial(n) = n * factorial(n-1) for n > 0'
      }),
      ...(selectedQuestionType === 'text' && {
        textAnswer: 'JavaScript',
        isMarkdown: false,
        supportCodeBlocks: false,
        minLength: 2,
        maxLength: 50,
        hintComment: 'Think about the programming language used for web browsers'
      })
    };
    
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      language: quizLanguage
    }));
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
  
  // Update time limit for a specific question
  const updateQuestionTimeLimit = (questionId: string, timeLimit: number | null) => {
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: prevQuiz.questions.map(q => 
        q.id === questionId ? { ...q, timeLimit } : q
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

  // Update quiz style
  const updateQuizStyle = (style: Partial<QuizStyle>) => {
    setQuiz(prev => ({ 
      ...prev, 
      style: { 
        ...prev.style, 
        ...style 
      } 
    }));
  };
  
  // Reset quiz style to default
  const resetQuizStyle = () => {
    setQuiz(prev => ({ 
      ...prev, 
      style: defaultQuizStyle 
    }));
  };
  
  // Reset quiz to default
  const resetQuiz = () => {
    console.log('Resetting quiz to default');
    setQuiz(createDefaultQuiz());
  };
  
  // Export quiz
  const exportQuiz = () => {
    console.log('Exporting quiz with language:', quizLanguage);
    return {
      ...quiz,
      language: quizLanguage,
      questions: quiz.questions.map(q => ({
        ...q,
        language: quizLanguage
      }))
    };
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
    quizTimeLimit: quiz.timeLimit,
    setQuizTimeLimit: (timeLimit) => setQuiz(prev => ({ ...prev, timeLimit })),
    hideFooter: quiz.hideFooter || false,
    setHideFooter: (hide) => setQuiz(prev => ({ ...prev, hideFooter: hide })),
    quizStyle: quiz.style || defaultQuizStyle,
    updateQuizStyle,
    resetQuizStyle,
    addQuestion,
    updateQuestion,
    updateQuestionTimeLimit,
    deleteQuestion,
    moveQuestionUp,
    moveQuestionDown,
    resetQuiz,
    stepByStep: quiz.stepByStep || false,
    setStepByStep: (enabled) => setQuiz(prev => ({ ...prev, stepByStep: enabled })),
    requireCorrectAnswer: quiz.requireCorrectAnswer || false,
    setRequireCorrectAnswer: (required) => setQuiz(prev => ({ ...prev, requireCorrectAnswer: required })),
    quizLanguage,
    setQuizLanguage,
    exportQuiz
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