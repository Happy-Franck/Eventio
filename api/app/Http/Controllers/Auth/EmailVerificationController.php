<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\EmailAuth\EmailAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmailVerificationController extends Controller
{
    public function __construct(
        private EmailAuthService $emailAuthService
    ) {}

    /**
     * Verify email with token.
     */
    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'user_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->emailAuthService->verifyEmailWithUserId($request->user_id, $request->token);

        return response()->json([
            'valid' => $result->valid,
            'email' => $result->email,
            'message' => $result->message,
            'error_code' => $result->errorCode
        ], $result->valid ? 200 : 400);
    }

    /**
     * Resend verification email.
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $result = $this->emailAuthService->resendVerification($user);

        return response()->json([
            'success' => $result->success,
            'message' => $result->message,
            'error_code' => $result->errorCode
        ], $result->success ? 200 : 400);
    }
}
