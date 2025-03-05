import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PromptManager } from '../dashboard-components/PromptManagement/PromptManagement';
import { MetadataManagement } from '../dashboard-components/MetadataManagement/MetadataManagement';

export function PromptManagement() {
  const [activeTab, setActiveTab] = useState('prompts');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prompt Management</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="metadata">Metadata Generator</TabsTrigger>
        </TabsList>
        <TabsContent value="prompts" className="mt-0">
          <div className="bg-white rounded-lg shadow">
            <PromptManager />
          </div>
        </TabsContent>
        <TabsContent value="metadata" className="mt-0">
          <div className="bg-white rounded-lg shadow">
            <MetadataManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}