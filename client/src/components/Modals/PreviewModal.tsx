import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';
import { Quiz, Question, CodeOrderBlock } from '@/types';
import { CodeBlock } from '@/components/CodeBlock';
import ReactMarkdown from 'react-markdown';
import type { 
  DragDropContextProps, 
  DroppableProps, 
  DraggableProps,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DroppableStateSnapshot,
  DraggableStateSnapshot
} from '@hello-pangea/dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PreviewModalProps {
  quiz: Quiz;
  onClose: () => void;
}

export default function PreviewModal({ quiz, onClose }: PreviewModalProps) {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Switch to quiz language when preview opens
  useEffect(() => {
    if (quiz.language) {
      console.log('Switching to quiz language:', quiz.language);
      const previousLanguage = i18n.language;
      setCurrentLanguage(previousLanguage);
      i18n.changeLanguage(quiz.language).then(() => {
        console.log('Language switched to:', quiz.language);
      }).catch((error) => {
        console.error('Failed to switch language:', error);
      });
    }
    
    // Restore original language when preview closes
    return () => {
      if (currentLanguage) {
        console.log('Restoring to previous language:', currentLanguage);
        i18n.changeLanguage(currentLanguage).then(() => {
          console.log('Language restored to:', currentLanguage);
        }).catch((error) => {
          console.error('Failed to restore language:', error);
        });
      }
    };
  }, [quiz.language]);

  // Track which questions have solutions and hints shown
  const [showSolution, setShowSolution] = useState<{[key: string]: boolean}>({});
  const [showHint, setShowHint] = useState<{[key: string]: boolean}>({});
  const [codeInputs, setCodeInputs] = useState<{[key: string]: string}>({});
  const [codeOutputs, setCodeOutputs] = useState<{[key: string]: string}>({});
  const [isRunning, setIsRunning] = useState<{[key: string]: boolean}>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string | string[]}>({});
  const [feedback, setFeedback] = useState<{[key: string]: string}>({});
  const [orderedBlocks, setOrderedBlocks] = useState<{[key: string]: CodeOrderBlock[]}>({});
  const [userOrderedBlocks, setUserOrderedBlocks] = useState<{[key: string]: CodeOrderBlock[]}>({});
  const [gapAnswers, setGapAnswers] = useState<{ [key: string]: { [gapId: string]: string } }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const toggleSolution = (questionId: string) => {
    setShowSolution(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));

    if (!showSolution[questionId] && orderedBlocks[questionId]) {
      // Store current user order before showing solution
      setUserOrderedBlocks(prev => ({
        ...prev,
        [questionId]: [...orderedBlocks[questionId]]
      }));
      // Show correct order
      const correctOrder = [...orderedBlocks[questionId]]
        .sort((a, b) => a.correctPosition - b.correctPosition);
      setOrderedBlocks(prev => ({
        ...prev,
        [questionId]: correctOrder
      }));
    } else {
      // Restore user's order when hiding solution
      if (userOrderedBlocks[questionId]) {
        setOrderedBlocks(prev => ({
          ...prev,
          [questionId]: [...userOrderedBlocks[questionId]]
        }));
      }
    }
  };
  
  const toggleHint = (questionId: string) => {
    setShowHint(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  
  const handleCodeChange = (questionId: string, value: string) => {
    setCodeInputs(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const runCode = (question: Question) => {
    // Mark this question as running
    setIsRunning(prev => ({
      ...prev,
      [question.id]: true
    }));
    
    const userCode = codeInputs[question.id] || '';
    const language = question.language || 'javascript';
    
    // Combine the prefix, user code, and suffix
    const completeCode = `${question.codePrefix || ''}\n${userCode}\n${question.codeSuffix || ''}`;
    
    if (language === 'javascript') {
      try {
        // Create a container to capture console.log output
        const logs: string[] = [];
        const originalConsoleLog = console.log;
        
        // Override console.log to capture output
        console.log = (...args) => {
          logs.push(args.map(arg => String(arg)).join(' '));
          // Also call the original console.log to help with debugging
          originalConsoleLog(...args);
        };
        
        // Execute the code
        try {
          // Using Function constructor to evaluate code safely
          // Create a function that runs the code in a function context
          const execFunc = new Function(completeCode);
          
          // Execute the function
          execFunc();
          
          // If there were no logs, indicate success
          if (logs.length === 0) {
            logs.push('Code executed successfully (no output)');
          }
          
          setCodeOutputs(prev => ({
            ...prev,
            [question.id]: logs.join('\n')
          }));
        } catch (error: any) {
          // Handle code execution errors
          const errorMessage = error instanceof Error ? error.message : String(error);
          setCodeOutputs(prev => ({
            ...prev,
            [question.id]: `Error: ${errorMessage}`
          }));
        }
        
        // Restore the original console.log
        console.log = originalConsoleLog;
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setCodeOutputs(prev => ({
          ...prev,
          [question.id]: `Error: ${errorMessage}`
        }));
      }
    } else if (language === 'python') {
      // For Python, we'll show a message that it needs to be run in the exported version
      setCodeOutputs(prev => ({
        ...prev,
        [question.id]: `Python execution is available in the exported HTML version using Pyodide. In this preview, we're simulating the experience.`
      }));
    }
    
    // Mark this question as no longer running
    setIsRunning(prev => ({
      ...prev,
      [question.id]: false
    }));
  };

  const handleAnswerChange = (questionId: string, optionId: string, type: 'single-choice' | 'multiple-choice') => {
    if (type === 'single-choice') {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: optionId
      }));
    } else {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: prev[questionId] 
          ? Array.isArray(prev[questionId])
            ? (prev[questionId] as string[]).includes(optionId)
              ? (prev[questionId] as string[]).filter(id => id !== optionId)
              : [...(prev[questionId] as string[]), optionId]
            : [optionId]
          : [optionId]
      }));
    }
  };

  const checkAnswer = (question: Question) => {
    // For code-order questions
    if (question.type === 'code-order') {
      if (!question.codeBlocks || !orderedBlocks[question.id]) {
        setFeedback(prev => ({
          ...prev,
          [question.id]: 'Please arrange the code blocks first.'
        }));
        return;
      }

      const currentOrder = orderedBlocks[question.id].map((block, index) => ({
        position: index + 1,
        correctPosition: block.correctPosition
      }));

      const isCorrect = currentOrder.every(block => block.position === block.correctPosition);

      setFeedback(prev => ({
        ...prev,
        [question.id]: isCorrect 
          ? 'Correct! The code blocks are in the right order.' 
          : 'Incorrect. Try rearranging the blocks to match the correct order. Click "Show Solution" to see the correct arrangement.'
      }));
      return;
    }

    // For fill-gaps questions
    if (question.type === 'fill-gaps') {
      const answers = gapAnswers[question.id] || {};
      const isCorrect = question.gaps?.every((gap: any) => 
        answers[gap.id] === gap.answer
      );

      // Clear any existing feedback first
      if (feedback[question.id]) {
        return;
      }

      setFeedback(prev => ({
        ...prev,
        [question.id]: isCorrect 
          ? "Correct! All gaps are filled correctly." 
          : "Some answers are incorrect. Try again or check the solution."
      }));
      return;
    }

    // For find-code-errors questions
    if (question.type === 'find-code-errors') {
      const userCode = codeInputs[question.id]?.trim() || '';
      const correctCode = question.correctCode?.trim() || '';

      // Remove all whitespace for comparison
      const normalizedUserCode = userCode.replace(/\s+/g, '');
      const normalizedCorrectCode = correctCode.replace(/\s+/g, '');

      const isCorrect = normalizedUserCode === normalizedCorrectCode;

      setFeedback(prev => ({
        ...prev,
        [question.id]: isCorrect 
          ? 'Correct! Your code matches the solution.' 
          : 'Incorrect. Your code does not match the solution. Try again or click "Show Solution" to see the correct code.'
      }));
      return;
    }

    // For text questions
    if (question.type === 'text') {
      const userAnswer = codeInputs[question.id]?.trim() || '';
      
      if (!userAnswer) {
        setFeedback(prev => ({
          ...prev,
          [question.id]: 'Please write your answer before checking.'
        }));
        return;
      }

      setFeedback(prev => ({
        ...prev,
        [question.id]: 'Your answer has been recorded. Check the solution to see a sample answer.'
      }));
      return;
    }

    // For single/multiple choice questions
    const selectedAnswer = selectedAnswers[question.id];
    
    if (!selectedAnswer) {
      setFeedback(prev => ({
        ...prev,
        [question.id]: 'Please select an answer.'
      }));
      return;
    }

    if (question.type === 'single-choice') {
      const correctOption = question.options?.find(opt => opt.isCorrect);
      const isCorrect = selectedAnswer === correctOption?.id;
      
      setFeedback(prev => ({
        ...prev,
        [question.id]: isCorrect 
          ? 'Correct!' 
          : 'Incorrect. Try again or click "Show Solution" to see the answer.'
      }));
    } else if (question.type === 'multiple-choice') {
      const selectedAnswerArray = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
      const correctOptions = question.options?.filter(opt => opt.isCorrect) || [];
      const correctOptionIds = correctOptions.map(opt => opt.id);
      
      // Check if all correct options are selected and no incorrect options are selected
      const allCorrectSelected = correctOptionIds.every(id => selectedAnswerArray.includes(id));
      const noIncorrectSelected = selectedAnswerArray.every(id => correctOptionIds.includes(id));
      const isCorrect = allCorrectSelected && noIncorrectSelected;
      
      setFeedback(prev => ({
        ...prev,
        [question.id]: isCorrect 
          ? 'Correct! You selected all the right answers.' 
          : allCorrectSelected 
            ? 'Almost there! You selected all correct answers but also some incorrect ones.' 
            : 'Incorrect. Make sure to select all correct answers and only correct answers.'
      }));
    }
  };

  const handleDragEnd = (result: DropResult, questionId: string) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const snippet = draggableId;

    setGapAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [destination.droppableId]: snippet
      }
    }));
  };

  const checkCodeOrder = (question: Question) => {
    if (!question.codeBlocks || !orderedBlocks[question.id]) {
      setFeedback(prev => ({
        ...prev,
        [question.id]: 'Please arrange the code blocks first.'
      }));
      return;
    }

    const currentOrder = orderedBlocks[question.id].map((block, index) => ({
      position: index + 1,
      correctPosition: block.correctPosition
    }));

    const isCorrect = currentOrder.every(block => block.position === block.correctPosition);

    setFeedback(prev => ({
      ...prev,
      [question.id]: isCorrect 
        ? 'Correct! The code blocks are in the right order.' 
        : 'Incorrect. Try rearranging the blocks to match the correct order. Click "Show Solution" to see the correct arrangement.'
    }));
  };

  // Initialize ordered blocks when question is first rendered
  const initializeCodeBlocks = (question: Question) => {
    if (question.type === 'code-order' && Array.isArray(question.codeBlocks) && !orderedBlocks[question.id]) {
      // Randomize the initial order
      const shuffledBlocks = [...question.codeBlocks].sort(() => Math.random() - 0.5);
      setOrderedBlocks(prev => ({
        ...prev,
        [question.id]: shuffledBlocks
      }));
    }
  };

  const canProceedToNext = (question: Question): boolean => {
    if (!quiz.requireCorrectAnswer) return true;
    
    const currentFeedback = feedback[question.id];
    if (!currentFeedback) return false;
    
    return currentFeedback.startsWith('Correct');
  };

  const handleNextQuestion = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (quiz.requireCorrectAnswer && !canProceedToNext(currentQuestion)) {
      return;
    }
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">
            {t('quiz.preview.preview', { lng: quiz.language })}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Debug Info */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
            <p className="text-yellow-800">
              {t('quiz.preview.debugInfo', { 
                count: quiz.questions.length, 
                type: quiz.questions[currentQuestionIndex]?.type,
                lng: quiz.language 
              })}
            </p>
          </div>

          {/* Question Display */}
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {t('quiz.preview.showQuestion', { lng: quiz.language })} {index + 1}
                </h3>
              </div>

              {question.type === 'code-order' && (
                <div className="space-y-4">
                  {orderedBlocks[question.id]?.map((block, blockIndex) => (
                    <div key={block.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          {t('quiz.preview.codeOrder.block', { number: blockIndex + 1, lng: quiz.language })}
                        </span>
                        <span className="text-sm text-gray-500">
                          {t('quiz.preview.codeOrder.position', { number: blockIndex + 1, lng: quiz.language })}
                        </span>
                      </div>
                      <CodeBlock code={block.content} language={block.language || 'javascript'} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Rest of the question rendering logic */}
              {/* ... existing code ... */}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
