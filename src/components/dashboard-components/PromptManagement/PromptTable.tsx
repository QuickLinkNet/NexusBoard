import React, { useState } from 'react';
import { Edit2, ArrowUpDown, Copy, CheckCircle, ChevronLeft, ChevronRight, MoreHorizontal, CheckSquare } from 'lucide-react';
import { apiService } from '../../../lib/apiService';

interface Prompt {
  id: string;
  title: string;
  prompt: string;
  keywords: string;
  expected_runs: string;
  successful_runs: string;
}

interface PromptTableProps {
  prompts: Prompt[];
  loading: boolean;
  onEdit: (prompt: Prompt) => void;
  onUpdate?: () => void;
}

type SortField = 'title' | 'prompt' | 'keywords' | 'expected_runs' | 'successful_runs';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function PromptTable({ prompts, loading, onEdit, onUpdate }: PromptTableProps) {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUnderperforming, setShowUnderperforming] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      await apiService.setPromptSuccessful(prompt.id);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error setting prompt successful:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const isUnderperforming = (prompt: Prompt) => {
    return parseInt(prompt.successful_runs) < parseInt(prompt.expected_runs);
  };

  const filteredPrompts = showUnderperforming
    ? prompts.filter(isUnderperforming)
    : prompts;

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
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
      <div className="p-4 text-center text-gray-500">
        Daten werden geladen...
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Keine Einträge gefunden.
      </div>
    );
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {label}
      <ArrowUpDown className={`h-4 w-4 ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`} />
    </button>
  );

  return (
    <div className="overflow-x-auto">
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
      <div className="overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="title" label="Titel" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="prompt" label="Prompt" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="keywords" label="Keywords" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="expected_runs" label="Erwartete Ausführungen" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="successful_runs" label="Erfolgreiche Ausführungen" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {paginatedPrompts.map((prompt) => (
            <tr
              key={prompt.id}
              className="hover:bg-gray-50"
            >
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
                  <button
                    onClick={() => onEdit(prompt)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCopy(prompt)}
                    className="text-blue-600 hover:text-blue-900 transition-colors relative"
                    title="Prompt kopieren (x10 ar8:3)"
                  >
                    {copiedId === prompt.id ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  {prompt.successful_runs < "10" && (
                    <button
                      onClick={() => handleSetSuccessful(prompt)}
                      disabled={updatingId === prompt.id}
                      className="text-blue-600 hover:text-blue-900 transition-colors relative"
                      title="Auf 10 erfolgreiche Ausführungen setzen"
                    >
                      {updatingId === prompt.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                      ) : (
                        <CheckSquare className="h-5 w-5" />
                      )}
                    </button>
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
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border rounded-md px-2 py-1 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1">
                <MoreHorizontal className="h-5 w-5 text-gray-400" />
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            )
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
