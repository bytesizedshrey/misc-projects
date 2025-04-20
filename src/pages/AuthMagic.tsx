
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const AuthMagic: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ignore && session) {
        navigate("/");
      }
    });
    return () => { ignore = true };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    setSending(false);
    if (error) {
      setError(error.message);
      toast({
        title: "Failed to send magic link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSent(true);
      toast({
        title: "Magic link sent!",
        description: "Please check your email to sign in.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cyber-background">
      <form
        onSubmit={handleSubmit}
        className="cyber-panel w-full max-w-md mt-8 flex flex-col gap-6"
      >
        <h1 className="font-orbitron text-3xl text-center text-cyber-purple mb-2">
          Magic Link Sign In
        </h1>
        {sent ? (
          <div className="text-cyber-light text-center">
            <p>
              We've sent a sign-in link to <span className="font-bold">{email}</span>.
            </p>
            <p className="mt-3">Check your inbox &amp; click the link to finish signing in.</p>
          </div>
        ) : (
          <>
            <label htmlFor="email" className="text-cyber-light font-semibold">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              className="cyber-input"
              placeholder="you@email.com"
              disabled={sending}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              className="cyber-button mt-2"
              type="submit"
              disabled={sending || !email}
            >
              {sending ? "Sending..." : "Send Magic Link"}
            </Button>
            {error && (
              <div className="text-accent mt-2 text-sm text-center">{error}</div>
            )}
          </>
        )}
      </form>
    </div>
  );
};

export default AuthMagic;
