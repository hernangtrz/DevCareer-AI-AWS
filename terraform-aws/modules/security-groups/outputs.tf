output "alb_external_sg_id" { value = aws_security_group.alb_external.id }
output "alb_internal_sg_id" { value = aws_security_group.alb_internal.id }
output "frontend_sg_id" { value = aws_security_group.frontend.id }
output "backend_sg_id" { value = aws_security_group.backend.id }
output "rds_sg_id" { value = aws_security_group.rds.id }
