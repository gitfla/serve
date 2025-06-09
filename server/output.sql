-- MySQL dump 10.13  Distrib 9.3.0, for macos15 (arm64)
--
-- Host: localhost    Database: serve
-- ------------------------------------------------------
-- Server version	9.3.0

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
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(90) NOT NULL,
  `book_writer` int NOT NULL,
  `blob_id` int NOT NULL,
  PRIMARY KEY (`book_id`),
  KEY `book_writer_idx` (`book_writer`),
  CONSTRAINT `book_writer` FOREIGN KEY (`book_writer`) REFERENCES `writers` (`writer_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations_sentences`
--

DROP TABLE IF EXISTS `conversations_sentences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations_sentences` (
  `conversation_sentence_id` int NOT NULL AUTO_INCREMENT,
  `conversation` int NOT NULL,
  `sentence_id` int NOT NULL,
  PRIMARY KEY (`conversation_sentence_id`),
  KEY `conversation_id_idx` (`conversation`),
  KEY `sentence_id_idx` (`sentence_id`),
  CONSTRAINT `conversation` FOREIGN KEY (`conversation`) REFERENCES `conversations` (`conversation_id`),
  CONSTRAINT `sentence_id` FOREIGN KEY (`sentence_id`) REFERENCES `sentences` (`sentence_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations_sentences`
--

LOCK TABLES `conversations_sentences` WRITE;
/*!40000 ALTER TABLE `conversations_sentences` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations_sentences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations_writers`
--

DROP TABLE IF EXISTS `conversations_writers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations_writers` (
  `conversation_writer_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `writer_id` int NOT NULL,
  PRIMARY KEY (`conversation_writer_id`),
  KEY `conversation_id_idx` (`conversation_id`),
  KEY `writer_id_idx` (`writer_id`),
  CONSTRAINT `conversation_id` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`),
  CONSTRAINT `writer_id` FOREIGN KEY (`writer_id`) REFERENCES `writers` (`writer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations_writers`
--

LOCK TABLES `conversations_writers` WRITE;
/*!40000 ALTER TABLE `conversations_writers` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations_writers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sentences`
--

DROP TABLE IF EXISTS `sentences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sentences` (
  `sentence_id` int NOT NULL AUTO_INCREMENT,
  `text` varchar(420) NOT NULL,
  `book_id` int NOT NULL,
  PRIMARY KEY (`sentence_id`),
  KEY `book_id_idx` (`book_id`),
  CONSTRAINT `book_id` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sentences`
--

LOCK TABLES `sentences` WRITE;
/*!40000 ALTER TABLE `sentences` DISABLE KEYS */;
/*!40000 ALTER TABLE `sentences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `writers`
--

DROP TABLE IF EXISTS `writers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `writers` (
  `writer_id` int NOT NULL AUTO_INCREMENT,
  `writer_name` varchar(70) NOT NULL,
  PRIMARY KEY (`writer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `writers`
--

LOCK TABLES `writers` WRITE;
/*!40000 ALTER TABLE `writers` DISABLE KEYS */;
/*!40000 ALTER TABLE `writers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-05 17:41:38
