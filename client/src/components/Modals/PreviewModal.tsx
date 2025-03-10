import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';
import { Quiz, Question, CodeOrderBlock } from '@/types';
import { CodeBlock } from '@/components/CodeBlock';
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

interface PreviewModalProps {
  quiz: Quiz;
  onClose: () => void;
}

export default function PreviewModal({ quiz, onClose }: PreviewModalProps) {
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

  const handleDragEnd = (result: any, questionId: string) => {
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Quiz Preview</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </Button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold mb-1">{quiz.title || 'Untitled Quiz'}</h1>
              <p className="text-gray-600 mb-3">{quiz.description || 'No description provided'}</p>
              {quiz.timeLimit && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded flex items-center mb-6">
                  <span className="mr-2">⏱️</span>
                  <span className="font-mono">{Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}</span>
                  <span className="ml-2 text-sm">(Quiz timer)</span>
                </div>
              )}
              {!quiz.timeLimit && <div className="mb-3"></div>}
              
              {quiz.questions.map((question, index) => (
                <div key={index} className="border-t border-gray-200 pt-6 mb-6 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Question {index + 1}:</h2>
                      <p className="mb-4">{question.title}</p>
                    </div>
                    {question.timeLimit && (
                      <div className="bg-gray-100 border border-gray-200 text-gray-800 px-2 py-1 rounded flex items-center text-sm">
                        <span className="mr-2">⏱️</span>
                        <span className="font-mono">{Math.floor(question.timeLimit / 60)}:{(question.timeLimit % 60).toString().padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>
                  
                  {question.type === 'code-order' && (
                    <>
                      {(() => {
                        initializeCodeBlocks(question);
                        return null;
                      })()}
                      <DragDropContext onDragEnd={(result) => handleDragEnd(result, question.id)}>
                        <Droppable droppableId={`code-blocks-${question.id}`}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {(orderedBlocks[question.id] || []).map((block, index) => (
                                <Draggable
                                  key={block.id}
                                  draggableId={block.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-[#1E293B] text-[#E5E7EB] p-3 rounded font-mono text-sm border ${
                                        showSolution[question.id]
                                          ? block.correctPosition === index + 1
                                            ? 'border-green-500 bg-green-50/10'
                                            : 'border-red-500 bg-red-50/10'
                                          : feedback[question.id]?.startsWith('Correct')
                                          ? 'border-green-500'
                                          : 'border-blue-500'
                                      } ${snapshot.isDragging ? 'opacity-50' : ''} cursor-move relative`}
                                    >
                                      <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
                                        {showSolution[question.id] ? `Position ${block.correctPosition}` : `Block ${index + 1}`}
                                      </div>
                                      <CodeBlock code={block.content} language={block.language || 'javascript'} />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {!question.hideSolution && (
                          <Button 
                            variant="outline" 
                            className="text-sm border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                            onClick={() => toggleSolution(question.id)}
                          >
                            {showSolution[question.id] ? 'Hide Solution' : 'Show Solution'}
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  
                  {(question.type === 'multiple-choice' || question.type === 'single-choice') && (
                    <>
                      {(() => {
                        console.log('Full question object:', JSON.stringify(question, null, 2));
                        console.log('Question type:', question.type);
                        console.log('Question options:', question.options);
                        console.log('Is condition true:', question.type === 'multiple-choice' || question.type === 'single-choice');
                        return null;
                      })()}
                      {question.codeExample && (
                        <div className="mb-4 bg-[#1E293B] p-3 rounded-md text-[#E5E7EB] font-mono text-sm">
                          <CodeBlock code={question.codeExample} language="javascript" />
                        </div>
                      )}
                      
                      <div className="space-y-3 mb-4">
                        {(question.options || []).map((option, i) => (
                          <div 
                            key={i} 
                            className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer flex items-start ${
                              showSolution[question.id] && option.isCorrect 
                                ? 'border-green-500 bg-green-50' 
                                : feedback[question.id]?.startsWith('Correct') && selectedAnswers[question.id] === option.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200'
                            }`}
                            onClick={() => handleAnswerChange(question.id, option.id, question.type as 'single-choice' | 'multiple-choice')}
                          >
                            <input 
                              type={question.type === 'multiple-choice' ? 'checkbox' : 'radio'} 
                              name={`question-${question.id}`}
                              checked={
                                Array.isArray(selectedAnswers[question.id])
                                  ? (selectedAnswers[question.id] as string[]).includes(option.id)
                                  : selectedAnswers[question.id] === option.id
                              }
                              onChange={() => {}} // Handled by div onClick
                              className="mt-1 mr-3" 
                            />
                            <div className="flex-1">
                              <p className="font-medium">{option.text}</p>
                              {showSolution[question.id] && option.feedback && (
                                <p className="text-sm mt-1 text-gray-600">{option.feedback}</p>
                              )}
                              {showSolution[question.id] && option.isCorrect && (
                                <div className="text-green-600 text-sm mt-1">✓ Correct answer</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Multiple choice question controls */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {!question.hideSolution && (
                          <Button 
                            variant="outline" 
                            className="text-sm border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                            onClick={() => toggleSolution(question.id)}
                          >
                            {showSolution[question.id] ? 'Hide Solution' : 'Show Solution'}
                          </Button>
                        )}
                        
                        {question.hintComment && (
                          <Button 
                            variant="outline" 
                            className="text-sm border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                            onClick={() => toggleHint(question.id)}
                          >
                            {showHint[question.id] ? 'Hide Hint' : 'Show Hint'}
                          </Button>
                        )}
                      </div>
                      
                      {/* Hint display for multiple choice */}
                      {question.hintComment && showHint[question.id] && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                          <div className="flex items-start">
                            <span className="text-amber-500 mr-2 text-xl">💡</span>
                            <p className="text-amber-800 text-sm">{question.hintComment}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {question.type === 'fill-gaps' && (
                    <>
                      <DragDropContext onDragEnd={(result) => handleDragEnd(result, question.id)}>
                        <div className="bg-[#1E293B] p-4 rounded-md font-mono text-sm text-[#E5E7EB] mb-4">
                          {question.codeWithGaps && (
                            <pre>
                              <code>
                                {question.codeWithGaps.split(/(\[GAP_\d+\])/).map((part, index) => {
                                  const gapMatch = part.match(/\[GAP_(\d+)\]/);
                                  if (gapMatch) {
                                    const gapNumber = parseInt(gapMatch[1]);
                                    const gap = question.gaps?.find(g => g.position === gapNumber);
                                    if (gap) {
                                      return (
                                        <Droppable key={gap.id} droppableId={gap.id}>
                                          {(provided: any, snapshot: any) => (
                                            <span
                                              ref={provided.innerRef}
                                              {...provided.droppableProps}
                                              className={`inline-block px-2 py-1 mx-1 rounded-md ${
                                                snapshot.isDraggingOver 
                                                  ? 'bg-blue-600 border-blue-400' 
                                                  : 'bg-slate-700 border-slate-500'
                                              } ${
                                                gapAnswers[question.id]?.[gap.id] 
                                                  ? 'border-green-400 text-white' 
                                                  : 'border-dashed text-slate-300'
                                              } border-2 hover:border-blue-400 transition-colors`}
                                            >
                                              {gapAnswers[question.id]?.[gap.id] || '[ Drop Here ]'}
                                              {provided.placeholder}
                                            </span>
                                          )}
                                        </Droppable>
                                      );
                                    }
                                  }
                                  return <span key={index}>{part}</span>;
                                })}
                              </code>
                            </pre>
                          )}
                          
                          <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2 text-white">Available Snippets:</h3>
                            <Droppable droppableId="snippets">
                              {(provided: any) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="flex flex-wrap gap-2"
                                >
                                  {(question.availableSnippets || []).map((snippet, i) => (
                                    <Draggable key={snippet} draggableId={snippet} index={i}>
                                      {(provided: any, snapshot: any) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`border-2 border-blue-400 rounded px-3 py-1 font-mono text-sm cursor-move ${
                                            snapshot.isDragging 
                                              ? 'bg-blue-100 text-blue-900' 
                                              : 'bg-white text-slate-900'
                                          } hover:bg-blue-50 hover:border-blue-500 transition-colors`}
                                        >
                                          {snippet}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        </div>
                      </DragDropContext>

                      <div className="flex space-x-2 mb-4">
                        <Button onClick={() => checkAnswer(question)}>
                          Check Answer
                        </Button>
                        {!question.hideSolution && (
                          <Button 
                            variant="outline" 
                            onClick={() => setShowSolution(prev => ({ ...prev, [question.id]: !prev[question.id] }))}
                          >
                            {showSolution[question.id] ? 'Hide Solution' : 'Show Solution'}
                          </Button>
                        )}
                      </div>

                      {showSolution[question.id] && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-4">
                          <h3 className="font-medium text-green-800 mb-2">Solution:</h3>
                          <div className="font-mono text-sm">
                            {question.gaps?.map((gap: any, index: number) => (
                              <div key={gap.id} className="text-green-700">
                                Gap {index + 1}: {gap.answer}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {question.type === 'find-code-errors' && (
                    <>
                      <div className="space-y-4">
                        {/* Code with errors display */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Code with Errors:</h3>
                          <div className="bg-[#1E293B] p-4 rounded-md font-mono text-sm text-[#E5E7EB] mb-4">
                            <CodeBlock 
                              code={question.codeWithErrors || ''} 
                              language={question.language || 'javascript'} 
                            />
                          </div>
                        </div>

                        {/* Student's corrected code input */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Your Corrected Code:</h3>
                          <div className="border border-gray-200 rounded-md">
                            <textarea
                              className="w-full p-3 font-mono text-sm min-h-[150px] bg-slate-50 rounded-md"
                              placeholder="Write your corrected version of the code here..."
                              value={codeInputs[question.id] || ''}
                              onChange={(e) => handleCodeChange(question.id, e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Error descriptions */}
                        {question.errorDescriptions && question.errorDescriptions.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">Errors to Fix:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                              {question.errorDescriptions.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Solution display */}
                        {showSolution[question.id] && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">Correct Solution:</h3>
                            <div className="bg-[#1E293B] p-4 rounded-md font-mono text-sm text-[#E5E7EB]">
                              <CodeBlock 
                                code={question.correctCode || ''} 
                                language={question.language || 'javascript'} 
                              />
                            </div>
                          </div>
                        )}

                        {/* Controls */}
                        <div className="flex flex-wrap gap-2">
                          {!question.hideSolution && (
                            <Button 
                              variant="outline" 
                              className="text-sm border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                              onClick={() => toggleSolution(question.id)}
                            >
                              {showSolution[question.id] ? 'Hide Solution' : 'Show Solution'}
                            </Button>
                          )}
                          
                          {question.hintComment && (
                            <Button 
                              variant="outline" 
                              className="text-sm border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                              onClick={() => toggleHint(question.id)}
                            >
                              {showHint[question.id] ? 'Hide Hint' : 'Show Hint'}
                            </Button>
                          )}
                        </div>

                        {/* Hint display */}
                        {question.hintComment && showHint[question.id] && (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                            <div className="flex items-start">
                              <span className="text-amber-500 mr-2 text-xl">💡</span>
                              <p className="text-amber-800 text-sm">{question.hintComment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {question.type === 'find-errors' && (
                    <>
                      <div className="bg-[#1E293B] p-4 rounded-md font-mono text-sm text-[#E5E7EB] overflow-auto mb-4">
                        <div className="flex">
                          <div className="pr-3 text-gray-500 select-none border-r border-gray-700 mr-3">
                            {question.code?.split('\n').map((_, i) => (
                              <div key={i}>{i + 1}</div>
                            ))}
                          </div>
                          <div className="flex-1">
                            {question.code?.split('\n').map((line, i) => {
                              const lineNumber = i + 1;
                              const isError = (question.errorLines || []).some(
                                el => el.lineNumber === lineNumber
                              );
                              return (
                                <div 
                                  key={i}
                                  className={`hover:bg-slate-700 px-2 rounded ${isError ? 'bg-red-900/20' : ''} flex items-center`}
                                >
                                  {isError && <input type="checkbox" className="mr-2" />}
                                  <span>{line}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {(question.errors || []).length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Errors to Find: <span className="text-gray-500">(Select all that apply)</span></h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(question.errors || []).map((error, i) => (
                              <div key={i} className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" id={`preview-error-${i}`} />
                                <label htmlFor={`preview-error-${i}`} className="ml-2 text-sm text-gray-700">{error}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {question.type === 'fill-whole' && (
                    <>
                      <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
                        {/* Code Prefix */}
                        <div className="bg-[#1E293B] p-3 font-mono text-sm text-[#E5E7EB]">
                          <CodeBlock code={question.codePrefix || ''} language={question.language || 'javascript'} />
                        </div>
                        
                        {/* Solution area */}
                        <div className="relative border-t border-b border-dashed border-gray-300 bg-slate-50">
                          {!showSolution[question.id] ? (
                            <textarea 
                              className="w-full p-3 font-mono text-sm resize-y min-h-[100px] bg-slate-50"
                              placeholder="Write your solution here" 
                              value={codeInputs[question.id] || ''}
                              onChange={(e) => handleCodeChange(question.id, e.target.value)}
                            />
                          ) : (
                            <div className="w-full bg-[#1E293B] p-3 font-mono text-sm text-[#E5E7EB]">
                              <CodeBlock code={question.solutionCode || ''} language={question.language || 'javascript'} />
                            </div>
                          )}
                        </div>
                        
                        {/* Code Suffix */}
                        <div className="bg-[#1E293B] p-3 font-mono text-sm text-[#E5E7EB]">
                          <CodeBlock code={question.codeSuffix || ''} language={question.language || 'javascript'} />
                        </div>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {!question.hideSolution && (
                          <Button 
                            className={`text-sm ${showSolution[question.id] ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                            onClick={() => toggleSolution(question.id)}
                          >
                            {showSolution[question.id] ? 'Hide Solution' : 'Show Solution'}
                          </Button>
                        )}
                        
                        {question.hintComment && (
                          <Button 
                            variant="outline" 
                            className="text-sm border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                            onClick={() => toggleHint(question.id)}
                          >
                            {showHint[question.id] ? 'Hide Hint' : 'Show Hint'}
                          </Button>
                        )}
                        
                        <Button 
                          className="text-sm bg-indigo-600 hover:bg-indigo-700 flex items-center"
                          onClick={() => runCode(question)}
                          disabled={isRunning[question.id]}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {isRunning[question.id] ? 'Running...' : 'Run Code'}
                        </Button>
                      </div>
                      
                      {/* Hint */}
                      {question.hintComment && showHint[question.id] && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                          <div className="flex items-start">
                            <span className="text-amber-500 mr-2 text-xl">💡</span>
                            <p className="text-amber-800 text-sm">{question.hintComment}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Code output */}
                      {codeOutputs[question.id] && (
                        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 font-mono text-sm overflow-auto max-h-[300px]">
                          <h3 className="text-gray-400 text-xs uppercase mb-2">Output:</h3>
                          <pre>{codeOutputs[question.id]}</pre>
                        </div>
                      )}
                    </>
                  )}
                  
                  {feedback[question.id] && (
                    <div className={`p-3 mb-4 rounded-md ${
                      feedback[question.id].startsWith('Correct') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {feedback[question.id]}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => checkAnswer(question)}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Check Answer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
