DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0
);

INSERT INTO books (title, author, price, stock) VALUES
  ('The Alchemist', 'Paulo Coelho', '299.00', 3),
  ('Wings of Fire', 'A. P. J. Abdul Kalam', '350.00', 5),
  ('The White Tiger', 'Aravind Adiga', '399.00', 4),
  ('Midnight''s Children', 'Salman Rushdie', '1250.00', 2),
  ('The God of Small Things', 'Arundhati Roy', '375.50', 6),
  ('Train to Pakistan', 'Khushwant Singh', '260.00', 3),
  ('Godan', 'Munshi Premchand', '199.99', 8),
  ('Malgudi Days', 'R. K. Narayan', '149.99', 5),
  ('The Guide', 'R. K. Narayan', '310.50', 4),
  ('Interpreter of Maladies', 'Jhumpa Lahiri', '1499.00', 1);
