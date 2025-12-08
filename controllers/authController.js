const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Kunci rahasia (sebaiknya taruh di .env)
const JWT_SECRET = "rahasia_negara_api_erp_2025"; 

// 1. REGISTER (Hanya untuk bikin user pertama kali)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Enkripsi password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashPassword,
            role
        });
        res.json({ msg: "Register Berhasil", user });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// 2. LOGIN
exports.login = async (req, res) => {
    try {
        // Cari user berdasarkan email
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) return res.status(404).json({ msg: "Email tidak ditemukan" });

        // Cek Password
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) return res.status(400).json({ msg: "Password Salah" });

        // Buat Token
        const userId = user.id;
        const name = user.name;
        const email = user.email;
        const role = user.role;

        const accessToken = jwt.sign({ userId, name, email, role }, JWT_SECRET, {
            expiresIn: '1d' // Token berlaku 1 hari
        });

        res.json({ accessToken, user: { name, email, role } });

    } catch (error) {
        res.status(404).json({ msg: "Email tidak ditemukan" });
    }
}