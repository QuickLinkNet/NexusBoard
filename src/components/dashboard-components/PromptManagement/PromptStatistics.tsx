import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

interface Log {
  prompt_id: string;
  success_count: number;
  prompt_title: string;
}

interface PromptStatisticsProps {
  logs: Log[];
}

export function PromptStatistics({logs}: PromptStatisticsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Prompt Nutzungsstatistik</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={logs}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="prompt_title"/>
            <YAxis/>
            <Tooltip/>
            <Bar dataKey="success_count" fill="#3B82F6"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}