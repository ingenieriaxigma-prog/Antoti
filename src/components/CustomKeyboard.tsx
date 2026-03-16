import { Delete } from 'lucide-react';

interface CustomKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}

export default function CustomKeyboard({ value, onChange, onClose }: CustomKeyboardProps) {
  const handleNumberClick = (num: string) => {
    onChange(value + num);
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const handleDecimal = () => {
    if (!value.includes('.')) {
      onChange(value + '.');
    }
  };

  // Format number with thousands separator
  const formatNumber = (num: string) => {
    if (!num) return '0';
    
    const parts = num.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add thousands separator
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return decimalPart !== undefined ? `${formatted}.${decimalPart}` : formatted;
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black flex flex-col h-full px-3 sm:px-4 py-4 pb-8">
      {/* Control Buttons - Compacto arriba con botón OK */}
      <div className="flex items-center justify-between mb-3 min-[390px]:mb-2 px-2 gap-2">
        <button
          onClick={handleClear}
          className="px-4 min-[390px]:px-3 py-2.5 min-[390px]:py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl min-[390px]:rounded-lg transition-all text-sm min-[390px]:text-xs font-medium shadow-lg hover:shadow-red-500/50 tap-scale"
        >
          Limpiar
        </button>
        
        <button
          onClick={onClose}
          className="flex-1 max-w-[140px] min-[390px]:max-w-[120px] py-2.5 min-[390px]:py-2 bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 active:from-orange-700 active:to-pink-700 text-white rounded-xl min-[390px]:rounded-lg transition-all text-sm min-[390px]:text-xs font-semibold shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 tap-scale flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-pink-500"
          disabled={!value || parseFloat(value) === 0}
          title="Confirmar monto"
        >
          <span className="text-lg min-[390px]:text-base">✓</span>
          <span>OK</span>
        </button>
        
        <button
          onClick={handleDelete}
          className="p-2.5 min-[390px]:p-2 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white rounded-xl min-[390px]:rounded-lg transition-all shadow-lg tap-scale"
        >
          <Delete className="w-6 h-6 min-[390px]:w-5 min-[390px]:h-5" />
        </button>
      </div>

      {/* Keypad Simplificado - Más compacto en móviles grandes */}
      <div className="flex-1 grid grid-cols-3 gap-3 min-[390px]:gap-2.5 auto-rows-fr pb-6 min-[390px]:pb-4">
        {/* Row 1: 7, 8, 9 */}
        <button
          onClick={() => handleNumberClick('7')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          7
        </button>
        <button
          onClick={() => handleNumberClick('8')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          8
        </button>
        <button
          onClick={() => handleNumberClick('9')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          9
        </button>

        {/* Row 2: 4, 5, 6 */}
        <button
          onClick={() => handleNumberClick('4')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          4
        </button>
        <button
          onClick={() => handleNumberClick('5')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          5
        </button>
        <button
          onClick={() => handleNumberClick('6')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          6
        </button>

        {/* Row 3: 1, 2, 3 */}
        <button
          onClick={() => handleNumberClick('1')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          1
        </button>
        <button
          onClick={() => handleNumberClick('2')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          2
        </button>
        <button
          onClick={() => handleNumberClick('3')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          3
        </button>

        {/* Row 4: ., 0, 00 */}
        <button
          onClick={handleDecimal}
          className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-400 active:to-blue-500 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          .
        </button>
        <button
          onClick={() => handleNumberClick('0')}
          className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 text-white text-4xl min-[390px]:text-8xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          0
        </button>
        <button
          onClick={() => handleNumberClick('00')}
          className="bg-gradient-to-br from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 active:from-orange-400 active:to-pink-400 text-white text-4xl min-[390px]:text-7xl rounded-2xl min-[390px]:rounded-xl transition-all shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 active:scale-95 font-light flex items-center justify-center"
        >
          00
        </button>
      </div>
    </div>
  );
}