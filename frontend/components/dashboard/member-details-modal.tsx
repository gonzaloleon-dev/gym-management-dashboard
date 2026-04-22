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
import { Member } from '@/lib/mock-data';
import { useAppContext, Plan } from '@/lib/app-context';
import { Save, X, CalendarIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
  const { plans, addMember, updateMember } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<string>(member?.plan ?? plans[0]?.name ?? '');
  const [selectedOrigin, setSelectedOrigin] = useState<string>(member?.origin ?? 'Instagram');
  const [joinDate, setJoinDate] = useState<Date | undefined>(
    member?.joinDate ? new Date(member.joinDate + "T12:00:00") : new Date()
  );
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    member?.nextExpiry ? new Date(member.nextExpiry + "T12:00:00") : undefined
  );

  useEffect(() => {
    setSelectedPlan(member?.plan ?? plans[0]?.name ?? '');
    setSelectedOrigin(member?.origin ?? 'Instagram');
    
    if (member) {
      setJoinDate(new Date(member.joinDate + "T12:00:00"));
      setExpiryDate(new Date(member.nextExpiry + "T12:00:00"));
    } else {
      const today = new Date();
      setJoinDate(today);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setExpiryDate(nextMonth);
    }
  }, [member, open, plans]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const medicalNotes = formData.get('medicalNotes') as string;
    const emergencyContactName = formData.get('emergencyContactName') as string;
    const emergencyContactPhone = formData.get('emergencyContactPhone') as string;

    if (isEditing) {
      updateMember(member.id, {
        name,
        phone,
        email,
        plan: selectedPlan as any,
        joinDate: joinDate ? format(joinDate, 'yyyy-MM-dd') : member.joinDate,
        nextExpiry: expiryDate ? format(expiryDate, 'yyyy-MM-dd') : member.nextExpiry,
        medicalNotes,
        emergencyContactName,
        emergencyContactPhone,
        origin: selectedOrigin,
      });
    } else {
      addMember({
        id: `m${Date.now()}`,
        dni: 'N/A',
        name,
        email,
        phone,
        plan: selectedPlan as any,
        status: (expiryDate && new Date(expiryDate) < new Date()) ? 'Vencido' : 'Activo',
        lastPayment: 'N/A',
        nextExpiry: expiryDate ? format(expiryDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        debt: 0,
        daysOverdue: 0,
        joinDate: joinDate ? format(joinDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        medicalNotes,
        emergencyContactName,
        emergencyContactPhone,
        personalObjective: 'Salud y bienestar',
        origin: selectedOrigin,
        initialPlan: selectedPlan as any,
      });
    }
    onOpenChange(false);
  };

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
          onSubmit={handleSubmit}
        >
          <div className="space-y-0">

            {/* — Información Básica — */}
            <section>
              <SectionTitle first>Información Básica</SectionTitle>
              <div className="space-y-4">
                <Field label="Nombre Completo">
                  <Input name="name" id="name" defaultValue={member?.name ?? ''} placeholder="Ej. Juan Pérez" className={inputClass} required />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Teléfono / WhatsApp">
                    <Input name="phone" id="phone" defaultValue={member?.phone ?? ''} placeholder="+54 11 1234-5678" className={inputClass} />
                  </Field>
                  <Field label="Email">
                    <Input name="email" id="email" type="email" defaultValue={member?.email ?? ''} placeholder="correo@mail.com" className={inputClass} />
                  </Field>
                </div>
              </div>
            </section>

            {/* — Membresía — */}
            <section>
              <SectionTitle>Membresía</SectionTitle>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Plan Actual">
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger className={`${inputClass} w-full cursor-pointer text-slate-900`}>
                        <SelectValue placeholder="Seleccionar Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(plan => (
                          <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Fecha de Inscripción">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              inputClass,
                              "w-full justify-start text-left font-normal pl-3 bg-white hover:bg-slate-50 border-slate-200 focus:bg-white text-slate-900 hover:text-slate-900",
                              !joinDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                            {joinDate ? format(joinDate, "dd/MM/yyyy") : <span className="text-slate-400">Seleccionar fecha</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={joinDate}
                            onSelect={(newDate) => {
                              setJoinDate(newDate);
                              if (!isEditing && newDate) {
                                const nextM = new Date(newDate);
                                nextM.setMonth(nextM.getMonth() + 1);
                                setExpiryDate(nextM);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                    <Field label="Fecha de Vencimiento">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              inputClass,
                              "w-full justify-start text-left font-normal pl-3 bg-white hover:bg-slate-50 border-slate-200 focus:bg-white text-slate-900 hover:text-slate-900",
                              !expiryDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                            {expiryDate ? format(expiryDate, "dd/MM/yyyy") : <span className="text-slate-400">Seleccionar fecha</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={expiryDate}
                            onSelect={setExpiryDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                  </div>
                </div>
              </div>
            </section>

            {/* — Perfil del Alumno — */}
            <section>
              <SectionTitle>Perfil del Alumno</SectionTitle>
              <div className="space-y-4">
                <Field label="Ficha Médica / Lesiones">
                  <Textarea
                    name="medicalNotes"
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
                    <Input name="emergencyContactName" id="emergencyContactName" placeholder="Nombre" defaultValue={member?.emergencyContactName ?? ''} className={inputClass} />
                  </Field>
                  <Field label="Tel. de Emergencia">
                    <Input name="emergencyContactPhone" id="emergencyContactPhone" placeholder="Teléfono" defaultValue={member?.emergencyContactPhone ?? ''} className={inputClass} />
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
