import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

/** Has `userId` shown interest in `event` (any applicant status)? */
function hasShownInterest(event, userId) {
  return (event.applicants || []).some((a) => String(a.user) === String(userId));
}

/**
 * Get all campus students for directory and starting new chats.
 * GET /api/chat/users?search=...
 */
export async function getCampusStudents(req, res) {
  try {
    const search = (req.query.search || '').trim();
    const query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .select('name email branch semester avatar campusScore isVerified role')
      .sort({ name: 1 })
      .limit(60);

    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch campus students' });
  }
}

/** Helper to seed realistic demo conversations if user has none */
async function seedConversationsForUser(userId) {
  try {
    const me = await User.findById(userId);
    if (!me) return;

    const students = await User.find({ _id: { $ne: userId } }).limit(10);
    if (!students || students.length === 0) return;

    const aarav = students.find((s) => s.name?.toLowerCase().includes('aarav')) || students[0];
    const ananya = students.find((s) => s.name?.toLowerCase().includes('ananya')) || students[1];
    const rohan = students.find((s) => s.name?.toLowerCase().includes('rohan')) || students[2];
    const priya = students.find((s) => s.name?.toLowerCase().includes('priya')) || students[3];

    // 1. Accepted chat with Aarav
    if (aarav) {
      const existing = await Conversation.findOne({
        participants: { $all: [userId, aarav._id], $size: 2 },
      });
      if (!existing) {
        const convo = await Conversation.create({
          participants: [userId, aarav._id],
          status: 'accepted',
          lastMessage: "Sounds great, thanks Aarav! Let's connect near the Central Library this Thursday.",
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
        });
        await Message.create([
          {
            conversation: convo._id,
            sender: aarav._id,
            text: `Hey ${me.name || 'there'}! Saw your profile on Campus Bond. Are you participating in the upcoming Smart Campus Hackathon?`,
            createdAt: new Date(Date.now() - 1000 * 60 * 120),
          },
          {
            conversation: convo._id,
            sender: me._id,
            text: `Hey Aarav! Yes, definitely! I'm building a project around student collaboration and real-time campus networking.`,
            createdAt: new Date(Date.now() - 1000 * 60 * 90),
          },
          {
            conversation: convo._id,
            sender: aarav._id,
            text: `That's awesome! Let me know if you need any help with backend integration or system design. Looking forward to collaborating!`,
            createdAt: new Date(Date.now() - 1000 * 60 * 60),
          },
          {
            conversation: convo._id,
            sender: me._id,
            text: `Sounds great, thanks Aarav! Let's connect near the Central Library this Thursday.`,
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
          },
        ]);
      }
    }

    // 2. Accepted chat with Ananya
    if (ananya && String(ananya._id) !== String(aarav?._id)) {
      const existing = await Conversation.findOne({
        participants: { $all: [userId, ananya._id], $size: 2 },
      });
      if (!existing) {
        const convo = await Conversation.create({
          participants: [userId, ananya._id],
          status: 'accepted',
          lastMessage: 'Thanks a lot! Really appreciate your help 🙏',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        });
        await Message.create([
          {
            conversation: convo._id,
            sender: ananya._id,
            text: `Hi ${me.name || 'friend'}, did you get the AI & Data Science lab assignment notes from yesterday?`,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
          },
          {
            conversation: convo._id,
            sender: me._id,
            text: `Hey Ananya! Yes, I have the Jupyter notebooks and code examples saved. I'll share them with you.`,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
          },
          {
            conversation: convo._id,
            sender: ananya._id,
            text: `Thanks a lot! Really appreciate your help 🙏`,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
          },
        ]);
      }
    }

    // 3. Incoming Pending Request from Rohan
    if (rohan && String(rohan._id) !== String(aarav?._id) && String(rohan._id) !== String(ananya?._id)) {
      const existing = await Conversation.findOne({
        participants: { $all: [userId, rohan._id], $size: 2 },
      });
      if (!existing) {
        await Conversation.create({
          participants: [userId, rohan._id],
          status: 'pending',
          requestedBy: rohan._id,
          requestMessage: `Hey ${me.name || 'friend'}! We are building an automated IoT rover for the upcoming TechFest. Wanted to check if you would be interested in collaborating on the web control dashboard?`,
          lastMessage: `Chat request from Rohan: "Interested in collaborating on IoT rover dashboard?"`,
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 15),
        });
      }
    }

    // 4. Outgoing Pending Request to Priya
    if (priya && String(priya._id) !== String(aarav?._id) && String(priya._id) !== String(ananya?._id) && String(priya._id) !== String(rohan?._id)) {
      const existing = await Conversation.findOne({
        participants: { $all: [userId, priya._id], $size: 2 },
      });
      if (!existing) {
        await Conversation.create({
          participants: [userId, priya._id],
          status: 'pending',
          requestedBy: me._id,
          requestMessage: `Hi Priya! I saw your post regarding the Embedded Systems workshop. Would love to join your study group.`,
          lastMessage: `Hi Priya! I saw your post regarding the Embedded Systems workshop.`,
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        });
      }
    }
  } catch (err) {
    console.error('Error auto-seeding user conversations:', err);
  }
}

