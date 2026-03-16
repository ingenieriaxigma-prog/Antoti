interface ThemeDecorationsProps {
  theme: string;
  position: 'header' | 'bottom';
  darkMode: boolean;
}

export default function ThemeDecorations({ theme, position, darkMode }: ThemeDecorationsProps) {
  // Only show decorations for themes with decorations
  if (!['blue', 'pink', 'rainbow', 'christmas'].includes(theme)) {
    return null;
  }

  // Increased opacity for better visibility
  const baseOpacity = darkMode ? 0.35 : 0.5;
  const isHeader = position === 'header';
  
  return (
    <>
      <style>{`
        @keyframes float-decoration {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(5deg);
          }
        }
        
        @keyframes pulse-decoration {
          0%, 100% {
            opacity: ${baseOpacity};
            transform: scale(1);
          }
          50% {
            opacity: ${baseOpacity * 1.4};
            transform: scale(1.1);
          }
        }
        
        .animate-float-decoration {
          animation: float-decoration 6s ease-in-out infinite;
        }
        
        .animate-pulse-decoration {
          animation: pulse-decoration 4s ease-in-out infinite;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* FEMININE THEME - Flowers and Butterflies */}
        {theme === 'pink' && (
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              {/* Small flower */}
              <g id="small-flower">
                <circle cx="0" cy="0" r="6" fill="currentColor" opacity={baseOpacity * 1.2} />
                <circle cx="-4" cy="-4" r="3" fill="currentColor" opacity={baseOpacity} />
                <circle cx="4" cy="-4" r="3" fill="currentColor" opacity={baseOpacity} />
                <circle cx="-4" cy="4" r="3" fill="currentColor" opacity={baseOpacity} />
                <circle cx="4" cy="4" r="3" fill="currentColor" opacity={baseOpacity} />
                <circle cx="0" cy="0" r="2" fill="white" opacity={baseOpacity * 1.5} />
              </g>
              
              {/* Butterfly */}
              <g id="small-butterfly">
                <ellipse cx="-3" cy="0" rx="4" ry="6" fill="currentColor" opacity={baseOpacity} />
                <ellipse cx="3" cy="0" rx="4" ry="6" fill="currentColor" opacity={baseOpacity} />
                <line x1="0" y1="-3" x2="0" y2="7" stroke="currentColor" strokeWidth="1.5" opacity={baseOpacity * 1.2} />
              </g>
              
              {/* Heart */}
              <g id="tiny-heart">
                <path d="M 0 2 Q -2 0, -4 2 Q -4 4, 0 6 Q 4 4, 4 2 Q 2 0, 0 2 Z" fill="currentColor" opacity={baseOpacity} />
              </g>
            </defs>
            
            <g className="text-pink-400 dark:text-pink-300">
              {isHeader ? (
                <>
                  {/* Header decorations - CENTER AREA between text and icons */}
                  {/* Top row */}
                  <use href="#small-flower" x="30%" y="25%" className="animate-float-decoration" style={{ animationDelay: '0s' }} />
                  <use href="#small-butterfly" x="45%" y="20%" className="animate-float-decoration" style={{ animationDelay: '0.7s' }} />
                  <use href="#tiny-heart" x="60%" y="25%" className="animate-pulse-decoration" style={{ animationDelay: '1.2s' }} />
                  
                  {/* Middle row */}
                  <use href="#tiny-heart" x="35%" y="50%" className="animate-pulse-decoration" style={{ animationDelay: '0.4s' }} />
                  <use href="#small-flower" x="50%" y="55%" className="animate-float-decoration" style={{ animationDelay: '1.5s' }} />
                  <use href="#small-butterfly" x="65%" y="50%" className="animate-float-decoration" style={{ animationDelay: '0.9s' }} />
                  
                  {/* Bottom row */}
                  <use href="#tiny-heart" x="40%" y="80%" className="animate-pulse-decoration" style={{ animationDelay: '1.8s' }} />
                  <use href="#small-flower" x="55%" y="75%" className="animate-float-decoration" style={{ animationDelay: '0.3s' }} />
                  <use href="#tiny-heart" x="70%" y="80%" className="animate-pulse-decoration" style={{ animationDelay: '1.0s' }} />
                </>
              ) : (
                <>
                  {/* Bottom nav decorations */}
                  <use href="#small-flower" x="15%" y="50%" className="animate-float-decoration" style={{ animationDelay: '0.3s' }} />
                  <use href="#small-flower" x="85%" y="40%" className="animate-float-decoration" style={{ animationDelay: '1.3s' }} />
                  <use href="#small-butterfly" x="35%" y="55%" className="animate-float-decoration" style={{ animationDelay: '0.8s' }} />
                  <use href="#small-butterfly" x="65%" y="45%" className="animate-float-decoration" style={{ animationDelay: '1.8s' }} />
                  <use href="#tiny-heart" x="50%" y="30%" className="animate-pulse-decoration" style={{ animationDelay: '0.5s' }} />
                  <use href="#tiny-heart" x="5%" y="70%" className="animate-pulse-decoration" style={{ animationDelay: '2.5s' }} />
                  <use href="#tiny-heart" x="95%" y="70%" className="animate-pulse-decoration" style={{ animationDelay: '1.5s' }} />
                </>
              )}
            </g>
          </svg>
        )}

        {/* MASCULINE THEME - Geometric Shapes */}
        {theme === 'blue' && (
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              {/* Hexagon small */}
              <g id="hex-small">
                <polygon points="0,-8 7,-4 7,4 0,8 -7,4 -7,-4" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  opacity={baseOpacity} />
              </g>
              
              {/* Triangle small */}
              <g id="tri-small">
                <polygon points="0,-7 6,5 -6,5" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  opacity={baseOpacity} />
              </g>
              
              {/* Square rotated */}
              <g id="sq-small">
                <rect x="-5" y="-5" width="10" height="10" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  opacity={baseOpacity}
                  transform="rotate(45)" />
              </g>
              
              {/* Circle */}
              <g id="circ-small">
                <circle cx="0" cy="0" r="6" 
                  fill="currentColor" 
                  opacity={baseOpacity * 0.6} />
              </g>
            </defs>
            
            <g className="text-blue-500 dark:text-blue-400">
              {isHeader ? (
                <>
                  {/* Header decorations - CENTER AREA between text and icons */}
                  {/* Top row */}
                  <use href="#hex-small" x="30%" y="20%" className="animate-float-decoration" style={{ animationDelay: '0s' }} />
                  <use href="#tri-small" x="48%" y="28%" className="animate-float-decoration" style={{ animationDelay: '0.8s' }} />
                  <use href="#circ-small" x="65%" y="22%" className="animate-pulse-decoration" style={{ animationDelay: '1.3s' }} />
                  
                  {/* Middle row */}
                  <use href="#sq-small" x="35%" y="52%" className="animate-pulse-decoration" style={{ animationDelay: '0.5s' }} />
                  <use href="#hex-small" x="52%" y="48%" className="animate-float-decoration" style={{ animationDelay: '1.6s' }} />
                  <use href="#tri-small" x="68%" y="55%" className="animate-float-decoration" style={{ animationDelay: '1.0s' }} />
                  
                  {/* Bottom row */}
                  <use href="#circ-small" x="40%" y="78%" className="animate-pulse-decoration" style={{ animationDelay: '1.9s' }} />
                  <use href="#sq-small" x="56%" y="82%" className="animate-pulse-decoration" style={{ animationDelay: '0.3s' }} />
                  <use href="#hex-small" x="72%" y="75%" className="animate-float-decoration" style={{ animationDelay: '1.2s' }} />
                </>
              ) : (
                <>
                  {/* Bottom nav decorations */}
                  <use href="#hex-small" x="10%" y="50%" className="animate-float-decoration" style={{ animationDelay: '0.3s' }} />
                  <use href="#hex-small" x="90%" y="50%" className="animate-float-decoration" style={{ animationDelay: '1.3s' }} />
                  <use href="#tri-small" x="30%" y="30%" className="animate-float-decoration" style={{ animationDelay: '0.8s' }} />
                  <use href="#tri-small" x="70%" y="70%" className="animate-float-decoration" style={{ animationDelay: '1.8s' }} />
                  <use href="#sq-small" x="50%" y="50%" className="animate-pulse-decoration" style={{ animationDelay: '0.5s' }} />
                  <use href="#circ-small" x="20%" y="60%" className="animate-pulse-decoration" style={{ animationDelay: '2.5s' }} />
                  <use href="#circ-small" x="80%" y="40%" className="animate-pulse-decoration" style={{ animationDelay: '1.5s' }} />
                </>
              )}
            </g>
          </svg>
        )}

        {/* LGBT+ THEME - Rainbow Elements */}
        {theme === 'rainbow' && (
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              {/* Rainbow gradients */}
              <linearGradient id={`rainbow-${position}-1`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff0000" stopOpacity={baseOpacity} />
                <stop offset="33%" stopColor="#ffdd00" stopOpacity={baseOpacity} />
                <stop offset="66%" stopColor="#0088ff" stopOpacity={baseOpacity} />
                <stop offset="100%" stopColor="#8800ff" stopOpacity={baseOpacity} />
              </linearGradient>
              
              <linearGradient id={`rainbow-${position}-2`} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff00ff" stopOpacity={baseOpacity} />
                <stop offset="33%" stopColor="#00ff00" stopOpacity={baseOpacity} />
                <stop offset="66%" stopColor="#ff7700" stopOpacity={baseOpacity} />
                <stop offset="100%" stopColor="#ff0000" stopOpacity={baseOpacity} />
              </linearGradient>
              
              <linearGradient id={`rainbow-${position}-3`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8800ff" stopOpacity={baseOpacity} />
                <stop offset="50%" stopColor="#00ff00" stopOpacity={baseOpacity} />
                <stop offset="100%" stopColor="#ff7700" stopOpacity={baseOpacity} />
              </linearGradient>
              
              {/* Heart small */}
              <g id="rainbow-heart-small">
                <path d="M 0 3 Q -3 0, -6 3 Q -6 6, 0 10 Q 6 6, 6 3 Q 3 0, 0 3 Z" 
                  fill={`url(#rainbow-${position}-1)`} />
              </g>
              
              {/* Star small */}
              <g id="rainbow-star-small">
                <path d="M 0 -8 L 2 -2 L 8 -2 L 3 1 L 5 7 L 0 3 L -5 7 L -3 1 L -8 -2 L -2 -2 Z" 
                  fill={`url(#rainbow-${position}-2)`} />
              </g>
              
              {/* Circle small */}
              <g id="rainbow-circle-small">
                <circle cx="0" cy="0" r="6" fill={`url(#rainbow-${position}-3)`} />
              </g>
            </defs>
            
            {isHeader ? (
              <>
                {/* Header decorations */}
                <use href="#rainbow-star-small" x="32%" y="22%" className="animate-pulse-decoration" style={{ animationDelay: '0.5s' }} />
                <use href="#rainbow-circle-small" x="50%" y="28%" className="animate-float-decoration" style={{ animationDelay: '0.7s' }} />
                <use href="#rainbow-heart-small" x="68%" y="25%" className="animate-float-decoration" style={{ animationDelay: '1s' }} />
                
                {/* Middle row */}
                <use href="#rainbow-heart-small" x="38%" y="52%" className="animate-float-decoration" style={{ animationDelay: '0s' }} />
                <use href="#rainbow-star-small" x="55%" y="48%" className="animate-pulse-decoration" style={{ animationDelay: '1.5s' }} />
                <use href="#rainbow-circle-small" x="72%" y="55%" className="animate-float-decoration" style={{ animationDelay: '1.2s' }} />
                
                {/* Bottom row */}
                <use href="#rainbow-circle-small" x="42%" y="78%" className="animate-float-decoration" style={{ animationDelay: '2s' }} />
                <use href="#rainbow-heart-small" x="58%" y="82%" className="animate-float-decoration" style={{ animationDelay: '0.3s' }} />
                <use href="#rainbow-star-small" x="75%" y="75%" className="animate-pulse-decoration" style={{ animationDelay: '1.8s' }} />
              </>
            ) : (
              <>
                {/* Bottom nav decorations */}
                <use href="#rainbow-heart-small" x="10%" y="50%" className="animate-float-decoration" style={{ animationDelay: '0.3s' }} />
                <use href="#rainbow-heart-small" x="90%" y="50%" className="animate-float-decoration" style={{ animationDelay: '1.3s' }} />
                <use href="#rainbow-star-small" x="30%" y="30%" className="animate-pulse-decoration" style={{ animationDelay: '0.8s' }} />
                <use href="#rainbow-star-small" x="50%" y="70%" className="animate-pulse-decoration" style={{ animationDelay: '1.8s' }} />
                <use href="#rainbow-star-small" x="70%" y="30%" className="animate-pulse-decoration" style={{ animationDelay: '0.3s' }} />
                <use href="#rainbow-circle-small" x="20%" y="60%" className="animate-float-decoration" style={{ animationDelay: '2s' }} />
                <use href="#rainbow-circle-small" x="80%" y="40%" className="animate-float-decoration" style={{ animationDelay: '1s' }} />
              </>
            )}
          </svg>
        )}

        {/* CHRISTMAS THEME - Snowflakes and Stars */}
        {theme === 'christmas' && (
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              {/* Snowflake */}
              <g id="snowflake-small">
                {/* Center */}
                <circle cx="0" cy="0" r="1.5" fill="currentColor" opacity={baseOpacity * 1.2} />
                {/* Main arms */}
                <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" strokeWidth="1.2" opacity={baseOpacity} />
                <line x1="-6" y1="0" x2="6" y2="0" stroke="currentColor" strokeWidth="1.2" opacity={baseOpacity} />
                {/* Diagonal arms */}
                <line x1="-4.5" y1="-4.5" x2="4.5" y2="4.5" stroke="currentColor" strokeWidth="1.2" opacity={baseOpacity} />
                <line x1="4.5" y1="-4.5" x2="-4.5" y2="4.5" stroke="currentColor" strokeWidth="1.2" opacity={baseOpacity} />
                {/* Branch details */}
                <line x1="0" y1="-6" x2="-2" y2="-4" stroke="currentColor" strokeWidth="0.8" opacity={baseOpacity * 0.8} />
                <line x1="0" y1="-6" x2="2" y2="-4" stroke="currentColor" strokeWidth="0.8" opacity={baseOpacity * 0.8} />
                <line x1="0" y1="6" x2="-2" y2="4" stroke="currentColor" strokeWidth="0.8" opacity={baseOpacity * 0.8} />
                <line x1="0" y1="6" x2="2" y2="4" stroke="currentColor" strokeWidth="0.8" opacity={baseOpacity * 0.8} />
              </g>
              
              {/* Christmas Star */}
              <g id="christmas-star-small">
                <path d="M 0 -7 L 1.5 -2 L 7 -2 L 2.5 1 L 4 6 L 0 3 L -4 6 L -2.5 1 L -7 -2 L -1.5 -2 Z" 
                  fill="currentColor" 
                  opacity={baseOpacity * 1.1} />
                <circle cx="0" cy="0" r="1.5" fill="white" opacity={baseOpacity * 1.3} />
              </g>
              
              {/* Holly berry */}
              <g id="holly-berry">
                <circle cx="0" cy="0" r="2.5" fill="#dc2626" opacity={baseOpacity * 1.2} />
                <circle cx="-3" cy="2" r="2" fill="#dc2626" opacity={baseOpacity} />
                <circle cx="3" cy="2" r="2" fill="#dc2626" opacity={baseOpacity} />
              </g>
              
              {/* Christmas Tree */}
              <g id="christmas-tree">
                {/* Tree layers - green */}
                <polygon points="0,-7 -5,-2 -3,-2 -6,2 -4,2 -7,6 7,6 4,2 6,2 3,-2 5,-2" 
                  fill="#2e7d32" 
                  opacity={baseOpacity * 1.2} />
                {/* Trunk - brown */}
                <rect x="-1.5" y="6" width="3" height="3" fill="#795548" opacity={baseOpacity * 1.1} />
                {/* Star on top - yellow */}
                <path d="M 0 -8 L 0.5 -7 L 1.5 -7 L 0.7 -6.3 L 1 -5.3 L 0 -6 L -1 -5.3 L -0.7 -6.3 L -1.5 -7 L -0.5 -7 Z" 
                  fill="#ffd700" 
                  opacity={baseOpacity * 1.3} />
                {/* Ornaments - red circles */}
                <circle cx="-3" cy="1" r="1" fill="#dc2626" opacity={baseOpacity * 1.2} />
                <circle cx="2" cy="0" r="1" fill="#dc2626" opacity={baseOpacity * 1.2} />
                <circle cx="0" cy="3" r="1" fill="#dc2626" opacity={baseOpacity * 1.2} />
              </g>
              
              {/* Candy Cane */}
              <g id="candy-cane">
                {/* Main cane shape - white base */}
                <path d="M 0 -7 Q 3 -7, 3 -4 Q 3 -2, 1 -1 L 1 6" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  fill="none" 
                  opacity={baseOpacity * 1.1}
                  strokeLinecap="round" />
                {/* Red stripes */}
                <line x1="0.5" y1="-6.5" x2="1.5" y2="-5.5" stroke="#dc2626" strokeWidth="2" opacity={baseOpacity * 1.2} strokeLinecap="round" />
                <line x1="2" y1="-3.5" x2="2.5" y2="-2.5" stroke="#dc2626" strokeWidth="2" opacity={baseOpacity * 1.2} strokeLinecap="round" />
                <line x1="1" y1="0" x2="1" y2="1.5" stroke="#dc2626" strokeWidth="2" opacity={baseOpacity * 1.2} strokeLinecap="round" />
                <line x1="1" y1="3" x2="1" y2="4.5" stroke="#dc2626" strokeWidth="2" opacity={baseOpacity * 1.2} strokeLinecap="round" />
              </g>
            </defs>
            
            <g className="text-white">
              {isHeader ? (
                <>
                  {/* Header decorations - CENTER AREA between text and icons */}
                  {/* Top row - mix of all decorations */}
                  <use href="#christmas-tree" x="28%" y="18%" className="animate-float-decoration" style={{ animationDelay: '0s' }} />
                  <use href="#snowflake-small" x="38%" y="22%" className="animate-float-decoration" style={{ animationDelay: '0.4s' }} />
                  <use href="#candy-cane" x="48%" y="20%" className="animate-pulse-decoration" style={{ animationDelay: '0.7s' }} />
                  <use href="#christmas-star-small" x="58%" y="24%" className="animate-pulse-decoration" style={{ animationDelay: '1s' }} />
                  <use href="#snowflake-small" x="68%" y="20%" className="animate-float-decoration" style={{ animationDelay: '1.3s' }} />
                  
                  {/* Middle row - more decorations */}
                  <use href="#holly-berry" x="32%" y="48%" className="animate-float-decoration" style={{ animationDelay: '0.4s' }} />
                  <use href="#christmas-tree" x="42%" y="52%" className="animate-float-decoration" style={{ animationDelay: '1s' }} />
                  <use href="#snowflake-small" x="52%" y="50%" className="animate-float-decoration" style={{ animationDelay: '1.6s' }} />
                  <use href="#candy-cane" x="62%" y="48%" className="animate-pulse-decoration" style={{ animationDelay: '0.6s' }} />
                  <use href="#christmas-star-small" x="72%" y="52%" className="animate-pulse-decoration" style={{ animationDelay: '0.9s' }} />
                  
                  {/* Bottom row - completing the festive look */}
                  <use href="#snowflake-small" x="35%" y="78%" className="animate-float-decoration" style={{ animationDelay: '1.9s' }} />
                  <use href="#candy-cane" x="45%" y="75%" className="animate-pulse-decoration" style={{ animationDelay: '0.2s' }} />
                  <use href="#holly-berry" x="55%" y="77%" className="animate-float-decoration" style={{ animationDelay: '0.3s' }} />
                  <use href="#christmas-tree" x="65%" y="80%" className="animate-float-decoration" style={{ animationDelay: '1.5s' }} />
                  <use href="#christmas-star-small" x="75%" y="76%" className="animate-pulse-decoration" style={{ animationDelay: '1.2s' }} />
                </>
              ) : (
                <>
                  {/* Bottom nav decorations */}
                  <use href="#christmas-tree" x="12%" y="50%" className="animate-float-decoration" style={{ animationDelay: '0.3s' }} />
                  <use href="#snowflake-small" x="20%" y="35%" className="animate-float-decoration" style={{ animationDelay: '0.8s' }} />
                  <use href="#candy-cane" x="30%" y="55%" className="animate-pulse-decoration" style={{ animationDelay: '1.2s' }} />
                  <use href="#christmas-star-small" x="40%" y="30%" className="animate-pulse-decoration" style={{ animationDelay: '0.5s' }} />
                  <use href="#holly-berry" x="50%" y="50%" className="animate-float-decoration" style={{ animationDelay: '0.5s' }} />
                  <use href="#candy-cane" x="60%" y="35%" className="animate-pulse-decoration" style={{ animationDelay: '1.5s' }} />
                  <use href="#christmas-star-small" x="70%" y="60%" className="animate-pulse-decoration" style={{ animationDelay: '1.8s' }} />
                  <use href="#christmas-tree" x="80%" y="45%" className="animate-float-decoration" style={{ animationDelay: '1.0s' }} />
                  <use href="#snowflake-small" x="88%" y="65%" className="animate-float-decoration" style={{ animationDelay: '2.2s' }} />
                </>
              )}
            </g>
          </svg>
        )}
      </div>
    </>
  );
}