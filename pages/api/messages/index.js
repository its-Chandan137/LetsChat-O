import dbConnect from '../../../utils/db';
import Message from '../../../models/Message';
import Conversation from '../../../models/Conversation';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  // Verify authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = await verifyToken(token);
    req.user = decoded;

    switch (req.method) {
      case 'GET': {
        const { conversationId } = req.query;
        if (!conversationId) {
          return res.status(400).json({ message: 'conversationId is required' });
        }
        const messages = await Message.find({ conversationId })
          .populate('sender', 'name email')
          .sort({ createdAt: 1 });
        return res.status(200).json(messages);
      }
      case 'POST': {
        const { conversationId, content } = req.body;
        if (!conversationId || !content) {
          return res.status(400).json({ message: 'conversationId and content are required' });
        }
        const message = await Message.create({
          conversationId,
          content,
          sender: req.user.userId,
        });
        // Update lastMessage in conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: content,
            sender: req.user.userId,
            timestamp: new Date(),
          },
        });
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email');
        return res.status(201).json(populatedMessage);
      }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Messages API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 