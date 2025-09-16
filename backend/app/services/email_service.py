import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
import os

def send_email(dest_email: str, subject: str, html: str):
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    sender_name = os.getenv('EMAIL_SENDER_NAME', 'Paivas Burguers')
    sender_email = os.getenv('EMAIL_SENDER', smtp_user)

    if not smtp_user or not smtp_pass:
        raise Exception("SMTP_USER e SMTP_PASS não configurados. Verifique o arquivo .env.")

    msg = MIMEMultipart()
    msg['From'] = formataddr((sender_name, sender_email))
    msg['To'] = dest_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html, 'html'))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(sender_email, dest_email, msg.as_string())

# Exemplo de uso:
# send_email('cliente@email.com', 'Bem-vindo!', '<h1>Bem-vindo ao Paivas Burguers!</h1>')
