const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt); // Password untuk semua akun

    return queryInterface.bulkInsert('Users', [
      {
        name: 'Super Admin',
        email: 'admin@erp.com',
        password: passwordHash,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Staff Inventory',
        email: 'staff@erp.com',
        password: passwordHash,
        role: 'staff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Manager Finance',
        email: 'manager@erp.com',
        password: passwordHash,
        role: 'manager',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};