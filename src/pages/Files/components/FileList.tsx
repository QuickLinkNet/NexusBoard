import React, {useState, useEffect, useMemo} from 'react';
import {Download, Trash2, Search, Filter, X, Eye} from 'lucide-react';
import {Button} from '../../../atoms/Button/Button';
import {apiService} from '../../../services/api/apiService';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploaded_at: string;
  previewable: boolean;
}

interface FileListProps {
  refreshTrigger: number;
}

export function FileList({refreshTrigger}: FileListProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'uploaded_at'>('uploaded_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<{
    content: string;
    type: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFiles();
      setFiles(response.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fileExtensions = useMemo(() => {
    const extensions = new Set<string>();
    files.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension) extensions.add(extension);
    });
    return Array.from(extensions).sort();
  }, [files]);

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const url = await apiService.getFileDownloadUrl(fileId);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Möchten Sie diese Datei wirklich löschen?')) return;

    try {
      await apiService.deleteFile(fileId);
      await loadFiles();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handlePreview = async (fileId: string) => {
    try {
      const content = await apiService.getFileContent(fileId);
      setPreviewContent(content);
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExtension = selectedExtension
      ? file.name.toLowerCase().endsWith(`.${selectedExtension.toLowerCase()}`)
      : true;
    return matchesSearch && matchesExtension;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dateien suchen..."
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            icon={<Filter className="h-5 w-5"/>}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            Sortieren
          </Button>
          {searchTerm && (
            <Button
              variant="secondary"
              onClick={() => setSearchTerm('')}
              icon={<X className="h-5 w-5"/>}
            >
              Zurücksetzen
            </Button>
          )}
        </div>
      </div>

      {fileExtensions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedExtension === null ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedExtension(null)}
          >
            Alle
          </Button>
          {fileExtensions.map(ext => (
            <Button
              key={ext}
              variant={selectedExtension === ext ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedExtension(ext === selectedExtension ? null : ext)}
            >
              .{ext}
              <span className="ml-2 text-xs">
                ({files.filter(f => f.name.toLowerCase().endsWith(`.${ext.toLowerCase()}`)).length})
              </span>
            </Button>
          ))}
        </div>
      )}

      {previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{previewContent.name}</h3>
              <button
                onClick={() => setPreviewContent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6"/>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {previewContent.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {sortedFiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Keine Dateien gefunden
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Größe
                  </th>
                  <th scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Typ
                  </th>
                  <th scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Hochgeladen
                  </th>
                  <th scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {sortedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col sm:hidden">
                        <span className="font-medium">{file.name}</span>
                        <span className="text-gray-500 text-xs mt-1">
                            {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                          </span>
                      </div>
                      <span className="hidden sm:block">{file.name}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {file.type}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(file.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {file.previewable && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePreview(file.id)}
                            icon={<Eye className="h-4 w-4"/>}
                          >
                            <span className="hidden sm:inline">Anzeigen</span>
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownload(file.id, file.name)}
                          icon={<Download className="h-4 w-4"/>}
                        >
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          icon={<Trash2 className="h-4 w-4"/>}
                        >
                          <span className="hidden sm:inline">Löschen</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}