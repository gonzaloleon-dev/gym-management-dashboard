'use client';

import { useState, useEffect } from 'react';
import { Receipt, CreditCard, CheckCircle2, CheckCheck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Member, PLAN_PRICES, MembershipPlan, formatCurrency, formatDate } from '@/lib/mock-data';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils"

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
}

const SURCHARGE_RATE = 0.10;

function getNextExpiryAfterPayment(): string {
  const today = new Date('2026-02-13');
  today.setMonth(today.getMonth() + 1);
  return today.toISOString().split('T')[0];
}

const inputClass =
  'h-10 bg-white border-stone-200 text-slate-900 text-[14px] font-sans focus-visible:ring-1 focus-visible:ring-teal-600/50 focus-visible:border-teal-600 transition-colors';

export function PaymentModal({ open, onOpenChange, member }: PaymentModalProps) {
  const isOverdue = member?.status === 'Deudor';

  type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Cuenta DNI' | 'Mercado Pago' | 'Débito' | 'Otros';

  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | ''>('');
  const [basePrice, setBasePrice] = useState(0);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined);
  const [otherDetails, setOtherDetails] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const PAYMENT_METHODS: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Cuenta DNI', 'Mercado Pago', 'Débito', 'Otros'];

  // Reset al abrir o cambiar de miembro
  useEffect(() => {
    if (open && member) {
      setSelectedPlan(member.plan);
      const price = PLAN_PRICES[member.plan];
      setBasePrice(price);
      const final = isOverdue ? Math.round(price * (1 + SURCHARGE_RATE)) : price;
      setCustomPrice(String(final));
      setPaymentMethod('Efectivo');
      if (member.nextExpiry) {
        setPaymentDate(new Date(member.nextExpiry + "T12:00:00"));
      }
      setOtherDetails('');
      setStep('form');
    }
  }, [open, member]);

  // Actualizar precio al cambiar de plan
  const handlePlanChange = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    const price = PLAN_PRICES[plan];
    setBasePrice(price);
    const final = isOverdue ? Math.round(price * (1 + SURCHARGE_RATE)) : price;
    setCustomPrice(String(final));
  };

  // Formatear número con separadores de miles (es-AR)
  const formatInputDisplay = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('es-AR');
  };

  const numericPrice = parseInt(customPrice.replace(/\D/g, '')) || 0;
  const surchargeAmount = isOverdue ? Math.round(basePrice * SURCHARGE_RATE) : 0;
  const nextExpiry = getNextExpiryAfterPayment();

  const handleRegister = () => {
    setStep('success');
  };

  const handleSendWhatsApp = () => {
    if (!member) return;
    const nombre = member.name.split(' ')[0];
    const monto = formatCurrency(numericPrice);
    const fecha = paymentDate ? format(paymentDate, 'dd/MM/yyyy') : formatDate(nextExpiry);
    const message = encodeURIComponent(
      `¡Gracias ${nombre}! Recibimos tu pago de ${monto}. Tu próximo vencimiento es el ${fecha}.`
    );
    const phone = member.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-0 gap-0 overflow-hidden rounded-2xl border border-stone-200 shadow-2xl bg-white font-sans">

        {/* Header con avatar + nombre */}
        <DialogHeader className="px-7 pt-7 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-sm font-bold ring-2 ring-teal-100">
              {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-[16px] font-bold text-slate-900 leading-tight">
                Registrar Pago
              </DialogTitle>
              <p className="text-[13px] text-slate-500 mt-0.5 font-medium">{member.name}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Vencimiento anterior: {formatDate(member.nextExpiry)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-7 py-6 space-y-5">

          {/* Banner de recargo — solo visible en el formulario */}
          {isOverdue && step === 'form' && (
            <div className="flex items-start gap-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <Receipt className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-800 uppercase tracking-tight">Recargo por mora aplicado</p>
                <p className="text-sm text-slate-600 mt-1 leading-snug">
                  Se agrega un 10% al monto base ({formatCurrency(surchargeAmount)}) debido al estado de la cuenta.
                </p>
              </div>
            </div>
          )}

          {step === 'form' ? (
            <>
              {/* Plan y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-slate-800">Plan</Label>
                  <Select value={selectedPlan} onValueChange={(v) => handlePlanChange(v as MembershipPlan)}>
                    <SelectTrigger className={`${inputClass} w-full`}>
                      <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PLAN_PRICES) as MembershipPlan[]).map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan} — {formatCurrency(PLAN_PRICES[plan])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 focus-within:z-50">
                  <Label className="text-[13px] font-semibold text-slate-800">Nuevo Vencimiento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          inputClass,
                          "w-full justify-start text-left font-normal pl-3 bg-white border-slate-200 hover:bg-slate-50 focus:bg-white text-slate-900 hover:text-slate-900",
                          !paymentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                        {paymentDate ? format(paymentDate, "dd/MM/yyyy") : <span className="text-slate-400">Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={paymentDate}
                        onSelect={setPaymentDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px] font-semibold text-slate-800">Importe a cobrar</Label>
                  {isOverdue && (
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium px-2 py-0.5 rounded-full">
                      Precio base + 10%
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-bold">$</span>
                  <Input
                    className="h-14 pl-8 text-2xl font-semibold text-slate-900 bg-white border-stone-200 focus-visible:ring-1 focus-visible:ring-teal-600/50 focus-visible:border-teal-600 transition-colors tracking-tight"
                    value={formatInputDisplay(customPrice)}
                    onChange={(e) => setCustomPrice(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                  />
                </div>
                {isOverdue && (
                  <p className="text-sm font-semibold text-slate-700 mt-2">
                    Base: {formatCurrency(basePrice)} + Recargo: {formatCurrency(surchargeAmount)} = <span className="text-slate-900 font-bold">{formatCurrency(numericPrice)}</span>
                  </p>
                )}
              </div>

              {/* Medio de pago */}
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-800">Medio de pago</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`h-11 rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === method
                          ? 'bg-teal-50 border-2 border-teal-600 text-teal-800 font-semibold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
                {paymentMethod === 'Otros' && (
                  <Input
                    placeholder="Especificar medio de pago..."
                    value={otherDetails}
                    onChange={(e) => setOtherDetails(e.target.value)}
                    className={`${inputClass} mt-2 animate-in fade-in slide-in-from-top-1 duration-200`}
                  />
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-10 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-700 text-[13px]"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-10 gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm text-[13px] font-semibold"
                  onClick={handleRegister}
                  disabled={numericPrice === 0 || (paymentMethod === 'Otros' && !otherDetails.trim())}
                >
                  <CreditCard className="w-4 h-4" />
                  Registrar Pago
                </Button>
              </div>
            </>
          ) : (
            /* Paso 2: Confirmación + WhatsApp */
            <div className="space-y-5">
              {/* Monto protagonista */}
              <div className="flex flex-col items-center text-center py-3 gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-2 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-slate-500">¡Pago registrado!</p>
                  <p className="text-4xl font-semibold text-slate-900 mt-1 tracking-tight">{formatCurrency(numericPrice)}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {paymentMethod === 'Otros' ? `Otros (${otherDetails})` : paymentMethod}
                  </p>
                </div>
              </div>

              {/* Preview burbuja WhatsApp */}
              <div className="bg-slate-100/80 rounded-2xl px-4 pt-3 pb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">Vista previa del mensaje</p>
                <div className="relative bg-[#E7FFDB] text-slate-800 p-3.5 rounded-2xl rounded-tr-none shadow-sm border border-green-200/50 max-w-[90%] mx-auto">
                  <p className="text-[15px] leading-snug">
                    ¡Gracias <span className="font-semibold">{member.name.split(' ')[0]}</span>! Recibimos tu pago de{' '}
                    <span className="font-bold">{formatCurrency(numericPrice)}</span>.
                    {' '}Tu próximo vencimiento es el{' '}
                    <span className="font-semibold">{formatDate(nextExpiry)}</span>.
                  </p>
                  <div className="text-[11px] text-green-700/60 text-right mt-1.5 flex items-center justify-end gap-1">
                    <span>12:00</span>
                    <CheckCheck className="w-3 h-3" />
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 font-medium text-center">
                ¿Enviamos el comprobante por WhatsApp?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-11 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  No, gracias
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20bc5a] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  Sí, enviar comprobante
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
