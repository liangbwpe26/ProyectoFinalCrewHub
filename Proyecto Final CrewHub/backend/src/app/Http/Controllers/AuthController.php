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

/**
* Controlador de autenticación y registro de usuarios.
* Provee endpoints para registro, verificación de correo, inicio de sesión,
* recuperación de contraseña, reenvío de códigos y cierre de sesión.
*/

class AuthController extends Controller
{
    
    /**
     * Registro de usuarios (saneado, validado y con verificación por correo).
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
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

            $verificationCode = rand(100000, 999999);

            $user = User::create([
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'fecha_registro' => now(),
                'verification_code' => (string) $verificationCode // Guardamos el código
            ]);

            Mail::to($user->email)->send(new VerificationCodeMail($verificationCode, 'registro'));

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente. Por favor verifica tu correo.',
                'email' => $user->email
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
     * Verifica el correo electrónico mediante un código enviado por email.
     *
     * Valida el código y marca el email como verificado, inicia sesión y
     * regenera la sesión.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
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

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => new UserResource($user),
            'message' => 'Cuenta verificada correctamente.'
        ]);
    }

    /**
     * Inicia sesión con email o username.
     *
     * Comprueba credenciales, estado de baneo y verificación de email,
     * inicia la sesión y regenera la sesión.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
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
     * Solicita la recuperación de contraseña enviando un código al email.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => true]);
        }

        $resetCode = rand(100000, 999999);
        $user->update(['reset_password_code' => (string) $resetCode]);

        Mail::to($user->email)->send(new VerificationCodeMail($resetCode, 'recuperacion'));

        return response()->json(['success' => true]);
    }

    /**
     * Restablece la contraseña usando el código enviado por email.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
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

        $user->update([
            'password' => Hash::make($request->new_password),
            'reset_password_code' => null
        ]);

        return response()->json(['success' => true, 'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.']);
    }

    /**
     * Reenvía el código de verificación al email del usuario.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
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

        $newCode = rand(100000, 999999);
        $user->update(['verification_code' => (string) $newCode]);

        Mail::to($user->email)->send(new \App\Mail\VerificationCodeMail($newCode, 'registro'));

        return response()->json([
            'success' => true,
            'message' => 'Nuevo código enviado. Revisa tu bandeja de entrada.'
        ]);
    }

    /**
     * Cierra la sesión del usuario autenticado.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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
     * Devuelve el usuario autenticado como recurso enriquecido.
     *
     * @param Request $request
     * @return \App\Http\Resources\UserResource
     */
    public function show(Request $request)
    {
        return new UserResource($request->user());
    }
}