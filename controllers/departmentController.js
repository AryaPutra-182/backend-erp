const { Department, Employee } = require("../models");

// GET ALL WITH RELATION
exports.getAll = async (req, res) => {
  try {
    const rows = await Department.findAll({
      include: [
        { model: Employee, as: "manager", attributes: ["id", "name"] },
        { model: Department, as: "parent", attributes: ["id", "name"] }
      ]
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE DEPARTMENT
exports.create = async (req, res) => {
  try {
    // Ambil data dari body
    let { name, managerId, parentId, description } = req.body;

    // 1. Validasi Nama Wajib
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Department name is required" });
    }

    // 2. Sanitasi Data (PENTING!)
    // Ubah string kosong "" atau "0" menjadi null agar tidak error Foreign Key
    if (managerId === "" || managerId === "0" || managerId === 0) managerId = null;
    if (parentId === "" || parentId === "0" || parentId === 0) parentId = null;

    // 3. Simpan ke Database
    const row = await Department.create({
      name,
      description: description || null,
      managerId, // Sekarang aman (null atau ID valid)
      parentId,  // Sekarang aman (null atau ID valid)
    });

    res.status(201).json({ message: "Department created", data: row });

  } catch (err) {
    // Log error lengkap ke Terminal agar mudah dibaca
    console.error("❌ ERROR CREATE DEPT:", err); 
    
    res.status(500).json({ error: err.message });
  }
};
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id, {
      include: [
        { model: Employee, as: "manager", attributes: ["id", "name"] },
        { model: Department, as: "parent", attributes: ["id", "name"] }
      ]
    });

    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. UPDATE (Untuk menyimpan Edit)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, managerId, parentId, description } = req.body;

    const department = await Department.findByPk(id);
    if (!department) return res.status(404).json({ error: "Department not found" });

    // Validasi sederhana: Tidak boleh menjadi parent bagi dirinya sendiri
    if (parentId && parseInt(parentId) === parseInt(id)) {
        return res.status(400).json({ error: "Department cannot be its own parent" });
    }

    await department.update({
      name,
      description,
      managerId: managerId || null,
      parentId: parentId || null
    });

    res.json({ message: "Department updated", data: department });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. DELETE (Untuk Hapus)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findByPk(id);
    if (!department) return res.status(404).json({ error: "Department not found" });

    // (Opsional) Cek apakah ada karyawan di dalam departemen ini sebelum hapus
    // const empCount = await Employee.count({ where: { departmentId: id } });
    // if (empCount > 0) return res.status(400).json({ error: "Cannot delete department containing employees" });

    await department.destroy();
    res.json({ message: "Department deleted successfully" });

  } catch (err) {
    // Handle error foreign key (misal masih ada child department)
    if(err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: "Cannot delete department because it has sub-departments or employees linked to it." });
    }
    res.status(500).json({ error: err.message });
  }
};
