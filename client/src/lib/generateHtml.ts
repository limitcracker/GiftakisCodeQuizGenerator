import { QuizStyle } from '@/types';
import i18next from 'i18next';

export function generateHtml(quiz: {
  id: string;
  title: string;
  description: string;
  questions: any[];
  timeLimit?: number | null;
  hideFooter?: boolean;
  style?: QuizStyle;
  language?: string;
}): string {
  const { title, description } = quiz;
  const t = i18next.getFixedT(quiz.language || 'en');
  
  // Helper function to escape HTML special characters
  const escape = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  
  // Generate HTML for each question
  const generateQuestionHtml = (): string => {
    return quiz.questions.map((question, index) => {
      let questionHtml = '';
      
      switch (question.type) {
        case 'code-order':
          // Code ordering question - no template literals
          questionHtml = '<div class="cq-question" data-type="code-order"';
          
          if (question.timeLimit) {
            questionHtml += ' data-time-limit="' + question.timeLimit + '"';
          }
          
          questionHtml += '>\n';
          questionHtml += '<h2 class="cq-question-title">Question ' + (index + 1) + ': ' + escape(question.title) + '</h2>\n';
          
          if (question.timeLimit) {
            questionHtml += '<div class="cq-question-timer"><span class="cq-timer-icon">⏱️</span> <span class="cq-question-timer-display">00:00</span></div>\n';
          }
          
          questionHtml += '<div class="cq-order-container">\n';
          
          if (question.codeBlocks && question.codeBlocks.length > 0) {
            for (let i = 0; i < question.codeBlocks.length; i++) {
              const block = question.codeBlocks[i];
              questionHtml += '<div class="cq-code-block" data-id="' + block.id + '" data-position="' + block.correctPosition + '">\n';
              questionHtml += '<pre><code class="language-' + block.language + '">' + escape(block.content) + '</code></pre>\n';
              questionHtml += '</div>\n';
            }
          }
          
          questionHtml += '</div>\n';
          questionHtml += '<div class="cq-code-controls">\n';
          
          // Only show solution button if solution is available and not explicitly hidden
          if (!question.hideSolution && question.codeBlocks && question.codeBlocks.length > 0) {
            questionHtml += `<button class="cq-button cq-show-order-solution">${t('quiz.preview.showSolution')}</button>\n`;
          }
          
          // Only show hint button if hint is available
          if (question.hintComment) {
            questionHtml += `<button class="cq-button cq-show-hint">${t('quiz.preview.showHint')}</button>\n`;
          }
          
          questionHtml += '</div>\n';
          
          if (question.hintComment) {
            questionHtml += '<div class="cq-hint" style="display: none;">\n';
            questionHtml += '<div class="cq-hint-icon">💡</div>\n';
            questionHtml += '<div class="cq-hint-text">' + escape(question.hintComment) + '</div>\n';
            questionHtml += '</div>\n';
          }
          
          // Add solution section
          const hasSolution = question.codeBlocks && question.codeBlocks.length > 0;
          if (!question.hideSolution && hasSolution) {
            questionHtml += '<div class="cq-solution" style="display: none;">\n';
            questionHtml += `<h3>${t('quiz.preview.solution')}:</h3>\n`;
            questionHtml += '<div class="cq-solution-blocks">\n';
            
            // Sort blocks by correctPosition before rendering solution
            const sortedBlocks = [...question.codeBlocks].sort((a, b) => a.correctPosition - b.correctPosition);
            
            for (let i = 0; i < sortedBlocks.length; i++) {
              const block = sortedBlocks[i];
              questionHtml += '<div class="cq-solution-block">\n';
              questionHtml += `<pre><code class="language-${block.language || 'javascript'}">${escape(block.content)}</code></pre>\n`;
              questionHtml += '</div>\n';
            }
            
            questionHtml += '</div>\n</div>\n';
          }
          
          if (question.explanation) {
            questionHtml += '<div class="cq-explanation">' + escape(question.explanation) + '</div>\n';
          }
          
          questionHtml += '</div>';
          break;
          
        case 'multiple-choice':
        case 'single-choice':
          // Multiple/single choice questions
          const isMultiple = question.type === 'multiple-choice';
          questionHtml = `
    <div class="cq-question" data-type="${question.type}" ${question.timeLimit ? `data-time-limit="${question.timeLimit}"` : ''}>
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      ${question.timeLimit ? `<div class="cq-question-timer"><span class="cq-timer-icon">⏱️</span> <span class="cq-question-timer-display">00:00</span></div>` : ''}
      
      ${question.codeExample ? `
      <div class="cq-code-example">
        <pre><code class="language-${question.language || 'javascript'}">${escape(question.codeExample)}</code></pre>
      </div>`: ''}
      
      <div class="cq-options">
        ${question.options?.map((option: { id: string; isCorrect: boolean; text: string; feedback?: string }) => {
          return `<div class="cq-option">
            <input type="${isMultiple ? 'checkbox' : 'radio'}" name="question-${index}" id="${option.id}" data-correct="${option.isCorrect}">
            <span>${escape(option.text)}</span>
            ${option.feedback ? `<div class="cq-feedback">${escape(option.feedback)}</div>` : ''}
          </div>`;
        }).join('\n') || ''}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution && question.options?.some((opt: { isCorrect: boolean }) => opt.isCorrect) ? `<button class="cq-button cq-show-choice-solution">Show Solution</button>` : ''}
        ${question.hintComment ? `<button class="cq-button cq-show-hint">Show Hint</button>` : ''}
      </div>
      
      ${question.hintComment ? `
      <div class="cq-hint" style="display: none;">
        <div class="cq-hint-icon">💡</div>
        <div class="cq-hint-text">${escape(question.hintComment)}</div>
      </div>` : ''}
      
      ${question.explanation ? `<div class="cq-explanation">${escape(question.explanation)}</div>` : ''}
    </div>`;
          break;
          
        case 'fill-gaps':
          // Fill in the gaps question
          questionHtml = `
    <div class="cq-question" data-type="${question.type}" ${question.timeLimit ? `data-time-limit="${question.timeLimit}"` : ''}>
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      ${question.timeLimit ? `<div class="cq-question-timer"><span class="cq-timer-icon">⏱️</span> <span class="cq-question-timer-display">00:00</span></div>` : ''}
      
      <div class="cq-code-with-gaps">
        <pre><code class="language-${question.language || 'javascript'}">
${question.gaps?.reduce((result: string, gap: { id: string; answer: string }, gapIndex: number) => {
  return result.replace(`[GAP${gapIndex + 1}]`, `<span class="cq-gap" data-id="${gap.id}" data-answer="${escape(gap.answer)}">[Gap ${gapIndex + 1}]</span>`);
}, escape(question.codeWithGaps || ''))}
        </code></pre>
      </div>
      
      <div class="cq-snippets">
        ${question.availableSnippets?.map((snippet: string) => {
          return `<div class="cq-snippet" draggable="true">${escape(snippet)}</div>`;
        }).join('\n') || ''}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution && question.gaps && question.gaps.length > 0 ? `<button class="cq-button cq-show-gaps-solution">Show Solution</button>` : ''}
        ${question.hintComment ? `<button class="cq-button cq-show-hint">Show Hint</button>` : ''}
      </div>
      
      ${question.hintComment ? `
      <div class="cq-hint" style="display: none;">
        <div class="cq-hint-icon">💡</div>
        <div class="cq-hint-text">${escape(question.hintComment)}</div>
      </div>` : ''}
      
      ${question.explanation ? `<div class="cq-explanation">${escape(question.explanation)}</div>` : ''}
    </div>`;
          break;
          
        case 'find-errors':
          // Find errors question
          questionHtml = `
    <div class="cq-question" data-type="${question.type}" ${question.timeLimit ? `data-time-limit="${question.timeLimit}"` : ''}>
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      ${question.timeLimit ? `<div class="cq-question-timer"><span class="cq-timer-icon">⏱️</span> <span class="cq-question-timer-display">00:00</span></div>` : ''}
      
      <div class="cq-code-with-errors">
        <div class="cq-line-numbers">
          ${(question.code || '').split('\n').map((line: string, i: number) => {
            const isError = question.errorLines?.some((errorLine: { lineNumber: number }) => errorLine.lineNumber === i + 1);
            return `<div class="cq-line-number ${isError ? 'cq-error-line' : ''}" data-line="${i + 1}">${i + 1}</div>`;
          }).join('\n')}
        </div>
        <pre><code class="language-${question.language || 'javascript'}">
${escape(question.code || '')}
        </code></pre>
      </div>
      
      <div class="cq-error-options">
        <h3>Select all the errors in the code:</h3>
        ${question.errors?.map((error: string, errorIndex: number) => {
          return `
          <div class="cq-error-option">
            <input type="checkbox" id="error-${index}-${errorIndex}" name="error-${index}-${errorIndex}">
            <span>${escape(error)}</span>
          </div>`;
        }).join('\n') || ''}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution && question.errorLines && question.errorLines.length > 0 ? `<button class="cq-button cq-show-errors-solution">Show Solution</button>` : ''}
        ${question.hintComment ? `<button class="cq-button cq-show-hint">Show Hint</button>` : ''}
      </div>
      
      ${question.hintComment ? `
      <div class="cq-hint" style="display: none;">
        <div class="cq-hint-icon">💡</div>
        <div class="cq-hint-text">${escape(question.hintComment)}</div>
      </div>` : ''}
      
      ${question.explanation ? `<div class="cq-explanation">${escape(question.explanation)}</div>` : ''}
    </div>`;
          break;
          
        case 'fill-whole':
          // Fill whole code block
          questionHtml = `
    <div class="cq-question" data-type="${question.type}" data-language="${question.language || 'javascript'}" ${question.timeLimit ? `data-time-limit="${question.timeLimit}"` : ''}>
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      ${question.timeLimit ? `<div class="cq-question-timer"><span class="cq-timer-icon">⏱️</span> <span class="cq-question-timer-display">00:00</span></div>` : ''}
      
      <div class="cq-code-wrapper">
        ${question.codePrefix ? `
        <div class="cq-code-prefix">
          <pre><code class="language-${question.language || 'javascript'}">${escape(question.codePrefix)}</code></pre>
        </div>
        ` : ''}
        
        <div class="cq-code-solution-container">
          <textarea class="cq-code-solution-input" placeholder="Type your solution here..."></textarea>
          <div class="cq-code-solution-overlay" style="display: none;">
            <pre><code class="language-${question.language || 'javascript'}">${escape(question.solutionCode || '')}</code></pre>
          </div>
        </div>
        
        ${question.codeSuffix ? `
        <div class="cq-code-suffix">
          <pre><code class="language-${question.language || 'javascript'}">${escape(question.codeSuffix)}</code></pre>
        </div>
        ` : ''}
      </div>
      
      <div class="cq-code-output" style="display: none;">
        <h3>Output:</h3>
        <pre class="cq-output-content"></pre>
      </div>
      
      <div class="cq-code-controls">
        <button class="cq-button cq-run-code">Run Code</button>
        ${!question.hideSolution && question.solutionCode ? `
        <button class="cq-button cq-show-solution">Show Solution</button>
        <button class="cq-button cq-hide-solution" style="display: none;">Hide Solution</button>
        ` : ''}
        ${question.hintComment ? `<button class="cq-button cq-show-hint">Show Hint</button>` : ''}
      </div>
      
      ${question.hintComment ? `
      <div class="cq-hint" style="display: none;">
        <div class="cq-hint-icon">💡</div>
        <div class="cq-hint-text">${escape(question.hintComment)}</div>
      </div>` : ''}
      
      ${question.explanation ? `<div class="cq-explanation">${escape(question.explanation)}</div>` : ''}
    </div>`;
          break;
        
        case 'text':
          // Determine if this is a short or long text question by the maxLength
          const isLong = (question.maxLength || 0) > 100;
          const minLen = question.minLength || 0;
          const maxLen = question.maxLength || 0;
          const supportsCode = question.supportCodeBlocks || false;
          
          // Build text input based on format
          let textInputHtml = '';
          if (isLong) {
            textInputHtml = '<textarea class="cq-text-answer-input" rows="8" placeholder="Type your answer here..."';
            if (minLen) textInputHtml += ' minlength="' + minLen + '"';
            if (maxLen) textInputHtml += ' maxlength="' + maxLen + '"';
            textInputHtml += '></textarea>';
          } else {
            textInputHtml = '<input type="text" class="cq-text-answer-input" placeholder="Type your answer here..."';
            if (minLen) textInputHtml += ' minlength="' + minLen + '"';
            if (maxLen) textInputHtml += ' maxlength="' + maxLen + '"';
            textInputHtml += ' />';
          }
          
          // Character counter display
          let lengthCounterHtml = '';
          if (minLen || maxLen) {
            lengthCounterHtml = '<div class="cq-text-length-counter"><span class="cq-current-length">0</span>';
            if (minLen && maxLen) {
              lengthCounterHtml += ' / ' + minLen + '-' + maxLen + ' characters';
            } else if (minLen) {
              lengthCounterHtml += ' / min ' + minLen + ' characters';
            } else {
              lengthCounterHtml += ' / max ' + maxLen + ' characters';
            }
            lengthCounterHtml += '</div>';
          }
          
          // Code formatting controls
          let formatControlsHtml = '';
          if (supportsCode) {
            formatControlsHtml = '<div class="cq-text-format-controls">';
            formatControlsHtml += '<button class="cq-button cq-format-code">Insert Code Block</button>';
            formatControlsHtml += '</div>';
          }
          
          // Solution display
          let solutionHtml = '';
          if (!question.hideSolution && question.textAnswer) {
            solutionHtml = '<div class="cq-text-solution" style="display: none;">';
            solutionHtml += '<h3>Sample Answer:</h3>';
            solutionHtml += '<div class="cq-text-solution-content">';
            
            if (question.isMarkdown) {
              solutionHtml += '<div class="cq-markdown-content">' + escape(question.textAnswer) + '</div>';
            } else {
              solutionHtml += '<p>' + escape(question.textAnswer) + '</p>';
            }
            
            solutionHtml += '</div></div>';
          }
          
          // Hint section
          let hintHtml = '';
          if (question.hintComment) {
            hintHtml = '<div class="cq-hint" style="display: none;">';
            hintHtml += '<div class="cq-hint-icon">💡</div>';
            hintHtml += '<div class="cq-hint-text">' + escape(question.hintComment) + '</div>';
            hintHtml += '</div>';
          }
          
          // Solution button
          let solutionButtonHtml = '';
          if (!question.hideSolution && question.textAnswer) {
            solutionButtonHtml = '<button class="cq-button cq-show-text-solution">Show Sample Answer</button>';
          }
          
          // Hint button
          let hintButtonHtml = '';
          if (question.hintComment) {
            hintButtonHtml = '<button class="cq-button cq-show-hint">Show Hint</button>';
          }
          
          // Explanation section
          let explanationHtml = '';
          if (question.explanation) {
            explanationHtml = '<div class="cq-explanation">' + escape(question.explanation) + '</div>';
          }
          
          // Build full question HTML
          questionHtml = 
            '<div class="cq-question" data-type="' + question.type + '"' + 
            (question.timeLimit ? ' data-time-limit="' + question.timeLimit + '"' : '') + 
            '>\n' +
            '  <h2 class="cq-question-title">Question ' + (index + 1) + ': ' + escape(question.title) + '</h2>\n' +
            (question.timeLimit ? 
              '  <div class="cq-question-timer"><span class="cq-timer-icon">⏱️</span> <span class="cq-question-timer-display">00:00</span></div>\n' : 
              '') +
            '  <div class="cq-text-answer-container">\n' +
            '    ' + textInputHtml + '\n' +
            (lengthCounterHtml ? '    ' + lengthCounterHtml + '\n' : '') +
            '  </div>\n' +
            (formatControlsHtml ? '  ' + formatControlsHtml + '\n' : '') +
            '  <div class="cq-code-controls">\n' +
            (solutionButtonHtml ? '    ' + solutionButtonHtml + '\n' : '') +
            (hintButtonHtml ? '    ' + hintButtonHtml + '\n' : '') +
            '  </div>\n' +
            (solutionHtml ? '  ' + solutionHtml + '\n' : '') +
            (hintHtml ? '  ' + hintHtml + '\n' : '') +
            (explanationHtml ? '  ' + explanationHtml + '\n' : '') +
            '</div>';
          break;
          
        default:
          questionHtml = `
    <div class="cq-question">
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      <p class="cq-not-implemented">This question type is not yet implemented in the export.</p>
    </div>`;
      }
      
      return questionHtml;
    }).join('\n');
  };
  
  // Get styling options with defaults
  const style = quiz.style || {};
  const primaryColor = style.primaryColor || '#3b82f6';
  const secondaryColor = style.secondaryColor || '#10b981';
  const backgroundColor = style.backgroundColor || '#ffffff';
  const textColor = style.textColor || '#1f2937';
  const fontFamily = style.fontFamily || 'system-ui, -apple-system, sans-serif';
  const borderRadius = style.borderRadius !== undefined ? style.borderRadius : 6;
  const buttonStyle = style.buttonStyle || 'rounded';
  
  // Generate button border radius based on style
  let buttonRadius = '4px';
  if (buttonStyle === 'pill') {
    buttonRadius = '9999px';
  } else if (buttonStyle === 'square') {
    buttonRadius = '0px';
  } else {
    buttonRadius = borderRadius + 'px';
  }
  
  // Generate the complete HTML
  return `<!-- Code Quiz: ${escape(title)} -->
<div id="code-quiz-container" class="cq-container" style="font-family: ${fontFamily}; color: ${textColor}; background-color: ${backgroundColor};">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
  
  <div class="cq-quiz" ${quiz.timeLimit ? `data-time-limit="${quiz.timeLimit}"` : ''}>
    <h1 class="cq-title" style="color: ${textColor};">${escape(title)}</h1>
    <p class="cq-description" style="color: ${textColor};">${escape(description)}</p>
    ${quiz.timeLimit ? `
    <div class="cq-timer-container">
      <div class="cq-timer">
        <span class="cq-timer-icon">⏱️</span> 
        <span class="cq-timer-display">${Math.floor(quiz.timeLimit / 60)}:${(quiz.timeLimit % 60 < 10 ? '0' + (quiz.timeLimit % 60) : quiz.timeLimit % 60)}</span>
      </div>
      <button class="cq-button cq-start-timer">Start Timer</button>
    </div>` : ''}
    
${generateQuestionHtml()}
    
    <div class="cq-controls">
      <button class="cq-button cq-check">Check Answers</button>
      <button class="cq-button cq-reset">Reset Quiz</button>
    </div>
  </div>
  
  <style>
    .cq-container { max-width: 800px; margin: 0 auto; }
    .cq-title { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .cq-description { margin-bottom: 1rem; }
    .cq-timer-container { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; padding: 1rem; background: ${primaryColor}10; border: 1px solid ${primaryColor}30; border-radius: ${borderRadius}px; }
    .cq-timer { background: ${primaryColor}20; border: 1px solid ${primaryColor}40; color: ${textColor}; padding: 0.5rem 1rem; border-radius: ${borderRadius}px; display: flex; align-items: center; flex-grow: 1; }
    .cq-start-timer { background: ${primaryColor}; color: white; font-weight: 500; border-radius: ${buttonRadius}; }
    .cq-start-timer:hover { background: ${primaryColor}dd; }
    .cq-start-timer.disabled { background: #94a3b8; cursor: not-allowed; }
    .cq-timer-icon { margin-right: 0.5rem; font-size: 1.25rem; }
    .cq-timer-display { font-family: monospace; font-size: 1.25rem; font-weight: 600; letter-spacing: 1px; }
    .cq-question-timer { background: ${primaryColor}10; border: 1px solid ${primaryColor}30; color: ${textColor}; padding: 0.4rem 0.8rem; border-radius: ${borderRadius}px; margin-bottom: 1rem; display: inline-flex; align-items: center; }
    .cq-question-timer-display { font-family: monospace; font-size: 0.95rem; font-weight: 500; }
    .cq-question { background: white; border-radius: ${borderRadius}px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1.5rem; margin-bottom: 1.5rem; }
    .cq-question-title { font-size: 1.2rem; margin-bottom: 1rem; }
    .cq-code-example, .cq-code-with-gaps, .cq-code-with-errors { background: #1e293b; border-radius: 6px; margin: 1rem 0; overflow: auto; position: relative; }
    .cq-code-block { background: #1e293b; color: #e5e7eb; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; cursor: move; font-family: monospace; }
    .cq-options { display: flex; flex-direction: column; gap: 0.75rem; }
    .cq-option { display: flex; align-items: flex-start; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; }
    .cq-option input { margin-top: 0.25rem; }
    .cq-option span { margin-left: 0.5rem; }
    .cq-feedback { display: none; margin-top: 0.25rem; font-size: 0.875rem; color: #059669; }
    .cq-gap { background: #374151; padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px dashed #6b7280; color: white; }
    
    /* Check Answer Styling */
    .cq-correct { border-left: 4px solid #10b981; background-color: #ecfdf5; }
    .cq-incorrect { border-left: 4px solid #ef4444; background-color: #fef2f2; }
    .cq-result-message { 
      margin: 1rem 0; 
      padding: 0.75rem 1rem; 
      background: ${primaryColor}15; 
      border: 1px solid ${primaryColor}40; 
      border-radius: ${borderRadius}px; 
      font-weight: 500; 
      color: ${textColor}; 
    }
    .cq-snippets { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
    .cq-snippet { background: white; border: 1px solid #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: move; font-family: monospace; }
    .cq-line-numbers { position: absolute; top: 0; left: 0; padding: 1rem 0.5rem; text-align: right; user-select: none; }
    .cq-line-number { cursor: pointer; }
    .cq-line-number:hover { background: rgba(255,255,255,0.1); }
    .cq-error-line { color: #ef4444; }
    .cq-error-options { margin: 1rem 0; }
    .cq-button { padding: 0.5rem 1rem; background: ${primaryColor}; color: white; border: none; border-radius: ${buttonRadius}; cursor: pointer; font-size: 0.875rem; }
    .cq-button:hover { background: ${primaryColor}dd; }
    .cq-show-order-solution, .cq-show-choice-solution, .cq-show-gaps-solution, .cq-show-errors-solution { background: ${secondaryColor}; }
    .cq-show-order-solution:hover, .cq-show-choice-solution:hover, .cq-show-gaps-solution:hover, .cq-show-errors-solution:hover { background: ${secondaryColor}dd; }
    .cq-code-controls { display: flex; gap: 0.5rem; margin: 1rem 0; }
    .cq-error-option { display: flex; align-items: center; margin-bottom: 0.5rem; }
    .cq-error-option span { margin-left: 0.5rem; }
    .cq-controls { display: flex; gap: 1rem; margin-top: 2rem; }
    .cq-button.cq-reset { background: ${secondaryColor}20; color: ${textColor}; }
    .cq-button.cq-reset:hover { background: ${secondaryColor}40; }
    .cq-explanation { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-style: italic; color: #4b5563; }
    
    /* Fill Whole question type styles */
    .cq-code-wrapper { border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin: 1rem 0; }
    .cq-code-prefix, .cq-code-suffix { background: #1e293b; padding: 0.5rem; }
    .cq-code-solution-container { position: relative; }
    .cq-code-solution-input { width: 100%; font-family: monospace; border: none; border-top: 1px dashed #e5e7eb; border-bottom: 1px dashed #e5e7eb; padding: 0.75rem; font-size: 14px; min-height: 120px; resize: vertical; background: #f8fafc; }
    .cq-code-solution-input:focus { outline: none; box-shadow: inset 0 0 0 2px #3b82f6; }
    .cq-code-solution-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #1e293b; z-index: 2; }
    .cq-code-solution-overlay pre { margin: 0; padding: 0.75rem; }
    .cq-code-controls { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .cq-show-solution, .cq-hide-solution { background: ${secondaryColor}; }
    .cq-show-solution:hover, .cq-hide-solution:hover { background: ${secondaryColor}dd; }
    .cq-show-hint { background: ${secondaryColor}80; color: ${textColor}; }
    .cq-show-hint:hover { background: ${secondaryColor}b0; }
    .cq-hint { display: flex; align-items: flex-start; background: ${primaryColor}10; border: 1px solid ${primaryColor}30; padding: 1rem; border-radius: ${borderRadius}px; margin: 1rem 0; }
    .cq-hint-icon { font-size: 1.25rem; margin-right: 0.75rem; }
    .cq-hint-text { color: ${textColor}; font-size: 0.9rem; }
    
    /* Text Question type styles */
    .cq-text-answer-container { margin: 1rem 0; }
    .cq-text-answer-input { width: 100%; border: 1px solid ${primaryColor}20; border-radius: ${borderRadius}px; padding: 0.75rem; font-family: ${fontFamily}; font-size: 14px; background: ${backgroundColor}; }
    .cq-text-answer-input:focus { outline: none; box-shadow: 0 0 0 2px ${primaryColor}; }
    textarea.cq-text-answer-input { min-height: 150px; resize: vertical; }
    .cq-text-length-counter { margin-top: 0.5rem; color: #6b7280; font-size: 0.875rem; text-align: right; }
    .cq-text-format-controls { margin: 0.5rem 0; }
    .cq-format-code { background: ${primaryColor}; }
    .cq-format-code:hover { background: ${primaryColor}dd; }
    
    /* Code order question styles */
    .cq-order-container { 
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 1.5rem 0;
    }
    .cq-code-block {
      border: 1px solid ${primaryColor}30;
      border-radius: ${borderRadius}px;
      padding: 0.5rem;
      background-color: ${backgroundColor};
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .cq-code-block:hover {
      border-color: ${primaryColor}60;
      box-shadow: 0 2px 4px ${primaryColor}15;
    }
    .cq-code-block.dragging {
      opacity: 0.8;
      transform: scale(1.02);
      box-shadow: 0 5px 10px rgba(0,0,0,0.1);
      z-index: 10;
    }
    .cq-order-correct .cq-code-block {
      border-color: ${secondaryColor};
      background-color: ${secondaryColor}15;
    }
    .cq-order-incorrect .cq-code-block {
      border-color: #ef4444;
      background-color: #fef2f2;
    }
    .cq-show-order-solution {
      background-color: ${secondaryColor};
    }
    .cq-show-order-solution:hover {
      background-color: ${secondaryColor}dd;
    }
    
    /* Text solution styles */
    .cq-text-solution { background: ${secondaryColor}10; border: 1px solid ${secondaryColor}40; border-radius: ${borderRadius}px; padding: 1rem; margin: 1rem 0; }
    .cq-text-solution h3 { font-size: 1rem; color: ${textColor}; margin-top: 0; margin-bottom: 0.5rem; }
    .cq-text-solution-content { color: ${textColor}; font-size: 0.9rem; }
    .cq-markdown-content { white-space: pre-wrap; font-family: ${fontFamily}; }
    .cq-show-text-solution { background: ${secondaryColor}; }
    .cq-show-text-solution:hover { background: ${secondaryColor}dd; }
    
    /* Footer styles */
    .cq-footer { 
      margin-top: 2.5rem; 
      border-top: 1px solid ${primaryColor}20; 
      padding-top: 0.5rem; 
      text-align: center;
      font-size: 0.65rem;
      color: ${textColor}80;
    }
    .cq-footer-content { 
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }
    .cq-footer small {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .cq-footer a { 
      color: ${primaryColor}; 
      text-decoration: none;
      transition: color 0.15s;
      font-weight: 500;
    }
    .cq-footer a:hover { 
      color: ${primaryColor}aa; 
    }
    /* Footer styling in exported mode doesn't need toggle button */
    }
  </style>
  
  <script>
    // Client-side code goes here
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize syntax highlighting, etc.
      if (typeof hljs !== 'undefined') hljs.highlightAll();
      
      // Setup quiz timer functionality
      const quizElement = document.querySelector('.cq-quiz');
      const quizTimerButton = document.querySelector('.cq-start-timer');
      const quizTimerDisplay = document.querySelector('.cq-timer-display');
      
      if (quizElement && quizTimerButton && quizTimerDisplay) {
        let timerInterval = null;
        let timerRunning = false;
        let timeLimit = parseInt(quizElement.getAttribute('data-time-limit') || '0');
        let timeRemaining = timeLimit;
        
        // Format time as MM:SS
        const formatTime = function(seconds) {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
        };
        
        // Initialize timer display
        quizTimerDisplay.textContent = formatTime(timeRemaining);
        
        // Setup start timer button
        quizTimerButton.addEventListener('click', function() {
          if (!timerRunning) {
            // Start the timer
            timerRunning = true;
            quizTimerButton.textContent = "Timer Started";
            quizTimerButton.classList.add('disabled');
            
            // Update timer display every second
            timerInterval = setInterval(function() {
              timeRemaining--;
              quizTimerDisplay.textContent = formatTime(timeRemaining);
              
              // Change color when time is running out
              if (timeRemaining <= 60) {
                quizTimerDisplay.style.color = '#ef4444';  // Red color
              }
              
              // Time's up
              if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                quizTimerDisplay.textContent = "Time's Up!";
                
                // Optionally auto-submit the quiz
                var checkBtn = document.querySelector('.cq-check');
                if (checkBtn) {
                  checkBtn.click();
                }
              }
            }, 1000);
          }
        });
      }
      
      // Setup character counters for text questions
      const textInputs = document.querySelectorAll('.cq-text-answer-input');
      textInputs.forEach(input => {
        input.addEventListener('input', function() {
          const counter = this.closest('.cq-text-answer-container').querySelector('.cq-current-length');
          if (counter) {
            counter.textContent = this.value.length;
          }
        });
        
        // Initialize counter with current value (if any)
        const counter = input.closest('.cq-text-answer-container')?.querySelector('.cq-current-length');
        if (counter) {
          counter.textContent = input.value.length;
        }
      });
      
      // Add event handlers (simplified)
      // Setup reset functionality
      const resetBtn = document.querySelector('.cq-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', function() {
          // Reset all inputs, selections, and states
          console.log('Quiz reset clicked');
        });
      }
      
      // Setup checking functionality
      const checkBtn = document.querySelector('.cq-check');
      if (checkBtn) {
        checkBtn.addEventListener('click', function() {
          // Get all questions
          const questions = document.querySelectorAll('.cq-question');
          let correctCount = 0;
          let totalCount = 0;
          
          questions.forEach(function(question) {
            const questionType = question.getAttribute('data-type');
            let isCorrect = false;
            
            switch(questionType) {
              case 'multiple-choice':
              case 'single-choice':
                // For choice questions, check if correct options are selected
                const choiceOptions = question.querySelectorAll('.cq-option');
                let allChoiceCorrect = true;
                
                choiceOptions.forEach(function(option) {
                  const input = option.querySelector('input');
                  if (input) {
                    const shouldBeChecked = input.getAttribute('data-correct') === 'true';
                    
                    if ((input.checked !== true && shouldBeChecked) || 
                        (input.checked === true && !shouldBeChecked)) {
                      allChoiceCorrect = false;
                    }
                  }
                });
                
                isCorrect = allChoiceCorrect;
                break;
                
              case 'code-order':
                // For code order, check if blocks are in correct order
                const codeBlocks = Array.from(question.querySelectorAll('.cq-code-block'));
                let orderedCorrectly = true;
                
                for (let i = 0; i < codeBlocks.length; i++) {
                  const block = codeBlocks[i];
                  if (block && block.getAttribute('data-position')) {
                    const correctPos = parseInt(block.getAttribute('data-position') || '0');
                    if (correctPos !== i + 1) {
                      orderedCorrectly = false;
                      break;
                    }
                  }
                }
                
                isCorrect = orderedCorrectly;
                break;
                
              case 'fill-gaps':
                // For fill gaps, check if all gaps have correct answers
                const gaps = question.querySelectorAll('.cq-gap');
                let allGapsCorrect = true;
                
                gaps.forEach(function(gap) {
                  const answer = gap.getAttribute('data-answer');
                  if (gap.textContent !== answer) {
                    allGapsCorrect = false;
                  }
                });
                
                isCorrect = allGapsCorrect;
                break;
                
              case 'find-errors':
                // For error finding, check if correct errors are selected
                const errorOptions = question.querySelectorAll('.cq-error-option input');
                let allErrorsCorrect = true;
                
                errorOptions.forEach(function(option) {
                  // All error options should be checked in a correct solution
                  if (!option.checked) {
                    allErrorsCorrect = false;
                  }
                });
                
                isCorrect = allErrorsCorrect;
                break;
                
              case 'text':
                // For text questions, check if the input matches the expected answer exactly
                const textInput = question.querySelector('.cq-text-answer-input');
                const expectedAnswer = question.querySelector('.cq-text-solution-content');
                
                if (textInput && expectedAnswer) {
                  // Get text content without HTML
                  const plainExpectedText = expectedAnswer.textContent || '';
                  const userInputText = textInput.value || '';
                  
                  // Simple exact match check - could be enhanced with more sophisticated comparison
                  isCorrect = userInputText.trim() === plainExpectedText.trim();
                }
                break;
                
              case 'fill-whole':
                // For fill whole code blocks
                const solutionInput = question.querySelector('.cq-code-solution-input');
                const solutionOverlay = question.querySelector('.cq-code-solution-overlay code');
                
                if (solutionInput && solutionOverlay) {
                  const expectedCode = solutionOverlay.textContent || '';
                  const userCode = solutionInput.value || '';
                  
                  // Compare with whitespace normalization
                  isCorrect = userCode.trim().replace(/\s+/g, ' ') === 
                              expectedCode.trim().replace(/\s+/g, ' ');
                }
                break;
            }
            
            // Apply visual feedback
            if (isCorrect) {
              question.classList.add('cq-correct');
              question.classList.remove('cq-incorrect');
              correctCount++;
            } else {
              question.classList.add('cq-incorrect');
              question.classList.remove('cq-correct');
            }
            
            totalCount++;
          });
          
          // Show result message
          let resultElement = document.querySelector('.cq-result-message');
          
          if (!resultElement) {
            resultElement = document.createElement('div');
            resultElement.className = 'cq-result-message';
            const controlsDiv = document.querySelector('.cq-controls');
            if (controlsDiv) {
              controlsDiv.insertBefore(resultElement, checkBtn.nextSibling);
            }
          }
          
          if (resultElement) {
            resultElement.textContent = 'Score: ' + correctCount + '/' + totalCount + ' correct';
            resultElement.style.display = 'block';
          }
        });
      }
      
      // Code order questions
      const orderContainers = document.querySelectorAll('.cq-order-container');
      orderContainers.forEach(container => {
        const codeBlocks = [...container.querySelectorAll('.cq-code-block')];
        
        // Randomize the order of code blocks initially
        shuffleBlocks(container, codeBlocks);
        
        // Set up drag & drop for code blocks
        setupDragAndDrop(container, codeBlocks);
      });
      
      // Function to shuffle code blocks
      function shuffleBlocks(container, blocks) {
        // Clone and shuffle array
        var shuffled = [].slice.call(blocks).sort(function() {
          return Math.random() - 0.5;
        });
        
        // Reapply to container
        shuffled.forEach(function(block) {
          container.appendChild(block);
        });
      }
      
      // Function to set up drag and drop for code blocks
      function setupDragAndDrop(container, blocks) {
        blocks.forEach(function(block) {
          // Make each block draggable
          block.setAttribute('draggable', 'true');
          
          // Drag start
          block.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            // Set dragged element data
            e.dataTransfer.setData('text/plain', this.dataset.id);
            e.dataTransfer.effectAllowed = 'move';
          });
          
          // Drag end
          block.addEventListener('dragend', function() {
            this.classList.remove('dragging');
          });
          
          // Click to select
          block.addEventListener('click', function() {
            // If already selected, do nothing
            if (this.classList.contains('selected')) return;
            
            // Select this block
            var selected = container.querySelector('.cq-code-block.selected');
            if (selected) {
              // If another block is selected, swap them
              var selectedIndex = Array.prototype.indexOf.call(container.children, selected);
              var thisIndex = Array.prototype.indexOf.call(container.children, this);
              
              if (selectedIndex < thisIndex) {
                // Insert after this block
                container.insertBefore(selected, this.nextSibling);
              } else {
                // Insert before this block
                container.insertBefore(selected, this);
              }
              
              selected.classList.remove('selected');
            } else {
              // Select this block
              this.classList.add('selected');
            }
          });
        });
        
        // Container drag over
        container.addEventListener('dragover', function(e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          
          // Find the closest block to cursor
          const afterElement = getDragAfterElement(container, e.clientY);
          const draggable = container.querySelector('.dragging');
          
          if (afterElement) {
            container.insertBefore(draggable, afterElement);
          } else {
            container.appendChild(draggable);
          }
        });
        
        // Container drop
        container.addEventListener('drop', function(e) {
          e.preventDefault();
          const id = e.dataTransfer.getData('text/plain');
          const selector = '.cq-code-block[data-id="' + id + '"]';
          const draggable = container.querySelector(selector);
          
          // Already inserted by dragover
          if (draggable) {
            draggable.classList.remove('dragging');
          }
        });
      }
      
      // Helper function to find the closest element to insert after
      function getDragAfterElement(container, y) {
        // Get all non-dragging elements
        var elements = [].slice.call(container.querySelectorAll('.cq-code-block:not(.dragging)'));
        
        // Find the element whose "middle" the y-coordinate is closest to
        return elements.reduce(function(closest, element) {
          var box = element.getBoundingClientRect();
          var offset = y - (box.top + box.height / 2);
          
          // If offset is negative, we're above the middle, but we want the closest one
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: element };
          } else {
            return closest;
          }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
      }
      
      // Show/Hide solution for code order questions (toggle between reordering blocks and showing solution div)
      const orderSolutionBtns = document.querySelectorAll('.cq-show-order-solution');
      orderSolutionBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          if (!question) return;
          
          const solution = question.querySelector('.cq-solution');
          
          if (solution) {
            // Toggle solution visibility
            const isVisible = solution.style.display !== 'none';
            solution.style.display = isVisible ? 'none' : 'block';
            this.textContent = isVisible ? 'Show Solution' : 'Hide Solution';
          } else {
            // If no solution div, fall back to reordering the blocks
            const containerElement = question.querySelector('.cq-order-container');
            if (!containerElement) return;
            
            const blocks = Array.from(containerElement.querySelectorAll('.cq-code-block'));
            
            // Sort blocks by correctPosition attribute
            blocks.sort(function(a, b) {
              const posA = parseInt(a.getAttribute('data-position') || '0');
              const posB = parseInt(b.getAttribute('data-position') || '0');
              return posA - posB;
            });
            
            // Reorder blocks in the container
            blocks.forEach(function(block) {
              containerElement.appendChild(block);
            });
          }
        });
      });
      
      // Show/Hide solution for multiple/single choice questions
      const choiceSolutionBtns = document.querySelectorAll('.cq-show-choice-solution');
      choiceSolutionBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          if (!question) return;
          
          const options = question.querySelectorAll('.cq-option');
          
          // First click: Show correct answers
          if (this.textContent === 'Show Solution') {
            options.forEach(function(option) {
              const input = option.querySelector('input');
              if (input) {
                const isCorrect = input.getAttribute('data-correct') === 'true';
                
                if (isCorrect) {
                  input.checked = true;
                  option.classList.add('cq-correct-option');
                } else {
                  input.checked = false;
                }
              }
            });
            
            this.textContent = 'Hide Solution';
          } 
          // Second click: Reset to original state
          else {
            options.forEach(function(option) {
              const input = option.querySelector('input');
              if (input) {
                input.checked = false;
                option.classList.remove('cq-correct-option');
              }
            });
            
            this.textContent = 'Show Solution';
          }
        });
      });
      
      // Show/Hide solution for fill-gaps questions
      const gapsSolutionBtns = document.querySelectorAll('.cq-show-gaps-solution');
      gapsSolutionBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          if (!question) return;
          
          const gaps = question.querySelectorAll('.cq-gap');
          
          // Toggle solution visibility
          if (this.textContent === 'Show Solution') {
            gaps.forEach(function(gap) {
              const answer = gap.getAttribute('data-answer');
              if (answer) {
                gap.textContent = answer;
                gap.classList.add('cq-gap-solved');
              }
            });
            this.textContent = 'Hide Solution';
          } else {
            const gapsArray = Array.from(gaps);
            gapsArray.forEach(function(gap, index) {
              gap.textContent = '[Gap ' + (index + 1) + ']';
              gap.classList.remove('cq-gap-solved');
            });
            this.textContent = 'Show Solution';
          }
        });
      });
      
      // Show/Hide solution for find-errors questions
      const errorsSolutionBtns = document.querySelectorAll('.cq-show-errors-solution');
      errorsSolutionBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          if (!question) return;
          
          const errorOptions = question.querySelectorAll('.cq-error-option input');
          const errorLines = question.querySelectorAll('.cq-line-number.cq-error-line');
          
          // Toggle solution visibility
          if (this.textContent === 'Show Solution') {
            // Check all correct errors
            errorOptions.forEach(function(option) {
              if (option) {
                option.checked = true;
              }
            });
            
            // Highlight error lines
            errorLines.forEach(function(line) {
              if (line) {
                line.classList.add('cq-error-line-highlighted');
              }
            });
            
            this.textContent = 'Hide Solution';
          } else {
            // Uncheck all errors
            errorOptions.forEach(function(option) {
              if (option) {
                option.checked = false;
              }
            });
            
            // Remove highlighting
            errorLines.forEach(function(line) {
              if (line) {
                line.classList.remove('cq-error-line-highlighted');
              }
            });
            
            this.textContent = 'Show Solution';
          }
        });
      });
      
      // Show/Hide solution for text questions
      const textSolutionBtns = document.querySelectorAll('.cq-show-text-solution');
      textSolutionBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          if (!question) return;
          
          const solution = question.querySelector('.cq-text-solution');
          if (solution) {
            const isCurrentlyVisible = solution.style.display !== 'none';
            solution.style.display = isCurrentlyVisible ? 'none' : 'block';
            this.textContent = isCurrentlyVisible ? 'Show Sample Answer' : 'Hide Sample Answer';
          }
        });
      });
      
      // Footer functionality (only if footer exists)
      const footer = document.querySelector('.cq-footer');
      
      // Initialize footer visibility in exported quiz
      if (footer) {
        // Always show footer in exported mode
        footer.style.display = 'block';
      }
    });
  </script>
  
  ${!quiz.hideFooter ? `
  <div class="cq-footer">
    <div class="cq-footer-content">
      <small>
        <span>Powered by </span>
        <a href="https://giftakis.gr" target="_blank" rel="noopener noreferrer">giftakis.gr</a>
      </small>
    </div>
  </div>
  ` : ''}
</div>`;
}