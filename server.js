const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

// Import Routes
const customerRoutes = require('./routes/customerRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const salesRoutes = require('./routes/salesRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const manufacturingRoutes = require('./routes/manufacturingRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const materialRoutes = require('./routes/materialRoutes');
const manufacturingMaterialsRoutes = require('./routes/manufacturingMaterialsRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const purchaseRoutes = require("./routes/purchaseRoutes")



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder untuk akses gambar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'uploads')));

// Gunakan Routes
app.use('/api/customers', customerRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/manufacturing-materials', manufacturingMaterialsRoutes);
app.use('/api/vendor',vendorRoutes);
app.use("/api/purchase", purchaseRoutes);


// Sync DB & Start
const PORT = process.env.PORT || 5000;
db.sequelize.sync({ force: false, alter: true }).then(() => {
    console.log('✅ Database Synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});