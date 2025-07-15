const { sql } = require('../config/db');

class Demande {
    static async create(demandeData) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('Titre', sql.NVarChar, demandeData.Titre)
                .input('Description', sql.NVarChar, demandeData.Description)
                .input('Statut', sql.NVarChar, demandeData.Statut || 'Pending') // Default status
                .input('DateCreation', sql.DateTime, new Date())
                .query(`
                    INSERT INTO Demandes (Titre, Description, Statut, DateCreation)
                    VALUES (@Titre, @Description, @Statut, @DateCreation);
                    SELECT SCOPE_IDENTITY() AS id;
                `);
            return result.recordset[0].id;
        } catch (err) {
            throw new Error(`Error creating demande: ${err.message}`);
        }
    }

    static async getAll() {
        try {
            const pool = await sql.connect();
            const result = await pool.request().query('SELECT * FROM Demandes');
            return result.recordset;
        } catch (err) {
            throw new Error(`Error fetching demandes: ${err.message}`);
        }
    }

    static async getById(id) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('ID', sql.Int, id)
                .query('SELECT * FROM Demandes WHERE ID = @ID');
            return result.recordset[0]; // Return the first record found
        } catch (err) {
            throw new Error(`Error fetching demande by ID: ${err.message}`);
        }
    }

    // You can add more methods here (update, delete, etc.)
}

module.exports = Demande;

// Note: You'll need to create the 'Demandes' table in your SQL Server database.
// Example SQL for creating the table:
/*
CREATE TABLE Demandes (
    ID INT PRIMARY KEY IDENTITY(1,1),
    Titre NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Statut NVARCHAR(50) DEFAULT 'Pending',
    DateCreation DATETIME DEFAULT GETDATE()
);
*/