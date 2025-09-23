const { db, query, queryOne, run } = require('../database/connection');

/**
 * Model posiłku z obsługą analizy AI
 */
class Meal {
  /**
   * Pobranie wszystkich posiłków użytkownika
   * @param {number} userId - ID użytkownika
   * @param {Object} options - Opcje filtrowania
   * @returns {Promise<Array>} - Lista posiłków
   */
  async getAllForUser(userId, options = {}) {
    try {
      const { date, limit = 100, offset = 0, type, sort = 'desc' } = options;
      
      let sql = 'SELECT * FROM meals WHERE user_id = ?';
      const params = [userId];
      
      if (date) {
        sql += ' AND meal_date = ?';
        params.push(date);
      }
      
      if (type) {
        sql += ' AND meal_type = ?';
        params.push(type);
      }
      
      sql += ` ORDER BY meal_date ${sort === 'asc' ? 'ASC' : 'DESC'}, created_at DESC`;
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      return await query(sql, params);
    } catch (error) {
      throw new Error(`Błąd podczas pobierania posiłków: ${error.message}`);
    }
  }

  /**
   * Pobranie pojedynczego posiłku
   * @param {number} id - ID posiłku
   * @param {number} userId - ID użytkownika
   * @returns {Promise<Object>} - Posiłek
   */
  async getById(id, userId) {
    try {
      const meal = await queryOne(
        'SELECT * FROM meals WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (!meal) {
        throw new Error('Posiłek nie znaleziony');
      }
      
      // Jeśli posiłek ma analizę AI, parsujemy ją
      if (meal.ai_analysis) {
        try {
          meal.ai_analysis = JSON.parse(meal.ai_analysis);
        } catch (e) {
          // W przypadku błędu parsowania, pozostawiamy jako string
          console.error('Błąd parsowania analizy AI:', e);
        }
      }
      
      return meal;
    } catch (error) {
      throw new Error(`Błąd podczas pobierania posiłku: ${error.message}`);
    }
  }

  /**
   * Dodawanie nowego posiłku
   * @param {Object} mealData - Dane posiłku
   * @returns {Promise<Object>} - Utworzony posiłek
   */
  async create(mealData) {
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Jeśli ai_analysis jest obiektem, konwertujemy go do JSON
      let aiAnalysis = mealData.ai_analysis;
      if (aiAnalysis && typeof aiAnalysis === 'object') {
        aiAnalysis = JSON.stringify(aiAnalysis);
      }
      
      const result = await run(
        `INSERT INTO meals (
          user_id, name, description, calories, 
          protein, carbs, fat, meal_date, meal_type, ai_analysis
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mealData.user_id,
          mealData.name,
          mealData.description || '',
          mealData.calories || null,
          mealData.protein || null,
          mealData.carbs || null,
          mealData.fat || null,
          mealData.meal_date || today,
          mealData.meal_type || null,
          aiAnalysis
        ]
      );
      
      return await this.getById(result.id, mealData.user_id);
    } catch (error) {
      throw new Error(`Błąd podczas dodawania posiłku: ${error.message}`);
    }
  }

  /**
   * Aktualizacja posiłku
   * @param {number} id - ID posiłku
   * @param {number} userId - ID użytkownika
   * @param {Object} mealData - Dane posiłku do aktualizacji
   * @returns {Promise<Object>} - Zaktualizowany posiłek
   */
  async update(id, userId, mealData) {
    try {
      // Najpierw sprawdzamy czy posiłek istnieje
      await this.getById(id, userId);
      
      const fields = [];
      const values = [];
      
      // Budujemy zapytanie na podstawie przekazanych pól
      Object.keys(mealData).forEach(key => {
        if (key !== 'id' && key !== 'user_id' && mealData[key] !== undefined) {
          // Specjalne traktowanie ai_analysis jeśli jest obiektem
          if (key === 'ai_analysis' && typeof mealData[key] === 'object') {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(mealData[key]));
          } else {
            fields.push(`${key} = ?`);
            values.push(mealData[key]);
          }
        }
      });
      
      if (fields.length === 0) {
        return await this.getById(id, userId);
      }
      
      values.push(id, userId);
      
      const result = await run(
        `UPDATE meals SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );
      
      if (result.changes === 0) {
        throw new Error('Nie zaktualizowano posiłku');
      }
      
      return await this.getById(id, userId);
    } catch (error) {
      throw new Error(`Błąd podczas aktualizacji posiłku: ${error.message}`);
    }
  }

  /**
   * Usuwanie posiłku
   * @param {number} id - ID posiłku
   * @param {number} userId - ID użytkownika
   * @returns {Promise<Object>} - Wynik operacji
   */
  async delete(id, userId) {
    try {
      const result = await run(
        'DELETE FROM meals WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (result.changes === 0) {
        throw new Error('Posiłek nie znaleziony');
      }
      
      return { message: 'Posiłek usunięty' };
    } catch (error) {
      throw new Error(`Błąd podczas usuwania posiłku: ${error.message}`);
    }
  }

  /**
   * Pobranie statystyk posiłków dla użytkownika
   * @param {number} userId - ID użytkownika
   * @returns {Promise<Object>} - Statystyki
   */
  async getUserStats(userId) {
    try {
      const stats = await queryOne(`
        SELECT 
          COUNT(*) as total_meals,
          AVG(calories) as avg_calories,
          AVG(protein) as avg_protein,
          AVG(carbs) as avg_carbs,
          AVG(fat) as avg_fat,
          COUNT(DISTINCT meal_date) as unique_days
        FROM meals
        WHERE user_id = ?`,
        [userId]
      );
      
      return stats;
    } catch (error) {
      throw new Error(`Błąd podczas pobierania statystyk: ${error.message}`);
    }
  }
}

module.exports = new Meal();