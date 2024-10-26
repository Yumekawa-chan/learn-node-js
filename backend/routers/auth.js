const router = require("express").Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

// 新規ユーザー登録
router.post("/register", async (req, res) => {
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
router.post("/login", async (req, res) => { 
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

module.exports = router;