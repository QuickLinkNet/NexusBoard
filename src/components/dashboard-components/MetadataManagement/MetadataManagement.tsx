import React, { useState, useRef } from 'react';
import { FileDown, FolderOpen, RefreshCw } from 'lucide-react';
import { apiService } from '../../../lib/apiService';

interface GenerateResponse {
  message: string;
  filesProcessed: number;
  metadataGenerated: number;
  outputFiles: {
    csv: string;
    json: string;
  };
}

interface Prompt {
  id: string;
  title: string;
  prompt: string;
  keywords: string;
  expected_runs: string;
  successful_runs: string;
}

export function MetadataManagement() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileNames: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const name = files[i].name;
      if (name.startsWith('quicklink_') || name.startsWith('drunkenmunkey1986_86250_')) {
        fileNames.push(name);
      }
    }

    setImageFiles(fileNames);
    setError(fileNames.length === 0 ? 'Keine passenden Bilder gefunden' : null);
  };

  const generateMetadata = async () => {
    if (imageFiles.length === 0) {
      setError('Keine Bilder gefunden');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Hole alle Prompts
      const promptsResponse = await apiService.getPrompts();
      const prompts = promptsResponse.prompts;

      // Erstelle Metadata für jedes Bild
      const metadata = [];

      for (const imageName of imageFiles) {
        let promptParts: string[];
        if (imageName.startsWith('quicklink_')) {
          promptParts = imageName.split('_').slice(1, -2);
        } else {
          promptParts = imageName.split('_').slice(2, -2);
        }

        const prompt = promptParts.join(' ');

        // Suche nach dem passenden Prompt in der Datenbank
        for (const item of prompts) {
          if (item.prompt.includes(prompt)) {
            metadata.push({
              filename: imageName,
              title: item.title,
              keywords: `"${item.keywords.split(/\s+/).join(', ')}"`,
              category: "8",
              releases: ""
            });
            break;
          }
        }
      }

      // Generiere CSV
      const csvContent = generateCSV(metadata);
      const jsonContent = JSON.stringify(metadata, null, 2);

      // Erstelle Download-Links
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const jsonBlob = new Blob([jsonContent], { type: 'application/json' });

      const csvUrl = URL.createObjectURL(csvBlob);
      const jsonUrl = URL.createObjectURL(jsonBlob);

      setResult({
        message: 'Metadaten erfolgreich generiert',
        filesProcessed: imageFiles.length,
        metadataGenerated: metadata.length,
        outputFiles: {
          csv: csvUrl,
          json: jsonUrl
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCSV = (metadata: any[]) => {
    const header = ['Filename', 'Title', 'Keywords', 'Category', 'Releases'];
    const rows = metadata.map(item => [
      item.filename,
      item.title,
      item.keywords,
      item.category,
      item.releases
    ]);

    return [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Metadata Generator</h2>

      <div className="space-y-6">
        {/* Dateiauswahl */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bilder auswählen
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Bilder auswählen
            </button>
          </div>
          {imageFiles.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {imageFiles.length} passende Bilder gefunden
            </p>
          )}
        </div>

        {/* Generieren Button */}
        <div>
          <button
            onClick={generateMetadata}
            disabled={isGenerating || imageFiles.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generiere...
              </>
            ) : (
              'Metadaten generieren'
            )}
          </button>
        </div>

        {/* Fehlermeldung */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {/* Ergebnis */}
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">
              {result.message}
            </h3>
            <div className="space-y-2 text-sm text-green-700">
              <p>Verarbeitete Dateien: {result.filesProcessed}</p>
              <p>Generierte Metadaten: {result.metadataGenerated}</p>
              <div className="flex gap-4 mt-4">
                <a
                  href={result.outputFiles.csv}
                  download="metadata.csv"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FileDown className="w-4 h-4" />
                  CSV herunterladen
                </a>
                <a
                  href={result.outputFiles.json}
                  download="metadata.json"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FileDown className="w-4 h-4" />
                  JSON herunterladen
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
