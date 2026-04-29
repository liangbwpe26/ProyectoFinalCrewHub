<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Exception;

class AuthController extends Controller
{
    /**
     * Registro de usuarios (Saneado y Validado)
     */
    public function register(Request $request)
    {
        try {
            // 1. Validación de datos (Saneamiento automático de Laravel)
            $validatedData = $request->validate([
                'username' => 'required|string|max:50|unique:users,username',
                'email' => 'required|string|email|max:100|unique:users,email',
                'password' => 'required|string|min:8',
            ]);

            // 2. Creación del documento en MongoDB (Operación Atómica)
            $user = User::create([
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
                'password_hash' => Hash::make($validatedData['password']), // Contraseña hasheada
                'fecha_registro' => now(),
            ]);

            // 3. Generación de Token REST (Sanctum)
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'data' => $user,
                'token' => $token
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
     * Login de usuarios
     */
    public function login(Request $request)
    {
        // 1. Validamos que nos envíen un campo genérico "login" y la contraseña
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        // 2. ¿Es un correo o un usuario? PHP lo detecta automáticamente
        $loginType = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        // 3. Buscamos al usuario en MongoDB usando el campo detectado
        $user = User::where($loginType, $request->login)->first();

        // 4. Verificamos que exista y la contraseña sea correcta
        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Las credenciales proporcionadas son incorrectas.'
            ], 401);
        }

        // 5. CREACIÓN DEL TOKEN REFINADO
        // Parámetro 1: Nombre del token
        // Parámetro 2: Habilidades o permisos (['*'] significa todos los permisos, pero puedes limitarlo)
        // Parámetro 3: Fecha de expiración (ej. 7 días)
        $token = $user->createToken(
            'auth_token',
            ['*'],
            now()->addDays(7)
        )->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
            'message' => 'Inicio de sesión exitoso'
        ]);
    }
}
