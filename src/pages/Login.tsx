/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Login realizado com sucesso!');
      onLogin();
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error('Falha ao autenticar com o Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <img 
              src="https://drive.google.com/thumbnail?id=1u60rekYWjseJ0IV_LY0cz7GfvFavgriH&sz=w1000" 
              alt="Logo COMPESCAL" 
              className="h-16 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bem-vindo</h1>
          <p className="text-sm text-slate-500 mt-1">Acesse o sistema de almoxarifado</p>
        </div>

        <div className="space-y-5">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            {isLoading ? 'Conectando...' : 'Entrar com Google'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">v2.0.0-STABLE</p>
        </div>
      </div>
    </div>
  );
}
