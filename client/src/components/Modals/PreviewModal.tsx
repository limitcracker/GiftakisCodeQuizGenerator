import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { Quiz, Question, CodeOrderBlock } from '@/types';
import { CodeBlock } from '@/components/CodeBlock';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useQuiz } from '@/context/QuizContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { 
  DropResult as DndDropResult, 
  DroppableProvided as DndDroppableProvided, 
  DraggableProvided as DndDraggableProvided 
} from '@hello-pangea/dnd';

interface PreviewModalProps {
  quiz: Quiz;
  onClose: () => void;
}

type AnswerType = 'single-choice' | 'multiple-choice';

export default function PreviewModal({ quiz, onClose }: PreviewModalProps) {
  const { t } = useTranslation();
  const { quizLanguage } = useQuiz();

  // Initialize state
  const [showSolution, setShowSolution] = useState<{[key: string]: boolean}>({});
  const [showHint, setShowHint] = useState<{[key: string]: boolean}>({});
  const [codeInputs, setCodeInputs] = useState<{[key: string]: string}>({});
  const [userInputs, setUserInputs] = useState<{[key: string]: string}>({});
  const [codeOutputs, setCodeOutputs] = useState<{[key: string]: string}>({});
  const [isRunning, setIsRunning] = useState<{[key: string]: boolean}>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string | string[]}>({});
  const [feedback, setFeedback] = useState<{[key: string]: string}>({});
  const [orderedBlocks, setOrderedBlocks] = useState<{[key: string]: CodeOrderBlock[]}>({});
  const [userOrderedBlocks, setUserOrderedBlocks] = useState<{[key: string]: CodeOrderBlock[]}>({});
  const [gapAnswers, setGapAnswers] = useState<{ [key: string]: { [gapId: string]: string } }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Initialize code blocks for code-order questions
  useEffect(() => {
    quiz.questions.forEach(question => {
      if (
        question.type === 'code-order' && 
        !orderedBlocks[question.id] && 
        question.codeBlocks && 
        question.codeBlocks.length > 0
      ) {
        const blocks: CodeOrderBlock[] = [...question.codeBlocks];
        setOrderedBlocks(prev => ({
          ...prev,
          [question.id]: blocks
        }));
      }
    });
  }, [quiz.questions]);

  const toggleSolution = (questionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    setShowSolution(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));

    if (!showSolution[questionId]) {
      // Store current user input before showing solution
      if (question.type === 'text') {
        setUserInputs(prev => ({
          ...prev,
          [questionId]: codeInputs[questionId] || ''
        }));
      }

      switch (question.type) {
        case 'code-order':
          if (orderedBlocks[questionId]) {
            setUserOrderedBlocks(prev => ({
              ...prev,
              [questionId]: [...orderedBlocks[questionId]]
            }));
            const correctOrder = [...orderedBlocks[questionId]]
              .sort((a, b) => a.correctPosition - b.correctPosition);
            setOrderedBlocks(prev => ({
              ...prev,
              [questionId]: correctOrder
            }));
          }
          break;
        
        case 'multiple-choice':
        case 'single-choice':
          const correctAnswers = question.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
          setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: question.type === 'multiple-choice' ? correctAnswers : correctAnswers[0]
          }));
          break;
        
        case 'fill-whole':
          if (question.solutionCode) {
            setCodeInputs(prev => ({
              ...prev,
              [questionId]: question.solutionCode || ''
            }));
          }
          break;

        case 'text':
          // Store current user input before showing solution
          setUserInputs(prev => ({
            ...prev,
            [questionId]: codeInputs[questionId] || ''
          }));
          break;
      }
    } else {
      // Restore user's previous answers when hiding solution
      switch (question.type) {
        case 'code-order':
          if (userOrderedBlocks[questionId]) {
            setOrderedBlocks(prev => ({
              ...prev,
              [questionId]: [...userOrderedBlocks[questionId]]
            }));
          }
          break;
        case 'text':
          // Restore the user's original input
          setCodeInputs(prev => ({
            ...prev,
            [questionId]: userInputs[questionId] ?? ''
          }));
          break;
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

  const runCode = async (question: Question) => {
    setIsRunning(prev => ({
      ...prev,
      [question.id]: true
    }));

    try {
      const userCode = codeInputs[question.id] || '';
      const completeCode = `${question.codePrefix || ''}\n${userCode}\n${question.codeSuffix || ''}`;
      
      // For demo purposes, just show a message
      setCodeOutputs(prev => ({
        ...prev,
        [question.id]: t('quiz.preview.codeExecutionAvailable', { lng: quizLanguage })
      }));
    } catch (error) {
      setCodeOutputs(prev => ({
        ...prev,
        [question.id]: `Error: ${error instanceof Error ? error.message : String(error)}`
      }));
    } finally {
      setIsRunning(prev => ({
        ...prev,
        [question.id]: false
      }));
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string, type: AnswerType) => {
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
    if (!question) return;

    let feedbackMessage = '';
    let isCorrect = false;

    switch (question.type) {
      case 'code-order':
        if (!orderedBlocks[question.id]) {
          feedbackMessage = t('quiz.preview.noBlocksToArrange', { lng: quizLanguage });
          break;
        }
        isCorrect = orderedBlocks[question.id].every((block, index) => 
          block.correctPosition === index + 1
        );
        feedbackMessage = isCorrect 
          ? t('quiz.preview.correct', { lng: quizLanguage })
          : t('quiz.preview.incorrect', { lng: quizLanguage });
        break;

      case 'multiple-choice':
      case 'single-choice':
        if (!selectedAnswers[question.id]) {
          feedbackMessage = t('quiz.preview.selectAnswer', { lng: quizLanguage });
          break;
        }
        const selected = selectedAnswers[question.id];
        const correctOptions = question.options?.filter(opt => opt.isCorrect) || [];
        isCorrect = Array.isArray(selected)
          ? selected.length === correctOptions.length && 
            selected.every(id => correctOptions.some(opt => opt.id === id))
          : correctOptions.some(opt => opt.id === selected);
        feedbackMessage = isCorrect 
          ? t('quiz.preview.correct', { lng: quizLanguage })
          : t('quiz.preview.incorrect', { lng: quizLanguage });
        break;

      case 'fill-whole':
        const userCode = codeInputs[question.id]?.trim() || '';
        const solution = question.solutionCode?.trim() || '';
        isCorrect = userCode === solution;
        feedbackMessage = isCorrect 
          ? t('quiz.preview.correct', { lng: quizLanguage })
          : t('quiz.preview.incorrect', { lng: quizLanguage });
        break;

      case 'fill-gaps':
        if (!gapAnswers[question.id]) {
          feedbackMessage = t('quiz.preview.fillAllGaps', { lng: quizLanguage });
          break;
        }
        // Add gap answers checking logic here when implemented
        feedbackMessage = t('quiz.preview.answerRecorded', { lng: quizLanguage });
        break;

      case 'text':
        const userAnswer = codeInputs[question.id]?.trim().toLowerCase() || '';
        if (!userAnswer) {
          feedbackMessage = t('quiz.preview.writeAnswer', { lng: quizLanguage });
          break;
        }
        const correctAnswer = question.textAnswer?.trim().toLowerCase() || '';
        isCorrect = userAnswer === correctAnswer;
        feedbackMessage = isCorrect 
          ? t('quiz.preview.correct', { lng: quizLanguage })
          : t('quiz.preview.incorrect', { lng: quizLanguage });
        break;

      case 'find-code-errors':
        if (!codeInputs[question.id]) {
          feedbackMessage = t('quiz.preview.identifyErrors', { lng: quizLanguage });
          break;
        }
        feedbackMessage = t('quiz.preview.answerRecorded', { lng: quizLanguage });
        break;

      default:
        feedbackMessage = t('quiz.preview.questionTypeNotImplemented', { lng: quizLanguage });
        break;
    }

    setFeedback(prev => ({
      ...prev,
      [question.id]: feedbackMessage
    }));
  };

  const canProceedToNext = (question: Question): boolean => {
    if (!quiz.requireCorrectAnswer) return true;
    const currentFeedback = feedback[question.id];
    return currentFeedback === t('quiz.preview.correct', { lng: quizLanguage });
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

  const handleDragEnd = (result: DndDropResult, questionId: string) => {
    if (!result.destination) return;

    const items = Array.from(orderedBlocks[questionId]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedBlocks(prev => ({
      ...prev,
      [questionId]: items
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col" hideDefaultCloseButton>
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">
            {t('quiz.preview.preview', { lng: quizLanguage })}
          </h2>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Debug Info */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
            <p className="text-yellow-800">
              {t('quiz.preview.debugInfo', { 
                count: quiz.questions.length, 
                type: quiz.questions[0]?.type,
                lng: quizLanguage 
              })}
            </p>
          </div>

          {/* All Questions */}
          <div className="space-y-8">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    {t('quiz.preview.questionNumber', { 
                      number: index + 1, 
                      total: quiz.questions.length,
                      lng: quizLanguage 
                    })}
                  </h3>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-medium mb-4">
                    {question.title}
                  </h4>

                  {/* Question Content */}
                  {(() => {
                    switch (question.type) {
                      case 'code-order':
                        return (
                          <div className="space-y-4">
                            <DragDropContext onDragEnd={(result) => handleDragEnd(result, question.id)}>
                              <Droppable droppableId={question.id}>
                                {(provided: DndDroppableProvided) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                  >
                                    {orderedBlocks[question.id]?.map((block, blockIndex) => (
                                      <Draggable
                                        key={block.id}
                                        draggableId={block.id}
                                        index={blockIndex}
                                      >
                                        {(provided: DndDraggableProvided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                          >
                                            <CodeBlock code={block.content} language={question.language || 'javascript'} />
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </DragDropContext>
                            
                            <div className="flex gap-2 mt-4">
                              <Button onClick={() => checkAnswer(question)}>
                                {t('quiz.preview.checkAnswer', { lng: quizLanguage })}
                              </Button>
                              {!question.hideSolution && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleSolution(question.id)}
                                >
                                  {showSolution[question.id] 
                                    ? t('quiz.preview.hideSolution', { lng: quizLanguage })
                                    : t('quiz.preview.showSolution', { lng: quizLanguage })}
                                </Button>
                              )}
                              {question.hintComment && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleHint(question.id)}
                                >
                                  {showHint[question.id]
                                    ? t('quiz.preview.hideHint', { lng: quizLanguage })
                                    : t('quiz.preview.showHint', { lng: quizLanguage })}
                                </Button>
                              )}
                            </div>
                            
                            {feedback[question.id] && (
                              <div className={`p-4 rounded-lg ${
                                feedback[question.id] === t('quiz.preview.correct', { lng: quizLanguage })
                                  ? 'bg-green-50 text-green-800 border border-green-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {feedback[question.id]}
                              </div>
                            )}
                            
                            {showHint[question.id] && question.hintComment && (
                              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-800">💡</span>
                                  <span className="text-amber-800">{question.hintComment}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                        
                      case 'multiple-choice':
                      case 'single-choice':
                        return (
                          <div className="space-y-4">
                            {question.codeExample && (
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <CodeBlock code={question.codeExample} language={question.language || 'javascript'} />
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              {question.options?.map((option) => (
                                <div key={option.id} className="flex items-center gap-2">
                                  <input
                                    type={question.type === 'multiple-choice' ? 'checkbox' : 'radio'}
                                    id={option.id}
                                    name={`question-${question.id}`}
                                    checked={
                                      question.type === 'multiple-choice'
                                        ? Array.isArray(selectedAnswers[question.id]) &&
                                          (selectedAnswers[question.id] as string[]).includes(option.id)
                                        : selectedAnswers[question.id] === option.id
                                    }
                                    onChange={() => handleAnswerChange(
                                      question.id, 
                                      option.id, 
                                      question.type as AnswerType
                                    )}
                                    className="h-4 w-4"
                                  />
                                  <label htmlFor={option.id} className="text-sm">
                                    {option.text}
                                  </label>
                                  {showSolution[question.id] && option.isCorrect && (
                                    <span className="text-green-600 text-sm ml-2">✓</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <Button onClick={() => checkAnswer(question)}>
                                {t('quiz.preview.checkAnswer', { lng: quizLanguage })}
                              </Button>
                              {!question.hideSolution && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleSolution(question.id)}
                                >
                                  {showSolution[question.id] 
                                    ? t('quiz.preview.hideSolution', { lng: quizLanguage })
                                    : t('quiz.preview.showSolution', { lng: quizLanguage })}
                                </Button>
                              )}
                            </div>
                            
                            {feedback[question.id] && (
                              <div className={`p-4 rounded-lg ${
                                feedback[question.id] === t('quiz.preview.correct', { lng: quizLanguage })
                                  ? 'bg-green-50 text-green-800 border border-green-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {feedback[question.id]}
                              </div>
                            )}

                            {showSolution[question.id] && (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                                <div className="text-green-800 font-medium mb-2">
                                  {t('quiz.preview.solution', { lng: quizLanguage })}:
                                </div>
                                <div className="space-y-2">
                                  {question.options?.filter(opt => opt.isCorrect).map((option) => (
                                    <div key={option.id} className="text-green-700">
                                      • {option.text}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                        
                      case 'fill-whole':
                        return (
                          <div className="space-y-4">
                            {question.codePrefix && (
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <CodeBlock code={question.codePrefix} language={question.language || 'javascript'} />
                              </div>
                            )}
                            
                            <div className="bg-white border border-gray-200 rounded-lg">
                              <textarea
                                value={codeInputs[question.id] || ''}
                                onChange={(e) => handleCodeChange(question.id, e.target.value)}
                                className="w-full h-32 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                                placeholder={t('quiz.preview.writeAnswer', { lng: quizLanguage })}
                              />
                            </div>
                            
                            {question.codeSuffix && (
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <CodeBlock code={question.codeSuffix} language={question.language || 'javascript'} />
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Button onClick={() => runCode(question)}>
                                {isRunning[question.id] 
                                  ? t('quiz.preview.running', { lng: quizLanguage })
                                  : t('quiz.preview.runCode', { lng: quizLanguage })}
                              </Button>
                              {!question.hideSolution && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleSolution(question.id)}
                                >
                                  {showSolution[question.id] 
                                    ? t('quiz.preview.hideSolution', { lng: quizLanguage })
                                    : t('quiz.preview.showSolution', { lng: quizLanguage })}
                                </Button>
                              )}
                            </div>
                            
                            {codeOutputs[question.id] && (
                              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                                <div className="text-gray-400 mb-2">{t('quiz.preview.output', { lng: quizLanguage })}:</div>
                                <pre>{codeOutputs[question.id]}</pre>
                              </div>
                            )}
                            
                            {showSolution[question.id] && question.solutionCode && (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="text-green-800 font-medium mb-2">
                                  {t('quiz.preview.solution', { lng: quizLanguage })}:
                                </div>
                                <div className="text-green-700">
                                  {question.solutionCode}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                        
                      case 'fill-gaps':
                        return (
                          <div className="space-y-4">
                            {question.codeExample && (
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <CodeBlock code={question.codeExample} language={question.language || 'javascript'} />
                              </div>
                            )}
                            
                            <div className="flex gap-2 mt-4">
                              <Button onClick={() => checkAnswer(question)}>
                                {t('quiz.preview.checkAnswer', { lng: quizLanguage })}
                              </Button>
                              {!question.hideSolution && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleSolution(question.id)}
                                >
                                  {showSolution[question.id] 
                                    ? t('quiz.preview.hideSolution', { lng: quizLanguage })
                                    : t('quiz.preview.showSolution', { lng: quizLanguage })}
                                </Button>
                              )}
                            </div>
                            
                            {feedback[question.id] && (
                              <div className={`p-4 rounded-lg ${
                                feedback[question.id] === t('quiz.preview.correct', { lng: quizLanguage })
                                  ? 'bg-green-50 text-green-800 border border-green-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {feedback[question.id]}
                              </div>
                            )}
                          </div>
                        );

                      case 'text':
                        return (
                          <div className="space-y-4">
                            <div className="bg-white border border-gray-200 rounded-lg">
                              <textarea
                                value={codeInputs[question.id] || ''}
                                onChange={(e) => handleCodeChange(question.id, e.target.value)}
                                className="w-full h-32 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                                placeholder={t('quiz.preview.writeAnswer', { lng: quizLanguage })}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button onClick={() => checkAnswer(question)}>
                                {t('quiz.preview.checkAnswer', { lng: quizLanguage })}
                              </Button>
                              {!question.hideSolution && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleSolution(question.id)}
                                >
                                  {showSolution[question.id] 
                                    ? t('quiz.preview.hideSolution', { lng: quizLanguage })
                                    : t('quiz.preview.showSolution', { lng: quizLanguage })}
                                </Button>
                              )}
                            </div>
                            
                            {feedback[question.id] && (
                              <div className={`p-4 rounded-lg ${
                                feedback[question.id] === t('quiz.preview.correct', { lng: quizLanguage })
                                  ? 'bg-green-50 text-green-800 border border-green-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {feedback[question.id]}
                              </div>
                            )}

                            {showSolution[question.id] && (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                                <div className="text-green-800 font-medium mb-2">
                                  {t('quiz.preview.solution', { lng: quizLanguage })}:
                                </div>
                                <div className="text-green-700 whitespace-pre-wrap font-mono">
                                  {question.textAnswer || t('quiz.preview.noSolutionProvided', { lng: quizLanguage })}
                                </div>
                                {question.explanation && (
                                  <div className="mt-2 text-green-700">
                                    <div className="font-medium mb-1">{t('quiz.preview.explanation', { lng: quizLanguage })}:</div>
                                    {question.explanation}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );

                      case 'find-code-errors':
                        return (
                          <div className="space-y-4">
                            {question.codeExample && (
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <CodeBlock code={question.codeExample} language={question.language || 'javascript'} />
                              </div>
                            )}
                            
                            <div className="bg-white border border-gray-200 rounded-lg">
                              <textarea
                                value={codeInputs[question.id] || ''}
                                onChange={(e) => handleCodeChange(question.id, e.target.value)}
                                className="w-full h-32 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                                placeholder={t('quiz.preview.identifyErrors', { lng: quizLanguage })}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button onClick={() => checkAnswer(question)}>
                                {t('quiz.preview.checkAnswer', { lng: quizLanguage })}
                              </Button>
                              {!question.hideSolution && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleSolution(question.id)}
                                >
                                  {showSolution[question.id] 
                                    ? t('quiz.preview.hideSolution', { lng: quizLanguage })
                                    : t('quiz.preview.showSolution', { lng: quizLanguage })}
                                </Button>
                              )}
                            </div>
                            
                            {feedback[question.id] && (
                              <div className={`p-4 rounded-lg ${
                                feedback[question.id] === t('quiz.preview.correct', { lng: quizLanguage })
                                  ? 'bg-green-50 text-green-800 border border-green-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {feedback[question.id]}
                              </div>
                            )}
                          </div>
                        );

                      case 'jigsaw':
                        return (
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <p className="text-gray-500">
                                {t('quiz.preview.jigsawInstructions', { lng: quizLanguage })}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button onClick={() => checkAnswer(question)}>
                                {t('quiz.preview.checkAnswer', { lng: quizLanguage })}
                              </Button>
                              {!question.hideSolution && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => toggleSolution(question.id)}
                                >
                                  {showSolution[question.id] 
                                    ? t('quiz.preview.hideSolution', { lng: quizLanguage })
                                    : t('quiz.preview.showSolution', { lng: quizLanguage })}
                                </Button>
                              )}
                            </div>
                            
                            {feedback[question.id] && (
                              <div className={`p-4 rounded-lg ${
                                feedback[question.id] === t('quiz.preview.correct', { lng: quizLanguage })
                                  ? 'bg-green-50 text-green-800 border border-green-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {feedback[question.id]}
                              </div>
                            )}
                          </div>
                        );
                        
                      default:
                        return (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-500">
                              {t('quiz.preview.questionTypeNotImplemented', { lng: quizLanguage })}
                            </p>
                          </div>
                        );
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
