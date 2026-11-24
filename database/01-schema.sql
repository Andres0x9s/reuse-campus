CREATE DATABASE IF NOT EXISTS reuse_campus
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE reuse_campus;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('USUARIO','ADMINISTRADOR') NOT NULL DEFAULT 'USUARIO',
    estado ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    modalidad ENUM('DONACION','INTERCAMBIO') NOT NULL,
    estado ENUM('DISPONIBLE','RESERVADA','ENTREGADA','CANCELADA')
        NOT NULL DEFAULT 'DISPONIBLE',
    fechaPublicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuarioId INT NOT NULL,
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacionId INT NOT NULL,
    solicitanteId INT NOT NULL,
    mensaje TEXT NOT NULL,
    fechaSolicitud DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('PENDIENTE','ACEPTADA','RECHAZADA','CANCELADA')
        NOT NULL DEFAULT 'PENDIENTE',
    pendiente TINYINT GENERATED ALWAYS AS
        (IF(estado='PENDIENTE',1,NULL)) STORED,
    aceptada TINYINT GENERATED ALWAYS AS
        (IF(estado='ACEPTADA',1,NULL)) STORED,
    UNIQUE KEY uq_pendiente (publicacionId, solicitanteId, pendiente),
    UNIQUE KEY uq_aceptada (publicacionId, aceptada),
    UNIQUE KEY uq_solicitud_publicacion (id, publicacionId),
    FOREIGN KEY (publicacionId) REFERENCES publicaciones(id),
    FOREIGN KEY (solicitanteId) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacionId INT NOT NULL UNIQUE,
    solicitudId INT NOT NULL UNIQUE,
    propietarioId INT NOT NULL,
    receptorId INT NOT NULL,
    fechaAcuerdo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaEntrega DATETIME NULL,
    estado ENUM('PENDIENTE','COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
    FOREIGN KEY (publicacionId) REFERENCES publicaciones(id),
    FOREIGN KEY (solicitudId, publicacionId)
        REFERENCES solicitudes(id, publicacionId),
    FOREIGN KEY (propietarioId) REFERENCES usuarios(id),
    FOREIGN KEY (receptorId) REFERENCES usuarios(id)
) ENGINE=InnoDB;