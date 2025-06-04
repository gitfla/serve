CREATE DATABASE IF NOT EXISTS `serve-db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `serve-db`;

DROP TABLE IF EXISTS `texts`;
CREATE TABLE `texts` (
  `text_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(90) NOT NULL,
  `text_writer` int NOT NULL,
  `blob_id` varchar(90) NOT NULL,
  PRIMARY KEY (`text_id`),
  KEY `text_writer_idx` (`text_writer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `conversations_sentences`;
CREATE TABLE `conversations_sentences` (
  `conversation_sentence_id` int NOT NULL AUTO_INCREMENT,
  `conversation` int NOT NULL,
  `sentence_id` int NOT NULL,
  PRIMARY KEY (`conversation_sentence_id`),
  KEY `conversation_id_idx` (`conversation`),
  KEY `sentence_id_idx` (`sentence_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `conversations_writers`;
CREATE TABLE `conversations_writers` (
  `conversation_writer_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `writer_id` int NOT NULL,
  PRIMARY KEY (`conversation_writer_id`),
  KEY `conversation_id_idx` (`conversation_id`),
  KEY `writer_id_idx` (`writer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `sentences`;
CREATE TABLE `sentences` (
  `sentence_id` int NOT NULL AUTO_INCREMENT,
  `text` varchar(420) NOT NULL,
  `text_id` int NOT NULL,
  PRIMARY KEY (`sentence_id`),
  KEY `text_id_idx` (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `writers`;
CREATE TABLE `writers` (
  `writer_id` int NOT NULL AUTO_INCREMENT,
  `writer_name` varchar(70) NOT NULL,
  PRIMARY KEY (`writer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;