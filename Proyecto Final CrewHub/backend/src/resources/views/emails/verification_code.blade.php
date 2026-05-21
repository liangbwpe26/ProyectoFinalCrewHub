<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
        .content { padding: 40px 30px; text-align: center; color: #333333; }
        .content p { font-size: 16px; line-height: 1.6; margin-bottom: 25px; }
        .code-box { background-color: #f8f9fa; border: 2px dashed #0095f6; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; color: #0095f6; letter-spacing: 5px; margin: 0 auto 25px auto; width: max-content; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CrewHub</h1>
        </div>
        <div class="content">
            @if($type === 'registro')
                <h2>¡Bienvenido a CrewHub!</h2>
                <p>Estamos emocionados de tenerte aquí. Para completar tu registro y asegurar tu cuenta, por favor introduce el siguiente código de verificación en la aplicación:</p>
            @else
                <h2>Recuperación de contraseña</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Introduce este código en la aplicación para crear una nueva:</p>
            @endif
            
            <div class="code-box">
                {{ $code }}
            </div>
            
            <p style="font-size: 14px; color: #666;">Si no has solicitado este código, puedes ignorar este correo de forma segura. De lo contrario, te recomendamos cambiar la contraseña para evitar accesos no autorizados.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CrewHub. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>