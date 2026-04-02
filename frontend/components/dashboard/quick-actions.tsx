'use client';

import { Plus, CreditCard, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PLAN_PRICES, formatCurrency } from '@/lib/mock-data';

export function QuickActions() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const planOptions = Object.entries(PLAN_PRICES).map(([plan, price]) => ({
    value: plan,
    label: `${plan} - ${formatCurrency(price)}`,
  }));

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
        {/* Secondary actions - show when expanded */}
        <div
          className={cn(
            'flex flex-col-reverse gap-3 transition-all duration-300',
            isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          <Button
            size="lg"
            variant="outline"
            className="h-12 gap-2 rounded-full border-primary/30 bg-card text-primary shadow-lg hover:bg-primary/5"
            onClick={() => {
              setMemberDialogOpen(true);
              setIsExpanded(false);
            }}
          >
            <UserPlus className="h-5 w-5" />
            <span className="pr-1">Nuevo Miembro</span>
          </Button>
          <Button
            size="lg"
            className="h-12 gap-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            onClick={() => {
              setPaymentDialogOpen(true);
              setIsExpanded(false);
            }}
          >
            <CreditCard className="h-5 w-5" />
            <span className="pr-1">Registrar Pago</span>
          </Button>
        </div>

        {/* Main FAB */}
        <Button
          size="lg"
          className={cn(
            'h-14 w-14 rounded-full shadow-xl transition-all duration-300',
            isExpanded
              ? 'bg-muted text-muted-foreground rotate-45'
              : 'bg-primary text-primary-foreground'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Registrar Pago</DialogTitle>
            <DialogDescription>
              Ingresa los datos del pago a registrar.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setPaymentDialogOpen(false); }}>
            <div className="space-y-2">
              <Label htmlFor="member">Miembro</Label>
              <Select>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Seleccionar miembro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Martín González</SelectItem>
                  <SelectItem value="2">Lucía Fernández</SelectItem>
                  <SelectItem value="3">Santiago Rodríguez</SelectItem>
                  <SelectItem value="7">Nicolás Díaz</SelectItem>
                  <SelectItem value="9">Agustín Romero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  {planOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (ARS)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="50000"
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Método de Pago</Label>
              <Select>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Registrar Pago
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Nuevo Miembro</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo miembro.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMemberDialogOpen(false); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  placeholder="12.345.678"
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+54 11 1234-5678"
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  {planOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setMemberDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Agregar Miembro
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
