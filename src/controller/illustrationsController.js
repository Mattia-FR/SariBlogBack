const illustrationsModel = require("../model/illustrationsModel");

const getGalleryPreview = async (req, res) => {
  try {
    const limit = req.query.limit
      ? Number.parseInt(req.query.limit)
      : undefined;

    const illustrations = await illustrationsModel.findGalleryPreview(limit);

    res.json(illustrations);
  } catch (error) {
    console.error("Erreur getGalleryPreview:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des illustrations",
    });
  }
};

module.exports = {
  getGalleryPreview,
};