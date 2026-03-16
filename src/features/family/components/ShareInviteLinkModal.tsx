/**
 * 🔗 SHARE INVITE LINK MODAL
 * 
 * Modal para generar y compartir link de invitación a través de diferentes canales.
 */

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Mail, Link as LinkIcon, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import type { FamilyGroupWithMembers } from '../types/family.types';

interface ShareInviteLinkModalProps {
  group: FamilyGroupWithMembers;
  inviteCode: string;
  onClose: () => void;
}

export function ShareInviteLinkModal({ group, inviteCode, onClose }: ShareInviteLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Generar el link completo
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = `${baseUrl}/join/${inviteCode}`;

  // Mensaje de invitación
  const inviteMessage = `¡Hola! 👋\n\nTe invito a unirte a mi grupo "${group.emoji} ${group.name}" en Oti para compartir gastos e ingresos.\n\n🔗 Link de invitación:\n${inviteLink}\n\n📱 O usa el código: ${inviteCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Error al copiar link');
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      toast.success('Mensaje copiado al portapapeles');
    } catch (err) {
      toast.error('Error al copiar mensaje');
    }
  };

  const handleShareWhatsApp = () => {
    const encodedMessage = encodeURIComponent(inviteMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Invitación a ${group.name} en Oti`);
    const body = encodeURIComponent(inviteMessage);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Unirse a ${group.name}`,
          text: inviteMessage,
          url: inviteLink,
        });
      } catch (err) {
        // Usuario canceló o error
        console.log('Share cancelled', err);
      }
    } else {
      toast.error('Tu navegador no soporta compartir');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#10B981] px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Compartir Invitación</h2>
                  <p className="text-emerald-100 text-sm">
                    {group.emoji} {group.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Link de invitación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link de invitación
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-700 overflow-x-auto">
                  {inviteLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Código de invitación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de invitación
              </label>
              <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <code className="text-lg font-mono font-bold text-emerald-700">
                  {inviteCode}
                </code>
              </div>
            </div>

            {/* Botones de compartir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Compartir por
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>

                {/* Email */}
                <button
                  onClick={handleShareEmail}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </button>

                {/* Copiar mensaje */}
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>Copiar mensaje</span>
                </button>

                {/* Share nativo (solo móvil) */}
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={handleShareNative}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Más opciones</span>
                  </button>
                )}

                {/* Código QR */}
                <button
                  onClick={() => setShowQR(!showQR)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    showQR
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>Código QR</span>
                </button>
              </div>
            </div>

            {/* Código QR - Placeholder */}
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-gray-200 rounded-xl p-6 bg-gray-50 overflow-hidden"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                      Código QR para unirte al grupo
                    </p>
                    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300">
                      {/* Placeholder para QR - Se puede implementar con una librería como qrcode.react */}
                      <div className="w-48 h-48 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="w-16 h-16 text-emerald-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 max-w-[150px]">
                            Funcionalidad de QR disponible próximamente
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center max-w-xs">
                      Por ahora, comparte el link o código directamente con tus contactos
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview del mensaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista previa del mensaje
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {inviteMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
