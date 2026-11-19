
const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Bolygótípusok lekérdezése
app.get("/api/tipusok", async (req, res) => {
    try {
        const [tipusok] = await db.query(
            "SELECT * FROM bolygo_tipusok"
        );

        res.status(200).json(tipusok);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Adatbázishiba"
        });
    }
});

// Bolygók lekérdezése
app.get("/api/bolygok", async (req, res) => {
    try {
        const [bolygok] = await db.query(`
            SELECT
                bolygok.*,
                bolygo_tipusok.tipus_neve
            FROM bolygok
            INNER JOIN bolygo_tipusok
                ON bolygok.tipus_id = bolygo_tipusok.tipus_id
        `);

        res.status(200).json(bolygok);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Adatbázishiba"
        });
    }
});

// Bolygó törlése
app.delete("/api/torles", async (req, res) => {
    try {
        const { id } = req.body;

        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                error: "Érvénytelen bolygóazonosító"
            });
        }

        const [eredmeny] = await db.query(
            "DELETE FROM bolygok WHERE bolygo_id = ?",
            [id]
        );

        if (eredmeny.affectedRows === 0) {
            return res.status(404).json({
                error: "A bolygó nem található"
            });
        }

        res.status(200).json({
            message: "A bolygó sikeresen törölve"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Adatbázishiba"
        });
    }
});

// Új bolygó létrehozása
app.post("/api/ujbolygo", async (req, res) => {
    try {
        const {
            neve,
            tipus_id,
            tomeg,
            egyenlitori_sugar,
            holdak_szama,
            nap_tavolsag,
            fold_tavolsag,
            leiras
        } = req.body;

        if (
            typeof neve !== "string" || !neve.trim() ||
            tipus_id === undefined || tipus_id === null ||
            tomeg === undefined || tomeg === null ||
            egyenlitori_sugar === undefined || egyenlitori_sugar === null ||
            holdak_szama === undefined || holdak_szama === null ||
            nap_tavolsag === undefined || nap_tavolsag === null ||
            typeof leiras !== "string" || !leiras.trim()
        ) {
            return res.status(400).json({
                error: "A név megadása kötelező"
            });
        }

        const [eredmeny] = await db.query(
            `INSERT INTO bolygok
            (neve, tipus_id, tomeg, egyenlitori_sugar,
            holdak_szama, nap_tavolsag, fold_tavolsag, leiras)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                neve.trim(),
                tipus_id,
                tomeg,
                egyenlitori_sugar,
                holdak_szama,
                nap_tavolsag,
                fold_tavolsag ?? null,
                leiras
            ]
        );

        res.status(201).json({
            message: "A bolygó sikeresen létrehozva",
            id: eredmeny.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Adatbázishiba"
        });
    }
});

// Szerver indítása
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`A szerver fut: http://localhost:${PORT}`);
});
