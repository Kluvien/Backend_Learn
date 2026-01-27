const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_USER = process.env.GITHUB_USERNAME || 'Kluvien';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    Message: "Server Kluvien is Active!",
    owner: GITHUB_USER,
    endpoints: {
        github: "/api/github",
        repos: "/api/github/repos"
    }
    });
});

app.get('/api/github', async (req, res) => {
    try {
        // Server kita "nelfon" ke GitHub
        const response = await axios.get(`https://api.github.com/users/${GITHUB_USER}`);
        
        // Kita kirim balik datanya ke browser
        res.json({
            username: response.data.login,
            avatar: response.data.avatar_url,
            bio: response.data.bio,
            public_repos: response.data.public_repos,
            followers: response.data.followers,
            profile_url: response.data.html_url
        });
    } catch (error) {
        res.status(500).json({ error: "Gagal mengambil data GitHub", detail: error.message });
    }
});

app.get('/api/github/repos', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=5`);
        
        const projects = response.data.map(repo => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            url: repo.html_url,
            last_update: repo.updated_at
        }));

        res.json({
            total_count: projects.length,
            projects: projects
        });
    } catch (error) {
        res.status(500).json({ error: "Gagal mengambil repo", detail: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`👤 Target GitHub: ${GITHUB_USER}`);
});