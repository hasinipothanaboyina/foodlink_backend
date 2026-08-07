-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: foodlink_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `donor_name` varchar(255) DEFAULT NULL,
  `donor_phone` varchar(20) DEFAULT NULL,
  `food_type` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `pickup_by` datetime DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `status` enum('pending','matched','in_transit','completed','cancelled') DEFAULT 'pending',
  `delivery_method` varchar(50) DEFAULT 'donor_delivers',
  `ngo_id` int(11) DEFAULT NULL,
  `ngo_name` varchar(150) DEFAULT NULL,
  `distance_km` double DEFAULT NULL,
  `is_urgent` tinyint(1) DEFAULT 0,
  `expires_at` datetime DEFAULT NULL,
  `last_matched_at` datetime DEFAULT NULL,
  `rejected_by` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `ngo_id` (`ngo_id`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `donations_ibfk_2` FOREIGN KEY (`ngo_id`) REFERENCES `ngos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
INSERT INTO `donations` VALUES (1,NULL,'Test Donor','1234567890','cooked',50,'2025-12-31 23:59:00','Test Address','Vijayawada',NULL,16.5062,80.648,'pending','donor_delivers',NULL,NULL,NULL,1,NULL,'2026-08-02 11:37:43',NULL,'2026-08-02 06:07:43'),(2,NULL,'hasu','9951049933','packaged',10,'2026-08-03 11:55:00','Billapadu (R), Gudivada, Krishna district, Andhra Pradesh, 521301, India','Vijayawada',NULL,16.419701094322885,81.0036849982259,'pending','donor_delivers',NULL,NULL,NULL,0,NULL,'2026-08-02 11:56:02',NULL,'2026-08-02 06:26:02'),(3,NULL,'leo','9110303721','packaged',20,'2026-08-03 12:02:00','Billapadu (R), Gudivada, Krishna district, Andhra Pradesh, 521301, India','Guntur',NULL,16.419701094322885,81.0036849982259,'pending','donor_delivers',NULL,NULL,NULL,0,NULL,'2026-08-02 12:02:48',NULL,'2026-08-02 06:32:48'),(4,NULL,'leo','9110303721','packaged',20,'2026-08-04 12:03:00','Billapadu (R), Gudivada, Krishna district, Andhra Pradesh, 521301, India','Vijayawada',NULL,16.419707556273377,81.00368424821491,'pending','donor_delivers',NULL,NULL,NULL,0,NULL,'2026-08-02 12:03:28',NULL,'2026-08-02 06:33:28'),(5,NULL,'Test Donor','1234567890','cooked',50,'2025-12-31 23:59:00','Test Address','Vijayawada',NULL,16.5062,80.648,'pending','donor_delivers',NULL,NULL,0,1,NULL,'2026-08-02 12:04:08','1','2026-08-02 06:34:08'),(6,NULL,'hasu','9951049933','cooked',10,'2026-08-02 12:10:00','Billapadu (R), Gudivada, Krishna district, Andhra Pradesh, 521301, India','Vijayawada',NULL,16.419707556273377,81.00368424821491,'pending','donor_delivers',NULL,NULL,NULL,1,NULL,'2026-08-02 12:10:43',NULL,'2026-08-02 06:40:43'),(7,NULL,'hasini','9110303721','cooked',10,'2026-08-02 12:11:00','Billapadu (R), Gudivada, Krishna district, Andhra Pradesh, 521301, India','Vijayawada',NULL,16.419707556273377,81.00368424821491,'pending','donor_delivers',NULL,NULL,NULL,1,NULL,'2026-08-02 12:11:46',NULL,'2026-08-02 06:41:46'),(8,NULL,'honey','9951049933','packaged',10,'2026-08-02 12:21:00','Billapadu (R), Gudivada, Krishna district, Andhra Pradesh, 521301, India','Vijayawada',NULL,16.419707556273377,81.00368424821491,'in_transit','donor_delivers',21,'leo foundation',0,0,NULL,'2026-08-02 12:21:42',NULL,'2026-08-02 06:51:42');
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ngos`
--

DROP TABLE IF EXISTS `ngos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ngos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `city` varchar(100) DEFAULT 'Unknown',
  `address` varchar(255) DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `capacity` int(11) DEFAULT 100,
  `accepted_types` varchar(255) DEFAULT 'cooked,produce,packaged,bakery',
  `approved` tinyint(1) DEFAULT 0,
  `availability_status` enum('active','limited','offline') DEFAULT 'active',
  `working_hours` varchar(100) DEFAULT '00:00-23:59',
  `avg_response_time` int(11) DEFAULT 0,
  `acceptance_rate` double DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `registered_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ngos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ngos`
--

LOCK TABLES `ngos` WRITE;
/*!40000 ALTER TABLE `ngos` DISABLE KEYS */;
INSERT INTO `ngos` VALUES (1,NULL,'Akshaya Patra Foundation','Vijayawada','Auto Nagar, Vijayawada, Krishna, AP',16.5062,80.648,200,'cooked,produce,packaged,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(2,NULL,'LEPRA Society AP','Vijayawada','Krishnanagar, Vijayawada, Krishna, AP',16.5193,80.6305,150,'cooked,produce,packaged',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(3,NULL,'Naandi Foundation','Guntur','Arundelpet, Guntur, AP',16.3067,80.4365,180,'cooked,produce,packaged,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(4,NULL,'Sri Sathya Sai Annapoorna Trust','Guntur','Lakshmipuram, Guntur, AP',16.2994,80.4571,120,'cooked,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(5,NULL,'HelpAge India Visakhapatnam','Visakhapatnam','Dwaraka Nagar, Visakhapatnam, AP',17.7231,83.3012,150,'cooked,packaged,produce',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(6,NULL,'Committed Communities Development Trust','Visakhapatnam','MVP Colony, Visakhapatnam, AP',17.744,83.272,100,'cooked,produce,packaged,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(7,NULL,'TTD Annadanam Centre','Tirupati','Tirumala Hills, Tirupati, Chittoor, AP',13.6288,79.4192,300,'cooked',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(8,NULL,'Serve India Tirupati','Tirupati','Balaji Nagar, Tirupati, Chittoor, AP',13.63,79.42,100,'cooked,packaged,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(9,NULL,'Food For Life Kurnool','Kurnool','Gandhi Nagar, Kurnool, AP',15.8281,78.0373,120,'cooked,produce,packaged',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(10,NULL,'Seva Bharathi Kurnool','Kurnool','Budhawarpet, Kurnool, AP',15.83,78.04,80,'cooked,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(11,NULL,'Sneha Charitable Trust','Nellore','Pogathota, Nellore, AP',14.4426,79.9865,100,'cooked,produce,packaged,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(12,NULL,'Narayana Seva Samithi Nellore','Nellore','Trunk Road, Nellore, AP',14.44,79.99,90,'cooked,produce',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(13,NULL,'Bala Vikasa Foundation','Kakinada','Jagannaickpur, Kakinada, East Godavari, AP',16.9891,82.2475,150,'cooked,produce,packaged',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(14,NULL,'CASA India Kakinada','Kakinada','Main Road, Kakinada, East Godavari, AP',16.98,82.24,120,'cooked,packaged,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(15,NULL,'Akshaya Patra Rajahmundry','Rajahmundry','T Nagar, Rajahmundry, East Godavari, AP',17.0005,81.804,200,'cooked,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(16,NULL,'Praja Seva Samithi Eluru','Eluru','Powerpet, Eluru, West Godavari, AP',16.7107,81.1001,100,'cooked,produce,packaged',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(17,NULL,'Sri Venkateswara Seva Trust','Kadapa','Gandhi Road, Kadapa, AP',14.4674,78.8241,80,'cooked,produce,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(18,NULL,'Rural Development Trust','Anantapur','Beside RTC Bus Stand, Anantapur, AP',14.6818,77.6006,150,'cooked,produce,packaged,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(19,NULL,'SHARE Microfin Charitable Trust','Ongole','Kurnool Road, Ongole, Prakasam, AP',15.5057,80.0499,90,'cooked,packaged',1,'active','00:00-23:59',0,1,'2026-08-02 06:05:51',NULL,NULL,NULL,NULL),(21,5,'leo foundation','vijayawada','billapadu,gudivada,521301,andhrapradesh',16.419707556273377,81.00368424821491,100,'cooked,produce,packaged,bakery',1,'active','00:00-23:59',0,1,'2026-08-02 06:46:56','9951049933',NULL,NULL,NULL);
/*!40000 ALTER TABLE `ngos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pickup_requests`
--

DROP TABLE IF EXISTS `pickup_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pickup_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donation_id` int(11) NOT NULL,
  `ngo_id` int(11) NOT NULL,
  `volunteer_id` int(11) DEFAULT NULL,
  `status` enum('pending','accepted','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `donation_id` (`donation_id`),
  KEY `ngo_id` (`ngo_id`),
  KEY `volunteer_id` (`volunteer_id`),
  CONSTRAINT `pickup_requests_ibfk_1` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pickup_requests_ibfk_2` FOREIGN KEY (`ngo_id`) REFERENCES `ngos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pickup_requests_ibfk_3` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pickup_requests`
--

LOCK TABLES `pickup_requests` WRITE;
/*!40000 ALTER TABLE `pickup_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `pickup_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reported_issues`
--

DROP TABLE IF EXISTS `reported_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reported_issues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reported_by` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'General',
  `description` text NOT NULL,
  `status` enum('open','resolved') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reported_issues`
--

LOCK TABLES `reported_issues` WRITE;
/*!40000 ALTER TABLE `reported_issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `reported_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('donor','ngo','admin') DEFAULT 'donor',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@gmail.com','$2a$10$Q00OMBzFzvK18lYaGx1icuLli9gjaNIxcrS6xu/HMGfUTCcByrwMm','admin','2026-08-02 06:06:47'),(5,'Hasini Pothanaboyina','vijayparitala0@gmail.com','$2a$10$NZOUAODXGl2rlFJ7VrbqoOVkgFTSfPdYA3LyDkwElO2duLT3hJdCi','ngo','2026-08-02 06:46:56');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteers`
--

DROP TABLE IF EXISTS `volunteers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `city` varchar(100) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `status` enum('available','busy','offline') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `volunteers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteers`
--

LOCK TABLES `volunteers` WRITE;
/*!40000 ALTER TABLE `volunteers` DISABLE KEYS */;
/*!40000 ALTER TABLE `volunteers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-02 13:20:35
