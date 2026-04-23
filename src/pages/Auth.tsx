"use client";

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-2xl">F</div>
          </Link>
          <h1 className="text-3xl font-bold">Family Hub</h1>
          <p className="text-muted-foreground mt-2">Gérez votre famille en toute simplicité</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
            <CardTitle className="text-2xl">{mode === 'login' ? 'Bienvenue !' : 'Créer un compte'}</CardTitle>
            <CardDescription>{mode === 'login' ? 'Connectez-vous pour accéder à votre espace' : 'Rejoignez Family Hub'}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input name="name" placeholder="Marie Dupont" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="pl-10 h-12 rounded-xl" required />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input name="email" type="email" placeholder="marie@exemple.com" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="pl-10 h-12 rounded-xl" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} className="pl-10 pr-10 h-12 rounded-xl" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} className="pl-10 h-12 rounded-xl" required />
                  </div>
                </div>
              )}

              {error && <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full h-12" loading={loading}>{mode === 'login' ? 'Se connecter' : "S'inscrire"}</Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'login' ? (<>Pas encore de compte ? <button onClick={() => setMode('register')} className="font-medium text-primary hover:underline">S'inscrire</button></>) : (<>Déjà un compte ? <button onClick={() => setMode('login')} className="font-medium text-primary hover:underline">Se connecter</button></>)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}