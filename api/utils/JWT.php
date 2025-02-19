<?php
class JWT {
  private static function base64UrlEncode($data) {
    return str_replace(['+','/','='], ['-','_',''], base64_encode($data));
  }

  private static function base64UrlDecode($data) {
    $base64 = str_replace(['-','_'], ['+','/'], $data);
    $padLength = strlen($base64) % 4;
    if ($padLength) {
      $base64 .= str_repeat('=', 4 - $padLength);
    }
    return base64_decode($base64);
  }

  public static function generate($payload) {
    $config = require __DIR__ . '/../config/config.php';
    $secret = $config['jwt']['secret'];

    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + $config['jwt']['expiration'];
    $payload = json_encode($payload);

    $base64UrlHeader = self::base64UrlEncode($header);
    $base64UrlPayload = self::base64UrlEncode($payload);

    $signature = hash_hmac('sha256',
      $base64UrlHeader . "." . $base64UrlPayload,
      $secret,
      true
    );
    $base64UrlSignature = self::base64UrlEncode($signature);

    error_log("JWT Generate - Header: " . $header);
    error_log("JWT Generate - Payload: " . $payload);
    error_log("JWT Generate - Secret: " . substr($secret, 0, 5) . '...');

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
  }

  public static function verify($token) {
    try {
      error_log("JWT Verify - Received Token: " . $token);

      $config = require __DIR__ . '/../config/config.php';
      $secret = $config['jwt']['secret'];

      error_log("JWT Verify - Using Secret: " . substr($secret, 0, 5) . '...');

      $tokenParts = explode('.', $token);
      if (count($tokenParts) != 3) {
        error_log("JWT Verify - Invalid token format: wrong number of parts");
        return false;
      }

      [$headerB64, $payloadB64, $signatureB64] = $tokenParts;

      $header = json_decode(self::base64UrlDecode($headerB64), true);
      $payload = json_decode(self::base64UrlDecode($payloadB64), true);

      error_log("JWT Verify - Decoded Header: " . json_encode($header));
      error_log("JWT Verify - Decoded Payload: " . json_encode($payload));

      if (!$header || !$payload) {
        error_log("JWT Verify - Failed to decode header or payload");
        return false;
      }

      if ($payload['exp'] < time()) {
        error_log("JWT Verify - Token expired: " . date('Y-m-d H:i:s', $payload['exp']));
        return false;
      }

      // Berechne erwartete Signatur
      $expectedSignature = hash_hmac('sha256',
        $headerB64 . "." . $payloadB64,
        $secret,
        true
      );
      $expectedSignatureB64 = self::base64UrlEncode($expectedSignature);

      error_log("JWT Verify - Expected Signature: " . substr($expectedSignatureB64, 0, 10) . '...');
      error_log("JWT Verify - Received Signature: " . substr($signatureB64, 0, 10) . '...');

      if ($signatureB64 !== $expectedSignatureB64) {
        error_log("JWT Verify - Signature mismatch");
        return false;
      }

      error_log("JWT Verify - Token valid");
      return $payload;
    } catch (Exception $e) {
      error_log("JWT Verify - Exception: " . $e->getMessage());
      return false;
    }
  }
}
