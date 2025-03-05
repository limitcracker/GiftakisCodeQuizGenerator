export function generateHtml(quiz: {
  id: string;
  title: string;
  description: string;
  questions: any[];
  timeLimit?: number | null;
}): string {
  const { title, description } = quiz;
  
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
          // Code ordering question
          questionHtml = `
    <div class="cq-question" data-type="${question.type}" ${question.timeLimit ? `data-time-limit="${question.timeLimit}"` : ''}>
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      ${question.timeLimit ? `<div class="cq-question-timer"><span class="cq-timer-icon">⏱️</span> <span class="cq-question-timer-display">00:00</span></div>` : ''}
      
      <div class="cq-order-container">
        ${question.codeBlocks?.map(block => {
          return `<div class="cq-code-block" data-id="${block.id}" data-position="${block.correctPosition}">
            <pre><code class="language-${block.language}">${escape(block.content)}</code></pre>
          </div>`;
        }).join('\n') || ''}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution ? `<button class="cq-button cq-show-order-solution">Show Solution</button>` : ''}
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
        ${question.options?.map(option => {
          return `<div class="cq-option">
            <input type="${isMultiple ? 'checkbox' : 'radio'}" name="question-${index}" id="${option.id}" data-correct="${option.isCorrect}">
            <span>${escape(option.text)}</span>
            ${option.feedback ? `<div class="cq-feedback">${escape(option.feedback)}</div>` : ''}
          </div>`;
        }).join('\n') || ''}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution ? `<button class="cq-button cq-show-choice-solution">Show Solution</button>` : ''}
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
${question.gaps?.reduce((result, gap, gapIndex) => {
  return result.replace(`[GAP${gapIndex + 1}]`, `<span class="cq-gap" data-id="${gap.id}" data-answer="${escape(gap.answer)}">[Gap ${gapIndex + 1}]</span>`);
}, escape(question.codeWithGaps || ''))}
        </code></pre>
      </div>
      
      <div class="cq-snippets">
        ${question.availableSnippets?.map(snippet => {
          return `<div class="cq-snippet" draggable="true">${escape(snippet)}</div>`;
        }).join('\n') || ''}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution ? `<button class="cq-button cq-show-gaps-solution">Show Solution</button>` : ''}
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
          ${(question.code || '').split('\n').map((line, i) => {
            const isError = question.errorLines?.some(errorLine => errorLine.lineNumber === i + 1);
            return `<div class="cq-line-number ${isError ? 'cq-error-line' : ''}" data-line="${i + 1}">${i + 1}</div>`;
          }).join('\n')}
        </div>
        <pre><code class="language-${question.language || 'javascript'}">
${escape(question.code || '')}
        </code></pre>
      </div>
      
      <div class="cq-error-options">
        <h3>Select all the errors in the code:</h3>
        ${question.errors?.map((error, errorIndex) => {
          return `
          <div class="cq-error-option">
            <input type="checkbox" id="error-${index}-${errorIndex}" name="error-${index}-${errorIndex}">
            <span>${escape(error)}</span>
          </div>`;
        }).join('\n') || ''}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution ? `<button class="cq-button cq-show-errors-solution">Show Solution</button>` : ''}
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
        ${!question.hideSolution ? `
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
          if (!question.hideSolution) {
            solutionHtml = '<div class="cq-text-solution" style="display: none;">';
            solutionHtml += '<h3>Sample Answer:</h3>';
            solutionHtml += '<div class="cq-text-solution-content">';
            
            if (question.isMarkdown) {
              solutionHtml += '<div class="cq-markdown-content">' + escape(question.textAnswer || '') + '</div>';
            } else {
              solutionHtml += '<p>' + escape(question.textAnswer || '') + '</p>';
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
          if (!question.hideSolution) {
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
  
  // Generate the complete HTML
  return `<!-- Code Quiz: ${escape(title)} -->
<div id="code-quiz-container" class="cq-container">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
  
  <div class="cq-quiz" ${quiz.timeLimit ? `data-time-limit="${quiz.timeLimit}"` : ''}>
    <h1 class="cq-title">${escape(title)}</h1>
    <p class="cq-description">${escape(description)}</p>
    ${quiz.timeLimit ? `<div class="cq-timer"><span class="cq-timer-icon">⏱️</span> <span class="cq-timer-display">00:00</span></div>` : ''}
    
${generateQuestionHtml()}
    
    <div class="cq-controls">
      <button class="cq-button cq-check">Check Answers</button>
      <button class="cq-button cq-reset">Reset Quiz</button>
    </div>
  </div>
  
  <style>
    .cq-container { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; }
    .cq-title { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .cq-description { color: #666; margin-bottom: 1rem; }
    .cq-timer { background: #f0f9ff; border: 1px solid #bae6fd; color: #0c4a6e; padding: 0.5rem 1rem; border-radius: 0.5rem; margin-bottom: 2rem; display: flex; align-items: center; }
    .cq-timer-icon { margin-right: 0.5rem; font-size: 1.25rem; }
    .cq-timer-display { font-family: monospace; font-size: 1.1rem; font-weight: 500; }
    .cq-question-timer { background: #f8f8f8; border: 1px solid #e5e7eb; color: #374151; padding: 0.4rem 0.8rem; border-radius: 0.4rem; margin-bottom: 1rem; display: inline-flex; align-items: center; }
    .cq-question-timer-display { font-family: monospace; font-size: 0.95rem; font-weight: 500; }
    .cq-question { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1.5rem; margin-bottom: 1.5rem; }
    .cq-question-title { font-size: 1.2rem; margin-bottom: 1rem; }
    .cq-code-example, .cq-code-with-gaps, .cq-code-with-errors { background: #1e293b; border-radius: 6px; margin: 1rem 0; overflow: auto; position: relative; }
    .cq-code-block { background: #1e293b; color: #e5e7eb; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; cursor: move; font-family: monospace; }
    .cq-options { display: flex; flex-direction: column; gap: 0.75rem; }
    .cq-option { display: flex; align-items: flex-start; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; }
    .cq-option input { margin-top: 0.25rem; }
    .cq-option span { margin-left: 0.5rem; }
    .cq-feedback { display: none; margin-top: 0.25rem; font-size: 0.875rem; color: #059669; }
    .cq-gap { background: #374151; padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px dashed #6b7280; color: white; }
    .cq-snippets { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
    .cq-snippet { background: white; border: 1px solid #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: move; font-family: monospace; }
    .cq-line-numbers { position: absolute; top: 0; left: 0; padding: 1rem 0.5rem; text-align: right; user-select: none; }
    .cq-line-number { cursor: pointer; }
    .cq-line-number:hover { background: rgba(255,255,255,0.1); }
    .cq-error-line { color: #ef4444; }
    .cq-error-options { margin: 1rem 0; }
    .cq-button { background: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
    .cq-button:hover { background: #0284c7; }
    .cq-show-order-solution, .cq-show-choice-solution, .cq-show-gaps-solution, .cq-show-errors-solution { background: #059669; }
    .cq-show-order-solution:hover, .cq-show-choice-solution:hover, .cq-show-gaps-solution:hover, .cq-show-errors-solution:hover { background: #047857; }
    .cq-code-controls { display: flex; gap: 0.5rem; margin: 1rem 0; }
    .cq-error-option { display: flex; align-items: center; margin-bottom: 0.5rem; }
    .cq-error-option span { margin-left: 0.5rem; }
    .cq-controls { display: flex; gap: 1rem; margin-top: 2rem; }
    .cq-button { padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .cq-button:hover { background: #2563eb; }
    .cq-button.cq-reset { background: #f3f4f6; color: #1f2937; }
    .cq-button.cq-reset:hover { background: #e5e7eb; }
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
    .cq-show-solution, .cq-hide-solution { background: #16a34a; }
    .cq-show-solution:hover, .cq-hide-solution:hover { background: #15803d; }
    .cq-show-hint { background: #eab308; color: #1e293b; }
    .cq-show-hint:hover { background: #ca8a04; }
    .cq-hint { display: flex; align-items: flex-start; background: #fef9c3; border: 1px solid #fde047; padding: 1rem; border-radius: 6px; margin: 1rem 0; }
    .cq-hint-icon { font-size: 1.25rem; margin-right: 0.75rem; }
    .cq-hint-text { color: #854d0e; font-size: 0.9rem; }
    
    /* Text Question type styles */
    .cq-text-answer-container { margin: 1rem 0; }
    .cq-text-answer-input { width: 100%; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.75rem; font-family: -apple-system, system-ui, sans-serif; font-size: 14px; background: #f8fafc; }
    .cq-text-answer-input:focus { outline: none; box-shadow: 0 0 0 2px #3b82f6; }
    textarea.cq-text-answer-input { min-height: 150px; resize: vertical; }
    .cq-text-length-counter { margin-top: 0.5rem; color: #6b7280; font-size: 0.875rem; text-align: right; }
    .cq-text-format-controls { margin: 0.5rem 0; }
    .cq-format-code { background: #3b82f6; }
    .cq-format-code:hover { background: #2563eb; }
    .cq-text-solution { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 1rem; margin: 1rem 0; }
    .cq-text-solution h3 { font-size: 1rem; color: #166534; margin-top: 0; margin-bottom: 0.5rem; }
    .cq-text-solution-content { color: #166534; font-size: 0.9rem; }
    .cq-markdown-content { white-space: pre-wrap; font-family: -apple-system, system-ui, sans-serif; }
    .cq-show-text-solution { background: #16a34a; }
    .cq-show-text-solution:hover { background: #15803d; }
  </style>
  
  <script>
    // Client-side code goes here
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize syntax highlighting, etc.
      if (typeof hljs !== 'undefined') hljs.highlightAll();
      
      // Add event handlers (simplified)
      // Setup reset functionality
      document.querySelector('.cq-reset').addEventListener('click', function() {
        // Reset all inputs, selections, and states
        console.log('Quiz reset clicked');
      });
      
      // Setup checking functionality
      document.querySelector('.cq-check').addEventListener('click', function() {
        // Check all answers
        console.log('Check answers clicked');
      });
    });
  </script>
</div>`;
}