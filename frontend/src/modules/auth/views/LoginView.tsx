import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { login } from '../../../services/authService';

interface LoginViewProps {
  gateToken: string;
}

export function LoginView({ gateToken }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const logoSrc = "/assets/pulsefit-logo-transparent.png";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email.trim().toLowerCase(), password, gateToken);
      setUser(user);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
        <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-8 text-center">
          <div className="h-16 w-56 bg-white/95 rounded-xl flex items-center justify-center mx-auto mb-4 px-4 shadow-lg shadow-purple-950/20">
            <img src={logoSrc} alt="PulseFit" className="h-12 w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Painel Admin</h1>
          <p className="text-purple-200 text-sm mt-2">Acesso Restrito</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="admin@empresa.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-purple-800 to-purple-600 text-white font-bold text-sm uppercase tracking-tight rounded-xl py-3.5 hover:from-purple-700 hover:to-purple-500 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
