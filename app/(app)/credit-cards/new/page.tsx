import { CreditCardForm } from "@/components/credit-card-form";

export default function NewCreditCardPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-1 sm:px-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Nueva Tarjeta</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Registra los datos de tu tarjeta de credito
        </p>
      </div>
      <CreditCardForm />
    </div>
  );
}
