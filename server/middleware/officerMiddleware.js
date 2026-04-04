import jwt from 'jsonwebtoken';

const protectOfficer = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'officer') {
      return res.status(403).json({ message: 'Not authorized as officer' });
    }
    req.user = decoded; // contains { id, role, department }
    next();
  } catch (error) {
    console.error('Officer auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default protectOfficer;