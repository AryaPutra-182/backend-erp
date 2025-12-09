const bcrypt = require('bcryptjs');
const db = require('./models');
const User = db.User;

async function seed() {
    try {
        console.log("⏳ Menjalankan seeder...");

        await db.sequelize.sync();

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await User.create({
            name: "Administrator",
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log("✅ User admin berhasil dibuat!");
        process.exit();
    } catch (error) {
        console.error("❌ Seeder gagal:", error);
        process.exit(1);
    }
}

seed();
