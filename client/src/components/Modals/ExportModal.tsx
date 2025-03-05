import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Copy, Check } from 'lucide-react';
import { Quiz } from '@/types';
import { generateHtml } from '@/lib/generateHtml';
import { CodeBlock } from '@/components/CodeBlock';

interface ExportModalProps {
  quiz: Quiz;
  onClose: () => void;
}

export default function ExportModal({ quiz, onClose }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  const generatedHtml = generateHtml(quiz);

  const handleCopy = async () => {
    if (codeRef.current) {
      try {
        await navigator.clipboard.writeText(codeRef.current.textContent || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Export HTML Code</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 mb-2">Copy this HTML code and embed it in your website:</p>
            <div className="relative">
              <pre 
                ref={codeRef}
                className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-[400px] font-mono"
              >
                <code>{generatedHtml}</code>
              </pre>
              <Button 
                onClick={handleCopy} 
                className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4 h-64 overflow-auto bg-gray-50">
              <div className="border-b pb-3 mb-3">
                <h2 className="text-xl font-bold">{quiz.title || 'JavaScript Basics Quiz'}</h2>
                <p className="text-gray-600">{quiz.description || 'Test your JavaScript knowledge with this quiz'}</p>
              </div>
              
              {quiz.questions.slice(0, 2).map((question, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                  <h3 className="font-medium mb-2">Question {index + 1}:</h3>
                  <p>{question.title}</p>
                  
                  {question.type === 'code-order' && (
                    <div className="mt-2 space-y-2">
                      {(question.codeBlocks || []).map((block, i) => (
                        <div key={i} className="bg-[#1E293B] text-[#E5E7EB] p-2 rounded font-mono text-sm">
                          <CodeBlock code={block.content} language={block.language || 'javascript'} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'multiple-choice' && (
                    <>
                      {question.codeExample && (
                        <div className="mt-2 mb-3 bg-[#1E293B] p-3 rounded-md text-[#E5E7EB] font-mono text-sm">
                          <CodeBlock code={question.codeExample} language="javascript" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {(question.options || []).map((option, i) => (
                          <div key={i} className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span>{option.text}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {question.type === 'fill-whole' && (
                    <div className="mt-2">
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        {/* Code Prefix */}
                        <div className="bg-[#1E293B] p-2 font-mono text-sm text-[#E5E7EB]">
                          <CodeBlock code={question.codePrefix || ''} language={question.language || 'javascript'} />
                        </div>
                        
                        {/* Solution area */}
                        <div className="border-t border-b border-dashed border-gray-300 bg-slate-50 p-2">
                          <div className="font-mono text-xs text-gray-500">Write your solution here</div>
                        </div>
                        
                        {/* Code Suffix */}
                        <div className="bg-[#1E293B] p-2 font-mono text-sm text-[#E5E7EB]">
                          <CodeBlock code={question.codeSuffix || ''} language={question.language || 'javascript'} />
                        </div>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button 
                          className="text-sm bg-green-600 hover:bg-green-700 px-2 py-1 h-auto"
                          size="sm"
                        >
                          Show Solution
                        </Button>
                        
                        {question.hintComment && (
                          <Button 
                            variant="outline" 
                            className="text-sm border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 h-auto"
                            size="sm"
                          >
                            Show Hint
                          </Button>
                        )}
                        
                        <Button 
                          className="text-sm bg-indigo-600 hover:bg-indigo-700 flex items-center px-2 py-1 h-auto"
                          size="sm"
                        >
                          Run Code
                        </Button>
                      </div>
                      
                      {/* Output preview */}
                      <div className="mt-2 p-2 bg-gray-800 text-white rounded-md">
                        <div className="text-xs text-gray-400 mb-1">Output:</div>
                        <div className="font-mono text-xs">Code execution is available in the exported HTML</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {quiz.questions.length > 2 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  ...more questions in the preview...
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
