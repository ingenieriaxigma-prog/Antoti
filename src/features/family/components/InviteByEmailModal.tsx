/**
 * 📧 INVITE BY EMAIL MODAL
 * 
 * Modal simple para invitar usuarios por email.
 * - Si el usuario existe → Crea notificación en la app
 * - Si no existe → Guarda invitación pendiente + opción de compartir link de registro
 */

import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Check, Share2, UserPlus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { FamilyGroup } from '../types/family.types';

interface InviteByEmailModalProps {
  groups: FamilyGroup[];
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteByEmailModal({ groups, onClose, onSuccess }: InviteByEmailModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  // Seleccionar automáticamente el primer grupo cuando se cargue
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
      console.log('✅ Grupo seleccionado automáticamente:', groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Por favor ingresa un correo electrónico');
      return;
    }

    if (!selectedGroupId) {
      setError('Por favor selecciona un grupo');
      return;
    }

    // Sending invitation

    setIsLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('No hay sesión activa');
      }

      // Access token found

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/family/invitations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: selectedGroupId,
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();
      console.log('📩 Server response:', { status: response.status, data });

      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Error al enviar invitación';
        console.error('❌ Server error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Verificar si el usuario existe
      setInvitationCode(data.invitation.code);
      setUserExists(data.userExists || false);
      setSuccess(true);

      // Llamar callback de éxito después de 2 segundos
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar invitación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareRegistrationLink = () => {
    const registrationLink = 'https://www.finanzapersonal.com';
    const message = `¡Hola! Te invito a unirte a mi grupo de finanzas familiares en Oti.\n\nPrimero regístrate aquí: ${registrationLink}\n\nDespués usa este código de invitación: ${invitationCode}\n\n¡Nos vemos en la app! 👋`;

    if (navigator.share) {
      navigator.share({
        title: 'Invitación a Oti',
        text: message,
      }).catch(() => {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(message);
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(message);
      alert('Mensaje copiado al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#10B981] p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Invitar Miembro</h2>
                <p className="text-sm text-emerald-50">Por correo electrónico</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Selector de grupo (si tiene múltiples) */}
                {groups.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo
                    </label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      disabled={isLoading}
                    >
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.emoji} {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Email input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">¿Cómo funciona?</p>
                      <ul className="space-y-1 text-blue-800">
                        <li>• Si el usuario ya tiene cuenta, recibirá una notificación en la app</li>
                        <li>• Si no tiene cuenta, la invitación quedará pendiente hasta que se registre</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
                  >
                    <p className="text-sm text-red-900">{error}</p>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar Invitación</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                {/* Success icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-10 h-10 text-emerald-600" />
                  </div>
                </div>

                {/* Success message */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ¡Invitación Enviada!
                  </h3>
                  <p className="text-gray-600">
                    {userExists ? (
                      <>Se ha notificado a <strong>{email}</strong> en la app</>
                    ) : (
                      <>Invitación pendiente para <strong>{email}</strong></>
                    )}
                  </p>
                </div>

                {/* Invitation code */}
                {invitationCode && (
                  <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                    <p className="text-sm text-gray-600 mb-2">Código de invitación:</p>
                    <code className="text-lg font-mono font-bold text-emerald-600">
                      {invitationCode}
                    </code>
                  </div>
                )}

                {/* Share registration link (if user doesn't exist) */}
                {userExists === false && (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg text-left">
                      <p className="text-sm text-yellow-900">
                        <strong>Usuario no registrado.</strong> Comparte el link de registro para que se una.
                      </p>
                    </div>
                    <button
                      onClick={handleShareRegistrationLink}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Compartir Link de Registro</span>
                    </button>
                  </div>
                )}

                {/* Next steps */}
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg text-left">
                  <p className="text-sm text-emerald-900 font-medium mb-1">
                    ¿Qué sigue?
                  </p>
                  <p className="text-sm text-emerald-800">
                    {userExists 
                      ? 'El usuario recibirá una notificación en la app y podrá aceptar la invitación.'
                      : 'Cuando se registre, verá la invitación y podrá unirse al grupo.'}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