/**
 * Open (or request) a conversation.
 * Sends a chat request if one doesn't already exist.
 * POST /api/chat/open   body: { eventId, userId, participantId, message }
 */
export async function openConversation(req, res) {
  const targetUserId = req.body.userId || req.body.participantId;
  const { eventId, message } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ message: 'A target user is required to start a chat.' });
  }

  const me = String(req.user._id);
  const other = String(targetUserId);

  if (me === other) {
    return res.status(400).json({ message: 'You cannot start a chat with yourself.' });
  }

  let event = null;
  if (eventId) {
    event = await Event.findById(eventId);
  }

  // Look for existing conversation between userA and userB
  let convo = await Conversation.findOne({
    participants: { $all: [me, other], $size: 2 },
    ...(eventId ? { event: eventId } : {}),
  });

  if (!convo) {
    // If not found with event, check without event filter to avoid duplicate 1-on-1 threads
    convo = await Conversation.findOne({
      participants: { $all: [me, other], $size: 2 },
    });
  }

  if (!convo) {
    // Create new conversation in pending status (Request Sent)
    convo = await Conversation.create({
      participants: [me, other],
      event: eventId || undefined,
      status: 'pending',
      requestedBy: req.user._id,
      requestMessage: (message || '').trim() || `Hi! I would like to connect on Campus Bond.`,
      lastMessage: (message || '').trim() || 'Chat request sent',
      lastMessageAt: new Date(),
    });
  } else if (convo.status === 'declined') {
    // If previously declined, re-open as pending request
    convo.status = 'pending';
    convo.requestedBy = req.user._id;
    if (message) {
      convo.requestMessage = message.trim();
      convo.lastMessage = message.trim();
      convo.lastMessageAt = new Date();
    }
    await convo.save();
  }

  await convo.populate('participants', 'name branch semester avatar');
  if (convo.event) {
    await convo.populate('event', 'title');
  }

  res.status(200).json({ conversation: convo });
}

/**
 * Respond to a pending chat request (Accept or Decline).
 * PATCH /api/chat/conversations/:id/respond   body: { action: 'accept' | 'decline' }
 */
export async function respondToChatRequest(req, res) {
  const { action } = req.body;
  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ message: "Action must be 'accept' or 'decline'." });
  }

  const { convo, error } = await loadMyConversation(req.params.id, req.user._id);
  if (error === 404) return res.status(404).json({ message: 'Conversation not found.' });
  if (error === 403) return res.status(403).json({ message: 'Not your conversation.' });

  if (action === 'accept') {
    convo.status = 'accepted';
  } else {
    convo.status = 'declined';
  }
  await convo.save();

  await convo.populate('participants', 'name branch semester avatar');
  if (convo.event) {
    await convo.populate('event', 'title');
  }

  res.status(200).json({ conversation: convo });
}

/**
 * My conversations, most recent first.
 * GET /api/chat/conversations
 */
export async function getConversations(req, res) {
  let convos = await Conversation.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name branch semester avatar')
    .populate('event', 'title');

  if (!convos || convos.length === 0) {
    await seedConversationsForUser(req.user._id);
    convos = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name branch semester avatar')
      .populate('event', 'title');
  }

  res.status(200).json({ conversations: convos });
}

/** Ensure the current user belongs to the conversation. */
async function loadMyConversation(convoId, userId) {
  const convo = await Conversation.findById(convoId);
  if (!convo) return { error: 404 };
  if (!convo.participants.some((p) => String(p) === String(userId))) return { error: 403 };
  return { convo };
}

/**
 * Messages in a conversation (oldest first).
 * GET /api/chat/conversations/:id/messages
 */
export async function getMessages(req, res) {
  const { convo, error } = await loadMyConversation(req.params.id, req.user._id);
  if (error === 404) return res.status(404).json({ message: 'Conversation not found.' });
  if (error === 403) return res.status(403).json({ message: 'Not your conversation.' });

  const messages = await Message.find({ conversation: convo._id })
    .sort({ createdAt: 1 })
    .populate('sender', 'name');
  res.status(200).json({ messages });
}

/**
 * Send a message.
 * POST /api/chat/conversations/:id/messages   body: { text }
 */
export async function sendMessage(req, res) {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Message cannot be empty.' });

  const { convo, error } = await loadMyConversation(req.params.id, req.user._id);
  if (error === 404) return res.status(404).json({ message: 'Conversation not found.' });
  if (error === 403) return res.status(403).json({ message: 'Not your conversation.' });

  if (convo.status === 'pending') {
    return res.status(400).json({ message: 'Chat request has not been accepted yet.' });
  }

  const message = await Message.create({ conversation: convo._id, sender: req.user._id, text });
  convo.lastMessage = text;
  convo.lastMessageAt = new Date();
  await convo.save();

  await message.populate('sender', 'name');
  res.status(201).json({ message });
}
