'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Member, PLAN_PRICES } from '@/lib/mock-data';
import { Save, X } from 'lucide-react';

interface MemberDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
}

// Componente reutilizable para títulos de sección
function SectionTitle({ first = false, children }: { first?: boolean; children: React.ReactNode }) {
  return (
    <p className={`text-xs font-bold text-teal-800 uppercase tracking-widest mb-4 ${first ? 'mt-0' : 'mt-8'}`}>
      {children}
    </p>
  );
}

// Componente reutilizable para campos del formulario
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-semibold text-slate-800 font-sans">{label}</Label>
      {children}
    </div>
  );
}

const inputClass = "h-10 bg-white border-stone-200 text-slate-900 placeholder:text-slate-300 text-[14px] font-sans focus-visible:ring-1 focus-visible:ring-teal-600/50 focus-visible:border-teal-600 transition-colors pointer-events-auto cursor-pointer";

export function MemberDetailsModal({ open, onOpenChange, member }: MemberDetailsModalProps) {
  const isEditing = !!member;
  const [selectedOrigin, setSelectedOrigin] = useState<string>(member?.origin ?? 'Instagram');

  useEffect(() => {
    setSelectedOrigin(member?.origin ?? 'Instagram');
  }, [member, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 overflow-hidden bg-white border-l border-stone-100 shadow-2xl flex flex-col font-sans">
        <VisuallyHidden>
          <SheetTitle>{isEditing ? 'Ficha del Alumno' : 'Nuevo Alumno'}</SheetTitle>
        </VisuallyHidden>

        {/* Header fijo con avatar, nombre y descripción */}
        <div className="px-7 pt-7 pb-5 border-b border-stone-100 shrink-0">
          {isEditing ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-sm font-bold font-sans shrink-0 ring-2 ring-teal-100">
                {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[16px] font-bold text-slate-900 font-sans leading-tight">{member.name}</p>
                <p className="text-[13px] text-slate-400 font-sans">{member.email}</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-[18px] font-bold text-slate-900 font-sans leading-tight">Nuevo Alumno</h2>
              <p className="text-[13px] text-slate-400 font-sans mt-0.5">Completá los datos para registrar un nuevo alumno.</p>
            </div>
          )}
        </div>

        {/* Formulario scrollable sin scrollbar nativa */}
        <form
          className="flex-1 overflow-y-auto px-7 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onSubmit={(e) => { e.preventDefault(); onOpenChange(false); }}
        >
          <div className="space-y-0">

            {/* — Información Básica — */}
            <section>
              <SectionTitle first>Información Básica</SectionTitle>
              <div className="space-y-4">
                <Field label="Nombre Completo">
                  <Input id="name" defaultValue={member?.name ?? ''} placeholder="Ej. Juan Pérez" className={inputClass} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Teléfono / WhatsApp">
                    <Input id="phone" defaultValue={member?.phone ?? ''} placeholder="+54 11 1234-5678" className={inputClass} />
                  </Field>
                  <Field label="Email">
                    <Input id="email" type="email" defaultValue={member?.email ?? ''} placeholder="correo@mail.com" className={inputClass} />
                  </Field>
                </div>
              </div>
            </section>

            {/* — Membresía — */}
            <section>
              <SectionTitle>Membresía</SectionTitle>
              <div className="space-y-4">
                <Field label="Plan Actual">
                  <Select defaultValue={member?.plan ?? '3 veces x semana'}>
                    <SelectTrigger className={`${inputClass} w-full cursor-pointer text-slate-900`}>
                      <SelectValue placeholder="Seleccionar Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PLAN_PRICES).map(plan => (
                        <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            {/* — Perfil del Alumno — */}
            <section>
              <SectionTitle>Perfil del Alumno</SectionTitle>
              <div className="space-y-4">
                <Field label="Ficha Médica / Lesiones">
                  <Textarea
                    id="medicalNotes"
                    defaultValue={member?.medicalNotes ?? ''}
                    placeholder="Ej. Lesión en rodilla, apto médico presentado, hipertensión..."
                    className={`${inputClass} h-auto resize-none`}
                    rows={3}
                  />
                </Field>
                <Field label="Objetivo Personal">
                  <Select defaultValue={member?.personalObjective ?? 'Salud y bienestar'}>
                    <SelectTrigger className={`${inputClass} w-full cursor-pointer text-slate-900`}>
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
                </Field>
              </div>
            </section>

            {/* — Datos Adicionales — */}
            <section>
              <SectionTitle>Datos Adicionales</SectionTitle>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contacto de Emergencia">
                    <Input id="emergencyContactName" placeholder="Nombre" defaultValue={member?.emergencyContactName ?? ''} className={inputClass} />
                  </Field>
                  <Field label="Tel. de Emergencia">
                    <Input id="emergencyContactPhone" placeholder="Teléfono" defaultValue={member?.emergencyContactPhone ?? ''} className={inputClass} />
                  </Field>
                </div>
                <Field label="¿Cómo nos conoció?">
                  <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                    <SelectTrigger className={`${inputClass} w-full cursor-pointer text-slate-900`}>
                      <SelectValue placeholder="Seleccionar Origen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Pasa por la puerta">Pasa por la puerta</SelectItem>
                      <SelectItem value="Recomendación">Recomendación de otro alumno</SelectItem>
                      <SelectItem value="Otro">Otro (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedOrigin === 'Otro' && (
                    <Input
                      placeholder="Contanos cómo llegaste..."
                      className={`${inputClass} mt-2 animate-in fade-in slide-in-from-top-1 duration-200`}
                    />
                  )}
                </Field>
              </div>
            </section>

          </div>

          {/* Footer sticky */}
          <div className="flex gap-3 pt-7 mt-7 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 border-stone-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-[13px] font-sans cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-[13px] font-sans cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Guardar Cambios' : 'Registrar Alumno'}
            </Button>
          </div>
        </form>

      </SheetContent>
    </Sheet>
  );
}
