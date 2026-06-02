# Script de Limpieza Profunda de Recursos Huérfanos AWS Academy
# Cubre: VPC, CloudWatch Log Groups, Subnets, Internet Gateway, EIPs, NAT GW

cd "$PSScriptRoot\..\terraform-aws"

# 1. Leer credenciales desde terraform.tfvars
$tfvars = Get-Content "terraform.tfvars" -Raw
$aws_id    = [regex]::Match($tfvars, 'aws_access_key_id\s*=\s*"([^"]+)"').Groups[1].Value
$aws_key   = [regex]::Match($tfvars, 'aws_secret_access_key\s*=\s*"([^"]+)"').Groups[1].Value
$aws_token = [regex]::Match($tfvars, 'aws_session_token\s*=\s*"([^"]+)"').Groups[1].Value

$env:AWS_ACCESS_KEY_ID     = $aws_id
$env:AWS_SECRET_ACCESS_KEY = $aws_key
$env:AWS_SESSION_TOKEN     = $aws_token
$env:AWS_DEFAULT_REGION    = "us-east-1"

echo "===== Credenciales configuradas. Buscando recursos huérfanos... ====="

# 2. Eliminar CloudWatch Log Groups directamente vía AWS CLI
echo "`n--- Eliminando CloudWatch Log Groups ---"
aws logs delete-log-group --log-group-name "/ecs/devcareer-dev/frontend" 2>$null
if ($LASTEXITCODE -eq 0) { echo "✅ Log Group frontend eliminado" } else { echo "ℹ️ Log Group frontend no existía o ya fue eliminado" }

aws logs delete-log-group --log-group-name "/ecs/devcareer-dev/backend" 2>$null
if ($LASTEXITCODE -eq 0) { echo "✅ Log Group backend eliminado" } else { echo "ℹ️ Log Group backend no existía o ya fue eliminado" }

# 3. Liberar IPs Elásticas huérfanas
echo "`n--- Liberando Elastic IPs huérfanas ---"
$eips = aws ec2 describe-addresses --query "Addresses[?AssociationId==null].AllocationId" --output text 2>$null
if ($eips) {
    foreach ($eip in $eips.Split()) {
        if ($eip) {
            aws ec2 release-address --allocation-id $eip 2>$null
            echo "✅ EIP $eip liberada"
        }
    }
} else {
    echo "ℹ️ No se encontraron EIPs huérfanas"
}

# 4. Buscar y destruir la VPC huérfana con todos sus recursos
echo "`n--- Buscando VPC huérfana devcareer-dev-vpc ---"
$vpc_id = aws ec2 describe-vpcs --filters "Name=tag:Name,Values=devcareer-dev-vpc" --query "Vpcs[0].VpcId" --output text 2>$null

if ($vpc_id -and $vpc_id -ne "None") {
    echo "VPC encontrada: $vpc_id. Iniciando limpieza de dependencias..."

    # Eliminar NAT Gateways
    echo "  Eliminando NAT Gateways..."
    $nat_ids = aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$vpc_id" "Name=state,Values=available" --query "NatGateways[].NatGatewayId" --output text 2>$null
    foreach ($nat in $nat_ids.Split()) {
        if ($nat) {
            aws ec2 delete-nat-gateway --nat-gateway-id $nat 2>$null
            echo "  NAT Gateway $nat eliminado (esperando que se libere...)"
        }
    }
    if ($nat_ids) { Start-Sleep -Seconds 30 }

    # Detach e Eliminar Internet Gateways
    echo "  Eliminando Internet Gateways..."
    $igw_ids = aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query "InternetGateways[].InternetGatewayId" --output text 2>$null
    foreach ($igw in $igw_ids.Split()) {
        if ($igw) {
            aws ec2 detach-internet-gateway --internet-gateway-id $igw --vpc-id $vpc_id 2>$null
            aws ec2 delete-internet-gateway --internet-gateway-id $igw 2>$null
            echo "  ✅ IGW $igw eliminado"
        }
    }

    # Eliminar Subnets
    echo "  Eliminando Subnets..."
    $subnet_ids = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query "Subnets[].SubnetId" --output text 2>$null
    foreach ($subnet in $subnet_ids.Split()) {
        if ($subnet) {
            aws ec2 delete-subnet --subnet-id $subnet 2>$null
            echo "  ✅ Subnet $subnet eliminada"
        }
    }

    # Eliminar Route Tables no principales
    echo "  Eliminando Route Tables personalizadas..."
    $rt_ids = aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpc_id" "Name=association.main,Values=false" --query "RouteTables[].RouteTableId" --output text 2>$null
    foreach ($rt in $rt_ids.Split()) {
        if ($rt) {
            aws ec2 delete-route-table --route-table-id $rt 2>$null
            echo "  ✅ Route Table $rt eliminada"
        }
    }

    # Eliminar Security Groups no-default
    echo "  Eliminando Security Groups personalizados..."
    $sg_ids = aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$vpc_id" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text 2>$null
    foreach ($sg in $sg_ids.Split()) {
        if ($sg) {
            aws ec2 delete-security-group --group-id $sg 2>$null
            echo "  ✅ Security Group $sg eliminado"
        }
    }

    # Finalmente eliminar la VPC
    echo "  Eliminando la VPC $vpc_id..."
    aws ec2 delete-vpc --vpc-id $vpc_id 2>$null
    if ($LASTEXITCODE -eq 0) {
        echo "✅ VPC $vpc_id eliminada con éxito"
    } else {
        echo "⚠️ No se pudo eliminar la VPC aún. Puede quedar alguna dependencia. Intenta de nuevo en 1-2 minutos."
    }
} else {
    echo "ℹ️ No se encontró VPC huérfana con el nombre devcareer-dev-vpc"
}

echo "`n===== Limpieza completada. Tu cuenta de AWS Academy está lista para el pipeline. ====="
