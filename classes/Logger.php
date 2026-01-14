<?php
/**
 * Logger Class
 * Comprehensive error and activity logging
 */

class Logger {
    private static $logPath;
    
    public static function init() {
        self::$logPath = __DIR__ . '/../logs/';
        
        // Create logs directory if it doesn't exist
        if (!is_dir(self::$logPath)) {
            mkdir(self::$logPath, 0755, true);
        }
    }
    
    /**
     * Log error
     */
    public static function error($message, $context = []) {
        self::write('error', $message, $context);
    }
    
    /**
     * Log warning
     */
    public static function warning($message, $context = []) {
        self::write('warning', $message, $context);
    }
    
    /**
     * Log info
     */
    public static function info($message, $context = []) {
        self::write('info', $message, $context);
    }
    
    /**
     * Log debug
     */
    public static function debug($message, $context = []) {
        if (ENVIRONMENT === 'development') {
            self::write('debug', $message, $context);
        }
    }
    
    /**
     * Write log entry
     */
    private static function write($level, $message, $context) {
        self::init();
        
        $timestamp = date('Y-m-d H:i:s');
        $logFile = self::$logPath . date('Y-m-d') . '.log';
        
        $logEntry = sprintf(
            "[%s] [%s] %s %s\n",
            $timestamp,
            strtoupper($level),
            $message,
            !empty($context) ? json_encode($context) : ''
        );
        
        file_put_contents($logFile, $logEntry, FILE_APPEND);
        
        // Also log to database for critical errors
        if ($level === 'error') {
            self::logToDatabase($level, $message, $context);
        }
    }
    
    /**
     * Log to database
     */
    private static function logToDatabase($level, $message, $context) {
        try {
            $db = Database::getInstance();
            $data = [
                'user_id' => $_SESSION['user_id'] ?? null,
                'action' => 'system_log',
                'description' => $level . ': ' . $message,
                'metadata' => json_encode($context),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
            ];
            
            $db->insert('activity_logs', $data);
        } catch (Exception $e) {
            // Silently fail if database logging fails
            error_log("Failed to log to database: " . $e->getMessage());
        }
    }
    
    /**
     * Get recent logs
     */
    public static function getRecentLogs($lines = 100) {
        self::init();
        
        $logFile = self::$logPath . date('Y-m-d') . '.log';
        
        if (!file_exists($logFile)) {
            return [];
        }
        
        $logs = file($logFile);
        return array_slice($logs, -$lines);
    }
    
    /**
     * Clear old logs (older than 30 days)
     */
    public static function clearOldLogs() {
        self::init();
        
        $files = glob(self::$logPath . '*.log');
        $cutoff = time() - (30 * 24 * 60 * 60); // 30 days
        
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
            }
        }
    }
}

// Set custom error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $error = [
        'errno' => $errno,
        'file' => $errfile,
        'line' => $errline
    ];
    
    Logger::error($errstr, $error);
    
    // Don't execute PHP internal error handler
    return true;
});

// Set custom exception handler
set_exception_handler(function($exception) {
    $error = [
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => $exception->getTraceAsString()
    ];
    
    Logger::error($exception->getMessage(), $error);
    
    // Display user-friendly error in production
    if (ENVIRONMENT === 'production') {
        echo "An error occurred. Please try again later.";
    } else {
        echo "<pre>" . $exception . "</pre>";
    }
});
