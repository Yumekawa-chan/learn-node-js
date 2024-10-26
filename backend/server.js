const express = require('express');
const app = express();
const PORT = 5000;
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(express.json());

// 新規ユーザー登録
app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body;

    // ここでpasswordをどっかに飛ばすと使い回している人のパスワードを盗めそう

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        }
    });
    return res.json({ user });
});

// ログイン
app.post("/api/auth/login", async (req, res) => { 
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.status(401).json({ error: "メアドが間違っているよー" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(401).json({ error: "パスワードが間違っているよー" });
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
    });
    return res.json({ token });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

