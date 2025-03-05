import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Quiz, Question } from '@/types';
import { CodeBlock } from '@/components/CodeBlock';

interface PreviewModalProps {
  quiz: Quiz;
  onClose: () => void;
}

export default function PreviewModal({ quiz, onClose }: PreviewModalProps) {
  // Track which questions have solutions and hints shown
  const [showSolution, setShowSolution] = useState<{[key: string]: boolean}>({});
  const [showHint, setShowHint] = useState<{[key: string]: boolean}>({});
  
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
  };
  
  const toggleHint = (questionId: string) => {
    setShowHint(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
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
              <p className="text-gray-600 mb-6">{quiz.description || 'No description provided'}</p>
              
              {quiz.questions.map((question, index) => (
                <div key={index} className="border-t border-gray-200 pt-6 mb-6 last:mb-0">
                  <h2 className="text-lg font-semibold mb-3">Question {index + 1}:</h2>
                  <p className="mb-4">{question.title}</p>
                  
                  {question.type === 'code-order' && (
                    <div className="space-y-2 mb-4">
                      {(question.codeBlocks || []).map((block, i) => (
                        <div key={i} className="bg-[#1E293B] text-[#E5E7EB] p-3 rounded font-mono text-sm border border-blue-500 cursor-move">
                          <CodeBlock code={block.content} language={block.language || 'javascript'} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(question.type === 'multiple-choice' || question.type === 'single-choice') && (
                    <>
                      {question.codeExample && (
                        <div className="mb-4 bg-[#1E293B] p-3 rounded-md text-[#E5E7EB] font-mono text-sm">
                          <CodeBlock code={question.codeExample} language="javascript" />
                        </div>
                      )}
                      
                      <div className="space-y-3 mb-4">
                        {(question.options || []).map((option, i) => (
                          <div key={i} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer flex items-start">
                            <input 
                              type={question.type === 'multiple-choice' ? 'checkbox' : 'radio'} 
                              name={`question-${question.id}`}
                              className="mt-1 mr-3" 
                            />
                            <div>
                              <p className="font-medium">{option.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {question.type === 'fill-gaps' && (
                    <>
                      <div className="bg-[#1E293B] p-4 rounded-md font-mono text-sm text-[#E5E7EB] mb-4">
                        {question.codeWithGaps && (
                          <pre>
                            <code dangerouslySetInnerHTML={{ 
                              __html: question.codeWithGaps.replace(
                                /\[GAP_\d+\]/g, 
                                '<span class="bg-gray-700 px-2 py-1 rounded border border-dashed border-gray-500">_______</span>'
                              ) 
                            }} />
                          </pre>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Drag snippets here:</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(question.availableSnippets || []).map((snippet, i) => (
                            <div key={i} className="border border-gray-300 rounded bg-white px-3 py-1 font-mono text-sm cursor-move">
                              {snippet}
                            </div>
                          ))}
                        </div>
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
                      <div className="flex space-x-2 mb-4">
                        <Button 
                          className={`text-sm ${showSolution[question.id] ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                          onClick={() => toggleSolution(question.id)}
                        >
                          {showSolution[question.id] ? 'Hide Solution' : 'Show Solution'}
                        </Button>
                        
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
                      
                      {/* Hint */}
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
                  
                  <div className="flex justify-end">
                    <Button className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
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
