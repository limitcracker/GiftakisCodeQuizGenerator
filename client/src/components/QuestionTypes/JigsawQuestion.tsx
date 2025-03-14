import { useState } from 'react';
import { Question, JigsawPiece } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronUp, ChevronDown, Trash2, Plus, Grid2X2, Rows3, ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import { SyntaxHighlighterWrapper } from '@/lib/syntaxHighlighter';
import { useTranslation } from 'react-i18next';
import { useQuiz } from '@/context/QuizContext';

interface JigsawQuestionProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

// Generate a random ID for new jigsaw pieces
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Sample 2D jigsaw examples
const JIGSAW_EXAMPLES = {
  factorial: {
    pieces: [
      { id: generateId(), content: 'function factorial(n) {', correctRow: 0, correctColumn: 0, language: 'javascript' },
      { id: generateId(), content: '  if (n <= 1) return 1;', correctRow: 1, correctColumn: 0, language: 'javascript' },
      { id: generateId(), content: '  return n * factorial(n - 1);', correctRow: 2, correctColumn: 0, language: 'javascript' },
      { id: generateId(), content: '}', correctRow: 3, correctColumn: 0, language: 'javascript' },
    ],
    gridSize: { rows: 4, columns: 1 },
    description: 'Arrange the code blocks to create a valid factorial function'
  },
  conditions: {
    pieces: [
      { id: generateId(), content: 'if (age < 13) {', correctRow: 0, correctColumn: 0, language: 'javascript' },
      { id: generateId(), content: '  console.log("Child");', correctRow: 1, correctColumn: 0, language: 'javascript' },
      { id: generateId(), content: '} else if (age < 20) {', correctRow: 0, correctColumn: 1, language: 'javascript' },
      { id: generateId(), content: '  console.log("Teenager");', correctRow: 1, correctColumn: 1, language: 'javascript' },
      { id: generateId(), content: '} else {', correctRow: 0, correctColumn: 2, language: 'javascript' },
      { id: generateId(), content: '  console.log("Adult");', correctRow: 1, correctColumn: 2, language: 'javascript' },
      { id: generateId(), content: '}', correctRow: 2, correctColumn: 1, language: 'javascript' },
    ],
    gridSize: { rows: 3, columns: 3 },
    description: 'Arrange the code blocks to form a valid age checking condition structure'
  }
};

