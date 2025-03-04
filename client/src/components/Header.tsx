import { Button } from '@/components/ui/button';
import { Eye, Code } from 'lucide-react';

interface HeaderProps {
  onPreview: () => void;
  onExport: () => void;
}

export default function Header({ onPreview, onExport }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <i className="fas fa-code text-blue-500 text-2xl"></i>
          <h1 className="text-xl font-semibold text-slate-800">Code Quiz Generator</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onPreview}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={onExport}>
            <Code className="h-4 w-4 mr-2" />
            Export HTML
          </Button>
        </div>
      </div>
    </header>
  );
}
