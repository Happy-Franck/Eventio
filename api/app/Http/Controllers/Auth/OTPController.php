<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\EmailAuth\EmailAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OTPController extends Controller
{
    public function __construct(
        private EmailAuthService $emailAuthService
    ) {}

    /**
     * Send OTP code to email.
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

        $result = $this->emailAuthService->sendOTPCode($request->email);

        return response()->json([
            'success' => $result->success,
            'message' => $result->message,
            'error_code' => $result->errorCode
        ], $result->success ? 200 : 400);
    }

    /**
     * Verify OTP code.
     */
    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->emailAuthService->verifyOTPCode($request->email, $request->code);

        return response()->json([
            'valid' => $result->valid,
            'email' => $result->email,
            'message' => $result->message,
            'error_code' => $result->errorCode
        ], $result->valid ? 200 : 400);
    }

    /**
     * Resend OTP code.
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

        $result = $this->emailAuthService->resendOTP($request->email);

        return response()->json([
            'success' => $result->success,
            'message' => $result->message,
            'error_code' => $result->errorCode
        ], $result->success ? 200 : 400);
    }
}
