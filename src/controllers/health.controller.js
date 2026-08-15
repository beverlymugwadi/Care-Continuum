exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Care Continuum',
    timestamp: new Date().toISOString(),
  });
};
