import json
import os
import time
import base64
import boto3


def lambda_handler(event, context):
    """
    Email handler Lambda for Dovecot mail system.
    
    Actions:
    - deliver: Write email to EFS Maildir
    - wake: Start Fargate task
    - status: Check if Fargate is running
    """
    body = event.get('body', '{}')
    if isinstance(body, str):
        body = json.loads(body)
    
    # Auth check
    headers = event.get('headers', {})
    api_key = headers.get('x-api-key', headers.get('X-API-Key', ''))
    expected_key = os.environ.get('API_KEY', '')
    
    if expected_key and api_key != expected_key:
        return {
            'statusCode': 401,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    action = body.get('action', 'deliver')
    
    if action == 'deliver':
        return deliver_email(body, context)
    elif action == 'wake':
        return wake_fargate()
    elif action == 'status':
        return get_status()
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Unknown action'})
        }


def deliver_email(body, context):
    """Write email to Maildir format on EFS."""
    maildir_base = os.environ.get('MAILDIR_BASE', '/mnt/efs')
    username = os.environ.get('DOVECOT_USERNAME', 'clay')
    
    maildir = f"{maildir_base}/{username}/Maildir"
    
    # Create Maildir structure
    for subdir in ['new', 'cur', 'tmp']:
        os.makedirs(f"{maildir}/{subdir}", exist_ok=True)
    
    raw_email = body.get('raw_email', '')
    if not raw_email:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'No email content'})
        }
    
    # Decode base64 email
    try:
        email_data = base64.b64decode(raw_email)
    except Exception:
        email_data = raw_email.encode('utf-8')
    
    # Generate Maildir-compliant filename
    timestamp = int(time.time())
    filename = f"{timestamp}.{context.aws_request_id}.lambda"
    
    tmp_path = f"{maildir}/tmp/{filename}"
    new_path = f"{maildir}/new/{filename}"
    
    # Write to tmp, then move to new (atomic)
    with open(tmp_path, 'wb') as f:
        f.write(email_data)
    
    os.rename(tmp_path, new_path)
    os.chown(new_path, 1000, 1000)  # vmail user
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'status': 'delivered',
            'from': body.get('from'),
            'to': body.get('to'),
            'file': filename
        })
    }


def wake_fargate():
    """Start Fargate task if not already running."""
    ecs = boto3.client('ecs')
    ec2 = boto3.client('ec2')
    
    cluster = os.environ.get('ECS_CLUSTER', 'dovecot')
    task_def = os.environ.get('TASK_DEFINITION', 'dovecot')
    subnets = os.environ.get('SUBNETS', '').split(',')
    security_group = os.environ.get('SECURITY_GROUP', '')
    
    # Check if already running
    tasks = ecs.list_tasks(cluster=cluster)
    if tasks['taskArns']:
        task_info = ecs.describe_tasks(cluster=cluster, tasks=tasks['taskArns'])
        for task in task_info['tasks']:
            if task['lastStatus'] == 'RUNNING':
                ip = _get_task_ip(task, ec2)
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'status': 'running',
                        'ip': ip
                    })
                }
    
    # Start new task
    response = ecs.run_task(
        cluster=cluster,
        taskDefinition=task_def,
        launchType='FARGATE',
        enableExecuteCommand=True,
        networkConfiguration={
            'awsvpcConfiguration': {
                'subnets': subnets,
                'securityGroups': [security_group],
                'assignPublicIp': 'ENABLED'
            }
        }
    )
    
    task_arn = response['tasks'][0]['taskArn']
    
    # Wait for task to start (up to 60s)
    for _ in range(30):
        time.sleep(2)
        task_info = ecs.describe_tasks(cluster=cluster, tasks=[task_arn])
        if task_info['tasks'] and task_info['tasks'][0]['lastStatus'] == 'RUNNING':
            ip = _get_task_ip(task_info['tasks'][0], ec2)
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'status': 'started',
                    'ip': ip
                })
            }
    
    return {
        'statusCode': 202,
        'body': json.dumps({
            'status': 'starting',
            'task': task_arn
        })
    }


def get_status():
    """Check if Fargate task is running."""
    ecs = boto3.client('ecs')
    ec2 = boto3.client('ec2')
    
    cluster = os.environ.get('ECS_CLUSTER', 'dovecot')
    
    tasks = ecs.list_tasks(cluster=cluster)
    if not tasks['taskArns']:
        return {
            'statusCode': 200,
            'body': json.dumps({'status': 'stopped'})
        }
    
    task_info = ecs.describe_tasks(cluster=cluster, tasks=tasks['taskArns'])
    if task_info['tasks']:
        task = task_info['tasks'][0]
        status = task['lastStatus']
        
        if status == 'RUNNING':
            ip = _get_task_ip(task, ec2)
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'status': 'running',
                    'ip': ip
                })
            }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps({'status': status.lower()})
            }
    
    return {
        'statusCode': 200,
        'body': json.dumps({'status': 'unknown'})
    }


def _get_task_ip(task, ec2):
    """Extract public IP from Fargate task."""
    for attachment in task.get('attachments', []):
        for detail in attachment.get('details', []):
            if detail['name'] == 'networkInterfaceId':
                eni_id = detail['value']
                eni = ec2.describe_network_interfaces(
                    NetworkInterfaceIds=[eni_id]
                )
                return eni['NetworkInterfaces'][0].get('Association', {}).get('PublicIp')
    return None