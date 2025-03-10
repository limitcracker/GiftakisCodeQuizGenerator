import { useQuiz } from '@/context/QuizContext';
import { Question } from '@/types';
import type { QuestionType } from '@/types';
import CodeOrderQuestion from '@/components/QuestionTypes/CodeOrderQuestion';
import MultipleChoiceQuestion from '@/components/QuestionTypes/MultipleChoiceQuestion';
import CodeFillQuestion from '@/components/QuestionTypes/CodeFillQuestion';
import JigsawQuestion from '@/components/QuestionTypes/JigsawQuestion';
import FillWholeQuestion from '@/components/QuestionTypes/FillWholeQuestion';
import TextQuestion from '@/components/QuestionTypes/TextQuestion';
import FindCodeErrorsQuestion from '@/components/QuestionTypes/FindCodeErrorsQuestion';
import { useTranslation } from 'react-i18next';

export default function QuestionList() {
  const { questions, updateQuestion, deleteQuestion, moveQuestionUp, moveQuestionDown, quizLanguage } = useQuiz();
  const { t } = useTranslation();

  console.log('Current questions in QuestionList:', questions);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('quiz.editor.noQuestions', { lng: quizLanguage })}
        </h3>
        <p className="text-gray-500">
          {t('quiz.editor.addQuestionPrompt', { lng: quizLanguage })}
        </p>
      </div>
    );
  }

  const renderQuestion = (question: Question) => {
    console.log('Rendering question:', question);
    
    const commonProps = {
      question,
      onUpdate: updateQuestion,
      onDelete: () => deleteQuestion(question.id),
      onMoveUp: () => moveQuestionUp(question.id),
      onMoveDown: () => moveQuestionDown(question.id)
    };

    switch (question.type) {
      case 'code-order':
        return <CodeOrderQuestion key={question.id} {...commonProps} />;
      case 'multiple-choice':
      case 'single-choice':
        return <MultipleChoiceQuestion key={question.id} {...commonProps} />;
      case 'fill-gaps':
        return <CodeFillQuestion key={question.id} {...commonProps} />;
      case 'jigsaw':
        return <JigsawQuestion key={question.id} {...commonProps} />;
      case 'fill-whole':
        return <FillWholeQuestion key={question.id} {...commonProps} />;
      case 'text':
        return <TextQuestion key={question.id} {...commonProps} />;
      case 'find-code-errors':
        return <FindCodeErrorsQuestion key={question.id} {...commonProps} />;
      default:
        console.log('Unknown question type:', question.type);
        return (
          <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium">
              Question {question.order}: {question.type} (Not implemented yet)
            </h3>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {questions.map(renderQuestion)}
    </div>
  );
}
