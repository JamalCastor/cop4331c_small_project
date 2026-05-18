-- COP4331 Small Project - Personal Contact Manager
-- Part - Personal Contact Manager Database
-- Created by Group 19 Julie Sin

CREATE DATABASE ContactManager;

USE ContactManager;

-- Create Users table for login/registration
CREATE TABLE Users (
    ID INT NOT NULL AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL DEFAULT '',
    LastName VARCHAR(50) NOT NULL DEFAULT '',
    Login VARCHAR(50) NOT NULL DEFAULT '',
    Password VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (ID)
) ENGINE = InnoDB;

-- Create Contacts table connected to each User
CREATE TABLE Contacts (
	ID INT NOT NULL AUTO_INCREMENT,
	FirstName VARCHAR(50) NOT NULL DEFAULT '',
    LastName VARCHAR(50) NOT NULL DEFAULT '',
    Phone VARCHAR(50) NOT NULL DEFAULT '',
    Email VARCHAR(50) NOT NULL DEFAULT '',
    UserID INT NOT NULL DEFAULT 0,
    DateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID)
) ENGINE = InnoDB;


-- Create web app database user
CREATE USER 'TheBeast' IDENTIFIED BY 'COP4331//x26SP';

-- Grant access privileges to web app database user
GRANT ALL PRIVILEGES ON ContactManager.* TO 'TheBeast'@'%';
    
    
-- Samples to test API endpoints

-- Julie Sin is UserID 1
INSERT INTO Users (FirstName, LastName, Login, Password) VALUES ('Julie', 'Sin', 'JulieS', MD5('Password1'));
-- Jamal Castor is UserID 2
INSERT INTO Users (FirstName, LastName, Login, Password) VALUES ('Jamal', 'Castor', 'JamalC', MD5('Password2'));

-- Insert test contacts for Julie Sin (UserID 1)
INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES ('Charles', 'Bravo', '407-555-1234', 'charles.bravo@email.com', 1);
INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES ('Gabriel', 'Tiqui', '407-555-5678', 'gabe.tiqui@email.com', 1);
INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES ('Cesar', 'Ramirez', '407-555-9012', 'cesar.ramirez@email.com', 1);
    
