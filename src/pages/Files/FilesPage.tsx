import React from 'react';
import {Card} from '../../molecules/Card/Card';
import {FileUploader} from './components/FileUploader';
import {FileList} from './components/FileList';

export function FilesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dateiverwaltung</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <FileUploader/>
        </Card>

        <Card>
          <FileList/>
        </Card>
      </div>
    </div>
  );
}