import React from 'react';
import {Card} from '../../molecules/Card/Card';
import {PromptManager} from './components/PromptManager';
import {MetadataGenerator} from './components/MetadataGenerator';

export function PromptsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prompt Management</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <PromptManager/>
        </Card>

        <Card>
          <MetadataGenerator/>
        </Card>
      </div>
    </div>
  );
}