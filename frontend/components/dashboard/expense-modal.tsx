'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: any) => void;
}

export function ExpenseModal({ open, onOpenChange, onSave }: ExpenseModalProps) {
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [method, setMethod] = useState('');

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().split('T')[0]);
      setConcept('');
      setAmount('');
      setCategory('');
      setMethod('');
    }
  }, [open]);

  const handleSave = () => {
    if (onSave) {
      onSave({ concept, amount: Number(amount), date, category, method });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Registrar Nuevo Gasto</DialogTitle>
          <DialogDescription className="text-slate-500 pt-2">
            Ingresa los detalles del egreso. El importe será reflejado en el balance de caja.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="concept" className="font-semibold text-slate-700">Concepto</Label>
            <Input id="concept" placeholder="Ej. Factura de luz" value={concept} onChange={(e) => setConcept(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount" className="font-semibold text-slate-700">Monto</Label>
            <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date" className="font-semibold text-slate-700">Fecha</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category" className="font-semibold text-slate-700">Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alquiler">Alquiler</SelectItem>
                <SelectItem value="Servicios">Servicios (Luz, Internet, Agua)</SelectItem>
                <SelectItem value="Insumos / Mantenimiento">Insumos / Mantenimiento</SelectItem>
                <SelectItem value="Honorarios">Honorarios (Profesores)</SelectItem>
                <SelectItem value="Varios">Varios</SelectItem>
              </SelectContent>
            </Select>
            {category === 'Honorarios' && (
              <p className="text-xs text-slate-500 mt-1">Carga manual 100%. No se calculará automáticamente el valor por horas.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="method" className="font-semibold text-slate-700">Medio de Pago</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Selecciona el medio de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                <SelectItem value="Débito">Débito</SelectItem>
                <SelectItem value="Cuenta DNI">Cuenta DNI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-300 text-slate-700">Cancelar</Button>
          <Button onClick={handleSave} className="bg-slate-900 border-0 text-white hover:bg-slate-800 transition-colors">Guardar Gasto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
