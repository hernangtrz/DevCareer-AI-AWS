# 🚀 Guía de Redespliegue — DevCareer AI

Cada vez que inicies una nueva sesión de Laboratorio de AWS Academy, sigue estos pasos en orden.
Este proceso tarda aproximadamente **15-20 minutos** en total.

---

## 📋 Requisitos Previos
- **Docker Desktop** debe estar abierto y corriendo
- La terminal abierta en la carpeta raíz del proyecto: `c:\Users\herna\Desktop\DevCareer AI`
- El Lab de AWS Academy debe estar **activo** con credenciales nuevas

---

## Paso 1 — Obtener las credenciales nuevas del Lab

En la pantalla del laboratorio de AWS Academy haz clic en **"AWS Details"** → **"Show"** y copia los 3 valores:
- `aws_access_key_id` (empieza por `ASIA...`)
- `aws_secret_access_key`
- `aws_session_token` (el más largo, empieza por `IQoJ...`)

---

## Paso 2 — Actualizar `terraform.tfvars`

Abre el archivo [`terraform-aws/terraform.tfvars`](terraform-aws/terraform.tfvars) y reemplaza las líneas 14-16 con las credenciales del paso anterior:

```hcl
aws_access_key_id     = "ASIA..."         # ← nuevo valor del Lab
aws_secret_access_key = "..."             # ← nuevo valor del Lab
aws_session_token     = "IQoJb3Jp..."    # ← nuevo valor del Lab
```

> ⚠️ Las demás líneas del archivo no cambian. Solo los 3 valores de credenciales.

---

## Paso 3 — Limpiar el estado antiguo de Terraform

El `tfstate` del lab anterior ya no es válido porque el Account ID cambia entre sesiones:

```powershell
Remove-Item -Path "terraform-aws\terraform.tfstate", "terraform-aws\terraform.tfstate.backup" -Force -ErrorAction SilentlyContinue
```

---

## Paso 4 — Aplicar Terraform (crear toda la infraestructura)

```powershell
cd "c:\Users\herna\Desktop\DevCareer AI\terraform-aws"
terraform init
terraform apply -auto-approve
```

Al finalizar (~5 min) verás este output con los DNS generados:

```
frontend_alb_dns = "devcareer-dev-alb-ext-XXXXXXXX.us-east-1.elb.amazonaws.com"
backend_alb_dns  = "internal-devcareer-dev-alb-int-XXXXXXXX.us-east-1.elb.amazonaws.com"
```

**Guarda el valor de `frontend_alb_dns`**, lo necesitarás en el siguiente paso.

---

## Paso 5 — Reconstruir el Frontend con el nuevo DNS del ALB

El frontend tiene la URL del balanceador de carga **compilada dentro de la imagen Docker**. Como el DNS cambia con cada lab, hay que reconstruirla.

Reemplaza `<frontend_alb_dns>` con el valor del paso anterior e incrementa el número de versión (v11 → v12, v12 → v13, etc.):

```powershell
cd "c:\Users\herna\Desktop\DevCareer AI\frontend"

docker build `
  --build-arg NEXT_PUBLIC_API_URL=http://<frontend_alb_dns> `
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyCsScqZzOIxRpf9uCuWZuRNk8MywsQyPSc" `
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="prepwise-614c4.firebaseapp.com" `
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="prepwise-614c4" `
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="prepwise-614c4.firebasestorage.app" `
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="198075807525" `
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="1:198075807525:web:7bfc6a49a1e35a61968ccc" `
  --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-LV8MJSQCZT" `
  --build-arg NEXT_PUBLIC_VAPI_WEB_TOKEN="76e26462-fbaa-43ed-a7ad-2afad444677d" `
  --build-arg NEXT_PUBLIC_VAPI_WORKFLOW_ID="ab2a7208-e677-4952-95e9-05108448a006" `
  -t hernang09/devcareer-frontend:v12 .

docker push hernang09/devcareer-frontend:v12
```

> 📝 **Regla:** Cada vez que relances el lab, incrementa el número de versión del tag (v12, v13, v14...). Esto obliga a ECS a descargar la imagen nueva.

---

## Paso 6 — Actualizar el tag del frontend en Terraform y redesplegar

Edita [`terraform-aws/terraform.tfvars`](terraform-aws/terraform.tfvars), línea 11:

```hcl
frontend_image = "hernang09/devcareer-frontend:v12"  # ← el nuevo tag
```

Luego aplica de nuevo:

```powershell
cd "c:\Users\herna\Desktop\DevCareer AI\terraform-aws"
terraform apply -auto-approve
```

ECS tardará **2-3 minutos** en reemplazar las tareas antiguas con la nueva imagen.

---

## Paso 7 — Verificar la App en el Navegador

Abre en el navegador:

```
http://<frontend_alb_dns>
```

- ✅ Registrar una cuenta nueva → debe redirigir al dashboard
- ✅ Iniciar sesión → debe llegar al dashboard sin bucles
- ✅ Crear una entrevista → Gemini debe generar preguntas

---

## Paso 8 — Configurar el Túnel HTTPS para Vapi (para hacer entrevistas)

Los navegadores modernos bloquean el acceso al micrófono si la página no corre en HTTPS. Como el ALB de AWS Academy usa HTTP, necesitamos crear un túnel seguro.

### 8.1 — Abrir el proxy local (Terminal 1)

Abre una **primera terminal** y ejecuta el proxy Node.js:

```powershell
cd "c:\Users\herna\Desktop\DevCareer AI"

