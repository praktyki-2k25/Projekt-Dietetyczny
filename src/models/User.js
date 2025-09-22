const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

class User {
  constructor(db) {
    this.db = db;
  }

  // Metoda do utworzenia nowego użytkownika
  async create(userData) {
    return new Promise((resolve, reject) => {
      // Hashowanie hasła
      bcrypt.hash(userData.password, 10, (err, hash) => {
        if (err) {
          return reject(err);
        }

        // Obliczanie BMI (weight / (height/100)^2)
        let bmi = null;
        if (userData.weight && userData.height) {
          bmi = userData.weight / Math.pow(userData.height / 100, 2);
          bmi = parseFloat(bmi.toFixed(1));
        }

        const sql = `
          INSERT INTO users (email, password, username, weight, height, age, bmi, weight_goal, gender, activity_level)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        this.db.run(sql, [
          userData.email,
          hash,
          userData.username,
          userData.weight || null,
          userData.height || null,
          userData.age || null,
          bmi,
          userData.weight_goal || null,
          userData.gender || null,
          userData.activity_level || 'moderate'
        ], function(err) {
          if (err) {
            return reject(err);
          }
          resolve({ id: this.lastID, ...userData, bmi, password: undefined });
        });
      });
    });
  }

  // Metoda do wyszukiwania użytkownika po email
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
          return reject(err);
        }
        resolve(user);
      });
    });
  }

  // Metoda do wyszukiwania użytkownika po ID
  findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
          return reject(err);
        }

        if (user) {
          // Nie zwracamy hasła
          delete user.password;
        }
        
        resolve(user);
      });
    });
  }

  // Metoda do aktualizacji danych użytkownika
  async update(id, userData) {
    return new Promise((resolve, reject) => {
      // Sprawdzenie, czy użytkownik istnieje
      this.findById(id).then(user => {
        if (!user) {
          return reject(new Error('Użytkownik nie istnieje'));
        }

        let fields = [];
        let values = [];
        
        // Dynamiczne budowanie zapytania SQL
        Object.keys(userData).forEach(key => {
          if (key !== 'id' && key !== 'password' && key !== 'email') {
            fields.push(`${key} = ?`);
            values.push(userData[key]);
          }
        });

        // Jeśli zmieniono wzrost lub wagę, oblicz nowe BMI
        if (userData.weight || userData.height) {
          const weight = userData.weight || user.weight;
          const height = userData.height || user.height;
          
          if (weight && height) {
            const bmi = weight / Math.pow(height / 100, 2);
            fields.push('bmi = ?');
            values.push(parseFloat(bmi.toFixed(1)));
          }
        }

        // Jeśli nie ma nic do aktualizacji
        if (fields.length === 0) {
          return resolve(user);
        }

        // Dodaj ID na końcu wartości dla warunku WHERE
        values.push(id);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        
        this.db.run(sql, values, function(err) {
          if (err) {
            return reject(err);
          }
          
          if (this.changes === 0) {
            return reject(new Error('Nie zaktualizowano żadnych danych'));
          }
          
          // Pobierz zaktualizowane dane użytkownika
          this.findById(id).then(resolve).catch(reject);
        }.bind(this));
      }).catch(reject);
    });
  }

  // Metoda do zmiany hasła
  async changePassword(id, currentPassword, newPassword) {
    return new Promise((resolve, reject) => {
      // Pobierz użytkownika z hasłem
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
          return reject(err);
        }

        if (!user) {
          return reject(new Error('Użytkownik nie istnieje'));
        }

        // Sprawdź poprawność obecnego hasła
        bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
          if (err) {
            return reject(err);
          }

          if (!isMatch) {
            return reject(new Error('Nieprawidłowe hasło'));
          }

          // Hashowanie nowego hasła
          bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) {
              return reject(err);
            }

            // Aktualizacja hasła
            this.db.run('UPDATE users SET password = ? WHERE id = ?', [hash, id], function(err) {
              if (err) {
                return reject(err);
              }
              
              if (this.changes === 0) {
                return reject(new Error('Nie udało się zmienić hasła'));
              }
              
              resolve({ success: true, message: 'Hasło zostało zmienione' });
            });
          });
        });
      });
    });
  }

  // Metoda do usunięcia użytkownika
  async delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }
        
        if (this.changes === 0) {
          return reject(new Error('Użytkownik nie istnieje'));
        }
        
        resolve({ success: true, message: 'Użytkownik został usunięty' });
      });
    });
  }

  // Metoda do sprawdzenia poprawności danych logowania
  async verifyCredentials(email, password) {
    return new Promise((resolve, reject) => {
      this.findByEmail(email).then(user => {
        if (!user) {
          return reject(new Error('Nieprawidłowy email lub hasło'));
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return reject(err);
          }

          if (!isMatch) {
            return reject(new Error('Nieprawidłowy email lub hasło'));
          }

          // Nie zwracamy hasła
          delete user.password;
          resolve(user);
        });
      }).catch(reject);
    });
  }
}

module.exports = User;
