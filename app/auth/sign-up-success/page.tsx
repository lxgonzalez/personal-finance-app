import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Wallet } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verifica tu correo</CardTitle>
          <CardDescription>
            Te enviamos un enlace de confirmacion a tu correo electronico. Haz clic en el enlace para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Despues de confirmar tu correo, podras iniciar sesion y comenzar a usar FinControl.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <Wallet className="mr-2 h-4 w-4" />
              Ir a iniciar sesion
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
