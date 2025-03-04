import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const ClearStorage = () => {
  const clearLocalStorage = () => {
    localStorage.clear();
    console.log('LocalStorage cleared');
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">Storage Management</h1>
        <p className="text-gray-600 text-center">
          If you're experiencing issues with the app, you can try clearing your local storage.
        </p>
        <Button 
          onClick={clearLocalStorage}
          className="w-full"
          variant="destructive"
        >
          Clear Local Storage and Reset App
        </Button>
      </div>
    </div>
  );
};

export default ClearStorage;