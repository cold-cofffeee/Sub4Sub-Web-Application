<?php
/**
 * API Router
 * RESTful API endpoints for mobile app and external integrations
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/User.php';
require_once __DIR__ . '/../classes/Security.php';

class API {
    private $db;
    private $method;
    private $endpoint;
    private $params;
    private $user;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->method = $_SERVER['REQUEST_METHOD'];
        
        // Parse endpoint
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = str_replace('/api/', '', $path);
        $parts = explode('/', $path);
        
        $this->endpoint = $parts[0] ?? null;
        $this->params = array_slice($parts, 1);
        
        // Authenticate if token provided
        $this->authenticate();
    }
    
    /**
     * Authenticate API request
     */
    private function authenticate() {
        $token = null;
        
        // Check Authorization header
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
        }
        // Check query parameter
        elseif (isset($_GET['token'])) {
            $token = $_GET['token'];
        }
        
        if ($token) {
            $result = Security::validateApiToken($token);
            if ($result) {
                $this->user = User::find($result['user_id']);
            }
        }
    }
    
    /**
     * Route the request
     */
    public function route() {
        try {
            switch ($this->endpoint) {
                case 'auth':
                    return $this->handleAuth();
                    
                case 'users':
                    return $this->handleUsers();
                    
                case 'subscriptions':
                    return $this->handleSubscriptions();
                    
                case 'notifications':
                    return $this->handleNotifications();
                    
                case 'stats':
                    return $this->handleStats();
                    
                default:
                    return $this->error('Endpoint not found', 404);
            }
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
    
    /**
     * Handle authentication endpoints
     */
    private function handleAuth() {
        switch ($this->method) {
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                
                if ($this->params[0] === 'login') {
                    return $this->login($data);
                }
                elseif ($this->params[0] === 'register') {
                    return $this->register($data);
                }
                elseif ($this->params[0] === 'token') {
                    return $this->generateToken($data);
                }
                break;
        }
        
        return $this->error('Method not allowed', 405);
    }
    
    /**
     * Login
     */
    private function login($data) {
        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->error('Email and password required', 400);
        }
        
        $user = User::findByEmail($data['email']);
        
        if (!$user || !$user->verifyPassword($data['password'])) {
            return $this->error('Invalid credentials', 401);
        }
        
        if ($user->isBanned()) {
            return $this->error('Account is banned', 403);
        }
        
        $token = Security::generateApiToken($user->getId(), 'Mobile App');
        
        return $this->success([
            'token' => $token,
            'user' => $user->toArray()
        ]);
    }
    
    /**
     * Register
     */
    private function register($data) {
        $required = ['email', 'username', 'password', 'youtube_channel', 'youtube_channel_name'];
        
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                return $this->error("Field '$field' is required", 400);
            }
        }
        
        try {
            $user = User::create($data);
            $token = Security::generateApiToken($user->getId(), 'Mobile App');
            
            return $this->success([
                'token' => $token,
                'user' => $user->toArray()
            ], 201);
        } catch (Exception $e) {
            return $this->error('Registration failed: ' . $e->getMessage(), 400);
        }
    }
    
    /**
     * Handle user endpoints
     */
    private function handleUsers() {
        if (!$this->user) {
            return $this->error('Authentication required', 401);
        }
        
        switch ($this->method) {
            case 'GET':
                if (empty($this->params)) {
                    return $this->success(['user' => $this->user->toArray()]);
                }
                elseif ($this->params[0] === 'stats') {
                    return $this->success($this->user->getStatistics());
                }
                break;
                
            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);
                $this->user->update($data);
                return $this->success(['user' => $this->user->toArray()]);
                
            case 'DELETE':
                $this->user->delete();
                return $this->success(['message' => 'Account deleted']);
        }
        
        return $this->error('Method not allowed', 405);
    }
    
    /**
     * Handle subscription endpoints
     */
    private function handleSubscriptions() {
        if (!$this->user) {
            return $this->error('Authentication required', 401);
        }
        
        switch ($this->method) {
            case 'GET':
                $sql = "SELECT u.id, u.username, u.youtube_channel, u.youtube_channel_name 
                        FROM users u 
                        WHERE u.id != ? AND u.is_banned = 0 
                        LIMIT 20";
                $channels = $this->db->fetchAll($sql, [$this->user->getId()]);
                return $this->success(['channels' => $channels]);
                
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (!isset($data['target_user_id'])) {
                    return $this->error('target_user_id required', 400);
                }
                
                $subscriptionData = [
                    'user_id' => $this->user->getId(),
                    'target_user_id' => $data['target_user_id'],
                    'target_channel_url' => $data['target_channel_url'] ?? '',
                    'target_channel_name' => $data['target_channel_name'] ?? '',
                    'status' => 'pending'
                ];
                
                $id = $this->db->insert('subscriptions', $subscriptionData);
                return $this->success(['subscription_id' => $id], 201);
        }
        
        return $this->error('Method not allowed', 405);
    }
    
    /**
     * Handle notification endpoints
     */
    private function handleNotifications() {
        if (!$this->user) {
            return $this->error('Authentication required', 401);
        }
        
        switch ($this->method) {
            case 'GET':
                if ($this->params[0] === 'unread') {
                    $sql = "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0";
                    $result = $this->db->fetchOne($sql, [$this->user->getId()]);
                    return $this->success(['count' => (int)$result['count']]);
                }
                else {
                    $sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
                    $notifications = $this->db->fetchAll($sql, [$this->user->getId()]);
                    return $this->success(['notifications' => $notifications]);
                }
                
            case 'PUT':
                if ($this->params[0] === 'mark-read') {
                    $this->db->update('notifications', ['is_read' => 1], 'user_id = ?', [$this->user->getId()]);
                    return $this->success(['message' => 'Notifications marked as read']);
                }
                break;
        }
        
        return $this->error('Method not allowed', 405);
    }
    
    /**
     * Handle stats endpoints
     */
    private function handleStats() {
        $sql = "SELECT 
                    (SELECT COUNT(*) FROM users WHERE is_banned = 0) as total_users,
                    (SELECT COUNT(*) FROM subscriptions) as total_subscriptions,
                    (SELECT COUNT(*) FROM subscriptions WHERE status = 'verified') as verified_subscriptions";
        
        $stats = $this->db->fetchOne($sql);
        return $this->success($stats);
    }
    
    /**
     * Success response
     */
    private function success($data, $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        exit;
    }
    
    /**
     * Error response
     */
    private function error($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit;
    }
}

// Run API
$api = new API();
$api->route();
