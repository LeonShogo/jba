from email.message import EmailMessage
import os
import smtplib


def send_email(recipient: str, subject: str, body: str) -> None:
    
    message = EmailMessage()
    message["From"] = os.environ["EMAIL_FROM"]
    message["To"] = recipient
    message["Subject"] = subject
    
    message.set_content(body)
    
    host = os.environ["EMAIL_SMTP_HOST"]
    port = int(os.environ["EMAIL_SMTP_PORT"])
    username = os.environ["EMAIL_SMTP_USER"]
    password = os.environ["EMAIL_SMTP_PASSWORD"]
    
    
    use_tls = os.getenv("EMAIL_SMTP_USE_TLS", "true").lower() == "true"

    if not use_tls:
        raise RuntimeError("Unverschlüsselter Mailversand ist deaktiviert.")

    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(username, password)
        server.send_message(message)
