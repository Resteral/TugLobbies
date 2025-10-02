/**
 * Hockey statistics importer component for detailed match data
 */

import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Upload, FileText, AlertCircle, CheckCircle, Copy, Users } from 'lucide-react';
import { HockeyCSVParser } from '../../utils/hockey-csv-parser';
import { HockeyPlayerStats } from '../../types/hockey-stats';

interface HockeyStatsImporterProps {
  onImport: (data: HockeyPlayerStats[]) => void;
}

export const HockeyStatsImporter: React.FC<HockeyStatsImporterProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = (file: File) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const validationResult = HockeyCSVParser.validateHockeyStatsCSV(csvText);
      setValidation(validationResult);

      if (validationResult.isValid) {
        const parsedData = HockeyCSVParser.parseHockeyStatsData(csvText);
        const hockeyStats = HockeyCSVParser.convertToHockeyStats(parsedData);
        onImport(hockeyStats);
      }
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'text/csv') {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getExampleCSV = () => {
    return `1,1-S2-1-6820063,8,2,0,7,35,17,16,1.32,0,0,0,719,Player1
1,1-S2-1-10300134,1,1,1,4,33,16,22,1.13,0,0,0,719,Player2
2,1-S2-1-6820064,5,1,2,9,28,12,15,1.45,0,0,0,719,Player3
2,1-S2-1-10300135,3,0,1,6,31,14,18,1.20,0,0,0,719,Player4`;
  };

  const copyExampleToClipboard = () => {
    navigator.clipboard.writeText(getExampleCSV());
  };

  const handlePasteImport = () => {
    if (pasteText.trim()) {
      setIsImporting(true);
      const validationResult = HockeyCSVParser.validateHockeyStatsCSV(pasteText);
      setValidation(validationResult);

      if (validationResult.isValid) {
        const parsedData = HockeyCSVParser.parseHockeyStatsData(pasteText);
        const hockeyStats = HockeyCSVParser.convertToHockeyStats(parsedData);
        onImport(hockeyStats);
        setPasteText('');
      }
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span>Import Player Statistics</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload CSV file with player statistics or paste data directly. All participants will be imported as player stats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">
            Drag and drop your CSV file here, or click to browse
          </p>
          <p className="text-gray-400 text-sm mb-4">
            All player participants will be imported as individual player statistics
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isImporting}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? 'Importing Players...' : 'Select CSV File'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Text Paste Area */}
        <div className="border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
            <span>Or Paste Player Data Directly</span>
          </h4>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Paste your player statistics here...\nExample format:\n1,1-S2-1-6820063,8,2,0,7,35,17,16,1.32,0,0,0,719,Player1\n1,1-S2-1-10300134,1,1,1,4,33,16,22,1.13,0,0,0,719,Player2`}
            className="w-full h-32 bg-gray-800 border border-gray-600 rounded p-3 text-white text-sm font-mono resize-none focus:border-blue-500 focus:outline-none"
            disabled={isImporting}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="text-gray-400 text-sm">
              {pasteText.length > 0 ? `${pasteText.split('\n').length} player records` : 'Paste player data'}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={copyExampleToClipboard}
                variant="outline"
                className="bg-transparent border-gray-600 hover:border-gray-400"
                size="sm"
                disabled={isImporting}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Example
              </Button>
              <Button
                onClick={handlePasteImport}
                disabled={!pasteText.trim() || isImporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Player Data'}
              </Button>
            </div>
          </div>
        </div>

        {validation && (
          <div className={`p-4 rounded-lg ${
            validation.isValid ? 'bg-green-500/10 border border-green-500' : 'bg-red-500/10 border border-red-500'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={validation.isValid ? 'text-green-400' : 'text-red-400'}>
                {validation.isValid ? 'Player data is valid' : 'Player data validation failed'}
              </span>
            </div>
            {validation.errors.length > 0 && (
              <ul className="text-red-400 text-sm space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Expected Player Data Format:</h4>
          <p className="text-gray-400 text-sm mb-3">
            Each row represents a player participant with: Team, AccountID, Shots, Goals, Assists, Pickups, Passes, PassesReceived, Possession, ShotsAllowed, Saves, GoaltenderTime, SkaterTime, PlayerName
          </p>
          <pre className="text-gray-300 text-sm bg-gray-900 p-3 rounded overflow-x-auto">
            {getExampleCSV()}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}