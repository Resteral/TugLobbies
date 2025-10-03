/**
 * Results Webhook Console
 * Paste CSV match results, validate/preview, and apply locally (ELO updates + records).
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TextareaHTMLAttributes } from 'react';
import { CSVParser, CSVMatchData } from '../../utils/csv-parser';
import { applyMatchesAndSave } from '../../services/players-store';
import { Upload, CheckCircle, AlertCircle, ListChecks } from 'lucide-react';

/**
 * A small controlled textarea to avoid repeating props.
 */
function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        'w-full h-40 bg-gray-800 border border-gray-600 rounded p-3 text-white text-sm font-mono resize-none focus:border-blue-500 focus:outline-none ' +
        (props.className || '')
      }
    />
  );
}

/**
 * ResultsWebhookConsole component
 * Validates and applies pasted CSV match results on the client.
 */
export default function ResultsWebhookConsole() {
  const [csvText, setCsvText] = useState('');
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] } | null>(
    null
  );
  const [parsed, setParsed] = useState<CSVMatchData[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'validated' | 'applied' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const sampleCSV = useMemo(
    () =>
      `player1Name,player2Name,winner,date,duration,map,gameType
ZealotMaster,HockeyPro,ZealotMaster,2024-01-18,450,Zealot Arena,zealot-hockey
GoalGuardian,PuckHunter,PuckHunter,2024-01-18,380,Ice Hockey Map,3v3-hockey`,
    []
  );

  const onValidate = () => {
    const result = CSVParser.validateMatchCSV(csvText);
    setValidation(result);
    if (result.isValid) {
      const matches = CSVParser.parseMatchData(csvText);
      setParsed(matches);
      setStatus('validated');
      setMessage(`Validated: ${matches.length} matches`);
    } else {
      setParsed(null);
      setStatus('error');
      setMessage('CSV validation failed');
    }
  };

  const onApply = () => {
    if (!parsed || parsed.length === 0) {
      setStatus('error');
      setMessage('No parsed matches to apply');
      return;
    }

    // Apply to local players store
    const reduced = parsed.map((m) => ({
      player1Name: m.player1Name,
      player2Name: m.player2Name,
      winner: m.winner,
    }));
    applyMatchesAndSave(reduced);

    setStatus('applied');
    setMessage(`Applied ${parsed.length} matches to ELO and records`);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <ListChecks className="w-5 h-5 text-blue-400" />
          <span>Results Webhook Console</span>
          <Badge className="bg-blue-600">Local</Badge>
        </CardTitle>
        <CardDescription className="text-slate-300">
          Paste CSV match results, validate, and apply ELO updates locally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-blue-300">CSV Match Results</label>
            <Button
              variant="outline"
              className="bg-transparent border-blue-600 text-blue-300 hover:bg-blue-600 hover:text-white"
              onClick={() => setCsvText(sampleCSV)}
            >
              Load Sample
            </Button>
          </div>
          <TextArea
            placeholder={`Paste your match data here...\n${sampleCSV}`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <div className="text-right text-xs text-slate-400">
            {csvText.length > 0 ? `${csvText.split('\n').length} lines` : 'No data pasted'}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onValidate}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!csvText.trim()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Validate
          </Button>
          <Button
            onClick={onApply}
            variant="outline"
            className="bg-transparent border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            disabled={!parsed || parsed.length === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Apply Locally
          </Button>
        </div>

        {/* Validation status */}
        {validation && (
          <div
            className={`p-4 rounded-lg ${
              validation.isValid
                ? 'bg-green-500/10 border border-green-500'
                : 'bg-red-500/10 border border-red-500'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={validation.isValid ? 'text-green-400' : 'text-red-400'}>
                {validation.isValid ? 'CSV is valid' : 'CSV validation failed'}
              </span>
            </div>
            {validation.errors.length > 0 && (
              <ul className="text-red-400 text-sm space-y-1">
                {validation.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Preview */}
        {parsed && parsed.length > 0 && (
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <div className="text-white font-semibold mb-2">Preview ({parsed.length})</div>
            <div className="space-y-2 text-sm">
              {parsed.slice(0, 5).map((m, i) => (
                <div
                  key={`${m.player1Name}-${m.player2Name}-${i}`}
                  className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-700/60"
                >
                  <div className="text-slate-200">
                    {m.player1Name} vs {m.player2Name}
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-600">Winner: {m.winner}</Badge>
                  </div>
                </div>
              ))}
              {parsed.length > 5 && (
                <div className="text-slate-400 text-xs">
                  +{parsed.length - 5} more rows...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status message */}
        {status !== 'idle' && (
          <div
            className={`text-sm ${
              status === 'applied'
                ? 'text-green-400'
                : status === 'error'
                ? 'text-red-400'
                : 'text-blue-300'
            }`}
          >
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
