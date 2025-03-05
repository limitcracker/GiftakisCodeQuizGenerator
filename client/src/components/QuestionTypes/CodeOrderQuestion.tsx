import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd-next';
import { PencilIcon, GripIcon, XIcon, PlusIcon, EyeOffIcon } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { Question, CodeOrderBlock } from '@/types';
import QuestionTimerSettings from '@/components/QuizEditor/QuestionTimerSettings';

interface CodeOrderQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function CodeOrderQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: CodeOrderQuestionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(question.title);
  const [localExplanation, setLocalExplanation] = useState(question.explanation || '');
  const [codeBlocks, setCodeBlocks] = useState<CodeOrderBlock[]>(
    question.codeBlocks as CodeOrderBlock[] || []
  );

  const handleSave = () => {
    onUpdate({
      ...question,
      title: localTitle,
      explanation: localExplanation,
      codeBlocks: codeBlocks
    });
    setIsEditing(false);
  };

  const handleAddCodeBlock = () => {
    const newPosition = codeBlocks.length + 1;
    const newBlock: CodeOrderBlock = {
      id: `block-${Date.now()}`,
      content: '// New code block',
      correctPosition: newPosition,
      language: 'javascript'
    };
    setCodeBlocks([...codeBlocks, newBlock]);
  };

  const handleDeleteBlock = (id: string) => {
    const updatedBlocks = codeBlocks.filter(block => block.id !== id);
    // Recalculate positions
    const reorderedBlocks = updatedBlocks.map((block, idx) => ({
      ...block,
      correctPosition: idx + 1
    }));
    setCodeBlocks(reorderedBlocks);
  };

  const handleEditBlock = (id: string, content: string) => {
    setCodeBlocks(codeBlocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(codeBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const reorderedItems = items.map((item, index) => ({
      ...item,
      correctPosition: index + 1
    }));
    
    setCodeBlocks(reorderedItems);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Question {question.order} <span className="text-sm font-normal text-gray-500">(Order Code Blocks)</span>
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onMoveUp}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m18 15-6-6-6 6"/></svg>
            </Button>
            <Button variant="ghost" size="icon" onClick={onMoveDown}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor={`question-title-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">Question</Label>
            <Input
              id={`question-title-${question.id}`}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Code Blocks to Order</h3>
              <Button 
                variant="ghost" 
                onClick={handleAddCodeBlock}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-sm h-8">
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Code Block
              </Button>
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="codeBlocks">
                {(provided: any) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {codeBlocks.map((block, index) => (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided: any) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white border border-gray-200 shadow-sm rounded-md mb-3 last:mb-0"
                          >
                            <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
                              <div {...provided.dragHandleProps} className="text-gray-400 mr-2">
                                <GripIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                Block {index + 1} <span className="text-gray-500 text-xs">(Correct Position: {block.correctPosition})</span>
                              </div>
                              <div>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8">
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteBlock(block.id)} className="text-red-500 hover:text-red-700 p-1 h-8 w-8">
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {isEditing ? (
                              <Textarea
                                value={block.content}
                                onChange={(e) => handleEditBlock(block.id, e.target.value)}
                                className="p-3 font-mono text-sm"
                                rows={3}
                              />
                            ) : (
                              <div className="p-3 font-mono text-sm bg-[#1E293B] text-[#E5E7EB] rounded-b-md">
                                <CodeBlock code={block.content} language={block.language} />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          
          {/* Question Settings */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
            <h3 className="font-medium">Question Settings</h3>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id={`hideSolution-${question.id}`}
                checked={question.hideSolution || false}
                onChange={(e) => onUpdate({
                  ...question,
                  hideSolution: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <Label htmlFor={`hideSolution-${question.id}`} className="text-sm cursor-pointer flex items-center">
                <EyeOffIcon className="h-3 w-3 mr-1 text-gray-500" />
                Hide "Check Solution" button for students
              </Label>
            </div>
            
            <p className="text-xs text-gray-500 ml-6">
              When enabled, students won't be able to see the correct order of code blocks in the quiz.
              This is useful for assessments where you don't want students to see the correct answer.
            </p>
            
            {/* Question Timer Settings */}
            <QuestionTimerSettings 
              questionId={question.id} 
              currentTimeLimit={question.timeLimit} 
            />
          </div>
          
          <div>
            <Label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</Label>
            <Textarea
              id={`explanation-${question.id}`}
              value={localExplanation}
              onChange={(e) => setLocalExplanation(e.target.value)}
              placeholder="Add explanation for correct answer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <Button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              Save Question
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
