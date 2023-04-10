CREATE DATABASE pruebadb
USE pruebadb
CREATE TABLE
    empleado(
        id INT(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(45) DEFAULT NULL,
        salario INT(5) DEFAULT NULL,
        PRIMARY KEY(id)
    )
INSERT INTO empleado
VALUES (1, 'jose', 1000), (2, 'pedro', 2000)