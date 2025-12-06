const { Position } = require("../models");

exports.getAll = async (req, res) => {
  const rows = await Position.findAll();
  res.json(rows);
};

exports.create = async (req, res) => {
  const row = await Position.create(req.body);
  res.status(201).json(row);
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await Position.findByPk(id);

    if (!position) {
      return res.status(404).json({ error: "Position not found" });
    }

    await position.destroy();
    res.json({ message: "Position deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
