const { Employee, Department, Position } = require("../models");
const fs = require('fs');
const path = require('path')

exports.getAll = async (req, res) => {
  try {
    const rows = await Employee.findAll({
      include: [
        { model: Department, attributes: ["id", "name"] },
        { model: Position, attributes: ["id", "name"] }
      ]
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, phone, departmentId, positionId } = req.body;

    const employee = await Employee.create({
      name,
      email,
      phone,
      departmentId,
      positionId,
      photo: req.file?.filename || null
    });

    res.status(201).json(employee);

  } catch (err) {
    console.log("❌ ERROR CREATE EMPLOYEE:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id, {
      include: [
        { model: Department, attributes: ["id", "name"] },
        { model: Position, attributes: ["id", "name"] }
      ]
    });

    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    // (Opsional) Hapus file foto jika ada
    if (employee.photo) {
        const filePath = path.join(__dirname, '../uploads', employee.photo);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await employee.destroy();
    res.json({ msg: "Employee deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
