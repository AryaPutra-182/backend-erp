const { Employee, Department, Position } = require("../models");

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

