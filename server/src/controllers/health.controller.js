export const health = (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'eventx-ultra-api',
    timestamp: new Date().toISOString()
  });
};
