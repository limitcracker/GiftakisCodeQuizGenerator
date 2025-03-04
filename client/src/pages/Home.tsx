import { useState } from 'react';
import Header from '@/components/Header';
import QuizInformation from '@/components/QuizEditor/QuizInformation';
import QuestionTypeSelector from '@/components/QuizEditor/QuestionTypeSelector';
import QuestionList from '@/components/QuizEditor/QuestionList';
import ExportModal from '@/components/Modals/ExportModal';
import PreviewModal from '@/components/Modals/PreviewModal';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

const Home = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { 
    quiz, 
    addQuestion, 
    selectedQuestionType, 
    setSelectedQuestionType,
    quizTitle, 
    setQuizTitle,
    quizDescription, 
    setQuizDescription
  } = useQuiz();

  // Handler for the add question button
  const handleAddQuestion = () => {
    console.log('Add question button clicked');
    addQuestion();
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <Header 
        onExport={() => setShowExportModal(true)} 
        onPreview={() => setShowPreviewModal(true)} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <aside className="lg:col-span-1 bg-white rounded-lg shadow-sm p-5">
            <QuizInformation 
              title={quizTitle}
              setTitle={setQuizTitle}
              description={quizDescription}
              setDescription={setQuizDescription}
            />
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Question Types</h2>
              <QuestionTypeSelector 
                selectedType={selectedQuestionType}
                onSelectType={setSelectedQuestionType}
              />
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button 
                className="w-full"
                onClick={handleAddQuestion}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </aside>
          
          <main className="lg:col-span-4 space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
              <p className="text-yellow-800">
                <strong>Debug info:</strong> Quiz has {quiz.questions.length} questions.
                Current question type: {selectedQuestionType}
              </p>
            </div>
            <QuestionList />
          </main>
        </div>
      </div>

      {showExportModal && (
        <ExportModal 
          quiz={quiz}
          onClose={() => setShowExportModal(false)} 
        />
      )}

      {showPreviewModal && (
        <PreviewModal 
          quiz={quiz}
          onClose={() => setShowPreviewModal(false)} 
        />
      )}
    </div>
  );
};

export default Home;
