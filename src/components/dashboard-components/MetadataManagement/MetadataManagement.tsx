import React, {useState, useRef} from 'react';
import {FileDown, FolderOpen, RefreshCw} from 'lucide-react';
import {apiService} from '../../../lib/apiService';

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

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError('Keine Dateien ausgewählt');
      return;
    }

    const fileNames: string[] = [];
    for (let i = 0; i < files.length; i++) {
      fileNames.push(files[i].name);
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

      // Sicherstellen, dass prompts ein Array ist
      const prompts = Array.isArray(promptsResponse.prompts)
        ? promptsResponse.prompts
        : [];

      if (prompts.length === 0) {
        throw new Error('Keine Prompts gefunden. Bitte fügen Sie zuerst Prompts hinzu.');
      }

      // Erstelle Metadata für jedes Bild
      const metadata = [];

      for (const imageName of imageFiles) {
        let promptParts: string[];
        let promptText = '';

        // Verschiedene Dateinamenformate erkennen
        if (imageName.startsWith('quicklink_')) {
          promptParts = imageName.split('_').slice(1, -2);
          promptText = promptParts.join(' ');
        } else if (imageName.startsWith('drunkenmunkey1986_86250_')) {
          promptParts = imageName.split('_').slice(2, -2);
          promptText = promptParts.join(' ');
        } else {
          // Für andere Dateien versuchen, einen allgemeinen Ansatz zu verwenden
          // Entferne Dateiendung und Zahlen/Hashes am Ende
          const nameWithoutExt = imageName.replace(/\.[^/.]+$/, "");
          promptText = nameWithoutExt.replace(/_[a-f0-9-]+$/, "").replace(/_/g, ' ');
        }

        // Suche nach dem passenden Prompt in der Datenbank
        let matchFound = false;

        for (const item of prompts) {
          // Prüfe, ob der Prompt-Text im Prompt des Items enthalten ist
          if (item.prompt && item.prompt.toLowerCase().includes(promptText.toLowerCase())) {
            metadata.push({
              filename: imageName,
              title: item.title || 'Kein Titel',
              keywords: item.keywords || '',
              category: "8",
              releases: ""
            });
            matchFound = true;
            break;
          }
        }

        // Wenn kein passender Prompt gefunden wurde, füge trotzdem Metadaten hinzu
        if (!matchFound) {
          metadata.push({
            filename: imageName,
            title: 'Kein passender Prompt gefunden',
            keywords: '',
            category: "8",
            releases: ""
          });
        }
      }

      // Generiere CSV
      const csvContent = generateCSV(metadata);
      const jsonContent = JSON.stringify(metadata, null, 2);

      // Erstelle Download-Links
      const csvBlob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
      const jsonBlob = new Blob([jsonContent], {type: 'application/json'});

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
    const rows = metadata.map(item => {
      // Stelle sicher, dass Keywords in Anführungszeichen stehen
      const keywordsFormatted = `"${item.keywords}"`;

      return [
        item.filename,
        item.title,
        keywordsFormatted,
        item.category,
        item.releases
      ];
    });

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
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4"/>
              <span>Bilder auswählen</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept="image/*"
            />

            {imageFiles.length > 0 && (
              <span className="py-2 text-sm text-gray-600">
                {imageFiles.length} Dateien ausgewählt
              </span>
            )}
          </div>
          {imageFiles.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 max-h-40 overflow-y-auto border p-2 rounded">
              <p className="font-medium mb-1">Ausgewählte Dateien:</p>
              <ul className="list-disc pl-5">
                {imageFiles.slice(0, 10).map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
                {imageFiles.length > 10 && (
                  <li>...und {imageFiles.length - 10} weitere</li>
                )}
              </ul>
            </div>
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
                <RefreshCw className="w-4 h-4 animate-spin"/>
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
                  <FileDown className="w-4 h-4"/>
                  CSV herunterladen
                </a>
                <a
                  href={result.outputFiles.json}
                  download="metadata.json"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FileDown className="w-4 h-4"/>
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