/**
 * Schema Validator Component
 * 
 * Validador interactivo de schemas Zod en tiempo real
 */

import { useState } from 'react';
import { CheckCircle2, XCircle, Code } from 'lucide-react';
import type { z } from 'zod';

interface SchemaValidatorProps {
  schema: z.ZodTypeAny;
  defaultData?: any;
  title?: string;
}

export function SchemaValidator({ schema, defaultData, title }: SchemaValidatorProps) {
  const [inputData, setInputData] = useState(
    JSON.stringify(defaultData || {}, null, 2)
  );
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    data?: any;
    error?: any;
  } | null>(null);

  const validateData = () => {
    try {
      const parsedData = JSON.parse(inputData);
      const result = schema.safeParse(parsedData);
      
      setValidationResult({
        success: result.success,
        data: result.success ? result.data : undefined,
        error: result.success ? undefined : result.error.format(),
      });
    } catch (error: any) {
      setValidationResult({
        success: false,
        error: { _errors: [error.message] },
      });
    }
  };

  return (
    <div className="space-y-4">
      {title && <h4 className="flex items-center gap-2">
        <Code className="size-5" />
        {title}
      </h4>}

      {/* Input Area */}
      <div>
        <label className="block text-sm mb-2">
          Datos a validar (JSON):
        </label>
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          className="w-full h-48 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder='{ "key": "value" }'
        />
      </div>

      {/* Validate Button */}
      <button
        onClick={validateData}
        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
      >
        Validar Schema
      </button>

      {/* Results */}
      {validationResult && (
        <div className={`p-4 rounded-lg border ${
          validationResult.success
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        }`}>
          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            {validationResult.success ? (
              <>
                <CheckCircle2 className="size-5 text-green-600" />
                <span className="text-green-600">✓ Validación exitosa</span>
              </>
            ) : (
              <>
                <XCircle className="size-5 text-red-600" />
                <span className="text-red-600">✗ Validación fallida</span>
              </>
            )}
          </div>

          {/* Success Data */}
          {validationResult.success && validationResult.data && (
            <div>
              <p className="text-sm mb-2">Datos validados:</p>
              <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto">
                {JSON.stringify(validationResult.data, null, 2)}
              </pre>
            </div>
          )}

          {/* Error Details */}
          {!validationResult.success && validationResult.error && (
            <div>
              <p className="text-sm mb-2 text-red-600">Errores encontrados:</p>
              <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto text-red-600">
                {JSON.stringify(validationResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
