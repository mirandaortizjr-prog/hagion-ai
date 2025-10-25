import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || "");
      
      // Load profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, gender")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (profile) {
        setName(profile.name || "");
        setGender(profile.gender || "");
      }
    } else {
      navigate("/auth");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          name,
          gender,
        });

      if (error) throw error;

      toast({
        title: language === 'es' ? "Éxito" : "Success",
        description: language === 'es' ? "Perfil actualizado exitosamente" : "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: language === 'es' ? "Error" : "Error",
        description: error.message || (language === 'es' ? "No se pudo actualizar el perfil" : "Failed to update profile"),
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">{language === 'es' ? 'Perfil' : 'Profile'}</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{language === 'es' ? 'Información de Cuenta' : 'Account Information'}</CardTitle>
                  <CardDescription>{language === 'es' ? 'Administra los detalles de tu cuenta' : 'Manage your account details'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{language === 'es' ? 'Nombre' : 'Profile Name'}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSavingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{language === 'es' ? 'Género' : 'Gender'}</Label>
                  <Select value={gender} onValueChange={setGender} disabled={isSavingProfile}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder={language === 'es' ? 'Selecciona género' : 'Select gender'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{language === 'es' ? 'Masculino' : 'Male'}</SelectItem>
                      <SelectItem value="female">{language === 'es' ? 'Femenino' : 'Female'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'es' ? 'Correo Electrónico' : 'Email'}</Label>
                  <Input value={email} disabled className="bg-muted" />
                </div>
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'es' ? 'Guardando...' : 'Saving...'}
                    </>
                  ) : (
                    language === 'es' ? 'Guardar Cambios' : 'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'es' ? 'Cambiar Contraseña' : 'Change Password'}</CardTitle>
              <CardDescription>{language === 'es' ? 'Actualiza tu contraseña para mantener tu cuenta segura' : 'Update your password to keep your account secure'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{language === 'es' ? 'Nueva Contraseña' : 'New Password'}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{language === 'es' ? 'Confirmar Nueva Contraseña' : 'Confirm New Password'}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !newPassword || !confirmPassword}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'es' ? 'Actualizando...' : 'Updating...'}
                    </>
                  ) : (
                    language === 'es' ? 'Actualizar Contraseña' : 'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
