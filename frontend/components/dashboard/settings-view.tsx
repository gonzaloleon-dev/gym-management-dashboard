'use client';

import { Save, Building, Bell, CreditCard, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PLAN_PRICES, formatCurrency } from '@/lib/mock-data';

export function SettingsView() {
  return (
    <div className="space-y-6">
      {/* Business Settings */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base text-card-foreground">Datos del Gimnasio</CardTitle>
              <CardDescription>Configuración general de tu negocio</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gym-name">Nombre del Gimnasio</Label>
              <Input
                id="gym-name"
                defaultValue={process.env.NEXT_PUBLIC_GYM_NAME || ""}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                defaultValue={process.env.NEXT_PUBLIC_GYM_CUIT || ""}
                className="bg-muted/50 border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              defaultValue={process.env.NEXT_PUBLIC_GYM_ADDRESS || ""}
              className="bg-muted/50 border-border"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                defaultValue={process.env.NEXT_PUBLIC_GYM_PHONE || ""}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={process.env.NEXT_PUBLIC_CONTACT_EMAIL || ""}
                className="bg-muted/50 border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary/10 p-2">
              <CreditCard className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base text-card-foreground">Precios de Planes (Mensual)</CardTitle>
              <CardDescription>Configura las tarifas de membresía</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PLAN_PRICES).map(([plan, price]) => (
              <div key={plan} className="space-y-2">
                <Label htmlFor={`price-${plan}`}>{plan}</Label>
                <Input
                  id={`price-${plan}`}
                  type="number"
                  defaultValue={price}
                  className="bg-muted/50 border-border"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-base text-card-foreground">Notificaciones</CardTitle>
              <CardDescription>Configura alertas y recordatorios</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recordatorio de Vencimiento</Label>
              <p className="text-sm text-muted-foreground">
                Enviar WhatsApp 3 días antes del vencimiento
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alerta de Deuda</Label>
              <p className="text-sm text-muted-foreground">
                Notificar cuando un miembro acumule deuda
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Resumen Diario</Label>
              <p className="text-sm text-muted-foreground">
                Recibir email con el resumen del día
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base text-card-foreground">Integración API</CardTitle>
              <CardDescription>Configura la conexión con tu backend Java Spring Boot</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">URL del API</Label>
            <Input
              id="api-url"
              placeholder={process.env.NEXT_PUBLIC_API_URL || ""}
              className="bg-muted/50 border-border font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="bg-muted/50 border-border font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="env">Entorno</Label>
            <Select defaultValue="development">
              <SelectTrigger className="bg-muted/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Desarrollo</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Producción</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
