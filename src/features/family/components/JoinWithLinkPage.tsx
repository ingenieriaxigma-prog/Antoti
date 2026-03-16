/**
 * 🔗 JOIN WITH LINK PAGE
 * 
 * Página para unirse a un grupo usando un link de invitación.
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Users, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../../contexts/AuthContext';
import { familyService } from '../services/family.service';

interface JoinWithLinkPageProps {
  inviteCode: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function JoinWithLinkPage({ inviteCode, onSuccess, onError }: JoinWithLinkPageProps) {
  const { currentUser: user, getAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [inviteCode]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Aquí deberíamos hacer una llamada al backend para validar el código
      // Por ahora simulamos la respuesta
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simular datos de invitación
      setInvitation({
        groupName: 'Familia López',
        groupEmoji: '👨‍👩‍👧‍👦',
        invitedBy: 'María López',
        memberCount: 4,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Código de invitación inválido';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para unirte');
      return;
    }

    try {
      setJoining(true);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      // Hacer petición al backend para unirse con el código
      const response = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'placeholder'}.supabase.co/functions/v1/make-server-727b50c3/family/join/${inviteCode}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al unirse al grupo');
      }

      const data = await response.json();
      
      setSuccess(true);
      toast.success(`¡Te has unido a ${invitation.groupName}! 🎉`);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al unirse al grupo';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-[#10B981] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando invitación...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invitación no válida
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido al grupo! 🎉
          </h2>
          <p className="text-gray-600 mb-4">
            Te has unido exitosamente a <strong>{invitation.groupEmoji} {invitation.groupName}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">{invitation.groupEmoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invitación a {invitation.groupName}
          </h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para unirte a este grupo
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Iniciar Sesión
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{invitation.groupEmoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Te invitaron a unirte
          </h2>
          <h3 className="text-xl text-emerald-600 font-semibold mb-1">
            {invitation.groupName}
          </h3>
          <p className="text-sm text-gray-600">
            Invitado por {invitation.invitedBy}
          </p>
        </div>

        {/* Info del grupo */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Users className="w-5 h-5" />
            <span>{invitation.memberCount} {invitation.memberCount === 1 ? 'miembro' : 'miembros'}</span>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            Al unirte podrás compartir gastos e ingresos con el grupo, 
            ver estadísticas compartidas y recibir notificaciones de actividad.
          </p>
        </div>

        {/* Botón de unirse */}
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {joining ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Uniéndome...</span>
            </>
          ) : (
            <>
              <span>Unirme al grupo</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Código de invitación */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Código de invitación: <code className="font-mono font-semibold">{inviteCode}</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
