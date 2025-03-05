import { Quiz } from '@/types';

export function generateHtml(quiz: Quiz): string {
  const title = quiz.title || 'Code Quiz';
  const description = quiz.description || 'Interactive coding quiz';
  
  // Helper function to escape HTML special characters
  const escape = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Generate HTML for questions
  const generateQuestionHtml = () => {
    return quiz.questions.map((question, index) => {
      let questionHtml = '';
      
      switch (question.type) {
        case 'code-order':
          questionHtml = `
    <div class="cq-question" data-type="order">
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      <div class="cq-order-container">
        <!-- Blocks will be shuffled when quiz loads -->
        ${(question.codeBlocks || []).map(block => 
          `<div class="cq-code-block" data-position="${block.correctPosition}">${escape(block.content)}</div>`
        ).join('\n        ')}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution ? `
        <button class="cq-button cq-show-order-solution">Show Solution</button>
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
          
        case 'multiple-choice':
        case 'single-choice':
          const inputType = question.type === 'multiple-choice' ? 'checkbox' : 'radio';
          questionHtml = `
    <div class="cq-question" data-type="${question.type}">
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      ${question.codeExample ? `
      <div class="cq-code-example">
        <pre><code class="language-javascript">${escape(question.codeExample)}</code></pre>
      </div>` : ''}
      <div class="cq-options">
        ${(question.options || []).map(option => 
          `<label class="cq-option">
          <input type="${inputType}" data-correct="${option.isCorrect}">
          <span>${escape(option.text)}</span>
          ${option.feedback ? `<span class="cq-feedback">${escape(option.feedback)}</span>` : ''}
        </label>`
        ).join('\n        ')}
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution ? `
        <button class="cq-button cq-show-choice-solution">Show Solution</button>
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
          
        case 'fill-gaps':
          questionHtml = `
    <div class="cq-question" data-type="fill-gaps">
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      <div class="cq-code-with-gaps">
        <pre><code class="language-javascript">${
          escape(question.codeWithGaps || '')
            .replace(/\[GAP_(\d+)\]/g, (_, n) => 
              `<span class="cq-gap" data-gap-id="${n}">_______</span>`
            )
        }</code></pre>
      </div>
      <div class="cq-snippets">
        ${(question.availableSnippets || []).map(snippet => 
          `<div class="cq-snippet" data-value="${escape(snippet)}">${escape(snippet)}</div>`
        ).join('\n        ')}
      </div>
      ${question.explanation ? `<div class="cq-explanation">${escape(question.explanation)}</div>` : ''}
    </div>`;
          break;
          
        case 'find-errors':
          questionHtml = `
    <div class="cq-question" data-type="find-errors">
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      <div class="cq-code-with-errors">
        <pre><code class="language-python">${escape(question.code || '')}</code></pre>
        <div class="cq-line-numbers">
          ${(question.code || '').split('\n').map((_, i) => 
            `<div class="cq-line-number ${(question.errorLines || []).some(line => line.lineNumber === i + 1) ? 'cq-error-line' : ''}" data-line="${i + 1}">${i + 1}</div>`
          ).join('\n          ')}
        </div>
      </div>
      <div class="cq-error-options">
        <h3>Errors to find:</h3>
        ${(question.errors || []).map((error, i) => 
          `<label class="cq-error-option">
          <input type="checkbox" data-error-id="${i}">
          <span>${escape(error)}</span>
        </label>`
        ).join('\n        ')}
      </div>
      ${question.explanation ? `<div class="cq-explanation">${escape(question.explanation)}</div>` : ''}
    </div>`;
          break;
          
        case 'fill-whole':
          const language = question.language || 'javascript';
          questionHtml = `
    <div class="cq-question" data-type="fill-whole" data-language="${escape(language)}">
      <h2 class="cq-question-title">Question ${index + 1}: ${escape(question.title)}</h2>
      <div class="cq-code-wrapper">
        <div class="cq-code-prefix">
          <pre><code class="language-${escape(language)}">${escape(question.codePrefix || '')}</code></pre>
        </div>
        <div class="cq-code-solution-container">
          <textarea class="cq-code-solution-input" rows="4" placeholder="Write your solution code here"></textarea>
          <div class="cq-code-solution-overlay" style="display: none;">
            <pre><code class="language-${escape(language)}">${escape(question.solutionCode || '')}</code></pre>
          </div>
        </div>
        <div class="cq-code-suffix">
          <pre><code class="language-${escape(language)}">${escape(question.codeSuffix || '')}</code></pre>
        </div>
      </div>
      
      <div class="cq-code-controls">
        ${!question.hideSolution ? `
        <button class="cq-button cq-show-solution">Show Solution</button>
        <button class="cq-button cq-hide-solution" style="display: none;">Hide Solution</button>
        ` : ''}
        <button class="cq-button cq-run-code" style="background-color: #4f46e5;">Run Code</button>
        ${question.hintComment ? `<button class="cq-button cq-show-hint">Show Hint</button>` : ''}
      </div>
      
      <div class="cq-code-output" style="display: none; margin-top: 1rem;">
        <h3 style="font-size: 0.875rem; text-transform: uppercase; color: #9ca3af; margin-bottom: 0.5rem;">Output:</h3>
        <pre class="cq-output-content" style="background-color: #1f2937; color: white; padding: 1rem; border-radius: 0.375rem; overflow: auto; max-height: 200px; font-family: monospace; font-size: 0.875rem;"></pre>
      </div>
      
      ${question.hintComment ? `
      <div class="cq-hint" style="display: none;">
        <div class="cq-hint-icon">💡</div>
        <div class="cq-hint-text">${escape(question.hintComment)}</div>
      </div>` : ''}
      
      ${question.explanation ? `<div class="cq-explanation">${escape(question.explanation)}</div>` : ''}
    </div>`;
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
  
  <div class="cq-quiz">
    <h1 class="cq-title">${escape(title)}</h1>
    <p class="cq-description">${escape(description)}</p>
    
${generateQuestionHtml()}
    
    <div class="cq-controls">
      <button class="cq-button cq-check">Check Answers</button>
      <button class="cq-button cq-reset">Reset Quiz</button>
    </div>
  </div>
  
  <style>
    .cq-container { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; }
    .cq-title { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .cq-description { color: #666; margin-bottom: 2rem; }
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
    .cq-show-order-solution, .cq-show-choice-solution { background: #059669; }
    .cq-show-order-solution:hover, .cq-show-choice-solution:hover { background: #047857; }
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
  </style>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize syntax highlighting
      hljs.highlightAll();
      
      // Shuffle code blocks for ordering questions
      document.querySelectorAll('.cq-question[data-type="order"]').forEach(question => {
        const container = question.querySelector('.cq-order-container');
        const blocks = Array.from(container.querySelectorAll('.cq-code-block'));
        
        // Shuffle blocks
        for (let i = blocks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          container.appendChild(blocks[j]);
        }
      });
      
      // Check answers
      document.querySelector('.cq-check').addEventListener('click', function() {
        let score = 0;
        let total = 0;
        
        // Code ordering questions
        document.querySelectorAll('.cq-question[data-type="order"]').forEach(question => {
          const blocks = Array.from(question.querySelectorAll('.cq-code-block'));
          let correct = true;
          
          blocks.forEach((block, index) => {
            const correctPosition = parseInt(block.getAttribute('data-position'));
            if (correctPosition !== index + 1) {
              correct = false;
            }
            block.classList.remove('correct', 'incorrect');
            block.classList.add(correctPosition === index + 1 ? 'correct' : 'incorrect');
          });
          
          if (correct) score++;
          total++;
        });
        
        // Multiple/single choice
        document.querySelectorAll('.cq-question[data-type="multiple-choice"], .cq-question[data-type="single-choice"]').forEach(question => {
          const options = question.querySelectorAll('.cq-option');
          let correct = true;
          
          options.forEach(option => {
            const input = option.querySelector('input');
            const shouldBeChecked = input.getAttribute('data-correct') === 'true';
            const isChecked = input.checked;
            
            if (shouldBeChecked !== isChecked) {
              correct = false;
            }
            
            option.classList.remove('correct', 'incorrect');
            if (isChecked) {
              option.classList.add(shouldBeChecked ? 'correct' : 'incorrect');
            }
            
            // Show feedback if available
            const feedback = option.querySelector('.cq-feedback');
            if (feedback && isChecked) {
              feedback.style.display = 'block';
            }
          });
          
          if (correct) score++;
          total++;
        });
        
        // Show score
        alert(\`You got \${score} out of \${total} questions correct!\`);
      });
      
      // Reset quiz
      document.querySelector('.cq-reset').addEventListener('click', function() {
        // Reset code ordering
        document.querySelectorAll('.cq-code-block').forEach(block => {
          block.classList.remove('correct', 'incorrect');
        });
        
        // Reset multiple/single choice
        document.querySelectorAll('.cq-option input').forEach(input => {
          input.checked = false;
        });
        
        document.querySelectorAll('.cq-option').forEach(option => {
          option.classList.remove('correct', 'incorrect');
        });
        
        document.querySelectorAll('.cq-feedback').forEach(feedback => {
          feedback.style.display = 'none';
        });
        
        // Reset fill whole questions
        document.querySelectorAll('.cq-code-solution-input').forEach(input => {
          input.value = '';
        });
        
        document.querySelectorAll('.cq-code-solution-overlay').forEach(overlay => {
          overlay.style.display = 'none';
        });
        
        document.querySelectorAll('.cq-show-solution').forEach(btn => {
          btn.style.display = 'inline-block';
        });
        
        document.querySelectorAll('.cq-hide-solution').forEach(btn => {
          btn.style.display = 'none';
        });
        
        document.querySelectorAll('.cq-hint').forEach(hint => {
          hint.style.display = 'none';
        });
      });
      
      // Handle show/hide solution for Fill Whole questions
      document.querySelectorAll('.cq-show-solution').forEach(btn => {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          const overlay = question.querySelector('.cq-code-solution-overlay');
          const hideBtn = question.querySelector('.cq-hide-solution');
          
          overlay.style.display = 'block';
          this.style.display = 'none';
          hideBtn.style.display = 'inline-block';
          
          // Apply syntax highlighting
          hljs.highlightElement(overlay.querySelector('code'));
        });
      });
      
      document.querySelectorAll('.cq-hide-solution').forEach(btn => {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          const overlay = question.querySelector('.cq-code-solution-overlay');
          const showBtn = question.querySelector('.cq-show-solution');
          
          overlay.style.display = 'none';
          this.style.display = 'none';
          showBtn.style.display = 'inline-block';
        });
      });
      
      // Handle show/hide hints
      document.querySelectorAll('.cq-show-hint').forEach(btn => {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          const hint = question.querySelector('.cq-hint');
          
          if (hint.style.display === 'none' || hint.style.display === '') {
            hint.style.display = 'flex';
            this.textContent = 'Hide Hint';
          } else {
            hint.style.display = 'none';
            this.textContent = 'Show Hint';
          }
        });
      });
      
      // Handle show solution for code ordering questions
      document.querySelectorAll('.cq-show-order-solution').forEach(btn => {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          const container = question.querySelector('.cq-order-container');
          const blocks = Array.from(container.querySelectorAll('.cq-code-block'));
          
          // Sort blocks by correctPosition
          blocks.sort((a, b) => {
            return parseInt(a.getAttribute('data-position')) - parseInt(b.getAttribute('data-position'));
          });
          
          // Reappend in correct order
          blocks.forEach(block => {
            container.appendChild(block);
            block.style.backgroundColor = '#10b981';
            block.style.color = 'white';
          });
          
          // Hide the solution button
          this.style.display = 'none';
        });
      });
      
      // Handle show solution for multiple/single choice questions
      document.querySelectorAll('.cq-show-choice-solution').forEach(btn => {
        btn.addEventListener('click', function() {
          const question = this.closest('.cq-question');
          const options = question.querySelectorAll('.cq-option');
          
          options.forEach(option => {
            const input = option.querySelector('input');
            const isCorrect = input.getAttribute('data-correct') === 'true';
            
            if (isCorrect) {
              option.style.backgroundColor = '#d1fae5';
              option.style.borderColor = '#10b981';
              input.checked = true;
              
              // Show feedback if available
              const feedback = option.querySelector('.cq-feedback');
              if (feedback) {
                feedback.style.display = 'block';
              }
            }
          });
          
          // Hide the solution button
          this.style.display = 'none';
        });
      });
      
      // Handle code execution for Fill Whole questions
      let pyodideInstance = null;
      let pyodideLoading = false;
      
      async function loadPyodide() {
        if (pyodideInstance) return pyodideInstance;
        if (pyodideLoading) {
          // Wait for Pyodide to finish loading
          return new Promise(resolve => {
            const checkInterval = setInterval(() => {
              if (pyodideInstance) {
                clearInterval(checkInterval);
                resolve(pyodideInstance);
              }
            }, 100);
          });
        }
        
        pyodideLoading = true;
        try {
          // Show loading message in all Python outputs
          document.querySelectorAll('.cq-question[data-language="python"] .cq-output-content').forEach(output => {
            output.textContent = 'Loading Python environment... This may take a moment.';
            output.closest('.cq-code-output').style.display = 'block';
          });
          
          // Load Pyodide
          pyodideInstance = await loadPyodide();
          
          // Clear loading messages
          document.querySelectorAll('.cq-question[data-language="python"] .cq-output-content').forEach(output => {
            output.textContent = 'Python environment loaded and ready!';
          });
          
          return pyodideInstance;
        } catch (error) {
          console.error('Error loading Pyodide:', error);
          document.querySelectorAll('.cq-question[data-language="python"] .cq-output-content').forEach(output => {
            output.textContent = 'Error loading Python environment. Please try again or check console for details.';
          });
          pyodideLoading = false;
          throw error;
        }
      }
      
      // Execute JavaScript code
      function executeJavaScript(code, outputElement) {
        const logs = [];
        const originalConsoleLog = console.log;
        
        try {
          // Override console.log to capture output
          console.log = (...args) => {
            logs.push(args.map(arg => String(arg)).join(' '));
            originalConsoleLog(...args);
          };
          
          // Execute the code
          const result = new Function(code)();
          
          // If the code returns a value, add it to the logs
          if (result !== undefined) {
            logs.push(\`Return value: \${result}\`);
          }
          
          outputElement.textContent = logs.join('\\n') || 'Code executed successfully (no output)';
        } catch (error) {
          outputElement.textContent = \`Error: \${error.message}\`;
        } finally {
          // Restore the original console.log
          console.log = originalConsoleLog;
        }
      }
      
      // Execute Python code
      async function executePython(code, outputElement) {
        try {
          outputElement.textContent = 'Running Python code...';
          
          const pyodide = await loadPyodide();
          
          // Redirect stdout
          pyodide.setStdout({
            write: text => {
              const currentOutput = outputElement.textContent;
              outputElement.textContent = currentOutput === 'Running Python code...' ? text : currentOutput + '\\n' + text;
            }
          });
          
          // Run the code
          const result = await pyodide.runPythonAsync(code);
          
          // If there's a result value and no output yet, show it
          if (result !== undefined && outputElement.textContent === 'Running Python code...') {
            outputElement.textContent = String(result);
          } else if (outputElement.textContent === 'Running Python code...') {
            outputElement.textContent = 'Code executed successfully (no output)';
          }
        } catch (error) {
          outputElement.textContent = \`Error: \${error.message}\`;
        }
      }
      
      // Add event listeners for run code buttons
      document.querySelectorAll('.cq-run-code').forEach(btn => {
        btn.addEventListener('click', async function() {
          const question = this.closest('.cq-question');
          const language = question.getAttribute('data-language') || 'javascript';
          const inputElement = question.querySelector('.cq-code-solution-input');
          const outputElement = question.querySelector('.cq-output-content');
          const outputContainer = question.querySelector('.cq-code-output');
          
          // Show the output container
          outputContainer.style.display = 'block';
          
          // Get code components
          const codePrefix = question.querySelector('.cq-code-prefix code').textContent || '';
          const userCode = inputElement.value || '';
          const codeSuffix = question.querySelector('.cq-code-suffix code').textContent || '';
          
          // Combine the code
          const completeCode = \`\${codePrefix}\\n\${userCode}\\n\${codeSuffix}\`;
          
          // Execute based on language
          if (language === 'javascript') {
            executeJavaScript(completeCode, outputElement);
          } else if (language === 'python') {
            await executePython(completeCode, outputElement);
          } else {
            outputElement.textContent = \`Language '\${language}' is not supported for execution.\`;
          }
        });
      });
    });
  </script>
</div>`;
}
