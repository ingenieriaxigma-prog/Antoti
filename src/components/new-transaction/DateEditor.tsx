import { memo } from 'react';

/**
 * DateEditor Component
 * 
 * Date input field.
 * Memoized to prevent re-renders when other values change.
 * 
 * @param {string} value - Date value (ISO format)
 * @param {Function} onChange - Date change handler
 */

interface DateEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DateEditor = memo<DateEditorProps>(
  ({ value, onChange }) => {
    return (
      <div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-600 rounded-xl text-gray-900 dark:text-white shadow-sm"
          autoFocus
        />
      </div>
    );
  },
  // Custom comparison: only re-render if value changes
  (prevProps, nextProps) => {
    return prevProps.value === nextProps.value;
  }
);

DateEditor.displayName = 'DateEditor';

export default DateEditor;
