-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS techsolutions
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

-- Selecionar banco de dados
USE techsolutions;

-- Criar tabela de materiais
CREATE TABLE IF NOT EXISTS materiais (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) DEFAULT NULL,
    patrimonio VARCHAR(100) NOT NULL,
    status ENUM('Disponivel', 'Emprestado') NOT NULL DEFAULT 'Disponivel',
    funcionario VARCHAR(150) DEFAULT NULL,
    data_cadastro TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY numero_serie (patrimonio)
) ENGINE=InnoDB;

-- Inserir materiais de exemplo
INSERT INTO materiais
(nome, categoria, patrimonio, status, funcionario)
VALUES
('Furadeira Bosch', 'Ferramentas Eletricas', 'PAT-001', 'Disponivel', NULL),
('Parafusadeira', 'Ferramentas Eletricas', 'PAT-002', 'Disponivel', NULL),
('Notebook Dell', 'Informatica', 'PAT-003', 'Disponivel', NULL),
('Monitor LG', 'Informatica', 'PAT-004', 'Disponivel', NULL),
('Mouse Logitech', 'Informatica', 'PAT-005', 'Disponivel', NULL);

-- Consultar materiais cadastrados
SELECT * FROM materiais;