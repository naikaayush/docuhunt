provider "aws" {
  region = "ap-south-1"
}

resource "aws_ecs_cluster" "docuhunt_cluster" {
  name = "docuhunt-cluster"
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name        = "docuhunt-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_tasks_sg" {
  name        = "docuhunt-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 9200
    to_port         = 9200
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 9300
    to_port         = 9300
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 9998
    to_port         = 9998
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 5601
    to_port         = 5601
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Elasticsearch Task Definition
resource "aws_ecs_task_definition" "elasticsearch_task" {
  family                   = "elasticsearch"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 1024
  memory                  = 2048
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "elasticsearch"
      image = "docker.elastic.co/elasticsearch/elasticsearch:8.15.5"
      
      portMappings = [
        {
          containerPort = 9200
          hostPort      = 9200
          protocol      = "tcp"
        },
        {
          containerPort = 9300
          hostPort      = 9300
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "discovery.type"
          value = "single-node"
        },
        {
          name  = "ES_JAVA_OPTS"
          value = "-Xms1g -Xmx1g"
        },
        {
          name  = "xpack.security.enabled"
          value = "false"
        },
        {
          name  = "network.host"
          value = "0.0.0.0"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/elasticsearch"
          "awslogs-region"        = "ap-south-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Kibana Task Definition
resource "aws_ecs_task_definition" "kibana_task" {
  family                   = "kibana"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 512
  memory                  = 1024
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "kibana"
      image = "docker.elastic.co/kibana/kibana:8.15.5"
      
      portMappings = [
        {
          containerPort = 5601
          hostPort      = 5601
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "ELASTICSEARCH_HOSTS"
          value = "http://localhost:9200"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/kibana"
          "awslogs-region"        = "ap-south-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Tika Server Task Definition
resource "aws_ecs_task_definition" "tika_task" {
  family                   = "tika"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 512
  memory                  = 1024
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "tika"
      image = "apache/tika:3.0.0.0"
      
      portMappings = [
        {
          containerPort = 9998
          hostPort      = 9998
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/tika"
          "awslogs-region"        = "ap-south-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Application Load Balancer
resource "aws_lb" "docuhunt_alb" {
  name               = "docuhunt-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets           = data.aws_subnets.default.ids
}

# ALB Target Groups
resource "aws_lb_target_group" "elasticsearch_tg" {
  name        = "elasticsearch-tg"
  port        = 9200
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    path                = "/_cluster/health"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

resource "aws_lb_target_group" "kibana_tg" {
  name        = "kibana-tg"
  port        = 5601
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 10
  }
}

resource "aws_lb_target_group" "tika_tg" {
  name        = "tika-tg"
  port        = 9998
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 10
  }
}

# ALB Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.docuhunt_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:ap-south-1:050752654432:certificate/e8167a0b-80f4-4913-89ec-8dc866f54f33"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Invalid path"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "http_redirect" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 1

  action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
      host        = "api.docuhunt.me"
    }
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

# Listener Rules
resource "aws_lb_listener_rule" "elasticsearch_rule" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.elasticsearch_tg.arn
  }

  condition {
    path_pattern {
      values = ["/elasticsearch/*"]
    }
  }
}

resource "aws_lb_listener_rule" "kibana_rule" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 150

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.kibana_tg.arn
  }

  condition {
    path_pattern {
      values = ["/kibana/*"]
    }
  }
}

resource "aws_lb_listener_rule" "tika_rule" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tika_tg.arn
  }

  condition {
    path_pattern {
      values = ["/tika/*"]
    }
  }
}

# Data sources for default VPC and subnets
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Elasticsearch Service
resource "aws_ecs_service" "elasticsearch_service" {
  name            = "elasticsearch-service"
  cluster         = aws_ecs_cluster.docuhunt_cluster.id
  task_definition = aws_ecs_task_definition.elasticsearch_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.elasticsearch_tg.arn
    container_name   = "elasticsearch"
    container_port   = 9200
  }
}

# Kibana Service
resource "aws_ecs_service" "kibana_service" {
  name            = "kibana-service"
  cluster         = aws_ecs_cluster.docuhunt_cluster.id
  task_definition = aws_ecs_task_definition.kibana_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.kibana_tg.arn
    container_name   = "kibana"
    container_port   = 5601
  }
}

# Tika Service
resource "aws_ecs_service" "tika_service" {
  name            = "tika-service"
  cluster         = aws_ecs_cluster.docuhunt_cluster.id
  task_definition = aws_ecs_task_definition.tika_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.tika_tg.arn
    container_name   = "tika"
    container_port   = 9998
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "elasticsearch_logs" {
  name              = "/ecs/elasticsearch"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "kibana_logs" {
  name              = "/ecs/kibana"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "tika_logs" {
  name              = "/ecs/tika"
  retention_in_days = 30
}
