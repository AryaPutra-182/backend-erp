const Material = require('../models/Material');

exports.createMaterial = async (req, res) => {
  try {
    const {
      name,
      type,
      cost,
      category,
      internalReference,
      weight
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const material = await Material.create({
      name,
      type,
      cost,
      category,
      internalReference,
      weight,
      image: req.file ? req.file.filename : null
    });

    res.status(201).json({ msg: 'Material created', data: material });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.findAll();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    const image = req.file ? req.file.filename : material.image;

    await material.update({
      ...req.body,
      image
    });

    res.json({ msg: 'Material updated', data: material });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    await material.destroy();
    res.json({ message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
