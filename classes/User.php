<?php
/**
 * User Model
 * Object-oriented user management
 */

require_once __DIR__ . '/Database.php';

class User {
    private $db;
    private $id;
    private $email;
    private $username;
    private $full_name;
    private $location_address;
    private $youtube_channel;
    private $youtube_channel_name;
    private $profile_picture;
    private $is_premium;
    private $is_admin;
    private $is_banned;
    private $created_at;
    
    public function __construct($data = null) {
        $this->db = Database::getInstance();
        if ($data) {
            $this->hydrate($data);
        }
    }
    
    /**
     * Hydrate object with data
     */
    private function hydrate($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }
    
    /**
     * Find user by ID
     */
    public static function find($id) {
        $db = Database::getInstance();
        $sql = "SELECT * FROM users WHERE id = ?";
        $data = $db->fetchOne($sql, [$id]);
        
        return $data ? new self($data) : null;
    }
    
    /**
     * Find user by email
     */
    public static function findByEmail($email) {
        $db = Database::getInstance();
        $sql = "SELECT * FROM users WHERE email = ?";
        $data = $db->fetchOne($sql, [$email]);
        
        return $data ? new self($data) : null;
    }
    
    /**
     * Get all users
     */
    public static function all($limit = null, $offset = 0) {
        $db = Database::getInstance();
        $sql = "SELECT * FROM users ORDER BY created_at DESC";
        
        if ($limit) {
            $sql .= " LIMIT ? OFFSET ?";
            $results = $db->fetchAll($sql, [$limit, $offset]);
        } else {
            $results = $db->fetchAll($sql);
        }
        
        return array_map(function($data) {
            return new self($data);
        }, $results);
    }
    
    /**
     * Create new user
     */
    public static function create($data) {
        $db = Database::getInstance();
        
        // Hash password
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        // Set defaults
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['is_premium'] = $data['is_premium'] ?? 0;
        $data['is_admin'] = $data['is_admin'] ?? 0;
        $data['is_banned'] = $data['is_banned'] ?? 0;
        
        $id = $db->insert('users', $data);
        return self::find($id);
    }
    
    /**
     * Update user
     */
    public function update($data) {
        // Don't allow updating certain fields
        unset($data['id'], $data['created_at']);
        
        // Hash password if provided
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        $this->db->update('users', $data, 'id = ?', [$this->id]);
        
        // Refresh user data
        $updated = self::find($this->id);
        $this->hydrate((array)$updated);
        
        return $this;
    }
    
    /**
     * Delete user
     */
    public function delete() {
        return $this->db->delete('users', 'id = ?', [$this->id]);
    }
    
    /**
     * Verify password
     */
    public function verifyPassword($password) {
        $sql = "SELECT password FROM users WHERE id = ?";
        $result = $this->db->fetchOne($sql, [$this->id]);
        
        return $result && password_verify($password, $result['password']);
    }
    
    /**
     * Update password
     */
    public function updatePassword($newPassword) {
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        return $this->db->update('users', ['password' => $hash], 'id = ?', [$this->id]);
    }
    
    /**
     * Get user subscriptions
     */
    public function getSubscriptions() {
        $sql = "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC";
        return $this->db->fetchAll($sql, [$this->id]);
    }
    
    /**
     * Get user statistics
     */
    public function getStatistics() {
        $sql = "SELECT 
                    COUNT(DISTINCT s.id) as total_subscriptions,
                    COUNT(DISTINCT sv.id) as verified_subscriptions
                FROM users u
                LEFT JOIN subscriptions s ON u.id = s.user_id
                LEFT JOIN subscription_verifications sv ON s.id = sv.subscription_id
                WHERE u.id = ?";
        
        return $this->db->fetchOne($sql, [$this->id]);
    }
    
    /**
     * Ban user
     */
    public function ban() {
        return $this->update(['is_banned' => 1]);
    }
    
    /**
     * Unban user
     */
    public function unban() {
        return $this->update(['is_banned' => 0]);
    }
    
    /**
     * Make premium
     */
    public function makePremium() {
        return $this->update(['is_premium' => 1]);
    }
    
    /**
     * Remove premium
     */
    public function removePremium() {
        return $this->update(['is_premium' => 0]);
    }
    
    /**
     * Make admin
     */
    public function makeAdmin() {
        return $this->update(['is_admin' => 1]);
    }
    
    /**
     * Remove admin
     */
    public function removeAdmin() {
        return $this->update(['is_admin' => 0]);
    }
    
    /**
     * Getters
     */
    public function getId() { return $this->id; }
    public function getEmail() { return $this->email; }
    public function getUsername() { return $this->username; }
    public function getFullName() { return $this->full_name; }
    public function getLocationAddress() { return $this->location_address; }
    public function getYoutubeChannel() { return $this->youtube_channel; }
    public function getYoutubeChannelName() { return $this->youtube_channel_name; }
    public function getProfilePicture() { return $this->profile_picture; }
    public function isPremium() { return (bool)$this->is_premium; }
    public function isAdmin() { return (bool)$this->is_admin; }
    public function isBanned() { return (bool)$this->is_banned; }
    public function getCreatedAt() { return $this->created_at; }
    
    /**
     * Convert to array
     */
    public function toArray() {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'username' => $this->username,
            'full_name' => $this->full_name,
            'location_address' => $this->location_address,
            'youtube_channel' => $this->youtube_channel,
            'youtube_channel_name' => $this->youtube_channel_name,
            'profile_picture' => $this->profile_picture,
            'is_premium' => $this->is_premium,
            'is_admin' => $this->is_admin,
            'is_banned' => $this->is_banned,
            'created_at' => $this->created_at
        ];
    }
}
