# Script de Limpieza y Recuperación de Estado de AWS Academy
# Creado para corregir recursos huérfanos sin tener que reiniciar el Lab

cd "$PSScriptRoot\..\terraform-aws"

# 1. Leer credenciales desde terraform.tfvars
echo "Leyendo credenciales desde terraform.tfvars..."
$tfvars = Get-Content "terraform.tfvars" -Raw
$aws_id = [regex]::Match($tfvars, 'aws_access_key_id\s*=\s*"([^"]+)"').Groups[1].Value
$aws_key = [regex]::Match($tfvars, 'aws_secret_access_key\s*=\s*"([^"]+)"').Groups[1].Value
$aws_token = [regex]::Match($tfvars, 'aws_session_token\s*=\s*"([^"]+)"').Groups[1].Value

if (-not $aws_id -or -not $aws_key -or -not $aws_token) {
    Write-Error "No se pudieron encontrar las credenciales de AWS en terraform.tfvars"
    exit 1
}

# 2. Configurar variables de entorno para la sesión actual de PowerShell
$env:AWS_ACCESS_KEY_ID = $aws_id
$env:AWS_SECRET_ACCESS_KEY = $aws_key
$env:AWS_SESSION_TOKEN = $aws_token
$env:AWS_DEFAULT_REGION = "us-east-1"

echo "Credenciales configuradas con éxito."

# 3. Inicializar Terraform si es necesario
terraform init

# 4. Importar Tablas DynamoDB (ignorar errores si no existen)
echo "Importando Tablas DynamoDB..."
terraform import module.dynamodb.aws_dynamodb_table.users devcareer_users 2>$null
terraform import module.dynamodb.aws_dynamodb_table.interviews devcareer_interviews 2>$null
terraform import module.dynamodb.aws_dynamodb_table.feedback devcareer_feedback 2>$null

# 5. Importar Grupo de Subredes RDS
echo "Importando Grupo de Subredes de Base de Datos..."
terraform import module.vpc.aws_db_subnet_group.this devcareer-dev-db-subnet-group 2>$null

# 6. Importar Balanceadores de Carga y Target Groups
echo "Importando Balanceadores de Carga y Target Groups..."

$alb_ext_arn = aws elbv2 describe-load-balancers --names devcareer-dev-alb-ext --query "LoadBalancers[0].LoadBalancerArn" --output text 2>$null
if ($alb_ext_arn -and $alb_ext_arn -ne "None") {
    echo "Importando Load Balancer Externo..."
    terraform import module.alb.aws_lb.external $alb_ext_arn 2>$null
}

$alb_int_arn = aws elbv2 describe-load-balancers --names devcareer-dev-alb-int --query "LoadBalancers[0].LoadBalancerArn" --output text 2>$null
if ($alb_int_arn -and $alb_int_arn -ne "None") {
    echo "Importando Load Balancer Interno..."
    terraform import module.alb.aws_lb.internal $alb_int_arn 2>$null
}

$tg_front_arn = aws elbv2 describe-target-groups --names devcareer-dev-tg-frontend --query "TargetGroups[0].TargetGroupArn" --output text 2>$null
if ($tg_front_arn -and $tg_front_arn -ne "None") {
    echo "Importando Target Group Frontend..."
    terraform import module.alb.aws_lb_target_group.frontend $tg_front_arn 2>$null
}

$tg_back_arn = aws elbv2 describe-target-groups --names devcareer-dev-tg-backend --query "TargetGroups[0].TargetGroupArn" --output text 2>$null
if ($tg_back_arn -and $tg_back_arn -ne "None") {
    echo "Importando Target Group Backend..."
    terraform import module.alb.aws_lb_target_group.backend $tg_back_arn 2>$null
}

# 7. Ejecutar Terraform Destroy para limpiar la cuenta por completo
echo "¡Iniciando destrucción de recursos huérfanos importados!"
terraform destroy -auto-approve
