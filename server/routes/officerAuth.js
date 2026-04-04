// POST /api/auth/officer/login
router.post('/officer/login', async (req, res) => {
    const { email, password } = req.body;
    const officer = await Officer.findOne({ email });
    if (!officer) return res.status(401).json({ message: 'Invalid credentials' });
    const isValid = await bcrypt.compare(password, officer.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: officer._id, role: 'officer', department: officer.department }, process.env.JWT_SECRET);
    res.json({ token, officer: { id: officer._id, name: officer.name, department: officer.department } });
  });