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
          <CardTitle className="text-2xl font-bold">Verifique seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Após confirmar seu e-mail, você poderá fazer login e começar a usar o FinControl.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <Wallet className="mr-2 h-4 w-4" />
              Ir para login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
