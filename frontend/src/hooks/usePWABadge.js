import { useState, useEffect, useCallback } from 'react';
import { getPendingRequestsCount } from '../services/requestsService.js';

export const usePWABadge = () => {
  const [badgeCount, setBadgeCount] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  // Verificar se a Badge API é suportada
  useEffect(() => {
    const checkSupport = () => {
      if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
        setIsSupported(true);
        console.log('✅ Badge API suportada');
      } else {
        setIsSupported(false);
        console.log('❌ Badge API não suportada');
      }
    };

    checkSupport();
  }, []);

  // Função para atualizar o badge
  const updateBadge = useCallback(async () => {
    if (!isSupported) return;

    try {
      const count = await getPendingRequestsCount();
      setBadgeCount(count);

      if (count > 0) {
        await navigator.setAppBadge(count);
        console.log(`🔴 Badge atualizado: ${count} requerimentos pendentes`);
      } else {
        await navigator.clearAppBadge();
        console.log('✅ Badge limpo - nenhum requerimento pendente');
      }

      // Notificar o service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'UPDATE_BADGE',
          count: count
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar badge:', error);
    }
  }, [isSupported]);

  // Função para limpar o badge
  const clearBadge = useCallback(async () => {
    if (!isSupported) return;

    try {
      await navigator.clearAppBadge();
      setBadgeCount(0);
      console.log('✅ Badge limpo manualmente');
    } catch (error) {
      console.error('Erro ao limpar badge:', error);
    }
  }, [isSupported]);

  // Atualizar badge quando o componente monta
  useEffect(() => {
    if (isSupported) {
      updateBadge();
    }
  }, [isSupported, updateBadge]);

  // Atualizar badge a cada 30 segundos
  useEffect(() => {
    if (!isSupported) return;

    const interval = setInterval(updateBadge, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isSupported, updateBadge]);

  // Atualizar badge quando a página ganha foco
  useEffect(() => {
    if (!isSupported) return;

    const handleFocus = () => {
      updateBadge();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        updateBadge();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isSupported, updateBadge]);

  return {
    badgeCount,
    isSupported,
    updateBadge,
    clearBadge
  };
};
