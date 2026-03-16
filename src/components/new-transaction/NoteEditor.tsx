import { memo } from 'react';

/**
 * NoteEditor Component
 * 
 * Textarea for note input.
 * Memoized to prevent re-renders when other values change.
 * 
 * @param {string} value - Note text value
 * @param {Function} onChange - Note change handler
 */

interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const NoteEditor = memo<NoteEditorProps>(
  ({ value, onChange }) => {
    return (
      <div className="pb-96">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe una nota..."
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-600 rounded-xl text-gray-900 dark:text-white min-h-[200px] resize-none shadow-sm"
          autoFocus
          style={{
            fontSize: '16px', // Prevents zoom on iOS
          }}
        />
      </div>
    );
  },
  // Custom comparison: only re-render if value changes
  (prevProps, nextProps) => {
    return prevProps.value === nextProps.value;
  }
);

NoteEditor.displayName = 'NoteEditor';

export default NoteEditor;
