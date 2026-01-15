<?php
/**
 * Admin - Edit About Page Content
 */

session_start();
require_once '../config/config.php';
require_once '../classes/Database.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance();
$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $content = $_POST['content'] ?? '';
    try {
        $db->query("UPDATE about_content SET content = ? WHERE id = 1", [$content]);
        $message = 'Content updated successfully.';
        $messageType = 'success';
    } catch (Exception $e) {
        $message = 'Failed to update content: ' . $e->getMessage();
        $messageType = 'danger';
    }
}

// Fetch the current content
try {
    $result = $db->query("SELECT content FROM about_content WHERE id = 1")->fetch();
    $content = $result['content'] ?? '';
} catch (Exception $e) {
    $content = '';
    $message = 'Database not ready. Please run installation first.';
    $messageType = 'warning';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Edit About Page</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.ckeditor.com/4.16.2/standard/ckeditor.js"></script>
</head>
<body>
    <div class="container mt-5">
        <h1>Edit About Page</h1>
        <?php if ($message): ?>
            <div class="alert alert-<?php echo $messageType; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
        <form action="adminAbout.php" method="post">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            <div class="mb-3">
                <textarea name="content" id="content" rows="10" class="form-control"><?php echo htmlspecialchars($content); ?></textarea>
                <script>
                    CKEDITOR.replace('content');
                </script>
            </div>
            <button type="submit" class="btn btn-primary">Save</button>
        </form>
    </div>
</body>
</html>
<?php include '../functions/footer.php'; ?>
