/**
 * CSV import component for match results and player data
 */

import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { CSVParser } from '../../utils/csv-parser';

interface CSVImporterProps {
  onImport: (data: any[]) => void;
  type: 'matches' | 'players';
}

export const CSVImporter: React.FC<CSVImporterProps> = ({ onImport, type }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [pasteText, setPasteText] = useState('');

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const validationResult = type === 'matches' 
        ? CSVParser.validateMatchCSV(csvText)
        : CSVParser.validatePlayerCSV(csvText);
      setValidation(validationResult);

      if (validationResult.isValid) {
        const parsedData = type === 'matches' 
          ? CSVParser.parseMatchData(csvText)
          : CSVParser.parsePlayerData(csvText);
        onImport(parsedData);
      }
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
    if (type === 'matches') {
      return `player1Name,player2Name,winner,duration,map,gameType
Player1,Player2,Player1,450,Zealot Arena,zealot-hockey
Player3,Player4,Player4,380,Ice Hockey Map,3v3-hockey
Player5,Player6,Player5,520,StarCraft Arena,starcraft-1v1`;
    }
    return `name,elo,matchesPlayed,wins,losses,winRate,lastPlayed,joinDate
Player1,1450,25,18,7,72,2024-01-15,2024-01-01
Player2,1380,22,15,7,68,2024-01-14,2024-01-02
Player3,1320,20,12,8,60,2024-01-13,2024-01-03`;
  };

  const handleLoadSample = () => {
    setPasteText(getExampleCSV());
  };

  const handleImportPastedData = () => {
    if (pasteText.trim()) {
      const validationResult = type === 'matches' 
        ? CSVParser.validateMatchCSV(pasteText)
        : CSVParser.validatePlayerCSV(pasteText);
      setValidation(validationResult);

      if (validationResult.isValid) {
        const parsedData = type === 'matches' 
          ? CSVParser.parseMatchData(pasteText)
          : CSVParser.parsePlayerData(pasteText);
        onImport(parsedData);
        setPasteText('');
      }
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Upload className="w-5 h-5 text-blue-400" />
          <span>Import {type === 'matches' ? 'Match' : 'Player'} Data</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload CSV file with {type} data to import into the system
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
            Supported format: .csv with appropriate columns
          </p>
          <Button
            onClick={handleFileButtonClick}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select CSV File
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
            <span>Or Paste CSV Text Directly</span>
          </h4>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={type === 'matches' 
              ? `Paste your match data here...
player1Name,player2Name,winner,duration,map,gameType
Player1,Player2,Player1,450,Zealot Arena,zealot-hockey`
              : `Paste your player data here...
name,elo,matchesPlayed,wins,losses,winRate,lastPlayed,joinDate
Player1,1450,25,18,7,72,2024-01-15,2024-01-01`}
            className="w-full h-32 bg-gray-800 border border-gray-600 rounded p-3 text-white text-sm font-mono resize-none focus:border-blue-500 focus:outline-none"
          />
          <div className="flex justify-between items-center mt-3">
            <div className="text-gray-400 text-sm">
              {pasteText.length > 0 ? `${pasteText.split('\n').length} lines` : 'Paste CSV data'}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleLoadSample}
                variant="outline"
                className="bg-transparent border-gray-600 hover:border-gray-400"
                size="sm"
              >
                Load Sample
              </Button>
              <Button
                onClick={handleImportPastedData}
                disabled={!pasteText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Pasted Data
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
                {validation.isValid ? 'CSV file is valid' : 'CSV validation failed'}
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
          <h4 className="text-white font-medium mb-2">Expected CSV Format:</h4>
          <pre className="text-gray-300 text-sm bg-gray-900 p-3 rounded overflow-x-auto">
            {getExampleCSV()}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};