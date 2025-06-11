import dbConnect from '../../../utils/db';
import Conversation from '../../../models/Conversation';
import User from '../../../models/User';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const decoded = await verifyToken(token);
      const userId = decoded.userId;

      // Find or create the group chat (all users)
      let groupConversation = await Conversation.findOne({ type: 'group' });
      if (!groupConversation) {
        const allUsers = await User.find({}, '_id');
        groupConversation = await Conversation.create({
          type: 'group',
          members: allUsers.map(u => u._id),
        });
      }

      // Find all private conversations for the user
      const privateConversations = await Conversation.find({
        type: 'private',
        members: userId,
      })
        .populate('members', 'name email')
        .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

      // Populate group conversation
      await groupConversation.populate('members', 'name email');

      // Combine and sort (group always on top)
      const conversations = [groupConversation, ...privateConversations];

      res.status(200).json(conversations);
    } catch (error) {
      console.error('Fetch conversations error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      await dbConnect();
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const decoded = await verifyToken(token);
      const userId = decoded.userId;
      const { userId: otherUserId } = req.body;
      if (!otherUserId) {
        return res.status(400).json({ message: 'userId is required' });
      }
      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        type: 'private',
        members: { $all: [userId, otherUserId], $size: 2 },
      }).populate('members', 'name email');
      if (!conversation) {
        conversation = await Conversation.create({
          type: 'private',
          members: [userId, otherUserId],
        });
        await conversation.populate('members', 'name email');
      }
      return res.status(201).json(conversation);
    } catch (error) {
      console.error('Create private conversation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 