# Neural Expert — Guía de Despliegue (GitHub + Render)

## Requisitos Previos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Render](https://render.com)

---

## Paso 1: Publicar el Código en GitHub

1. En Replit, abre el panel lateral izquierdo y selecciona **Tools → Git**.
2. Haz clic en **Connect to GitHub** y autoriza Replit en tu cuenta de GitHub.
3. Crea un nuevo repositorio (público o privado) con el nombre que prefieras, por ejemplo `neural-expert-lottery`.
4. Replit hará el push inicial automáticamente. Cada vez que guardes cambios, podrás hacer push desde el mismo panel Git.

---

## Paso 2: Crear el Servicio en Render

### Opción A: Blueprint (Recomendado)

1. Entra a [render.com/dashboard](https://dashboard.render.com) y haz clic en **New +** → **Blueprint**.
2. Conecta tu cuenta de GitHub si no lo has hecho.
3. Selecciona el repositorio `neural-expert-lottery`.
4. Render detectará el archivo `render.yaml` automáticamente y creará:
   - Un **Web Service** (`neural-expert-lottery`) — Express API + frontend React
   - Una **Base de datos PostgreSQL** (`lottery-db`) — Plan Basic 256MB
5. Haz clic en **Apply** y espera a que el build termine.

### Opción B: Manual

1. **Base de datos**: New + → PostgreSQL → Nombre: `lottery-db`, Plan: Basic 256MB. Copia la **Internal Database URL**.
2. **Web Service**: New + → Web Service → Conecta el repo GitHub.
   - **Runtime**: Node
   - **Build Command**:
     ```
     npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter @workspace/lottery-app run build && pnpm --filter @workspace/api-server run build
     ```
   - **Start Command**: `node artifacts/api-server/dist/index.cjs`
   - **Variables de entorno**:
     - `NODE_ENV` = `production`
     - `BASE_PATH` = `/`
     - `DATABASE_URL` = *(la URL interna de tu base de datos PostgreSQL)*

---

## Paso 3: Inicializar la Base de Datos

Después del primer despliegue exitoso, necesitas crear las tablas en la base de datos de producción.

### Desde Render Shell

1. En el dashboard de Render, abre tu Web Service → pestaña **Shell**.
2. Ejecuta:
   ```bash
   npx drizzle-kit push --config lib/db/drizzle.config.ts
   ```
   Esto creará las tablas `historial_baloto`, `historial_revancha` y `historial_powerball`.

### Alternativa: Desde tu máquina local

1. Copia la **External Database URL** de tu base de datos en Render.
2. Ejecuta:
   ```bash
   DATABASE_URL="postgresql://..." npx drizzle-kit push --config lib/db/drizzle.config.ts
   ```

---

## Paso 4: Cargar Datos Históricos

1. Abre tu aplicación desplegada (la URL aparece en el dashboard de Render).
2. Ve a **Gestión de Datos** en el sidebar.
3. Sube los archivos CSV para cada lotería:
   - **Baloto**: columnas `fecha;b1;b2;b3;b4;b5;sb`
   - **Revancha**: columnas `fecha;r1;r2;r3;r4;r5;rsb`
   - **Powerball**: columnas `fecha;Bola Blanca 1;Bola Blanca 2;Bola Blanca 3;Bola Blanca 4;Bola Blanca 5;Powerball`

El separador puede ser `;` o `,` — el parser los detecta automáticamente.

---

## Estructura del Proyecto

```
/
├── render.yaml              ← Configuración de Render Blueprint
├── .node-version            ← Versión de Node.js (22 LTS)
├── artifacts/
│   ├── api-server/          ← Express API + Monte Carlo engine
│   └── lottery-app/         ← React/Vite frontend
├── lib/
│   ├── db/                  ← Drizzle ORM schema + migrations
│   ├── api-spec/            ← OpenAPI spec
│   ├── api-zod/             ← Zod schemas generados
│   └── api-client-react/    ← React Query hooks generados
└── package.json             ← Monorepo root (pnpm workspace)
```

---

## Notas Importantes

- **Auto-deploy**: Render hace deploy automáticamente cada vez que hagas push a la rama `main` de GitHub.
- **Free Tier**: El plan gratuito de Render suspende el servicio después de 15 minutos de inactividad. El primer request después de la suspensión tarda ~30 segundos.
- **Base de datos**: El plan Basic 256MB de Render tiene un límite de 256MB de almacenamiento y 97 días de retención antes de eliminar la DB.
