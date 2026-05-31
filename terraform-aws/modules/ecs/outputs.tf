output "cluster_name"           { value = aws_ecs_cluster.this.name }
output "cluster_id"             { value = aws_ecs_cluster.this.id }
output "frontend_service_name"  { value = aws_ecs_service.frontend.name }
output "backend_service_name"   { value = aws_ecs_service.backend.name }
output "frontend_td_arn"        { value = aws_ecs_task_definition.frontend.arn }
output "backend_td_arn"         { value = aws_ecs_task_definition.backend.arn }
