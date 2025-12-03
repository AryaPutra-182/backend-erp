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
    const { name, managerId, parentId, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Department name is required" });
    }

    const row = await Department.create({
      name,
      description: description || null,
      managerId: managerId || null,
      parentId: parentId || null,
    });

    res.status(201).json({ message: "Department created", data: row });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
