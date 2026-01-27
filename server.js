const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_USER = process.env.GITHUB_USERNAME || 'Kluvien';

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Sukses terhubung ke MongoDB Atlas"))
    .catch(err => console.error("❌ Gagal konek database:", err));

app.get('/', (req, res) => {
    res.json({
        message: "Server Portfolio Devan is Active!",
        database_status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        endpoints: {
            github: "/api/github",
            repos: "/api/github/repos"
        }
    });
});

app.get('/api/github', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${GITHUB_USER}`);
        res.json({
            username: response.data.login,
            avatar: response.data.avatar_url,
            bio: response.data.bio,
            public_repos: response.data.public_repos,
            profile_url: response.data.html_url
        });
    } catch (error) {
        res.status(500).json({ error: "Gagal ambil GitHub" });
    }
});

app.get('/api/github/repos', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=5`);
        const projects = response.data.map(repo => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            url: repo.html_url
        }));
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: "Gagal ambil Repo" });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;