import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cpp', cpp);

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export function SyntaxHighlighterWrapper({ 
  code, 
  language,
  showLineNumbers = false 
}: SyntaxHighlighterProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={atomOneDark}
      showLineNumbers={showLineNumbers}
      wrapLines={true}
      customStyle={{
        margin: 0,
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
