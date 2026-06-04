<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Mail\VerificationCodeMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Exception;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    /**
     * Registro de usuarios (Saneado, Validado y con Verificación de Correo)
     */
    public function register(Request $request)
    {
        try {
            // SANEAMIENTO PREVIO
            if ($request->has('username')) {
                $request->merge(['username' => strtolower($request->username)]);
            }

            // 1. Validación de datos
            $validatedData = $request->validate([
                'username' => [
                    'required',
                    'string',
                    'min:3',
                    'max:20',
                    'unique:users,username',
                    'regex:/^[a-z0-9_]+$/',
                    'not_in:login,register,chat,home,api,admin,perfil,config,index'
                ],
                'email' => 'required|string|email|max:100|unique:users,email',
                'password' => 'required|string|min:8',
            ]);

            // 2. Generamos el código de 6 dígitos
            $verificationCode = rand(100000, 999999);

            // 3. Creación del documento en MongoDB
            $user = User::create([
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'fecha_registro' => now(),
                'verification_code' => (string) $verificationCode // Guardamos el código
            ]);

            // 4. Enviamos el correo REAL usando Resend
            Mail::to($user->email)->send(new VerificationCodeMail($verificationCode, 'registro'));

            // OJO: Ya no generamos el token aquí. El usuario debe verificar su correo primero.
            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente. Por favor verifica tu correo.',
                'email' => $user->email // Devolvemos el correo para que React sepa a dónde se envió
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno en el servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar el correo electrónico con el código
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->verification_code !== $request->code) {
            return response()->json(['success' => false, 'message' => 'Código incorrecto o usuario no encontrado.'], 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null
        ]);

        // INICIO DE SESIÓN AUTOMÁTICO
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => new UserResource($user),
            'message' => 'Cuenta verificada correctamente.'
        ]);
    }

    /**
     * Login de usuarios (Con escudo de verificación)
     */

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = $request->login;
        if (!filter_var($loginInput, FILTER_VALIDATE_EMAIL)) {
            $loginInput = strtolower($loginInput);
        }

        $loginType = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $user = User::where($loginType, $loginInput)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Credenciales incorrectas.'], 401);
        }

        if (isset($user->is_banned) && $user->is_banned === true) {
            return response()->json([
                'success' => false,
                'message' => 'Tu cuenta ha sido suspendida permanentemente por violar las normas de la comunidad.'
            ], 403);
        }

        if (is_null($user->email_verified_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Debes verificar tu correo.',
                'needs_verification' => true,
                'email' => $user->email
            ], 403);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => new UserResource($user),
            'message' => 'Inicio de sesión exitoso'
        ]);
    }

    /**
     * Solicitar recuperación de contraseña
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Falso positivo por seguridad (para que no averigüen qué correos existen)
            return response()->json(['success' => true]);
        }

        $resetCode = rand(100000, 999999);
        $user->update(['reset_password_code' => (string) $resetCode]);

        // Enviamos el correo REAL usando Resend
        Mail::to($user->email)->send(new VerificationCodeMail($resetCode, 'recuperacion'));

        return response()->json(['success' => true]);
    }

    /**
     * Establecer la nueva contraseña
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'new_password' => 'required|string|min:8'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->reset_password_code !== $request->code) {
            return response()->json(['success' => false, 'message' => 'Código incorrecto o expirado.'], 400);
        }

        // Actualizamos la contraseña y borramos el código
        $user->update([
            'password' => Hash::make($request->new_password),
            'reset_password_code' => null
        ]);

        return response()->json(['success' => true, 'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.']);
    }

    /**
     * Reenviar el código de verificación
     */
    public function resendVerificationCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado.'], 404);
        }

        if (!is_null($user->email_verified_at)) {
            return response()->json(['success' => false, 'message' => 'Este correo ya está verificado.'], 400);
        }

        // Generamos un código nuevo
        $newCode = rand(100000, 999999);
        $user->update(['verification_code' => (string) $newCode]);

        // Lo enviamos (Recuerda: solo llegará si el correo es tu matbenesc@alu.edu.gva.es)
        Mail::to($user->email)->send(new \App\Mail\VerificationCodeMail($newCode, 'registro'));

        return response()->json([
            'success' => true,
            'message' => 'Nuevo código enviado. Revisa tu bandeja de entrada.'
        ]);
    }

    public function logout(Request $request)
    {
        // 1. Obtener al usuario (para verificar si hay alguien)
        $user = Auth::user();

        if ($user) {
            // 2. Cerrar sesión
            Auth::guard('web')->logout();

            // 3. Invalidar la sesión en el servidor
            $request->session()->invalidate();

            // 4. Regenerar el token para evitar ataques CSRF con la sesión vieja
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ], 200);
    }

    /**
     * Obtener el usuario autenticado enriquecido con su ubicación
     */
    public function show(Request $request)
    {
        return new UserResource($request->user());
    }
}