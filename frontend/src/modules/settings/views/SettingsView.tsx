import { type FormEvent, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import {
  type AdminTotpSetup,
  confirmAdminTotpSetup,
  startAdminTotpSetup,
} from '../../../services/authService';

export function SettingsView() {
  const [setup, setSetup] = useState<AdminTotpSetup | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      setSetup(await startAdminTotpSetup(true));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (event: FormEvent) => {
    event.preventDefault();
    if (!setup) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await confirmAdminTotpSetup(setup.setupToken, code.trim());
      setSetup(null);
      setCode('');
      setMessage('Google Authenticator atualizado com sucesso.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
      <div className="flex items-start gap-3 mb-6">
        <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Seguranca do Admin</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Gerencie o Google Authenticator usado antes do login com email e senha.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-100 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <h3 className="text-sm font-black text-neutral-800 uppercase tracking-widest mb-2">
          Google Authenticator
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          Use esta acao para trocar o autenticador em producao. A chave antiga so sera substituida depois que o novo codigo for confirmado.
        </p>

        {!setup ? (
          <button
            type="button"
            disabled={loading}
            onClick={handleStartReset}
            className="bg-gradient-to-r from-purple-800 to-purple-600 text-white font-bold text-sm uppercase tracking-tight rounded-xl px-5 py-3 hover:from-purple-700 hover:to-purple-500 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
          >
            {loading ? 'Gerando...' : 'Reconfigurar autenticador'}
          </button>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Nova chave de configuracao</label>
              <div className="p-3 bg-white border border-neutral-200 rounded-xl font-mono text-xs break-all text-neutral-700">
                {setup.setupKey}
              </div>
              <a
                href={setup.otpauthUri}
                className="text-xs font-bold text-purple-700 hover:text-purple-900"
              >
                Abrir configuracao no app autenticador
              </a>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Codigo do novo autenticador</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="password"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="6 digitos"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-800 to-purple-600 text-white font-bold text-sm uppercase tracking-tight rounded-xl px-5 py-3 hover:from-purple-700 hover:to-purple-500 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? 'Confirmando...' : 'Confirmar novo autenticador'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
