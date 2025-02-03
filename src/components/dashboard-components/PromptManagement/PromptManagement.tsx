import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Edit2, Save } from 'lucide-react';
import { Overlay } from './Overlay';
import { PromptStatistics } from './PromptStatistics';
import { PromptTable } from './PromptTable';
import { apiService } from '../../../lib/apiService';

interface Prompt {
  id: string;
  title: string;
  prompt: string;
  keywords: string;
  expected_runs: string;
  successful_runs: string;
}

export function PromptManagement() {
  const [showPromptList, setShowPromptList] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [validationPassed, setValidationPassed] = useState<boolean | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editPromptData, setEditPromptData] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const response = await apiService.getPrompts();
      setPrompts(response.prompts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading prompts:', error);
      setLoading(false);
    }
  };

  const validatePrompts = (input: string) => {
    try {
      const parsed = JSON.parse(input);
      setValidationPassed(Array.isArray(parsed));
    } catch (error) {
      setValidationPassed(false);
      console.error('Validation error:', error);
    }
  };

  const savePrompts = async () => {
    try {
      const parsedPrompts = JSON.parse(jsonInput);
      for (const prompt of parsedPrompts) {
        await apiService.createPrompt(prompt);
      }
      await loadPrompts();
      setShowOverlay(false);
      setJsonInput('');
    } catch (error) {
      console.error('Error saving prompts:', error);
    }
  };

  const handleEditPrompt = async () => {
    if (editPromptData && editPromptData.title && editPromptData.prompt) {
      try {
        await apiService.updatePrompt(editPromptData.id, editPromptData);
        await loadPrompts();
        setShowEditOverlay(false);
      } catch (error) {
        console.error('Error updating prompt:', error);
      }
    }
  };

  const handleRowEdit = (prompt: Prompt) => {
    setEditPromptData(prompt);
    setShowEditOverlay(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4 p-4">
        <button
          onClick={() => setShowPromptList(true)}
          className={`px-4 py-2 rounded-md ${
            showPromptList ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Prompt Liste
        </button>
        <button
          onClick={() => setShowPromptList(false)}
          className={`px-4 py-2 rounded-md ${
            !showPromptList ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Nutzungsstatistik
        </button>
      </div>

      {showPromptList ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Suchen..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowOverlay(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <PromptTable
              prompts={prompts.filter(prompt =>
                prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prompt.keywords.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              loading={loading}
              onEdit={handleRowEdit}
              onUpdate={loadPrompts}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <PromptStatistics logs={logs} />
        </div>
      )}

      <Overlay isOpen={showOverlay} onClose={() => setShowOverlay(false)}>
        <h2 className="text-xl font-bold mb-4">Neuer Prompt</h2>
        <textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            validatePrompts(e.target.value);
          }}
          placeholder="JSON eingeben"
          className="w-full h-40 p-2 border rounded-md mb-4"
        />
        {validationPassed !== null && (
          <div className="mb-4">
            <span className={validationPassed ? "text-green-600" : "text-red-600"}>
              {validationPassed ? "✔ Gültiges JSON" : "✖ Ungültiges JSON"}
            </span>
          </div>
        )}
        <button
          onClick={savePrompts}
          disabled={!validationPassed}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
        >
          Speichern
        </button>
      </Overlay>

      <Overlay isOpen={showEditOverlay} onClose={() => setShowEditOverlay(false)}>
        <h2 className="text-xl font-bold mb-4">Prompt bearbeiten</h2>
        <textarea
          value={editPromptData?.title || ''}
          onChange={(e) => setEditPromptData(prev => prev ? {...prev, title: e.target.value} : null)}
          placeholder="Titel"
          className="w-full p-2 border rounded-md mb-2"
        />
        <textarea
          value={editPromptData?.prompt || ''}
          onChange={(e) => setEditPromptData(prev => prev ? {...prev, prompt: e.target.value} : null)}
          placeholder="Prompt"
          className="w-full p-2 border rounded-md mb-2"
        />
        <textarea
          value={editPromptData?.keywords || ''}
          onChange={(e) => setEditPromptData(prev => prev ? {...prev, keywords: e.target.value} : null)}
          placeholder="Keywords"
          className="w-full p-2 border rounded-md mb-4"
        />
        <button
          onClick={handleEditPrompt}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Speichern
        </button>
      </Overlay>
    </div>
  );
}
