import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import * as motion from "motion/react-client";
import { Loader2 } from "lucide-react";

const DEFAULT_USERS = [
  { name: 'Yogesh', role: 'leader' },
  { name: 'Mithun', role: 'co-lead' },
  { name: 'Nishanth', role: 'member' },
  { name: 'Farhan', role: 'member' },
  { name: 'Renuga', role: 'member' },
  { name: 'Gokul', role: 'member' }
];

export default function Setup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [useEnv, setUseEnv] = useState(false);
  const [serviceAccountEmail, setServiceAccountEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/service-account")
      .then(res => res.json())
      .then(data => {
        if (data.email) setServiceAccountEmail(data.email);
      })
      .catch(console.error);
  }, []);
  
  const [users, setUsers] = useState(
    DEFAULT_USERS.map(u => ({ ...u, email: '', password: '', driveFolderId: '' }))
  );

  const handleUpdate = (index: number, field: string, value: string) => {
    const newUsers = [...users];
    newUsers[index] = { ...newUsers[index], [field]: value };
    setUsers(newUsers);
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      
      const payload = useEnv ? {} : { users };

      const res = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");
      
      toast.success(data.message);
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to setup application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen border-t-4 border-primary flex items-center justify-center p-4 bg-neutral-50/50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
        <Card className="border-neutral-200/60 shadow-lg shadow-neutral-200/20">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-3xl font-semibold tracking-tight">System Setup</CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto">
              Configure the 6 required team member accounts to initialize the system. 
              You can also use the credentials from your .env file.
            </CardDescription>
            {serviceAccountEmail && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-lg mt-4 text-sm text-left font-medium">
                <strong>Important:</strong> You must share every Google Drive folder ID listed below with this service account email: 
                <div className="mt-2 p-2 bg-blue-100 rounded text-blue-800 font-mono select-all">
                  {serviceAccountEmail}
                </div>
                If the folders are not shared, the setup will fail!
              </div>
            )}
          </CardHeader>
          <CardContent>
            
            <div className="flex justify-center mb-6">
              <Button 
                variant={useEnv ? "default" : "outline"}
                onClick={() => setUseEnv(!useEnv)}
              >
                {useEnv ? "Switch to Manual Entry" : "Use .env configuration"}
              </Button>
            </div>

            {!useEnv && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u, i) => (
                  <div key={u.name} className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                       <h3 className="font-semibold text-lg">{u.name}</h3>
                       <span className="text-xs uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-1 rounded-sm">
                         {u.role}
                       </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-500 font-medium uppercase">Email</Label>
                        <Input 
                          placeholder={`${u.name.toLowerCase()}@example.com`}
                          type="email" 
                          value={u.email} 
                          onChange={(e) => handleUpdate(i, 'email', e.target.value)} 
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-500 font-medium uppercase">Password</Label>
                        <Input 
                          placeholder="Password"
                          type="password" 
                          value={u.password} 
                          onChange={(e) => handleUpdate(i, 'password', e.target.value)} 
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-500 font-medium uppercase">Google Drive Folder ID</Label>
                        <Input 
                          placeholder="Folder ID..."
                          type="text" 
                          value={u.driveFolderId} 
                          onChange={(e) => handleUpdate(i, 'driveFolderId', e.target.value)} 
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </CardContent>
          <CardFooter className="bg-neutral-50 border-t justify-end p-6 rounded-b-xl">
            <Button 
              size="lg" 
              onClick={handleSetup} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Configuring System..." : "Complete Setup"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