export default function JigsawQuestion({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: JigsawQuestionProps) {
  const { t } = useTranslation();
  const { quizLanguage } = useQuiz();
  const [previewActive, setPreviewActive] = useState(false);
  const [showGridEditor, setShowGridEditor] = useState(false);
  const [showCompiledCode, setShowCompiledCode] = useState(false);

  // Initialize jigsawPieces if not present in the question
  if (!question.jigsawPieces) {
    question = {
      ...question,
      jigsawPieces: JIGSAW_EXAMPLES.factorial.pieces,
      gridSize: JIGSAW_EXAMPLES.factorial.gridSize,
      jigsawDescription: JIGSAW_EXAMPLES.factorial.description
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
      correctRow: piece.correctRow
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
      correctRow: piece.correctRow
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
  
  // Generate the complete code by assembling all jigsaw pieces in correct order
  const generateCompiledCode = (): { code: string; language: string } => {
    if (!question.jigsawPieces || !question.gridSize) {
      return { code: "// No code pieces defined", language: "javascript" };
    }
    
    const { rows, columns } = question.gridSize;
    
    // Create a grid to hold pieces
    const grid: (JigsawPiece | null)[][] = Array(rows).fill(null).map(() => Array(columns).fill(null));
    
    // Place pieces in their correct positions in the grid
    question.jigsawPieces.forEach(piece => {
      const { correctRow, correctColumn } = piece;
      // Only place if within grid bounds
      if (correctRow < rows && correctColumn < columns) {
        grid[correctRow][correctColumn] = piece;
      }
    });
    
    // Determine the predominant language
    const languageMap: Record<string, number> = {};
    question.jigsawPieces.forEach(piece => {
      languageMap[piece.language] = (languageMap[piece.language] || 0) + 1;
    });
    const language = Object.entries(languageMap).reduce(
      (a, b) => (a[1] > b[1] ? a : b), 
      ["javascript", 0]
    )[0];
    
    // Build the code by reading the grid row by row, column by column
    let compiledCode = "";
    grid.forEach(row => {
      row.forEach(piece => {
        if (piece) {
          compiledCode += piece.content;
          // Add a newline if this piece doesn't end with one
          if (!piece.content.endsWith('\n')) {
            compiledCode += '\n';
          }
        }
      });
    });
    
    return { 
      code: compiledCode.trim(), 
      language 
    };
  };

  const updateGridSize = (property: 'rows' | 'columns', value: number) => {
    if (!question.gridSize) return;
    
    // Ensure value is at least 1
    value = Math.max(1, value);
    
    onUpdate({
      ...question,
      gridSize: {
        ...question.gridSize,
        [property]: value
      }
    });
  };

  const changeTemplate = (templateName: keyof typeof JIGSAW_EXAMPLES) => {
    const template = JIGSAW_EXAMPLES[templateName];
    onUpdate({
      ...question,
      jigsawPieces: template.pieces,
      gridSize: template.gridSize,
      jigsawDescription: template.description
    });
  };

  // Create a visual representation of the grid
  const visualizeGrid = () => {
    if (!question.gridSize || !question.jigsawPieces) return null;
    
    const { rows, columns } = question.gridSize;
    
    // Create a grid matrix filled with null
    const grid: (JigsawPiece | null)[][] = Array(rows).fill(null).map(() => Array(columns).fill(null));
    
    // Place pieces in their correct positions
    question.jigsawPieces.forEach(piece => {
      const { correctRow, correctColumn } = piece;
      // Only place if within grid bounds
      if (correctRow < rows && correctColumn < columns) {
        grid[correctRow][correctColumn] = piece;
      }
    });
    
    return (
      <div className="mt-6 bg-slate-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-3">Grid Layout Preview</h3>
        <div 
          className="grid gap-2 border bg-white rounded-lg p-2"
          style={{ 
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, minmax(50px, auto))`
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((piece, colIndex) => (
              <div 
                key={`cell-${rowIndex}-${colIndex}`}
                className={`border ${piece ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-dashed border-gray-300'} rounded p-2 text-xs flex items-center justify-center min-h-[50px] relative`}
              >
                {piece ? (
                  <div className="text-center">
                    <div className="absolute top-1 right-1 text-xs text-gray-500">
                      R{rowIndex}:C{colIndex}
                    </div>
                    <div className="mt-2 truncate max-w-full">
                      {piece.content.length > 20 
                        ? piece.content.substring(0, 20) + '...' 
                        : piece.content}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Empty</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center text-lg font-medium">
            <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs mr-2">
              {t('quiz.editor.fillGaps.messages.questionType', { number: question.order, lng: quizLanguage })}
            </span>
            <Input 
              value={question.title} 
              onChange={handleTitleChange}
              className="bg-transparent border-none h-auto p-0 text-lg font-medium shadow-none focus-visible:ring-0"
              placeholder={t('quiz.editor.fillGaps.placeholders.questionTitle', { lng: quizLanguage })}
            />
          </CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={onMoveUp} title={t('quiz.editor.fillGaps.buttons.moveUp', { lng: quizLanguage })}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onMoveDown} title={t('quiz.editor.fillGaps.buttons.moveDown', { lng: quizLanguage })}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title={t('quiz.editor.fillGaps.buttons.delete', { lng: quizLanguage })}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>
            {t('quiz.editor.jigsawDescription', { lng: quizLanguage })}
          </Label>
          <Textarea 
            placeholder={t('quiz.editor.jigsawDescriptionPlaceholder', { lng: quizLanguage })}
            value={question.jigsawDescription || ''}
            onChange={handleDescriptionChange}
            className="min-h-20"
          />
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">{t('quiz.editor.fillGaps.labels.gridConfiguration', { lng: quizLanguage })}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGridEditor(!showGridEditor)}
              className="flex items-center space-x-1"
            >
              <Grid2X2 className="h-3.5 w-3.5 mr-1" />
              {showGridEditor 
                ? t('quiz.editor.fillGaps.buttons.hideGridEditor', { lng: quizLanguage })
                : t('quiz.editor.fillGaps.buttons.showGridEditor', { lng: quizLanguage })
              }
            </Button>
          </div>

          {showGridEditor && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex flex-1 items-center space-x-2">
                  <Label htmlFor="rows" className="whitespace-nowrap">{t('quiz.editor.fillGaps.labels.row', { lng: quizLanguage })}:</Label>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => updateGridSize('rows', (question.gridSize?.rows || 1) - 1)}
                    >
                      -
                    </Button>
                    <Input 
                      id="rows"
                      type="number" 
                      min="1"
                      value={question.gridSize?.rows || 1} 
                      onChange={(e) => updateGridSize('rows', parseInt(e.target.value) || 1)}
                      className="h-8 w-14 rounded-none text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => updateGridSize('rows', (question.gridSize?.rows || 1) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex flex-1 items-center space-x-2">
                  <Label htmlFor="columns" className="whitespace-nowrap">{t('quiz.editor.fillGaps.labels.column', { lng: quizLanguage })}:</Label>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => updateGridSize('columns', (question.gridSize?.columns || 1) - 1)}
                    >
                      -
                    </Button>
                    <Input 
                      id="columns"
                      type="number" 
                      min="1"
                      value={question.gridSize?.columns || 1} 
                      onChange={(e) => updateGridSize('columns', parseInt(e.target.value) || 1)}
                      className="h-8 w-14 rounded-none text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => updateGridSize('columns', (question.gridSize?.columns || 1) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <div className="text-sm text-gray-600 mb-2 w-full">{t('quiz.editor.templates', { lng: quizLanguage })}:</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => changeTemplate('factorial')}
                  className="flex items-center"
                >
                  <Rows3 className="h-3.5 w-3.5 mr-1" /> 
                  {t('quiz.editor.linear', { lng: quizLanguage })}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => changeTemplate('conditions')}
                  className="flex items-center"
                >
                  <Grid2X2 className="h-3.5 w-3.5 mr-1" /> 
                  {t('quiz.editor.grid', { lng: quizLanguage })}
                </Button>
              </div>

              {visualizeGrid()}
            </>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center">
            <Label>
              {t('quiz.editor.jigsawPieces', { lng: quizLanguage })}
            </Label>
            <Button onClick={handleAddPiece} size="sm" variant="outline" className="flex items-center">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t('quiz.editor.addPiece', { lng: quizLanguage })}
            </Button>
          </div>

          <div className="space-y-3">
            {question.jigsawPieces?.map((piece, index) => (
              <Card key={piece.id} className="border border-slate-200">
                <CardHeader className="py-2 px-4 bg-slate-50 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold">
                      {t('quiz.editor.piece', { lng: quizLanguage })} {index + 1}
                    </span>
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
                      title={t('quiz.editor.fillGaps.buttons.moveUp', { lng: quizLanguage })}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMovePieceDown(index)}
                      className="h-6 w-6"
                      title={t('quiz.editor.fillGaps.buttons.moveDown', { lng: quizLanguage })}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeletePiece(piece.id)}
                      className="h-6 w-6 text-red-500"
                      title={t('quiz.editor.fillGaps.buttons.delete', { lng: quizLanguage })}
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
                    placeholder={t('quiz.editor.pieceContent', { lng: quizLanguage })}
                  />

                  <div className="flex items-center gap-4 mt-3">
                    <div className="text-xs text-gray-600">{t('quiz.editor.fillGaps.labels.position', { lng: quizLanguage })}:</div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`row-${piece.id}`} className="text-xs">{t('quiz.editor.fillGaps.labels.row', { lng: quizLanguage })}:</Label>
                      <Input
                        id={`row-${piece.id}`}
                        type="number"
                        min="0"
                        value={piece.correctRow}
                        onChange={(e) => handlePiecePositionChange(piece.id, { 
                          row: parseInt(e.target.value) || 0, 
                          column: piece.correctColumn 
                        })}
                        className="h-7 w-16 text-xs"
                      />
                      <Label htmlFor={`col-${piece.id}`} className="text-xs">{t('quiz.editor.fillGaps.labels.column', { lng: quizLanguage })}:</Label>
                      <Input
                        id={`col-${piece.id}`}
                        type="number"
                        min="0"
                        value={piece.correctColumn}
                        onChange={(e) => handlePiecePositionChange(piece.id, { 
                          row: piece.correctRow, 
                          column: parseInt(e.target.value) || 0 
                        })}
                        className="h-7 w-16 text-xs"
                      />
                    </div>
                  </div>

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

        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">{t('quiz.editor.fillGaps.labels.completeCodePreview', { lng: quizLanguage })}</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setPreviewActive(!previewActive)}
              >
                {previewActive 
                  ? t('quiz.editor.fillGaps.buttons.hideIndividualPreviews', { lng: quizLanguage })
                  : t('quiz.editor.fillGaps.buttons.showIndividualPreviews', { lng: quizLanguage })
                }
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompiledCode(!showCompiledCode)}
                className="flex items-center"
              >
                {showCompiledCode 
                  ? t('quiz.editor.fillGaps.buttons.hideCompleteCode', { lng: quizLanguage })
                  : t('quiz.editor.fillGaps.buttons.showCompleteCode', { lng: quizLanguage })
                }
              </Button>
            </div>
          </div>
          
          {showCompiledCode && (
            <div className="mt-4">
              <div className="bg-slate-100 p-3 rounded-lg mb-3">
                <p className="text-sm text-slate-600 mb-1">
                  {t('quiz.editor.fillGaps.messages.completeCodeDescription', { lng: quizLanguage })}
                </p>
                <p className="text-xs text-slate-500 italic">
                  {t('quiz.editor.fillGaps.messages.codeAssemblyNote', { lng: quizLanguage })}
                </p>
              </div>
              <div className="border border-slate-200 rounded overflow-hidden bg-white">
                <SyntaxHighlighterWrapper 
                  code={generateCompiledCode().code} 
                  language={generateCompiledCode().language} 
                  showLineNumbers={true} 
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}