const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

// --- 1. IMPORT ROUTES (Konsisten di atas) ---
const customerRoutes = require('./routes/customerRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const salesRoutes = require('./routes/salesRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const manufacturingRoutes = require('./routes/manufacturingRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); // Import Invoice
const materialRoutes = require('./routes/materialRoutes');
const manufacturingMaterialsRoutes = require('./routes/manufacturingMaterialsRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const purchaseRoutes = require("./routes/purchaseRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const positionRoutes = require("./routes/positionRoutes");


const app = express();

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. REGISTER ROUTES (Gunakan variabel import) ---
app.use('/api/customers', customerRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/manufacturing-materials', manufacturingMaterialsRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/purchasing', purchaseRoutes);
// 👇 PERHATIKAN INI (Pastikan path sesuai Frontend)
app.use("/api/delivery-orders", deliveryRoutes); 
app.use("/api/invoices", invoiceRoutes); 


// --- 4. START SERVER ---
const PORT = process.env.PORT || 5000;
const QuotationTemplate = require("./models/QuotationTemplate");

// WRAPPER ASYNC AGAR BISA PAKAI AWAIT
const startServer = async () => {
    try {
        // 1. MATIKAN FOREIGN KEY CHECK (Solusi Ampuh)
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log("⚠️ Foreign Key Checks Disabled");

        // 2. RESET DATABASE (Hapus & Buat Ulang)
        // force: true = Hapus semua data & tabel
        await db.sequelize.sync();
        console.log('✅ Database Synced & Reset');

        // 3. NYALAKAN LAGI FOREIGN KEY CHECK
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("🔒 Foreign Key Checks Enabled");

        // 4. AUTO SEED TEMPLATE (Logic kamu tadi)
        const count = await QuotationTemplate.count();
        if (count === 0) {
            await QuotationTemplate.create({
                templateName: "Default Template",
                expiresAfterDays: 30,
                defaultCompanyName: "Your Company Name",
                notes: "Default quotation terms and conditions apply."
            });
            console.log("📌 Default quotation template created.");
        }

        // 5. JALANKAN SERVER
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    } catch (error) {
        console.error("❌ Gagal start server:", error);
    }
};

// Panggil fungsinya
startServer();