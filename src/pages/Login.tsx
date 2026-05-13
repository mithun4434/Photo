import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Navigate, useNavigate } from "react-router";
import { useAuth, AppUser } from "../hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";

export default function Login() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSetup() {
      try {
        const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (count === 0 && !error) {
          setNeedsSetup(true);
        }
      } catch (err) {
         console.warn(err);
      }
    }
    checkSetup();
  }, []);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success("Logged in successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to authenticate");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* High-Fidelity CSS 3D Rings Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-black overflow-hidden">
        {/* Ring 1 - Top Right */}
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full border-[2px] border-white/20 shadow-[inset_0_0_80px_rgba(255,255,255,0.05),0_0_80px_rgba(255,255,255,0.1)] blur-[1px]"></div>
        <div className="absolute top-[-18%] right-[-8%] w-[56vw] h-[56vw] rounded-full border-[1px] border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]"></div>
        
        {/* Ring 2 - Bottom Left (angled) */}
        <div className="absolute bottom-[-30%] left-[-20%] w-[80vw] h-[80vw] rounded-full border-[4px] border-white/10 shadow-[inset_0_0_120px_rgba(255,255,255,0.08),0_0_120px_rgba(255,255,255,0.15)] blur-[3px] scale-y-75 rotate-45"></div>
        <div className="absolute bottom-[-28%] left-[-18%] w-[76vw] h-[76vw] rounded-full border-[1px] border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-y-75 rotate-45"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-white/5 blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[30%] w-[40vw] h-[40vw] rounded-full bg-slate-400/5 blur-[120px]"></div>
      </div>
      <Card className="w-full max-w-md glass-card border-none mt-8 sm:mt-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-white/10 border border-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner">
            <ImagePlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">Team Photo Tracker</CardTitle>
          <CardDescription className="text-white/70">
            Welcome! Login to your assigned account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        {needsSetup && (
          <CardFooter className="flex-col gap-2 pt-2 pb-6 px-6">
            <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-md mb-2">
              <strong>System Not Configured</strong>
              <p>We detected that the team member accounts have not been initialized yet.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/setup")}>
              Run Initial Setup Wizard
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
