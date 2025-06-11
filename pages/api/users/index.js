import dbConnect from '../../../utils/db';
import User from '../../../models/User';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const decoded = await verifyToken(token);

    // Fetch all users except the current user
    const users = await User.find({ _id: { $ne: decoded.userId } }).select('_id name email');
    // Format users for frontend
    const formatted = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 