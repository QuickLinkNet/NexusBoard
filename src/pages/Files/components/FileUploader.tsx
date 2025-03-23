import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {Upload, X} from 'lucide-react';
import {Button} from '../../../atoms/Button/Button';
import {apiService} from '../../../services/api/apiService';

export function FileUploader() {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files[]', file);
      });

      await apiService.uploadFiles(formData);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, []);

  const {getRootProps, getInputProps, isDragActive, acceptedFiles, removeFile} = useDropzone({
    onDrop,
    maxSize: 10485760 // 10MB
  });

  return (
    <div className="p-6 space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400"/>
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Dateien hier ablegen...'
            : 'Dateien hierher ziehen oder klicken zum Auswählen'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Maximale Dateigröße: 10MB
        </p>
      </div>

      {acceptedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Ausgewählte Dateien
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => acceptedFiles.forEach(removeFile)}
            >
              Alle entfernen
            </Button>
          </div>
          <ul className="space-y-2">
            {acceptedFiles.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between bg-white p-2 rounded border"
              >
                <div className="flex items-center">
                  <span className="text-sm text-gray-900">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4"/>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}