import { useState, useEffect } from 'react';
import { Quiz, Question, QuestionType } from '@/types';

// Helper to generate a unique ID
const generateId = (): string => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function useQuizState() {
  // Quiz state
  const [quiz, setQuiz] = useState<Quiz>({
    id: generateId(),
    title: 'JavaScript Basics Quiz',
    description: 'Test your JavaScript knowledge with this quiz',
    questions: []
  });
  
  // Selected question type
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>('code-order');
  
  // Quiz information shortcuts
  const quizTitle = quiz.title;
  const setQuizTitle = (title: string) => {
    setQuiz(prev => ({ ...prev, title }));
  };
  
  const quizDescription = quiz.description;
  const setQuizDescription = (description: string) => {
    setQuiz(prev => ({ ...prev, description }));
  };
  
  // Shortcut for questions
  const questions = quiz.questions;
  
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

  // Add a new question based on the selected type
  const addQuestion = () => {
    if (!selectedQuestionType) return;
    
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
      })
    };
    
    console.log('Adding new question:', newQuestion);
    
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };
  
  // Update an existing question
  const updateQuestion = (updatedQuestion: Question) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    }));
  };
  
  // Delete a question
  const deleteQuestion = (questionId: string) => {
    setQuiz(prev => {
      const filteredQuestions = prev.questions.filter(q => q.id !== questionId);
      // Reorder the remaining questions
      const reorderedQuestions = filteredQuestions.map((q, index) => ({
        ...q,
        order: index + 1
      }));
      
      return {
        ...prev,
        questions: reorderedQuestions
      };
    });
  };
  
  // Move a question up in the order
  const moveQuestionUp = (questionId: string) => {
    setQuiz(prev => {
      const questionIndex = prev.questions.findIndex(q => q.id === questionId);
      if (questionIndex <= 0) return prev; // Can't move up if it's already at the top
      
      const newQuestions = [...prev.questions];
      const temp = newQuestions[questionIndex];
      newQuestions[questionIndex] = newQuestions[questionIndex - 1];
      newQuestions[questionIndex - 1] = temp;
      
      // Update order numbers
      return {
        ...prev,
        questions: newQuestions.map((q, index) => ({
          ...q,
          order: index + 1
        }))
      };
    });
  };
  
  // Move a question down in the order
  const moveQuestionDown = (questionId: string) => {
    setQuiz(prev => {
      const questionIndex = prev.questions.findIndex(q => q.id === questionId);
      if (questionIndex >= prev.questions.length - 1) return prev; // Can't move down if it's already at the bottom
      
      const newQuestions = [...prev.questions];
      const temp = newQuestions[questionIndex];
      newQuestions[questionIndex] = newQuestions[questionIndex + 1];
      newQuestions[questionIndex + 1] = temp;
      
      // Update order numbers
      return {
        ...prev,
        questions: newQuestions.map((q, index) => ({
          ...q,
          order: index + 1
        }))
      };
    });
  };
  
  // Hydrate from localStorage on initial load
  useEffect(() => {
    const savedQuiz = localStorage.getItem('codeQuiz');
    if (savedQuiz) {
      try {
        setQuiz(JSON.parse(savedQuiz));
      } catch (e) {
        console.error('Error parsing saved quiz:', e);
      }
    }
  }, []);
  
  // Save to localStorage when quiz changes
  useEffect(() => {
    localStorage.setItem('codeQuiz', JSON.stringify(quiz));
  }, [quiz]);
  
  return {
    quiz,
    questions,
    selectedQuestionType,
    setSelectedQuestionType,
    quizTitle,
    setQuizTitle,
    quizDescription,
    setQuizDescription,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestionUp,
    moveQuestionDown
  };
}
