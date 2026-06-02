# 🚀 Guía de Redespliegue — DevCareer AI

Esta guía contiene las instrucciones actualizadas para desplegar y destruir toda la infraestructura en AWS de la manera más sencilla y automática posible.

---

## ⚡ El Camino Fácil: Despliegue con GitHub Actions (CI/CD Pipeline)
El despliegue está completamente automatizado a través de GitHub Actions. No necesitas realizar compilaciones locales pesadas de Docker ni configurar Terraform en tu máquina. El pipeline se encarga de:
1. Detectar si rotó la sesión de AWS y limpiar estados obsoletos automáticamente.
2. Inicializar Terraform y levantar la infraestructura base (VPC, ECS, DynamoDB, ALB, etc.).
3. Extraer el DNS del balanceador externo, compilar el frontend con la URL correcta y subir la imagen a Docker Hub.
4. Realizar la actualización en ECS Fargate con la nueva versión en un solo flujo.

### Paso 1: Actualizar Credenciales en GitHub
Cada vez que inicies un nuevo lab en AWS Academy, las credenciales duran **4 horas**. Actualízalas en tu repositorio de GitHub:
1. Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Actualiza los valores de los siguientes secretos con los datos de **AWS Details**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN`

### Paso 2: Lanzar el Pipeline
1. Ve a la pestaña **Actions** en tu repositorio de GitHub.
2. Selecciona el workflow **CI/CD Pipeline** a la izquierda.
3. Haz clic en **Run workflow** → selecciona la rama `main` y haz clic en el botón verde **Run workflow**.
4. ¡Listo! En aproximadamente **8 minutos**, toda la infraestructura estará activa.

*Al finalizar el workflow, puedes ver el DNS externo generado en el log del paso `Extract Frontend ALB DNS` o buscarlo en la consola de AWS.*

---

## 🗑️ El Camino Fácil: Destrucción de Recursos (Ahorro de Créditos)
Para evitar que se consuman los créditos del laboratorio cuando no estés trabajando, debes destruir la infraestructura.

### Opción A: Desde GitHub Actions (Recomendado)
Hemos creado un workflow dedicado para destruir todo con un solo clic:
1. Ve a **Actions** en tu repositorio de GitHub.
2. Selecciona el workflow **Destroy Infrastructure** a la izquierda.
3. Haz clic en **Run workflow** y confirma.
4. El pipeline ejecutará `terraform destroy` de forma segura utilizando el estado guardado de la ejecución anterior.

### Opción B: Localmente desde PowerShell
Si prefieres limpiar tu cuenta o corregir recursos huérfanos localmente:
1. Asegúrate de actualizar las credenciales de AWS en tu archivo local [terraform-aws/terraform.tfvars](file:///c:/Users/herna/Desktop/DevCareer%20AI/terraform-aws/terraform.tfvars).
2. Ejecuta uno de nuestros scripts automatizados en la carpeta [scripts/](file:///c:/Users/herna/Desktop/DevCareer%20AI/scripts):
   
   * **Limpieza normal (Terraform Destroy):**
     ```powershell
     powershell -ExecutionPolicy Bypass -File .\scripts\cleanup.ps1
     ```
   * **Limpieza profunda (Eliminar VPC y recursos residuales vía CLI):**
     ```powershell
     powershell -ExecutionPolicy Bypass -File .\scripts\deep_cleanup.ps1
     ```

---

## 🎤 Configuración de Vapi y Micrófono (Para Entrevistas)

Los navegadores bloquean el micrófono en sitios HTTP. Como el balanceador de carga de AWS Academy no usa HTTPS, sigue estos pasos para habilitarlo:

### 1. Iniciar el Proxy Local
Abre una terminal local en el proyecto y ejecuta el proxy Node.js para reenviar peticiones al nuevo balanceador:
1. Modifica la variable `targetHost` en [proxy.js](file:///c:/Users/herna/Desktop/DevCareer%20AI/proxy.js) con el nuevo DNS del balanceador de carga externo (`devcareer-dev-alb-ext-...`).
2. Levanta el proxy local:
   ```powershell
   node proxy.js
   ```

### 2. Crear el Túnel HTTPS
En una segunda terminal local, abre el túnel seguro:
```powershell
ssh -o StrictHostKeyChecking=no -R 80:localhost:8080 nokey@localhost.run
```
Copia la URL segura generada que empieza con `https://` (ej. `https://xxxxxx.lhr.life`).

### 3. Actualizar Vapi
1. Entra a [dashboard.vapi.ai](https://dashboard.vapi.ai) → **Tools** → `getUserData`.
2. Reemplaza el dominio en la **Request URL** con el subdominio de tu túnel:
   ```
   https://xxxxxx.lhr.life/api/proxy/api/vapi/generate
   ```
3. Haz clic en **Save**.

### 4. Habilitar Micrófono en Chrome / Brave
1. Navega a `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. En el cuadro de texto, ingresa el DNS del frontend (HTTP): `http://devcareer-dev-alb-ext-...elb.amazonaws.com`
3. Cambia el estado a **Enabled** y presiona **Relaunch**.

---

## 🛠️ El Camino Manual: Despliegue Local (Alternativa)
Si necesitas levantar la infraestructura localmente paso a paso sin usar GitHub Actions, sigue estos pasos:

### 1. Actualizar credenciales locales
Actualiza [terraform-aws/terraform.tfvars](file:///c:/Users/herna/Desktop/DevCareer%20AI/terraform-aws/terraform.tfvars) con los 3 valores activos del Lab.

### 2. Limpiar estado anterior
```powershell
Remove-Item -Path "terraform-aws\terraform.tfstate", "terraform-aws\terraform.tfstate.backup" -Force -ErrorAction SilentlyContinue
```

### 3. Aplicar Terraform Base
```powershell
cd terraform-aws
terraform init
terraform apply -auto-approve
```

### 4. Compilar y Subir Frontend
```powershell
cd ../frontend
docker build `
  --build-arg NEXT_PUBLIC_API_URL=http://<NUEVO_ALB_DNS> `
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyCsScqZzOIxRpf9uCuWZuRNk8MywsQyPSc" `
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="prepwise-614c4.firebaseapp.com" `
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="prepwise-614c4" `
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="prepwise-614c4.firebasestorage.app" `
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="198075807525" `
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="1:198075807525:web:7bfc6a49a1e35a61968ccc" `
  --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-LV8MJSQCZT" `
  --build-arg NEXT_PUBLIC_VAPI_WEB_TOKEN="76e26462-fbaa-43ed-a7ad-2afad444677d" `
  --build-arg NEXT_PUBLIC_VAPI_WORKFLOW_ID="ab2a7208-e677-4952-95e9-05108448a006" `
  -t hernang09/devcareer-frontend:v13 .

docker push hernang09/devcareer-frontend:v13
```

### 5. Actualizar Tag del Frontend y Aplicar
Modifica `frontend_image` en `terraform.tfvars` al nuevo tag (ej: `"hernang09/devcareer-frontend:v13"`) y corre de nuevo:
```powershell
cd ../terraform-aws
terraform apply -auto-approve
```
