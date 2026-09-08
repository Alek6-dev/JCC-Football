-- ============================================================
-- Seed Ligue 1 2024-25 — 18 clubs
-- ============================================================

-- Nettoyage
TRUNCATE TABLE user_players CASCADE;
TRUNCATE TABLE players CASCADE;

-- Ajustements de contraintes pour badges/coaches
ALTER TABLE players ALTER COLUMN position DROP NOT NULL;
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_drop_weight_check;
ALTER TABLE players ADD CONSTRAINT players_drop_weight_check CHECK (drop_weight BETWEEN 0 AND 100);

-- ============================================================
-- ANGERS
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Angers SCO', 'Angers', NULL, 'badge', 5.50, 0, '2024-25'),
('H. Koffi', 'Angers', 'GK', 'player', 5.50, 50, '2024-25'),
('O. Pona', 'Angers', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Zinga', 'Angers', 'GK', 'player', 5.50, 50, '2024-25'),
('C. Arcus', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Bamba', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('E. Biumla', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('O. Camara', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Ekomié', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('F. Hanin', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Lefort', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Louër', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Raolisoa', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Sinaté', 'Angers', 'DEF', 'player', 5.50, 50, '2024-25'),
('H. Belkebla', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('Y. Belkhdim', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Capelle', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Courcoul', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. El-Baraka', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('I. Garin', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Koyalipou', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Mouton', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('B. Van den Boomen', 'Angers', 'MIL', 'player', 5.50, 50, '2024-25'),
('H. Djibirin', 'Angers', 'ATT', 'player', 5.50, 50, '2024-25'),
('L. Machine', 'Angers', 'ATT', 'player', 5.50, 50, '2024-25'),
('P. Peter', 'Angers', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Sbaï', 'Angers', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Dujeux', 'Angers', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- AUXERRE
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('AJ Auxerre', 'Auxerre', NULL, 'badge', 5.50, 0, '2024-25'),
('T. De Percin', 'Auxerre', 'GK', 'player', 5.50, 50, '2024-25'),
('D. Léon', 'Auxerre', 'GK', 'player', 5.50, 50, '2024-25'),
('L. Mezerette', 'Auxerre', 'GK', 'player', 5.50, 50, '2024-25'),
('T. Negrel', 'Auxerre', 'GK', 'player', 5.50, 50, '2024-25'),
('C. Akpa', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('E. Diamalunda', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Diomandé', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('E. Legros', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('G. Mensah', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Okoh', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('F. Oppegard', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Petit Dol', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Senaya', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('F. Sierralta', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Siwe', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Sy', 'Auxerre', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Ahamada', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. Casimir', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Coulibaly', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('K. Danois', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Devernois', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Dioussé', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('O. El-Azzouzi', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('R. Faivre', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('E. Owusu', 'Auxerre', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Cissokho', 'Auxerre', 'ATT', 'player', 5.50, 50, '2024-25'),
('S. Mara', 'Auxerre', 'ATT', 'player', 5.50, 50, '2024-25'),
('D. Namaso', 'Auxerre', 'ATT', 'player', 5.50, 50, '2024-25'),
('R. Rodin', 'Auxerre', 'ATT', 'player', 5.50, 50, '2024-25'),
('L. Sinayoko', 'Auxerre', 'ATT', 'player', 5.50, 50, '2024-25'),
('Y. Zaddy', 'Auxerre', 'ATT', 'player', 5.50, 50, '2024-25'),
('C. Pelissier', 'Auxerre', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- BREST
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Stade Brestois', 'Brest', NULL, 'badge', 5.50, 0, '2024-25'),
('G. Coudert', 'Brest', 'GK', 'player', 5.50, 50, '2024-25'),
('N. Jauny', 'Brest', 'GK', 'player', 5.50, 50, '2024-25'),
('R. Majecki', 'Brest', 'GK', 'player', 5.50, 50, '2024-25'),
('B. Chardonnet', 'Brest', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Coulibaly', 'Brest', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Diaz', 'Brest', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Guindo', 'Brest', 'DEF', 'player', 5.50, 50, '2024-25'),
('K. Lala', 'Brest', 'DEF', 'player', 5.50, 50, '2024-25'),
('R. Le Guen', 'Brest', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Locko', 'Brest', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Zogbé', 'Brest', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Chotard', 'Brest', 'MIL', 'player', 5.50, 50, '2024-25'),
('E. Dina Ebimbe', 'Brest', 'MIL', 'player', 5.50, 50, '2024-25'),
('K. Doumbia', 'Brest', 'MIL', 'player', 5.50, 50, '2024-25'),
('H. Magnetti', 'Brest', 'MIL', 'player', 5.50, 50, '2024-25'),
('H. Makalou', 'Brest', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Tousart', 'Brest', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Ajorque', 'Brest', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Baldé', 'Brest', 'ATT', 'player', 5.50, 50, '2024-25'),
('R. Del Castillo', 'Brest', 'ATT', 'player', 5.50, 50, '2024-25'),
('S. Diop', 'Brest', 'ATT', 'player', 5.50, 50, '2024-25'),
('I. Kanté', 'Brest', 'ATT', 'player', 5.50, 50, '2024-25'),
('R. Labeau Lascary', 'Brest', 'ATT', 'player', 5.50, 50, '2024-25'),
('P. Mboup', 'Brest', 'ATT', 'player', 5.50, 50, '2024-25'),
('E. Roy', 'Brest', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- LE HAVRE
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Le Havre AC', 'Le Havre', NULL, 'badge', 5.50, 0, '2024-25'),
('P. Argney', 'Le Havre', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Diaw', 'Le Havre', 'GK', 'player', 5.50, 50, '2024-25'),
('L. Mpasi', 'Le Havre', 'GK', 'player', 5.50, 50, '2024-25'),
('A. Teixeira', 'Le Havre', 'GK', 'player', 5.50, 50, '2024-25'),
('F. Doucouré', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Gomis', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('G. Lloris', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Nego', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Pembélé', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Sangante', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Seko', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('E. Youté Kinkoué', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Zagadou', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('Y. Zouaoui', 'Le Havre', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Bah', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Boufal', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Diabaté', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Ebonog', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Gourna-Douath', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('Y. Kechta', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('R. Khadra', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Kyeremeh', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('D. Mosengo', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('R. Ndiaye', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Rousseau', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Touré', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Zohouri', 'Le Havre', 'MIL', 'player', 5.50, 50, '2024-25'),
('Y. Djellel', 'Le Havre', 'ATT', 'player', 5.50, 50, '2024-25'),
('E. Koffi', 'Le Havre', 'ATT', 'player', 5.50, 50, '2024-25'),
('F. Mambimbi', 'Le Havre', 'ATT', 'player', 5.50, 50, '2024-25'),
('N. Obougou', 'Le Havre', 'ATT', 'player', 5.50, 50, '2024-25'),
('K. Quetant', 'Le Havre', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Samatta', 'Le Havre', 'ATT', 'player', 5.50, 50, '2024-25'),
('I. Soumaré', 'Le Havre', 'ATT', 'player', 5.50, 50, '2024-25'),
('D. Digard', 'Le Havre', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- LENS
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('RC Lens', 'Lens', NULL, 'badge', 5.50, 0, '2024-25'),
('A. Delplace', 'Lens', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Gorgelin', 'Lens', 'GK', 'player', 5.50, 50, '2024-25'),
('R. Gurtner', 'Lens', 'GK', 'player', 5.50, 50, '2024-25'),
('I. Jourdren', 'Lens', 'GK', 'player', 5.50, 50, '2024-25'),
('R. Risser', 'Lens', 'GK', 'player', 5.50, 50, '2024-25'),
('S. Abdulhamid', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('R. Aguilar', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('K. Antonio', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Baidoo', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Celik', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('P. Ganiou', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Gradit', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Masuaku', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Sarr', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Udol', 'Lens', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Bermont', 'Lens', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Bulatovic', 'Lens', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Diallo', 'Lens', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Haidara', 'Lens', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Sangaré', 'Lens', 'MIL', 'player', 5.50, 50, '2024-25'),
('F. Sylla', 'Lens', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Thomasson', 'Lens', 'MIL', 'player', 5.50, 50, '2024-25'),
('O. Édouard', 'Lens', 'ATT', 'player', 5.50, 50, '2024-25'),
('R. Fofana', 'Lens', 'ATT', 'player', 5.50, 50, '2024-25'),
('W. Saïd', 'Lens', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Saint-Maximin', 'Lens', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Sima', 'Lens', 'ATT', 'player', 5.50, 50, '2024-25'),
('F. Sotoca', 'Lens', 'ATT', 'player', 5.50, 50, '2024-25'),
('F. Thauvin', 'Lens', 'ATT', 'player', 5.50, 50, '2024-25'),
('P. Sage', 'Lens', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- LILLE
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('LOSC Lille', 'Lille', NULL, 'badge', 5.50, 0, '2024-25'),
('A. Bodart', 'Lille', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Caillard', 'Lille', 'GK', 'player', 5.50, 50, '2024-25'),
('Z. Lanssade', 'Lille', 'GK', 'player', 5.50, 50, '2024-25'),
('S. Merzouk', 'Lille', 'GK', 'player', 5.50, 50, '2024-25'),
('B. Özer', 'Lille', 'GK', 'player', 5.50, 50, '2024-25'),
('T. Sajous', 'Lille', 'GK', 'player', 5.50, 50, '2024-25'),
('Alexsandro', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Baret', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Goffi', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Mandi', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('C. Mbemba', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Meunier', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Ngoy', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('R. Perraud', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Santos', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('O. Touré', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('C. Verdonk', 'Lille', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. André', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('N. Bentaleb', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Bouaddi', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Boussadia', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Broholm', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('H. Haraldsson', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('E. Mbappé', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('N. Mukau', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Perrin', 'Lille', 'MIL', 'player', 5.50, 50, '2024-25'),
('F. Correia', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('S. Diaoune', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('N. Edjouma', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Fernandez-Pardo', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('O. Giroud', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('H. Igamane', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('Y. Lachaab', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('O. Sahraoui', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Yondjo Matah', 'Lille', 'ATT', 'player', 5.50, 50, '2024-25'),
('B. Genesio', 'Lille', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- LORIENT
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('FC Lorient', 'Lorient', NULL, 'badge', 5.50, 0, '2024-25'),
('B. Kamara', 'Lorient', 'GK', 'player', 5.50, 50, '2024-25'),
('B. Leroy', 'Lorient', 'GK', 'player', 5.50, 50, '2024-25'),
('Y. Mvogo', 'Lorient', 'GK', 'player', 5.50, 50, '2024-25'),
('N. Adjei', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Faye', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('P. Katseris', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Kouassi', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Meïté', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('I. Monnier', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('I. Silva', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Talbi', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('I. Touré', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Yongwa', 'Lorient', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Abergel', 'Lorient', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Avom Ebong', 'Lorient', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Bley', 'Lorient', 'MIL', 'player', 5.50, 50, '2024-25'),
('N. Cadiou', 'Lorient', 'MIL', 'player', 5.50, 50, '2024-25'),
('B. Fadiga', 'Lorient', 'MIL', 'player', 5.50, 50, '2024-25'),
('D. Karim', 'Lorient', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Le Bris', 'Lorient', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. Makengo', 'Lorient', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Bamba', 'Lorient', 'ATT', 'player', 5.50, 50, '2024-25'),
('B. Dieng', 'Lorient', 'ATT', 'player', 5.50, 50, '2024-25'),
('P. Pagis', 'Lorient', 'ATT', 'player', 5.50, 50, '2024-25'),
('T. Sanusi', 'Lorient', 'ATT', 'player', 5.50, 50, '2024-25'),
('S. Soumano', 'Lorient', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Tosin', 'Lorient', 'ATT', 'player', 5.50, 50, '2024-25'),
('O. Pantaloni', 'Lorient', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- LYON
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Olympique Lyonnais', 'Lyon', NULL, 'badge', 5.50, 0, '2024-25'),
('M. Da Silva', 'Lyon', 'GK', 'player', 5.50, 50, '2024-25'),
('R. Descamps', 'Lyon', 'GK', 'player', 5.50, 50, '2024-25'),
('L. Diarra', 'Lyon', 'GK', 'player', 5.50, 50, '2024-25'),
('D. Greif', 'Lyon', 'GK', 'player', 5.50, 50, '2024-25'),
('Abner Vinicius', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('H. Hateboer', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Kamara', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('R. Kluivert', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Laaziri', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Maitland-Niles', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('C. Mata', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Niakhaté', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Tagliafico', 'Lyon', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. De Carvalho', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('F. Fall', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('R. Ghezzal', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Gonçalves', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Hamdani', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Karabec', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('O. Mangala', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('K. Merah', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Morton', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('N. Nartey', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Sulc', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Tessmann', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('C. Tolisso', 'Lyon', 'MIL', 'player', 5.50, 50, '2024-25'),
('Endrick', 'Lyon', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Fofana', 'Lyon', 'ATT', 'player', 5.50, 50, '2024-25'),
('R. Himbert', 'Lyon', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Moreira', 'Lyon', 'ATT', 'player', 5.50, 50, '2024-25'),
('E. Nuamah', 'Lyon', 'ATT', 'player', 5.50, 50, '2024-25'),
('R. Yaremchuk', 'Lyon', 'ATT', 'player', 5.50, 50, '2024-25'),
('P. Fonseca', 'Lyon', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- MARSEILLE
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Olympique de Marseille', 'Marseille', NULL, 'badge', 5.50, 0, '2024-25'),
('J. De Lange', 'Marseille', 'GK', 'player', 5.50, 50, '2024-25'),
('G. Rulli', 'Marseille', 'GK', 'player', 5.50, 50, '2024-25'),
('J. Van Neck', 'Marseille', 'GK', 'player', 5.50, 50, '2024-25'),
('T. Vermot', 'Marseille', 'GK', 'player', 5.50, 50, '2024-25'),
('N. Aguerd', 'Marseille', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Balerdi', 'Marseille', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Doubal', 'Marseille', 'DEF', 'player', 5.50, 50, '2024-25'),
('C. Egan-Riley', 'Marseille', 'DEF', 'player', 5.50, 50, '2024-25'),
('F. Medina', 'Marseille', 'DEF', 'player', 5.50, 50, '2024-25'),
('E. Palmieri', 'Marseille', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Pavard', 'Marseille', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Weah', 'Marseille', 'DEF', 'player', 5.50, 50, '2024-25'),
('H. Abdelli', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Höjbjerg', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Kondogbia', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Mmadi', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('B. Nadir', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Nnadi', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('E. Nwaneri', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('Y. Sellami', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('Q. Timber', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('H. Traoré', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Vermeeren', 'Marseille', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Aubameyang', 'Marseille', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Gouiri', 'Marseille', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Greenwood', 'Marseille', 'ATT', 'player', 5.50, 50, '2024-25'),
('I. Paixao', 'Marseille', 'ATT', 'player', 5.50, 50, '2024-25'),
('H. Beye', 'Marseille', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- METZ
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('FC Metz', 'Metz', NULL, 'badge', 5.50, 0, '2024-25'),
('O. Ba', 'Metz', 'GK', 'player', 5.50, 50, '2024-25'),
('J. Fischer', 'Metz', 'GK', 'player', 5.50, 50, '2024-25'),
('R. Jean-Baptiste', 'Metz', 'GK', 'player', 5.50, 50, '2024-25'),
('P. Sy', 'Metz', 'GK', 'player', 5.50, 50, '2024-25'),
('F. Ballo-Touré', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Colin', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Diop', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('K. Kouao', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('Y. Lawson', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('U. Mboula', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('C. Mélières', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Sané', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Sarr', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Yegbe', 'Metz', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Deminguet', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. Gbamin', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('I. Guerti', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Hein', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('B. Munongo', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('B. Stambouli', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Touré', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('B. Traoré', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Tsitaichvili', 'Metz', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Abuachvili', 'Metz', 'ATT', 'player', 5.50, 50, '2024-25'),
('J. Asoro', 'Metz', 'ATT', 'player', 5.50, 50, '2024-25'),
('H. Diallo', 'Metz', 'ATT', 'player', 5.50, 50, '2024-25'),
('G. Kvilitaia', 'Metz', 'ATT', 'player', 5.50, 50, '2024-25'),
('J. Mangondo', 'Metz', 'ATT', 'player', 5.50, 50, '2024-25'),
('N. Mbala', 'Metz', 'ATT', 'player', 5.50, 50, '2024-25'),
('L. Michal', 'Metz', 'ATT', 'player', 5.50, 50, '2024-25'),
('B. Tavenot', 'Metz', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- MONACO
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('AS Monaco', 'Monaco', NULL, 'badge', 5.50, 0, '2024-25'),
('L. Hradecky', 'Monaco', 'GK', 'player', 5.50, 50, '2024-25'),
('P. Köhn', 'Monaco', 'GK', 'player', 5.50, 50, '2024-25'),
('Y. Lienard', 'Monaco', 'GK', 'player', 5.50, 50, '2024-25'),
('J. Stawiecki', 'Monaco', 'GK', 'player', 5.50, 50, '2024-25'),
('Caio Henrique', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('E. Dier', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('W. Faes', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Kehrer', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Kiwa', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('C. Mawissa Elebi', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Mokabakila', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Nibombe', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('K. Ouattara', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Salisu', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Teze', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('Vanderson', 'Monaco', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Akliouche', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Bamba', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Cabral', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Camara', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Coulibaly', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('K. Diatta', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Golovine', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Idumbo', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Minamino', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Pogba', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('I. Touré', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('D. Zakaria', 'Monaco', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Adingra', 'Monaco', 'ATT', 'player', 5.50, 50, '2024-25'),
('F. Balogun', 'Monaco', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Biereth', 'Monaco', 'ATT', 'player', 5.50, 50, '2024-25'),
('P. Brunner', 'Monaco', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Fati', 'Monaco', 'ATT', 'player', 5.50, 50, '2024-25'),
('S. Pocognoli', 'Monaco', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- NANTES
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('FC Nantes', 'Nantes', NULL, 'badge', 5.50, 0, '2024-25'),
('P. Carlgren', 'Nantes', 'GK', 'player', 5.50, 50, '2024-25'),
('A. Lopes', 'Nantes', 'GK', 'player', 5.50, 50, '2024-25'),
('A. Mirbach', 'Nantes', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Acapandié', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('K. Amian', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('C. Awaziem', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('F. Centonze', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Cozza', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Doucouré', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('F. Guilbert', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Machado', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('U. Radakovic', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Sylla', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Tati', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Yousuf', 'Nantes', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Bodiang', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('R. Cabella', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('F. Coquelin', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('B. Deuff', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Kaba', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. Lepenant', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Leroux', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('I. Sissoko', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('D. Tabibou', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Ziani', 'Nantes', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Abline', 'Nantes', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Camara', 'Nantes', 'ATT', 'player', 5.50, 50, '2024-25'),
('Y. El-Arabi', 'Nantes', 'ATT', 'player', 5.50, 50, '2024-25'),
('I. Ganago', 'Nantes', 'ATT', 'player', 5.50, 50, '2024-25'),
('B. Guirassy', 'Nantes', 'ATT', 'player', 5.50, 50, '2024-25'),
('J. Koné', 'Nantes', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Mohamed', 'Nantes', 'ATT', 'player', 5.50, 50, '2024-25'),
('V. Halilhodzic', 'Nantes', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- NICE
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('OGC Nice', 'Nice', NULL, 'badge', 5.50, 0, '2024-25'),
('T. Bruyère', 'Nice', 'GK', 'player', 5.50, 50, '2024-25'),
('Y. Diouf', 'Nice', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Dupé', 'Nice', 'GK', 'player', 5.50, 50, '2024-25'),
('B. Zelazowski', 'Nice', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Abdelmonem', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Abdi', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Bah', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Bard', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Bombito', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Clauss', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('Dante', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Mantsounga', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Mendy', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Monteiro', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('K. Peprah Oppong', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('E. Pereira', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Youssouf', 'Nice', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Abdul Samed', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Bernardeau', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('H. Boudaoui', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Brignone', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('D. Coulibaly', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Diop', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Louchet', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('Y. Ndayishimiye', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Ndombele', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Sanson', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('C. Vanhoutte', 'Nice', 'MIL', 'player', 5.50, 50, '2024-25'),
('K. Ali', 'Nice', 'ATT', 'player', 5.50, 50, '2024-25'),
('K. Boudache', 'Nice', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Cho', 'Nice', 'ATT', 'player', 5.50, 50, '2024-25'),
('Z. Diallo', 'Nice', 'ATT', 'player', 5.50, 50, '2024-25'),
('T. Gouveia', 'Nice', 'ATT', 'player', 5.50, 50, '2024-25'),
('I. Jansson', 'Nice', 'ATT', 'player', 5.50, 50, '2024-25'),
('Kevin Carlos', 'Nice', 'ATT', 'player', 5.50, 50, '2024-25'),
('E. Wahi', 'Nice', 'ATT', 'player', 5.50, 50, '2024-25'),
('C. Puel', 'Nice', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- PARIS FC
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Paris FC', 'Paris FC', NULL, 'badge', 5.50, 0, '2024-25'),
('O. Nkambadio', 'Paris FC', 'GK', 'player', 5.50, 50, '2024-25'),
('R. Riou', 'Paris FC', 'GK', 'player', 5.50, 50, '2024-25'),
('K. Trapp', 'Paris FC', 'GK', 'player', 5.50, 50, '2024-25'),
('S. Alakouch', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Chergui', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Coppola', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. De Smet', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Kolodziejczak', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Mbow', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Ollila', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('Otavio', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Sangui', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('H. Traoré', 'Paris FC', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Cafaro', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Camara', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('K. El-Kit', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('I. Kebbal', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Koleosho', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Lees-Melou', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. Lopez', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Lopez', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('V. Marchetti', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('R. Matondo', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Munetsi', 'Paris FC', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Dao', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('W. Geubbels', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Gory', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Gueye', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('P. Hamel', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('J. Ikoné', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('C. Immobile', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('J. Krasso', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Simon', 'Paris FC', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Kombouare', 'Paris FC', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- PARIS-SG
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Paris Saint-Germain', 'Paris-SG', NULL, 'badge', 5.50, 0, '2024-25'),
('L. Chevalier', 'Paris-SG', 'GK', 'player', 5.50, 50, '2024-25'),
('M. James', 'Paris-SG', 'GK', 'player', 5.50, 50, '2024-25'),
('R. Marin', 'Paris-SG', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Safonov', 'Paris-SG', 'GK', 'player', 5.50, 50, '2024-25'),
('A. Vignaud', 'Paris-SG', 'GK', 'player', 5.50, 50, '2024-25'),
('L. Beraldo', 'Paris-SG', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Boly', 'Paris-SG', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Hakimi', 'Paris-SG', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Hernandez', 'Paris-SG', 'DEF', 'player', 5.50, 50, '2024-25'),
('Marquinhos', 'Paris-SG', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Mendes', 'Paris-SG', 'DEF', 'player', 5.50, 50, '2024-25'),
('W. Pacho', 'Paris-SG', 'DEF', 'player', 5.50, 50, '2024-25'),
('I. Zabarnyi', 'Paris-SG', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Fernandez', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('Y. Khafi', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('K. Lee', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Mayulu', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. Neves', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('N. Nsoki', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('F. Ruiz', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('Vitinha', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('W. Zaïre-Emery', 'Paris-SG', 'MIL', 'player', 5.50, 50, '2024-25'),
('B. Barcola', 'Paris-SG', 'ATT', 'player', 5.50, 50, '2024-25'),
('O. Dembélé', 'Paris-SG', 'ATT', 'player', 5.50, 50, '2024-25'),
('D. Doué', 'Paris-SG', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Jangeal', 'Paris-SG', 'ATT', 'player', 5.50, 50, '2024-25'),
('K. Kvaratskhelia', 'Paris-SG', 'ATT', 'player', 5.50, 50, '2024-25'),
('I. Mbaye', 'Paris-SG', 'ATT', 'player', 5.50, 50, '2024-25'),
('Q. Ndjantou', 'Paris-SG', 'ATT', 'player', 5.50, 50, '2024-25'),
('G. Ramos', 'Paris-SG', 'ATT', 'player', 5.50, 50, '2024-25'),
('Luis Enrique', 'Paris-SG', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- RENNES
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Stade Rennais', 'Rennes', NULL, 'badge', 5.50, 0, '2024-25'),
('A. Akabou', 'Rennes', 'GK', 'player', 5.50, 50, '2024-25'),
('K. Belazzoug', 'Rennes', 'GK', 'player', 5.50, 50, '2024-25'),
('B. Samba', 'Rennes', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Silistrie', 'Rennes', 'GK', 'player', 5.50, 50, '2024-25'),
('A. Aït-Boudlal', 'Rennes', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Brassier', 'Rennes', 'DEF', 'player', 5.50, 50, '2024-25'),
('J. Jacquet', 'Rennes', 'DEF', 'player', 5.50, 50, '2024-25'),
('Q. Merlin', 'Rennes', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Nagida', 'Rennes', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Rouault', 'Rennes', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Seidu', 'Rennes', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Al-Tamari', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('L. Blas', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Camara', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('D. Cissé', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Frankowski', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('G. Kamara', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('P. Limon', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('V. Rongier', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Szymanski', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('C. Ugochukwu', 'Rennes', 'MIL', 'player', 5.50, 50, '2024-25'),
('H. Do Marcolino', 'Rennes', 'ATT', 'player', 5.50, 50, '2024-25'),
('B. Embolo', 'Rennes', 'ATT', 'player', 5.50, 50, '2024-25'),
('E. Lepaul', 'Rennes', 'ATT', 'player', 5.50, 50, '2024-25'),
('N. Mukiele', 'Rennes', 'ATT', 'player', 5.50, 50, '2024-25'),
('A. Nordin', 'Rennes', 'ATT', 'player', 5.50, 50, '2024-25'),
('E. Quiñonez', 'Rennes', 'ATT', 'player', 5.50, 50, '2024-25'),
('L. Rosier', 'Rennes', 'ATT', 'player', 5.50, 50, '2024-25'),
('Y. Zabiri', 'Rennes', 'ATT', 'player', 5.50, 50, '2024-25'),
('F. Haise', 'Rennes', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- STRASBOURG
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('RC Strasbourg', 'Strasbourg', NULL, 'badge', 5.50, 0, '2024-25'),
('S. Bajic', 'Strasbourg', 'GK', 'player', 5.50, 50, '2024-25'),
('K. Johnsson', 'Strasbourg', 'GK', 'player', 5.50, 50, '2024-25'),
('M. Penders', 'Strasbourg', 'GK', 'player', 5.50, 50, '2024-25'),
('A. Anselmino', 'Strasbourg', 'DEF', 'player', 5.50, 50, '2024-25'),
('V. Barco', 'Strasbourg', 'DEF', 'player', 5.50, 50, '2024-25'),
('B. Chilwell', 'Strasbourg', 'DEF', 'player', 5.50, 50, '2024-25'),
('G. Doué', 'Strasbourg', 'DEF', 'player', 5.50, 50, '2024-25'),
('I. Doukouré', 'Strasbourg', 'DEF', 'player', 5.50, 50, '2024-25'),
('L. Högsberg', 'Strasbourg', 'DEF', 'player', 5.50, 50, '2024-25'),
('A. Omobamidele', 'Strasbourg', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. Amougou', 'Strasbourg', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. El-Mourabet', 'Strasbourg', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. Enciso', 'Strasbourg', 'MIL', 'player', 5.50, 50, '2024-25'),
('R. Luis', 'Strasbourg', 'MIL', 'player', 5.50, 50, '2024-25'),
('J. Mwanga', 'Strasbourg', 'MIL', 'player', 5.50, 50, '2024-25'),
('T. Noubissie', 'Strasbourg', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Ouattara', 'Strasbourg', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Oyedele', 'Strasbourg', 'MIL', 'player', 5.50, 50, '2024-25'),
('S. Amo-Ameyaw', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('T. Diallo', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('E. Emegha', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('D. Fofana', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('M. Godo', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('D. Moreira', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('S. Nanasi', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('J. Panichelli', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('G. Yassine', 'Strasbourg', 'ATT', 'player', 5.50, 50, '2024-25'),
('G. O''Neil', 'Strasbourg', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- TOULOUSE
-- ============================================================
INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season) VALUES
('Toulouse FC', 'Toulouse', NULL, 'badge', 5.50, 0, '2024-25'),
('A. Dominguez', 'Toulouse', 'GK', 'player', 5.50, 50, '2024-25'),
('K. Haug', 'Toulouse', 'GK', 'player', 5.50, 50, '2024-25'),
('G. Restes', 'Toulouse', 'GK', 'player', 5.50, 50, '2024-25'),
('N. Saïd Mchindra', 'Toulouse', 'GK', 'player', 5.50, 50, '2024-25'),
('G. Bakhouche', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('C. Cresswell', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('F. Efuele Ngoyala', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('T. Garondo', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('W. Kamanzi', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('S. Koumbassa', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('M. McKenzie', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Methalie', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('R. Nicolaisen', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('D. Sidibé', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('N. Wasbauer', 'Toulouse', 'DEF', 'player', 5.50, 50, '2024-25'),
('F. Abu', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('C. Casseres', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('D. Diop', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Dönnum', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('N. Lahmadi', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('R. Messali', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('M. Sauer', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('A. Vossah', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('D. Zema', 'Toulouse', 'MIL', 'player', 5.50, 50, '2024-25'),
('I. Azizi', 'Toulouse', 'ATT', 'player', 5.50, 50, '2024-25'),
('Emersonn', 'Toulouse', 'ATT', 'player', 5.50, 50, '2024-25'),
('E. Faty', 'Toulouse', 'ATT', 'player', 5.50, 50, '2024-25'),
('Y. Gboho', 'Toulouse', 'ATT', 'player', 5.50, 50, '2024-25'),
('S. Hidalgo', 'Toulouse', 'ATT', 'player', 5.50, 50, '2024-25'),
('F. Magri', 'Toulouse', 'ATT', 'player', 5.50, 50, '2024-25'),
('J. Russell-Rowe', 'Toulouse', 'ATT', 'player', 5.50, 50, '2024-25'),
('J. Vignolo', 'Toulouse', 'ATT', 'player', 5.50, 50, '2024-25'),
('C. Martinez Novell', 'Toulouse', NULL, 'coach', 5.50, 0, '2024-25');

-- ============================================================
-- Assignation lettres de club (A=Angers, B=Auxerre, ..., R=Toulouse)
-- Les 18 clubs Ligue 1 par ordre alphabétique → lettres A à R
-- ============================================================
WITH club_letters AS (
  SELECT
    club,
    chr((64 + ROW_NUMBER() OVER (ORDER BY club ASC))::integer) AS letter
  FROM (SELECT DISTINCT club FROM players ORDER BY club ASC) c
)
UPDATE players
SET club_letter = cl.letter
FROM club_letters cl
WHERE players.club = cl.club;

-- ============================================================
-- Numérotation par club : badge=1, joueurs GK→DEF→MIL→ATT (alpha), coach=dernier
-- Les nouveaux arrivés au mercato prendront simplement la suite (n+1)
-- ============================================================
WITH club_numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY club
      ORDER BY
        CASE card_type WHEN 'badge' THEN 0 WHEN 'player' THEN 1 WHEN 'coach' THEN 2 END,
        CASE position WHEN 'GK' THEN 1 WHEN 'DEF' THEN 2 WHEN 'MIL' THEN 3 WHEN 'ATT' THEN 4 ELSE 5 END,
        name ASC
    ) AS num
  FROM players
)
UPDATE players
SET club_card_number = cn.num
FROM club_numbered cn
WHERE players.id = cn.id;
