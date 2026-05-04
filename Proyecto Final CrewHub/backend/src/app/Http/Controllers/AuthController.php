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
            // SANEAMIENTO PREVIO: Convertimos el username a minúsculas antes de validar.
            // Así evitamos que alguien se registre como "Login" o "CHAT" y rompa las rutas.
            if ($request->has('username')) {
                $request->merge(['username' => strtolower($request->username)]);
            }

            // 1. Validación de datos (El Muro de Seguridad)
            $validatedData = $request->validate([
                'username' => [
                    'required',
                    'string',
                    'min:3',
                    'max:20',
                    'unique:users,username',
                    'regex:/^[a-z0-9_]+$/', // Solo letras minúsculas, números y guiones bajos permitidos
                    'not_in:login,register,chat,home,api,admin,perfil,config,index' // Palabras reservadas (Rutas de React)
                ],
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

        // Saneamiento en el login: si intentan entrar con username, lo pasamos a minúsculas
        $loginInput = $request->login;
        if (!filter_var($loginInput, FILTER_VALIDATE_EMAIL)) {
            $loginInput = strtolower($loginInput);
        }

        // 2. ¿Es un correo o un usuario? PHP lo detecta automáticamente
        $loginType = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        // 3. Buscamos al usuario en MongoDB usando el campo detectado y saneado
        $user = User::where($loginType, $loginInput)->first();

        // 4. Verificamos que exista y la contraseña sea correcta
        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Las credenciales proporcionadas son incorrectas.'
            ], 401);
        }

        // 5. CREACIÓN DEL TOKEN REFINADO
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