const { Position } = require("../models");

exports.getAll = async (req, res) => {
  const rows = await Position.findAll();
  res.json(rows);
};

exports.create = async (req, res) => {
  const row = await Position.create(req.body);
  res.status(201).json(row);
};
