/**
 * 📋 COMPONENTE DE MENSAJE ESTRUCTURADO DE OTI
 * 
 * Renderiza respuestas estructuradas con secciones diferenciadas:
 * diagnóstico, recomendaciones, acciones, etc.
 */

import { 
  Activity, AlertTriangle, CheckCircle2, Lightbulb, 
  TrendingUp, Zap, ArrowRight, ExternalLink, Eye, Edit, Plus 
} from 'lucide-react';
import { Button } from '../ui/button';
import type { StructuredResponse, ResponseSection, OtiAction } from '../../features/oti/types/structured-response.types';

interface StructuredMessageProps {
  response: StructuredResponse;
  onAction?: (action: OtiAction) => void;
}

export function StructuredMessage({ response, onAction }: StructuredMessageProps) {
  // Validación: Si no hay response o sections, no renderizar nada
  if (!response || !response.sections) {
    return null;
  }

  // Mapeo de tipos de sección a iconos y colores
  const getSectionStyle = (type: ResponseSection['type']) => {
    switch (type) {
      case 'diagnosis':
        return {
          Icon: Activity,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-700 dark:text-blue-300',
          iconColor: 'text-blue-500',
        };
      case 'recommendation':
        return {
          Icon: Lightbulb,
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          textColor: 'text-emerald-700 dark:text-emerald-300',
          iconColor: 'text-emerald-500',
        };
      case 'action':
        return {
          Icon: Zap,
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          textColor: 'text-purple-700 dark:text-purple-300',
          iconColor: 'text-purple-500',
        };
      case 'insight':
        return {
          Icon: TrendingUp,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          textColor: 'text-amber-700 dark:text-amber-300',
          iconColor: 'text-amber-500',
        };
      case 'warning':
        return {
          Icon: AlertTriangle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-700 dark:text-red-300',
          iconColor: 'text-red-500',
        };
      case 'success':
        return {
          Icon: CheckCircle2,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-300',
          iconColor: 'text-green-500',
        };
      default:
        return {
          Icon: Activity,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-700 dark:text-gray-300',
          iconColor: 'text-gray-500',
        };
    }
  };

  // Mapeo de tipos de acción a iconos
  const getActionIcon = (type: OtiAction['type']) => {
    switch (type) {
      case 'navigate':
        return ArrowRight;
      case 'create':
        return Plus;
      case 'view':
        return Eye;
      case 'edit':
        return Edit;
      case 'external':
        return ExternalLink;
      default:
        return ArrowRight;
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Resumen */}
      {response.summary && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <p className="text-sm text-gray-900 dark:text-white leading-relaxed font-medium">
            {response.summary}
          </p>
        </div>
      )}

      {/* Secciones */}
      {response.sections.filter(section => section && section.type).map((section, index) => {
        const style = getSectionStyle(section.type);
        const SectionIcon = style.Icon;

        return (
          <div
            key={index}
            className={`${style.bgColor} ${style.borderColor} border rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header de la sección */}
            <div className="flex items-center gap-2 mb-3">
              {section.icon ? (
                <span className="text-lg">{section.icon}</span>
              ) : (
                <SectionIcon className={`w-5 h-5 ${style.iconColor}`} />
              )}
              <h4 className={`font-semibold ${style.textColor}`}>
                {section.title}
              </h4>
            </div>

            {/* Contenido de la sección */}
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {section.content}
              </p>

              {/* Lista de items si existe */}
              {section.items && section.items.length > 0 && (
                <ul className="space-y-2 mt-3">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className={`mt-0.5 ${style.iconColor}`}>•</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}

      {/* Acciones disponibles */}
      {response.actions && response.actions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            Acciones rápidas
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {response.actions.map((action) => {
              const ActionIcon = getActionIcon(action.type);
              return (
                <Button
                  key={action.id}
                  onClick={() => onAction?.(action)}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-all group overflow-hidden"
                >
                  <div className="flex items-center gap-2 w-full min-w-0">
                    {action.icon && (
                      <span className="text-base flex-shrink-0">{action.icon}</span>
                    )}
                    <ActionIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {action.label}
                      </p>
                      {action.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {action.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0 ml-1" />
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      {response.footer && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {response.footer}
          </p>
        </div>
      )}
    </div>
  );
}