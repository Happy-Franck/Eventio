<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\EmailAuth\EmailAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MagicLinkController extends Controller
{
    public function __construct(
        private EmailAuthService $emailAuthService
    ) {}

    /**
     * Send magic link for password reset.
     */
    public function send(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->emailAuthService->sendMagicLink($request->email);

        return response()->json([
            'success' => $result->success,
            'message' => $result->message,
            'error_code' => $result->errorCode
        ], $result->success ? 200 : 400);
    }

    /**
     * Verify magic link token.
     */
    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->emailAuthService->verifyMagicLink($request->token, $request->email);

        return response()->json([
            'valid' => $result->valid,
            'email' => $result->email,
            'message' => $result->message,
            'error_code' => $result->errorCode
        ], $result->valid ? 200 : 400);
    }

    /**
     * Resend magic link.
     */
    public function resend(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->emailAuthService->resendMagicLink($request->email);

        return response()->json([
            'success' => $result->success,
            'message' => $result->message,
            'error_code' => $result->errorCode
        ], $result->success ? 200 : 400);
    }
}
