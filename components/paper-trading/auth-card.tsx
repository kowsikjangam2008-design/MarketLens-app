'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface AuthCardProps {
  onSendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  onLocalSignIn?: (email: string) => void;
  isConfigured?: boolean;
}

export function AuthCard({ onSendOtp, onLocalSignIn, isConfigured = true }: AuthCardProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await onSendOtp(email.trim().toLowerCase());
    setIsSubmitting(false);

    if (result.success) {
      setSentSuccess(true);
    } else {
      setErrorMessage(result.error || 'Failed to send magic link.');
    }
  };

  const handleQuickDemo = () => {
    if (onLocalSignIn) {
      onLocalSignIn(email || 'trader@marketlens.app');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 px-4">
      <Card className="border-border/80 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-emerald-500 to-blue-500" />
        <CardHeader className="text-center pt-6 pb-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Paper Trading
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Practice trading with ₹10,00,000 of virtual capital.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          <div className="p-3 bg-muted/40 border border-border/60 rounded-xl text-xs text-muted-foreground leading-relaxed text-center">
            “Sign in to save your paper-trading portfolio across devices.”
          </div>

          {sentSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">
                Magic link sent!
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We sent a secure passwordless login link to <strong className="text-foreground">{email}</strong>. Click the link in your email to instantly load your paper portfolio.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSentSuccess(false)}
                className="text-xs text-primary mt-2"
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="auth-email-input" className="text-xs font-medium text-foreground/90">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
                  <Input
                    id="auth-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="you@example.com"
                    className="h-10 text-xs pl-9"
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 font-semibold text-xs gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Magic Link...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Magic Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Instant practice test mode */}
              {onLocalSignIn && (
                <div className="pt-2">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-border/50"></div>
                    <span className="flex-shrink mx-2 text-[10px] text-muted-foreground uppercase font-medium">or</span>
                    <div className="flex-grow border-t border-border/50"></div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleQuickDemo}
                    className="w-full h-9 text-xs text-muted-foreground hover:text-foreground border-border/70"
                  >
                    Continue with Local Practice Account
                  </Button>
                </div>
              )}
            </form>
          )}

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Passwordless & secure. No password required.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
