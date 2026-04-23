"use client";

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

type AuthMode = 'login' | 'register';

const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) return { valid: false, message: '8 caractères minimum' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Au moins une majuscule' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Au moins une minuscule' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Au moins un chiffre' };
  return { valid: true, message: '' };
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      const validation = validatePassword(formData.password);
      if (!validation.valid) { setError(validation.message); return; }
      if (formData.password !== formData.confirmPassword) { setError('Mots de passe différents'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') await login(formData.email, formData.password);
      else await register(formData.email, formData.password, formData.name);
      navigate('/');
    } catch { setError('Identifiants incorrects'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl glow-primary"
            >
              F
            </motion.div>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Family Hub</h1>
          <p className="text-muted-foreground mt-2">Gérez votre famille en toute simplicité</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center pb-2">
            <button 
              onClick={() => navigate(-1)} 
              className="absolute top-4 left-4 rounded-lg p-2 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Bienvenue !' : 'Créer un compte'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Connectez-vous pour accéder à votre espace' : 'Rejoignez Family Hub'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      name="name"
                      placeholder="Marie Dupont"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="marie@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 h-12 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full h-12" loading={loading}>
                {mode === 'login' ? 'Se connecter' : "S'inscrire"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    Pas encore de compte ?{' '}
                    <button onClick={() => setMode('register')} className="font-medium text-primary hover:underline">
                      S'inscrire
                    </button>
                  </>
                ) : (
                  <>
                    Déjà un compte ?{' '}
                    <button onClick={() => setMode('login')} className="font-medium text-primary hover:underline">
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}