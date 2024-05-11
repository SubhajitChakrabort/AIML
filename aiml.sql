-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 07, 2024 at 08:39 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aiml`
--

-- --------------------------------------------------------

--
-- Table structure for table `centers`
--

CREATE TABLE `centers` (
  `id` int(11) NOT NULL,
  `center_name` varchar(255) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `centers`
--

INSERT INTO `centers` (`id`, `center_name`, `date`) VALUES
(1, 'SS - slg', '2024-05-06'),
(2, 'SS - slg', '2024-05-06'),
(3, 'TK - kol', '2024-05-07'),
(4, 'BV - vds', '2024-05-07'),
(5, 'SS - slg', '2024-05-07'),
(6, 'SS - slg', '2024-05-07'),
(7, 'BV - vds', '2024-05-07');

-- --------------------------------------------------------

--
-- Table structure for table `center_schools`
--

CREATE TABLE `center_schools` (
  `id` int(11) NOT NULL,
  `center_id` int(11) NOT NULL,
  `center_name` varchar(255) NOT NULL DEFAULT 'NIL',
  `school_code` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `center_schools`
--

INSERT INTO `center_schools` (`id`, `center_id`, `center_name`, `school_code`, `city`, `date`) VALUES
(1, 1, 'NIL', 'TK', 'kol', '2024-05-06'),
(2, 1, 'NIL', 'BV', 'vds', '2024-05-06'),
(3, 1, 'NIL', 'AD', 'ddsx', '2024-05-06'),
(4, 2, 'NIL', 'TK', 'kol', '2024-05-06'),
(5, 2, 'NIL', 'BV', 'vds', '2024-05-06'),
(6, 2, 'NIL', 'AD', 'ddsx', '2024-05-06'),
(7, 3, 'NIL', 'AD', 'ddsx', '2024-05-07'),
(8, 3, 'NIL', 'TK', 'kol', '2024-05-07'),
(9, 3, 'NIL', 'SS', 'slg', '2024-05-07'),
(10, 4, 'NIL', 'SS', 'slg', '2024-05-07'),
(11, 4, 'NIL', 'TK', 'kol', '2024-05-07'),
(12, 4, 'NIL', 'AD', 'ddsx', '2024-05-07'),
(13, 4, 'NIL', 'BV', 'vds', '2024-05-07'),
(14, 6, 'SS - slg', 'TK', 'kol', '2024-05-07'),
(15, 6, 'SS - slg', 'BV', 'vds', '2024-05-07'),
(16, 6, 'SS - slg', 'AD', 'ddsx', '2024-05-07'),
(17, 7, 'BV - vds', 'AD', 'ddsx', '2024-05-07'),
(18, 7, 'BV - vds', 'SS', 'slg', '2024-05-07');

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id` int(11) NOT NULL,
  `school_code` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `medium` varchar(50) DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `school_code`, `name`, `city`, `medium`, `contact`, `date`) VALUES
(1, 'SS', 'sit', 'slg', 'English', '1233232341', '2024-05-06'),
(2, 'TK', 'tcs', 'kol', 'English', '3456543634', '2024-05-06'),
(3, 'SS', 'sbs', 'Slg', 'English', '0988350533', '2024-05-06'),
(4, 'BV', 'bdvxf', 'vds', 'Bengali', '345456456', '2024-05-06'),
(5, 'AD', 'asd', 'ddsx', 'Hindi', '3425432324', '2024-05-06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `studentID` varchar(255) NOT NULL,
  `schoolNameCode` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `Class` varchar(50) NOT NULL,
  `gurdianname` varchar(255) NOT NULL,
  `contactno` varchar(30) NOT NULL,
  `mediumCode` varchar(20) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `centers`
--
ALTER TABLE `centers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `center_schools`
--
ALTER TABLE `center_schools`
  ADD PRIMARY KEY (`id`),
  ADD KEY `center_id` (`center_id`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `centers`
--
ALTER TABLE `centers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `center_schools`
--
ALTER TABLE `center_schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `center_schools`
--
ALTER TABLE `center_schools`
  ADD CONSTRAINT `center_schools_ibfk_1` FOREIGN KEY (`center_id`) REFERENCES `centers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
