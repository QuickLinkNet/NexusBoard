import React, {useState, useRef} from 'react';
import {FileDown, FolderOpen, RefreshCw} from 'lucide-react';
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

export function MetadataGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
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
  };

  const generateMetadata = async () => {
    if (imageFiles.length === 0) {
      setError('Keine Bilder gefunden');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const promptsResponse = await apiService.getPrompts();
      const prompts = promptsResponse.prompts || [];

      if (prompts.length === 0) {
        throw new Error('Keine Prompts gefunden. Bitte fügen Sie zuerst Prompts hinzu.');
      }

      const metadata = imageFiles.map(imageName => {
        let promptParts: string[];
        let promptText = '';

        if (imageName.startsWith('quicklink_')) {
          promptParts = imageName.split('_').slice(1, -2);
          promptText = promptParts.join(' ');
        } else if (imageName.startsWith('drunkenmunkey1986_86250_')) {
          promptParts = imageName.split('_').slice(2, -2);
          promptText = promptParts.join(' ');
        } else {
          const nameWithoutExt = imageName.replace(/\.[^/.]+$/, "");
          promptText = nameWithoutExt.replace(/_[a-f0-9-]+$/, "").replace(/_/g, ' ');
        }

        const promptMatch = prompts.find(prompt =>
          prompt.prompt.toLowerCase().includes(promptText.toLowerCase())
        );

        return {
          filename: imageName,
          title: promptMatch?.title || 'Kein passender Prompt gefunden',
          keywords: promptMatch?.keywords || '',
          category: "8",
          releases: ""
        };
      });

      const csvContent = generateCSV(metadata);
      const jsonContent = JSON.stringify(metadata, null, 2);

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
    const rows = metadata.map(item => [
      item.filename,
      item.title,
      `"${item.keywords}"`,
      item.category,
      item.releases
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

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
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
  );
}