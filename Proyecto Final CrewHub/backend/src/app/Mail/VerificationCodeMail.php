<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Correo para enviar un código de verificación según el tipo de acción.
 */
class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Código de verificación enviado al usuario.
     *
     * @var string
     */
    public $code;

    /**
     * Tipo de mensaje: 'registro' o 'recuperacion'.
     *
     * @var string
     */
    public $type;

    /**
     * Crea una nueva instancia del mensaje.
     *
     * @param string $code Código de verificación.
     * @param string $type Tipo de correo ('registro' o 'recuperacion').
     */
    public function __construct($code, $type = 'registro')
    {
        $this->code = $code;
        $this->type = $type;
    }

    /**
     * Obtiene el sobre del mensaje con el asunto adecuado.
     */
    public function envelope(): Envelope
    {
        $subject = $this->type === 'registro'
            ? 'Bienvenido a CrewHub - Verifica tu cuenta'
            : 'CrewHub - Recuperación de contraseña';

        return new Envelope(subject: $subject);
    }

    /**
     * Define la vista que se usará para el contenido del correo.
     */
    public function content(): Content
    {
        return new Content(view: 'emails.verification_code');
    }

    /**
     * Adjuntos del mensaje.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
