# IA Images

App para generar imágenes de calidad a partir de un pedido en lenguaje natural (con o sin imagen
de referencia), sin la típica "cara de IA" genérica.

## Cómo funciona

1. **Clasificador** (`lib/classifier.ts`): una llamada barata a Gemini clasifica el pedido del
   usuario en una categoría (poster de evento, post de redes, producto, retrato/avatar, meme o
   general) y extrae los datos relevantes (título, fecha, lugar, etc.).
2. **Plantillas** (`lib/templates/`): cada categoría tiene su propia plantilla de prompt que
   encapsula reglas de diseño (tipografía, composición, cómo evitar el look genérico de IA) para
   construir un prompt final de alta calidad.
3. **Proveedor de imagen** (`lib/providers/`): el prompt final se envía a Google Gemini 2.5 Flash
   Image ("Nano Banana"). El proveedor está detrás de una interfaz (`ImageProvider`) para poder
   cambiar de motor en el futuro sin tocar el resto de la app.

## Configuración

1. Consigue una API key gratuita en [Google AI Studio](https://aistudio.google.com).
2. Copia `.env.local.example` a `.env.local` y pega tu key en `GOOGLE_API_KEY`.
3. Instala dependencias y levanta el servidor:

```bash
npm install
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000).

## Seguridad

- La API key solo se usa del lado del servidor (nunca se expone al navegador).
- El endpoint `/api/generate` valida el prompt y la imagen de referencia (tipo/tamaño), y aplica
  rate limiting por IP para evitar abuso de la cuota gratuita.
- No hay persistencia de imágenes ni prompts en el servidor; el historial vive solo en el
  navegador del usuario (`localStorage`).
