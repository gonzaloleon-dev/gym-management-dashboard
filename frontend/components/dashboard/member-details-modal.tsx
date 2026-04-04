import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Member, MembershipPlan, PLAN_PRICES } from '@/lib/mock-data';
import { Save } from 'lucide-react';

interface MemberDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
}

export function MemberDetailsModal({ open, onOpenChange, member }: MemberDetailsModalProps) {
  const isEditing = !!member;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-foreground">
            {isEditing ? 'Ficha del Alumno' : 'Nuevo Alumno'}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {isEditing 
              ? 'Revisa o actualiza los datos del alumno.' 
              : 'Ingresa los datos para registrar un nuevo alumno.'}
          </SheetDescription>
        </SheetHeader>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); onOpenChange(false); }}>
          <div className="space-y-4 text-sm text-foreground">
            
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-border pb-1">Información Básica</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" defaultValue={member?.name || ''} className="bg-secondary/50 border-border" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" defaultValue={member?.dni || ''} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                  <Input id="phone" defaultValue={member?.phone || ''} className="bg-secondary/50 border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={member?.email || ''} className="bg-secondary/50 border-border" />
              </div>
            </div>

            {/* Plan y Estado */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-border pb-1">Membresía</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan Actual</Label>
                  <Select defaultValue={member?.plan || "3 veces x semana"}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Seleccionar Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PLAN_PRICES).map(plan => (
                        <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialPlan">Plan Inicial</Label>
                  <Select defaultValue={member?.initialPlan || "3 veces x semana"}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PLAN_PRICES).map(plan => (
                        <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Ficha Médica y Objetivos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-border pb-1">Perfil del Alumno</h3>
              
              <div className="space-y-2">
                <Label htmlFor="medicalNotes">Ficha Médica / Lesiones</Label>
                <Textarea 
                  id="medicalNotes" 
                  defaultValue={member?.medicalNotes || ''} 
                  placeholder="Ej. Lesión en rodilla, apto médico presentado, hipertensión..."
                  className="bg-secondary/50 border-border resize-none" 
                  rows={3} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalObjective">Objetivo Personal</Label>
                <Select defaultValue={member?.personalObjective || "Salud y bienestar"}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Seleccionar Objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bajar de peso">Bajar de peso</SelectItem>
                    <SelectItem value="Ganar masa muscular">Ganar masa muscular</SelectItem>
                    <SelectItem value="Rehabilitación">Rehabilitación</SelectItem>
                    <SelectItem value="Salud y bienestar">Salud y bienestar</SelectItem>
                    <SelectItem value="Rendimiento deportivo">Rendimiento deportivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contacto Gral */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-border pb-1">Datos Adicionales</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Cont. Emergencia</Label>
                  <Input id="emergencyContactName" placeholder="Nombre" defaultValue={member?.emergencyContactName || ''} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Tel. Emergencia</Label>
                  <Input id="emergencyContactPhone" placeholder="Teléfono" defaultValue={member?.emergencyContactPhone || ''} className="bg-secondary/50 border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">¿Cómo nos conoció?</Label>
                <Select defaultValue={member?.origin || "Otro"}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Seleccionar Origen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Pasa por la puerta">Pasa por la puerta</SelectItem>
                    <SelectItem value="Recomendación">Recomendación de otro alumno</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border mt-8">
            <Button type="button" variant="outline" className="w-full sm:w-1/2" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-1/2 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="w-4 h-4" />
              {isEditing ? 'Guardar Cambios' : 'Registrar Alumno'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
