import React, {useState, useEffect} from 'react';
import {
  Search,
  X,
  Plus,
  Edit2,
  ArrowUpDown,
  Copy,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckSquare
} from 'lucide-react';
import {Button} from '../../../atoms/Button/Button';
import {FormField} from '../../../molecules/FormField/FormField';
import {apiService} from '../../../services/api/apiService';

interface Prompt {
  id: string;
  title: string;
  prompt: string;
  keywords: string;
  expected_runs: string;
  successful_runs: string;
}

type SortField = 'title' | 'prompt' | 'keywords' | 'expected_runs' | 'successful_runs';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function PromptManager() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    prompt: '',
    keywords: ''
  });
  const [jsonInput, setJsonInput] = useState('');
  const [validationPassed, setValidationPassed] = useState<boolean | null>(null);

  // Pagination and sorting state
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showUnderperforming, setShowUnderperforming] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPrompts();
      setPrompts(response.prompts || []);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
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
        // Konvertiere Keywords-Array zu einem String, falls es ein Array ist
        if (Array.isArray(prompt.keywords)) {
          prompt.keywords = prompt.keywords.join(', ');
        }

        await apiService.createPrompt(prompt);
      }

      await loadPrompts();
      setShowAddModal(false);
      setJsonInput('');
      setValidationPassed(null);
    } catch (error) {
      console.error('Error saving prompts:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCopy = async (prompt: Prompt) => {
    const textToCopy = `${prompt.prompt} --ar 8:3 --repeat 10`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSetSuccessful = async (prompt: Prompt) => {
    try {
      setUpdatingId(prompt.id);
      await apiService.updatePrompt(prompt.id, {successful_runs: "10"});
      await loadPrompts();
    } catch (error) {
      console.error('Error setting prompt successful:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrompt) return;

    try {
      await apiService.updatePrompt(selectedPrompt.id, editForm);
      await loadPrompts();
      setShowEditModal(false);
      setSelectedPrompt(null);
      setEditForm({title: '', prompt: '', keywords: ''});
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Prompt löschen möchten?')) return;

    try {
      await apiService.deletePrompt(id);
      await loadPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const isUnderperforming = (prompt: Prompt) => {
    return parseInt(prompt.successful_runs) < parseInt(prompt.expected_runs);
  };

  const filteredPrompts = prompts.filter(prompt =>
    (showUnderperforming ? isUnderperforming(prompt) : true) &&
    (prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === 'expected_runs' || sortField === 'successful_runs') {
      const aNum = parseInt(aValue as string, 10);
      const bNum = parseInt(bValue as string, 10);
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }

    return sortDirection === 'asc'
      ? (aValue as string).localeCompare(bValue as string)
      : (bValue as string).localeCompare(aValue as string);
  });

  const totalPages = Math.ceil(sortedPrompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrompts = sortedPrompts.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }

    pages.push(1);

    const leftBound = Math.max(2, currentPage - 1);
    const rightBound = Math.min(totalPages - 1, currentPage + 1);

    if (leftBound > 2) pages.push('...');
    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }
    if (rightBound < totalPages - 1) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const SortButton = ({field, label}: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {label}
      <ArrowUpDown className={`h-4 w-4 ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`}/>
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Suchen..."
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {searchTerm && (
            <Button
              variant="secondary"
              onClick={() => setSearchTerm('')}
              icon={<X className="h-5 w-5"/>}
            >
              Zurücksetzen
            </Button>
          )}
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="h-5 w-5"/>}
          >
            Neuer Prompt
          </Button>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-b">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showUnderperforming}
            onChange={(e) => setShowUnderperforming(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Nur Prompts mit weniger erfolgreichen als erwarteten Ausführungen anzeigen
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="title" label="Titel"/>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="prompt" label="Prompt"/>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="keywords" label="Keywords"/>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="expected_runs" label="Erwartete Ausführungen"/>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="successful_runs" label="Erfolgreiche Ausführungen"/>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {paginatedPrompts.map((prompt) => (
            <tr key={prompt.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prompt.title}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                <div className="line-clamp-2">{prompt.prompt}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                <div className="line-clamp-2">{prompt.keywords}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prompt.expected_runs}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prompt.successful_runs}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedPrompt(prompt);
                      setEditForm({
                        title: prompt.title,
                        prompt: prompt.prompt,
                        keywords: prompt.keywords
                      });
                      setShowEditModal(true);
                    }}
                    icon={<Edit2 className="h-4 w-4"/>}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(prompt)}
                    icon={copiedId === prompt.id ? <CheckCircle className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                  >
                    {copiedId === prompt.id ? 'Kopiert!' : 'Kopieren'}
                  </Button>
                  {prompt.successful_runs < "10" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetSuccessful(prompt)}
                      disabled={updatingId === prompt.id}
                      icon={
                        updatingId === prompt.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"/>
                        ) : (
                          <CheckSquare className="h-4 w-4"/>
                        )
                      }
                    >
                      Auf 10 setzen
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700">
            Zeige {startIndex + 1} bis {Math.min(startIndex + itemsPerPage, sortedPrompts.length)} von {sortedPrompts.length} Einträgen
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Einträge pro Seite:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-md px-2 py-1 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            icon={<ChevronLeft className="h-5 w-5"/>}
          />

          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1">
                <MoreHorizontal className="h-5 w-5 text-gray-400"/>
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentPage(page as number)}
              >
                {page}
              </Button>
            )
          ))}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            icon={<ChevronRight className="h-5 w-5"/>}
          />
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Neuer Prompt</h2>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                validatePrompts(e.target.value);
              }}
              placeholder="JSON eingeben"
              className="w-full h-40 p-2 border rounded-md mb-4 font-mono"
            />
            {validationPassed !== null && (
              <div className="mb-4">
                <span className={validationPassed ? "text-green-600" : "text-red-600"}>
                  {validationPassed ? "✔ Gültiges JSON" : "✖ Ungültiges JSON"}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setJsonInput('');
                  setValidationPassed(null);
                }}
              >
                Abbrechen
              </Button>
              <Button
                onClick={savePrompts}
                disabled={!validationPassed}
              >
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Prompt bearbeiten</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <FormField
                label="Titel"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                required
              />
              <FormField
                label="Prompt"
                value={editForm.prompt}
                onChange={(e) => setEditForm({...editForm, prompt: e.target.value})}
                required
              />
              <FormField
                label="Keywords"
                value={editForm.keywords}
                onChange={(e) => setEditForm({...editForm, keywords: e.target.value})}
                placeholder="Komma-getrennte Keywords"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPrompt(null);
                    setEditForm({title: '', prompt: '', keywords: ''});
                  }}
                >
                  Abbrechen
                </Button>
                <Button type="submit">
                  Speichern
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}