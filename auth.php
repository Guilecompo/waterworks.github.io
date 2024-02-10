<?php
session_start(); // Initialize the session

// Check if the user is not logged in, redirect to login page
if (!isset($_SESSION['loggedIn'])) {
    header("Location: /"); // Change this to your login page
    exit();
}
?>