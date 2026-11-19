const express = require("express");
const db = require("./db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("A Naprendszer backend szervere működik!");
});

app.get("/api/tipusok", async (req, res) => {
    try {
        const [tipusok] = await db.query(
            "SELECT * FROM bolygo_tipusok"
        );

        res.status(200).json(tipusok);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Adatbázishiba" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`A szerver fut: http://localhost:${PORT}`);
});

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
        res.status(500).json({ error: "Adatbázishiba" });
    }
});

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

        if (!neve || !neve.trim()) {
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
                neve,
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