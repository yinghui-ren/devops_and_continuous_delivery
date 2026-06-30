function home(req, res) {
  res.send('Hello from AAP DevOps POC');
}

function health(req, res) {
  res.status(200).json({ status: 'OK' });
}

module.exports = {
  home,
  health,
};
