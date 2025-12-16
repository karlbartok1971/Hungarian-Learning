
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, ArrowRight, BookOpen, Table, Grid } from 'lucide-react';
import { BibleLink } from '@/components/bible/BibleLink';

interface Example {
  hu: string;
  ko: string;
  context?: string;
}

interface GrammarRule {
  title: string;
  description: string;
  pattern?: string;
  examples?: Example[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

interface GrammarVisualizationProps {
  rules: GrammarRule[];
}

export const GrammarVisualization: React.FC<GrammarVisualizationProps> = ({ rules }) => {
  if (!rules || rules.length === 0) return null;

  return (
    <div className="space-y-6">
      {rules.map((rule, idx) => (
        <Card key={idx} className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-800">{rule.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Description */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              <BibleLink text={rule.description} />
            </p>

            {/* Table Visualization (For conjugation, declension) */}
            {rule.table && (
              <div className="mt-4 border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b px-4 py-2 flex items-center gap-2">
                  <Grid className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">활용표</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        {rule.table.headers.map((header, hIdx) => (
                          <th key={hIdx} className="px-6 py-3 whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rule.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="bg-white border-b last:border-0 hover:bg-gray-50">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-6 py-4 ${cIdx === 0 ? 'font-medium text-gray-900 bg-gray-50/50' : 'text-gray-600'}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pattern Visualization */}
            {rule.pattern && !rule.table && (
              <div className="bg-gray-900 rounded-xl p-4 text-white font-mono text-sm sm:text-base relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Layers className="h-16 w-16" />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <span className="text-blue-400 font-bold shrink-0">PATTERN</span>
                  <div className="h-4 w-px bg-gray-700"></div>
                  <span className="text-green-300 font-medium tracking-wide">
                    {rule.pattern}
                  </span>
                </div>
              </div>
            )}

            {/* Examples Grid */}
            {rule.examples && rule.examples.length > 0 && (
              <div className="mt-4">
                {/* Only show label if there isn't a table right above, purely aesthetic */}
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  <BookOpen className="h-4 w-4" />
                  실전 예문
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {rule.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="bg-white border rounded-lg p-3 hover:border-blue-300 transition-colors group relative"
                    >
                      {ex.context && (
                        <Badge
                          variant="outline"
                          className="mb-2 text-[10px] text-gray-500 border-gray-200"
                        >
                          {ex.context}
                        </Badge>
                      )}
                      <p className="font-medium text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">
                        {ex.hu}
                      </p>
                      <p className="text-sm text-gray-600">
                        <BibleLink text={ex.ko} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