# Edita proxy.js primero: cambia "targetHost" al nuevo DNS del ALB externo
# targetHost = 'devcareer-dev-alb-ext-XXXXXXXX.us-east-1.elb.amazonaws.com'

node proxy.js
```

Deberías ver: `Proxy server listening on port 8080 and forwarding to devcareer-dev-alb-ext-...`

### 8.2 — Crear el túnel HTTPS (Terminal 2)

Abre una **segunda terminal** y ejecuta:

```powershell
ssh -o StrictHostKeyChecking=no -R 80:localhost:8080 nokey@localhost.run
```

La terminal imprimirá una URL HTTPS del tipo:
```
xxxxxxxxxxxxxx.lhr.life tunneled with tls termination, https://xxxxxxxxxxxxxx.lhr.life
```

**Copia esa URL** (la que empieza por `https://`).

### 8.3 — Actualizar la URL del Webhook en el Dashboard de Vapi

1. Ve a [dashboard.vapi.ai](https://dashboard.vapi.ai) → **Tools** → `getUserData`
2. En el campo **Request URL** pon:
   ```
   https://xxxxxxxxxxxxxx.lhr.life/api/proxy/api/vapi/generate
   ```
   *(reemplaza `xxxxxxxxxxxxxx` con el subdominio que te dio el túnel en el paso anterior)*
3. Haz clic en **Save**

### 8.4 — Habilitar micrófono en el navegador

Como la URL del lab sigue siendo HTTP, el navegador bloquea el micrófono. Configura una excepción una sola vez:

1. En Chrome/Brave, abre: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Pega la URL del frontend: `http://<frontend_alb_dns>`
3. Cambia a **Enabled** y haz clic en **Relaunch**

---

## ✅ ¡Listo! Flujo completo de la app

Una vez completados todos los pasos, la app estará disponible y funcional:

```
Usuario (navegador)
  → http://<frontend_alb_dns>               (interfaz Next.js)
  → /api/proxy → Backend Express            (autenticación, entrevistas, feedback)
  → DynamoDB                                (persistencia de datos)

Vapi (entrevista de voz)
  → https://xxxxx.lhr.life                  (túnel HTTPS seguro)
  → proxy.js (puerto 8080)                  (proxy local)
  → http://<frontend_alb_dns>/api/proxy/api/vapi/generate
  → Backend Express → Gemini AI             (generación de preguntas)
```

---

## 📊 Resumen: ¿Qué cambia con cada nuevo lab?

| Componente              | ¿Necesita actualizarse? | Qué hacer                                          |
|-------------------------|-------------------------|----------------------------------------------------|
| **Credenciales AWS**    | ✅ Siempre              | Actualizar las 3 líneas en `terraform.tfvars`      |
| **tfstate**             | ✅ Siempre              | Borrar ambos archivos `.tfstate`                   |
| **Frontend (imagen)**   | ✅ Siempre              | Rebuild con nuevo DNS + subir tag nuevo a Docker   |
| **Backend (imagen)**    | ❌ Nunca                | Usa IAM Role (no tiene credenciales hardcoded)     |
| **DynamoDB tablas**     | ❌ Nunca                | Se crean desde cero con Terraform automáticamente  |
| **proxy.js**            | ✅ Siempre              | Actualizar el `targetHost` con el nuevo DNS del ALB |
| **URL Webhook en Vapi** | ✅ Siempre              | Actualizar con la nueva URL del túnel HTTPS        |

---

## ⚡ Comandos Rápidos (Cheat Sheet)

```powershell
# 1. Limpiar estado
Remove-Item -Path "terraform-aws\terraform.tfstate", "terraform-aws\terraform.tfstate.backup" -Force -ErrorAction SilentlyContinue

# 2. Aplicar infraestructura
cd "c:\Users\herna\Desktop\DevCareer AI\terraform-aws"
terraform apply -auto-approve

# 3. Build del frontend (reemplaza <DNS> y <VERSION>)
cd "c:\Users\herna\Desktop\DevCareer AI\frontend"
docker build --build-arg NEXT_PUBLIC_API_URL=http://<DNS> --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyCsScqZzOIxRpf9uCuWZuRNk8MywsQyPSc" --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="prepwise-614c4.firebaseapp.com" --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="prepwise-614c4" --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="prepwise-614c4.firebasestorage.app" --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="198075807525" --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="1:198075807525:web:7bfc6a49a1e35a61968ccc" --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-LV8MJSQCZT" --build-arg NEXT_PUBLIC_VAPI_WEB_TOKEN="76e26462-fbaa-43ed-a7ad-2afad444677d" --build-arg NEXT_PUBLIC_VAPI_WORKFLOW_ID="ab2a7208-e677-4952-95e9-05108448a006" -t hernang09/devcareer-frontend:<VERSION> .
docker push hernang09/devcareer-frontend:<VERSION>

# 4. Redesplegar con nuevo tag
cd "c:\Users\herna\Desktop\DevCareer AI\terraform-aws"
terraform apply -auto-approve

# 5. Túnel HTTPS (en dos terminales separadas)
# Terminal 1:
node "c:\Users\herna\Desktop\DevCareer AI\proxy.js"
# Terminal 2:
ssh -o StrictHostKeyChecking=no -R 80:localhost:8080 nokey@localhost.run
```
