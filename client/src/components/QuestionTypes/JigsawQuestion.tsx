import { useState } from 'react';
import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { SyntaxHighlighterWrapper } from '@/lib/syntaxHighlighter';

interface JigsawQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

// Generate a random ID for new jigsaw pieces
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function JigsawQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: JigsawQuestionProps) {
  const [previewActive, setPreviewActive] = useState(false);

  // Initialize jigsawPieces if not present in the question
  if (!question.jigsawPieces) {
    question = {
      ...question,
      jigsawPieces: [
        { id: generateId(), content: 'function factorial(n) {', correctRow: 0, correctColumn: 0, language: 'javascript' },
        { id: generateId(), content: '  if (n <= 1) return 1;', correctRow: 1, correctColumn: 0, language: 'javascript' },
        { id: generateId(), content: '  return n * factorial(n - 1);', correctRow: 2, correctColumn: 0, language: 'javascript' },
        { id: generateId(), content: '}', correctRow: 3, correctColumn: 0, language: 'javascript' },
      ],
      gridSize: { rows: 4, columns: 1 },
      jigsawDescription: 'Arrange the code blocks to create a valid factorial function'
    };
    onUpdate(question);
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      title: e.target.value
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      jigsawDescription: e.target.value
    });
  };

  const handlePieceContentChange = (id: string, content: string) => {
    onUpdate({
      ...question,
      jigsawPieces: question.jigsawPieces?.map(piece => 
        piece.id === id ? { ...piece, content } : piece
      )
    });
  };

  const handlePiecePositionChange = (id: string, position: { row: number; column: number }) => {
    onUpdate({
      ...question,
      jigsawPieces: question.jigsawPieces?.map(piece => 
        piece.id === id ? { 
          ...piece, 
          correctRow: position.row, 
          correctColumn: position.column 
        } : piece
      )
    });
  };

  const handleAddPiece = () => {
    const newPiece = {
      id: generateId(),
      content: '// New code block',
      correctRow: question.jigsawPieces?.length || 0,
      correctColumn: 0,
      language: 'javascript'
    };
    
    onUpdate({
      ...question,
      jigsawPieces: [...(question.jigsawPieces || []), newPiece]
    });
  };

  const handleDeletePiece = (id: string) => {
    onUpdate({
      ...question,
      jigsawPieces: question.jigsawPieces?.filter(piece => piece.id !== id)
    });
  };

  const handleMovePieceUp = (index: number) => {
    if (index <= 0 || !question.jigsawPieces) return;
    
    const newPieces = [...question.jigsawPieces];
    [newPieces[index], newPieces[index - 1]] = [newPieces[index - 1], newPieces[index]];
    
    // Update the correct positions after moving
    const updatedPieces = newPieces.map((piece, idx) => ({
      ...piece,
      correctRow: idx
    }));
    
    onUpdate({
      ...question,
      jigsawPieces: updatedPieces
    });
  };

  const handleMovePieceDown = (index: number) => {
    if (!question.jigsawPieces || index >= question.jigsawPieces.length - 1) return;
    
    const newPieces = [...question.jigsawPieces];
    [newPieces[index], newPieces[index + 1]] = [newPieces[index + 1], newPieces[index]];
    
    // Update the correct positions after moving
    const updatedPieces = newPieces.map((piece, idx) => ({
      ...piece,
      correctRow: idx
    }));
    
    onUpdate({
      ...question,
      jigsawPieces: updatedPieces
    });
  };

  const handleLanguageChange = (id: string, language: string) => {
    onUpdate({
      ...question,
      jigsawPieces: question.jigsawPieces?.map(piece => 
        piece.id === id ? { ...piece, language } : piece
      )
    });
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center text-lg font-medium">
            <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs mr-2">
              Question {question.order}
            </span>
            <Input 
              value={question.title} 
              onChange={handleTitleChange}
              className="bg-transparent border-none h-auto p-0 text-lg font-medium shadow-none focus-visible:ring-0"
              placeholder="Enter question title"
            />
          </CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={onMoveUp} title="Move up">
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onMoveDown} title="Move down">
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title="Delete question">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Description (instructions for the student)</Label>
          <Textarea 
            placeholder="Enter instructions for the student"
            value={question.jigsawDescription || ''}
            onChange={handleDescriptionChange}
            className="min-h-20"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Jigsaw Pieces (will be shuffled for students)</Label>
            <Button onClick={handleAddPiece} size="sm" variant="outline" className="flex items-center">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Piece
            </Button>
          </div>

          <div className="space-y-3">
            {question.jigsawPieces?.map((piece, index) => (
              <Card key={piece.id} className="border border-slate-200">
                <CardHeader className="py-2 px-4 bg-slate-50 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold">Piece {index + 1}</span>
                    <select
                      value={piece.language}
                      onChange={(e) => handleLanguageChange(piece.id, e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded px-2 py-1"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMovePieceUp(index)}
                      className="h-6 w-6"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMovePieceDown(index)}
                      className="h-6 w-6"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeletePiece(piece.id)}
                      className="h-6 w-6 text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Textarea
                    value={piece.content}
                    onChange={(e) => handlePieceContentChange(piece.id, e.target.value)}
                    className="font-mono text-sm h-16 bg-slate-50"
                    placeholder="Enter code snippet for this piece"
                  />
                  {previewActive && (
                    <div className="mt-2 border border-slate-200 rounded overflow-hidden">
                      <SyntaxHighlighterWrapper 
                        code={piece.content} 
                        language={piece.language} 
                        showLineNumbers={false} 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            variant="outline"
            onClick={() => setPreviewActive(!previewActive)}
          >
            {previewActive ? 'Hide' : 'Show'} Code Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}