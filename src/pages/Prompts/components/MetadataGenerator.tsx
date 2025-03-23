import React, {useState, useRef} from 'react';
import {FileDown, FolderOpen, RefreshCw, AlertCircle} from 'lucide-react';
import {Button} from '../../../atoms/Button/Button';
import {apiService} from '../../../services/api/apiService';

interface GenerateResponse {
  message: string;
  filesProcessed: number;
  metadataGenerated: number;
  outputFiles: {
    csv: string;
    json: string;
  };
}

interface UnmatchedFile {
  filename: string;
  originalPrompt: string;
  cleanedPrompt: string;
}

export function MetadataGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [unmatchedFiles, setUnmatchedFiles] = useState<UnmatchedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError('Keine Dateien ausgewählt');
      return;
    }

    const fileNames = Array.from(files).map(file => file.name);
    setImageFiles(fileNames);
    setError(fileNames.length === 0 ? 'Keine passenden Bilder gefunden' : null);
    setUnmatchedFiles([]);
  };

  // Helper function to remove umlauts from text
  const removeUmlauts = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[äöüß]/g, '');
  };

  // Helper function to extract prompt text from filename
  const extractPromptFromFilename = (filename: string): string => {
    let promptText = '';

    if (filename.startsWith('quicklink_')) {
      const parts = filename.split('_');
      promptText = parts.slice(1, -2).join(' ');
    } else if (filename.startsWith('drunkenmunkey1986_86250_')) {
      const parts = filename.split('_');
      promptText = parts.slice(2, -2).join(' ');
    } else {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      promptText = nameWithoutExt.replace(/_[a-f0-9-]+$/, "").replace(/_/g, ' ');
    }

    return promptText;
  };

  const generateMetadata = async () => {
    if (imageFiles.length === 0) {
      setError('Keine Bilder gefunden');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setUnmatchedFiles([]);

    try {
      const promptsResponse = await apiService.getPrompts();
      const prompts = promptsResponse.prompts || [];

      if (prompts.length === 0) {
        throw new Error('Keine Prompts gefunden. Bitte fügen Sie zuerst Prompts hinzu.');
      }

      const unmatched: UnmatchedFile[] = [];
      const metadata = imageFiles.map(imageName => {
        const promptText = extractPromptFromFilename(imageName);
        const cleanedPromptText = removeUmlauts(promptText);

        // Find matching prompt by comparing cleaned versions
        const promptMatch = prompts.find(prompt => {
          const cleanedDbPrompt = removeUmlauts(prompt.prompt);
          return cleanedDbPrompt.includes(cleanedPromptText) ||
            cleanedPromptText.includes(cleanedDbPrompt);
        });

        if (!promptMatch) {
          unmatched.push({
            filename: imageName,
            originalPrompt: promptText,
            cleanedPrompt: cleanedPromptText
          });
        }

        return {
          filename: imageName,
          title: promptMatch?.title || 'Kein passender Prompt gefunden',
          keywords: promptMatch?.keywords || '',
          category: "8",
          releases: "",
          originalPrompt: promptText,
          matchedPrompt: promptMatch?.prompt || ''
        };
      });

      setUnmatchedFiles(unmatched);

      const csvContent = generateCSV(metadata);
      const jsonContent = JSON.stringify(metadata, null, 2);

      const csvBlob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
      const jsonBlob = new Blob([jsonContent], {type: 'application/json'});

      const csvUrl = URL.createObjectURL(csvBlob);
      const jsonUrl = URL.createObjectURL(jsonBlob);

      setResult({
        message: metadata.length === unmatched.length
          ? 'Warnung: Keine Übereinstimmungen gefunden!'
          : unmatched.length > 0
            ? `Warnung: ${unmatched.length} von ${metadata.length} Dateien ohne Übereinstimmung`
            : 'Metadaten erfolgreich generiert',
        filesProcessed: imageFiles.length,
        metadataGenerated: metadata.length - unmatched.length,
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
    const header = ['Filename', 'Title', 'Keywords', 'Category', 'Releases', 'Original Prompt', 'Matched Prompt'];
    const rows = metadata.map(item => [
      item.filename,
      item.title,
      `"${item.keywords}"`,
      item.category,
      item.releases,
      `"${item.originalPrompt}"`,
      `"${item.matchedPrompt}"`
    ]);

    return [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Metadata Generator</h2>

      <div>
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            icon={<FolderOpen className="w-5 h-5"/>}
          >
            Bilder auswählen
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept="image/*"
          />

          {imageFiles.length > 0 && (
            <span className="text-sm text-gray-600">
              {imageFiles.length} Dateien ausgewählt
            </span>
          )}
        </div>

        {imageFiles.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
            <h4 className="font-medium mb-2">Ausgewählte Dateien:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {imageFiles.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <Button
          onClick={generateMetadata}
          disabled={isGenerating || imageFiles.length === 0}
          className="w-full"
          isLoading={isGenerating}
          icon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin"/> : undefined}
        >
          {isGenerating ? 'Generiere Metadaten...' : 'Metadaten generieren'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {unmatchedFiles.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 mb-3">
            <AlertCircle className="w-5 h-5"/>
            <h3 className="font-semibold">
              {unmatchedFiles.length} {unmatchedFiles.length === 1 ? 'Datei' : 'Dateien'} ohne Übereinstimmung
            </h3>
          </div>
          <div className="space-y-3">
            {unmatchedFiles.map((file, index) => (
              <div key={index} className="text-sm bg-white p-3 rounded border border-yellow-100">
                <p className="font-medium text-yellow-900">{file.filename}</p>
                <p className="text-yellow-800 mt-1">
                  <span className="font-medium">Extrahierter Prompt:</span> {file.originalPrompt}
                </p>
                <p className="text-yellow-700 mt-1">
                  <span className="font-medium">Ohne Umlaute:</span> {file.cleanedPrompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg border ${
          result.metadataGenerated === 0
            ? 'bg-red-50 border-red-200'
            : unmatchedFiles.length > 0
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            result.metadataGenerated === 0
              ? 'text-red-800'
              : unmatchedFiles.length > 0
                ? 'text-yellow-800'
                : 'text-green-800'
          }`}>
            {result.message}
          </h3>
          <div className="space-y-2 text-sm">
            <p>Verarbeitete Dateien: {result.filesProcessed}</p>
            <p>Erfolgreiche Zuordnungen: {result.metadataGenerated}</p>
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
  );
}