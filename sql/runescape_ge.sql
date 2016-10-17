-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 17, 2016 at 01:59 PM
-- Server version: 5.6.31-0ubuntu0.14.04.2
-- PHP Version: 5.5.9-1ubuntu4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `runescape_ge`
--

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE IF NOT EXISTS `category` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier',
  `description` varchar(255) DEFAULT NULL COMMENT 'Category identifier as per categories.id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COMMENT='Stores the category ids and their descriptions' AUTO_INCREMENT=38 ;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `description`) VALUES
(0, 'Miscellaneous'),
(1, 'Ammo'),
(2, 'Arrows'),
(3, 'Bolts'),
(4, 'Construction materials'),
(5, 'Construction projects'),
(6, 'Cooking ingredients'),
(7, 'Costumes'),
(8, 'Crafting materials'),
(9, 'Familiars'),
(10, 'Farming produce'),
(11, 'Fletching materials'),
(12, 'Food and drink'),
(13, 'Herblore materials'),
(14, 'Hunting equipment'),
(15, 'Hunting produce'),
(16, 'Jewellery'),
(17, 'Mage armour'),
(18, 'Mage weapons'),
(19, 'Melee armour - low level'),
(20, 'Melee armour - mid level'),
(21, 'Melee armour - high level'),
(22, 'Melee weapons - low level'),
(23, 'Melee weapons - mid level'),
(24, 'Melee weapons - high level'),
(25, 'Mining and smithing'),
(26, 'Potions'),
(27, 'Prayer armour'),
(28, 'Prayer materials'),
(29, 'Range armour'),
(30, 'Range weapons'),
(31, 'Runecrafting'),
(32, 'Runes,Spells and Teleports'),
(33, 'Seeds'),
(34, 'Summoning scrolls'),
(35, 'Tools and containers'),
(36, 'Woodcutting product'),
(37, 'Pocket Items');

--
-- Table structure for table `category_alpha`
--

CREATE TABLE IF NOT EXISTS `category_alpha` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier',
  `category` int(11) DEFAULT NULL COMMENT 'Category identifier as per categories.id',
  `letter` varchar(255) DEFAULT NULL COMMENT 'The letter or representation of the alpha',
  `items` int(11) DEFAULT NULL COMMENT 'The amount of items that exist for this alpha',
  `pages` int(11) DEFAULT NULL COMMENT 'The amount of pages that exist for this alpha',
  `processed` tinyint(1) DEFAULT NULL COMMENT 'Used to track which alphas were processed before anti-dos kicked in',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COMMENT='Stores the alpha information that is associated with a category' AUTO_INCREMENT=595 ;

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE IF NOT EXISTS `item` (
  `id` int(10) unsigned NOT NULL,
  `category` int(11) DEFAULT NULL,
  `alpha_id` int(11) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `icon_large` varchar(255) DEFAULT NULL,
  `typeIcon` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `members` varchar(255) DEFAULT NULL,
  `current_trend` varchar(255) DEFAULT NULL,
  `current_price` int(11) DEFAULT NULL,
  `today_trend` varchar(255) DEFAULT NULL,
  `today_price` int(11) DEFAULT NULL,
  `day30_trend` varchar(255) DEFAULT NULL,
  `day30_price` varchar(255) DEFAULT NULL,
  `day90_trend` varchar(255) DEFAULT NULL,
  `day90_price` varchar(255) DEFAULT NULL,
  `day180_trend` varchar(255) DEFAULT NULL,
  `day180_price` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191),`description`(191)),
  FULLTEXT KEY `name_ft` (`name`,`description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `item_icon`
--

CREATE TABLE IF NOT EXISTS `item_icon` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` int(10) unsigned NOT NULL,
  `status_code` smallint(3) NOT NULL,
  `filename` varchar(55) NOT NULL,
  `large` tinyint(1) DEFAULT NULL,
  `icon` blob,
  PRIMARY KEY (`id`),
  KEY `icon_large` (`item_id`),
  KEY `processed` (`status_code`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COMMENT='Tracks which item icons have been downloaded' AUTO_INCREMENT=8383 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
