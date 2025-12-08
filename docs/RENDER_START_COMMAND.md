# Verificar Start Command en Render

## Si usas render.yaml (recomendado)

Si tu servicio se creó desde `render.yaml`, el Start Command ya está configurado correctamente:

```yaml
startCommand: cd backend && chmod +x start.sh && bash start.sh
```

**No necesitas cambiar nada** - los cambios se aplicarán automáticamente en el próximo despliegue.

## Si creaste el servicio manualmente

Si creaste el servicio manualmente en Render, verifica el Start Command:

1. Ve a tu dashboard de Render
2. Selecciona tu servicio `snowrail-backend`
3. Ve a "Settings" → "Build & Deploy"
4. Verifica que el "Start Command" sea:

```bash
cd backend && chmod +x start.sh && bash start.sh
```

Si es diferente, cámbialo al comando de arriba y guarda.

## Alternativa: Usar npm start

Si prefieres no usar `start.sh`, puedes cambiar el Start Command a:

```bash
cd backend && npm run start:prod
```

Pero `start.sh` es más flexible y maneja mejor las rutas en Render.

