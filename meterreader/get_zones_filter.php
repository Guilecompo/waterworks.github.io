<?php
header("Access-Control-Allow-Origin: *");
include 'connection.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['readerId'], $_POST['branchId'])) {
        $readerId = $_POST['readerId'];
        $branchId = $_POST['branchId'];

        // Fetch zone_Id associated with the readerId
        $stmt = $conn->prepare("SELECT zone_Id FROM assign WHERE emp_Id = :readerId");
        $stmt->bindParam(":readerId", $readerId);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($rows) {
            $zoneIds = array_column($rows, 'zone_Id');
            if (empty($zoneIds)) {
                echo json_encode([]); // No zones found
                return;
            }

            // Create named placeholders for zone IDs
            $placeholders = [];
            foreach ($zoneIds as $key => $id) {
                $placeholders[] = ":zoneId$key";
            }

            // Prepare SQL to fetch zone details
            $sql = "SELECT c.zone_id, c.zone_name, d.barangay_name
                    FROM branch a
                    INNER JOIN address_zone c ON a.locationId = c.zone_id
                    INNER JOIN address_barangay d ON c.barangayId = d.barangay_id
                    WHERE a.branch_id = :branchId AND c.zone_id IN (" . implode(',', $placeholders) . ")
                    ORDER BY c.zone_name";

            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":branchId", $branchId);

            // Bind the zone IDs
            foreach ($zoneIds as $key => $id) {
                $stmt->bindValue(":zoneId$key", $id);
            }

            $stmt->execute();
            $returnValue = $stmt->rowCount() > 0 ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
            echo json_encode($returnValue);
        } else {
            echo json_encode(['error' => 'Reader not found']);
        }
    } else {
        echo json_encode(['error' => 'Invalid parameters']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
