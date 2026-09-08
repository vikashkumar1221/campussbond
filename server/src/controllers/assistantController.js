import Event from '../models/Event.js';
import MarketItem from '../models/MarketItem.js';
import LostItem from '../models/LostItem.js';
import Club from '../models/Club.js';

/**
 * Clean & tokenize input for intent detection
 */
const normalize = (text = '') => text.toLowerCase().trim();

const hasAnyWord = (text, words) => {
  return words.some((word) => {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(text);
  });
};

/**
 * Handle incoming student query in English with direct normal process
 */
export const handleAssistantQuery = async (req, res) => {
  try {
    const { query, userName } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ message: 'Query text is required' });
    }

    const rawName = userName && userName !== 'Student' 
      ? userName 
      : (req.user?.name ? req.user.name.split(' ')[0] : 'Vikash');
    const studentName = rawName.trim();
    const q = normalize(query);

    // 1. Academic Policies: Attendance (75%), CGPA, Exams, Detain
    if (
      hasAnyWord(q, [
        'attendance',
        'attendence',
        '75',
        '75%',
        'detain',
        'detention',
        'exam',
        'exams',
        'cgpa',
        'sgpa',
        'gpa',
        'internal',
        'internals',
        'marks',
        'syllabus',
        'datesheet',
        'date sheet',
        'hall ticket',
        'admit card',
        'backlog',
        'reappear',
      ])
    ) {
      return res.json({
        answer:
          `Hey ${studentName}, here is the attendance and exam process:\n\n` +
          `1. **75% Attendance:** Mandatory 75% aggregate attendance is required in each theory and lab subject.\n` +
          `2. **Medical Certificate:** If you were unwell, submit a medical certificate to your HOD office within **7 days** of rejoining.\n` +
          `3. **CGPA Target:** Maintain an **8.0+** CGPA to stay eligible for top placement drives.\n` +
          `4. **Datesheets & Hall Tickets:** Published on the college ERP portal 2-3 weeks before exams.`,
        actions: [
          { label: '📖 Study Notes', url: '/market?category=notes' },
          { label: '📚 Books in Market', url: '/market?category=books' },
        ],
      });
    }

    // 2. Hackathons / Collaborations / Events queries
    if (
      hasAnyWord(q, [
        'hackathon',
        'hackathons',
        'team',
        'teammate',
        'teammates',
        'project',
        'projects',
        'competition',
        'competitions',
        'event',
        'events',
        'collaboration',
        'partner',
        'partners',
        'sih',
      ]) ||
      q.includes('team kaise') ||
      q.includes('teammate chahiye')
    ) {
      const recentEvents = await Event.find({ status: 'open' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title category skillsNeeded');

      let liveInfo = '';
      if (recentEvents && recentEvents.length > 0) {
        liveInfo = `\n\n📌 **Live Openings on Campus:**\n` +
          recentEvents
            .map(
              (e) =>
                `• **${e.title}** (${e.category.toUpperCase()}) - Skills: ${
                  e.skillsNeeded?.length ? e.skillsNeeded.join(', ') : 'All'
                }`
            )
            .join('\n');
      }

      return res.json({
        answer:
          `Hey ${studentName}, here is the step-by-step process to find or create a hackathon team:\n\n` +
          `1. Click the **Create Post** button in the sidebar or feed.\n` +
          `2. Select **Hackathon** or **Project** as the category.\n` +
          `3. List required skills (e.g. React, Python, UI/UX) and team size.\n` +
          `4. When peers apply, review and accept them with one tap!` +
          liveInfo,
        actions: [
          { label: '🚀 Hackathons Feed', url: '/?category=hackathon' },
          { label: '➕ Create Team Post', url: '/', triggerCreate: true },
        ],
      });
    }

    // 3. Marketplace / Buy / Sell / Books queries
    if (
      hasAnyWord(q, [
        'market',
        'marketplace',
        'sell',
        'buying',
        'buy',
        'book',
        'books',
        'note',
        'notes',
        'kit',
        'kits',
        'laptop',
        'cycle',
        'bicycle',
        'drafter',
        'calculator',
        'store',
      ]) ||
      q.includes('kharidna') ||
      q.includes('bechna') ||
      q.includes('beche')
    ) {
      const words = q.split(' ').filter((w) => w.length > 2);
      const searchRegex = words.length > 0 ? new RegExp(words.join('|'), 'i') : /./;

      const recentItems = await MarketItem.find({
        status: 'available',
        $or: [{ title: searchRegex }, { category: searchRegex }, { description: searchRegex }],
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title price category condition');

      let liveItemsText = '';
      if (recentItems && recentItems.length > 0) {
        liveItemsText =
          `\n\n🛍️ **Available on Market:**\n` +
          recentItems
            .map((item) => `• **${item.title}** - ₹${item.price} (${item.condition})`)
            .join('\n');
      }

      return res.json({
        answer:
          `Hey ${studentName}, here is the process to buy and sell on Campus Market:\n\n` +
          `1. **To Sell:** Open the **Market** page -> Click **Sell an Item** -> Add photo, condition, and price.\n` +
          `2. **To Buy:** Browse listings -> Click **Chat with Seller** to coordinate and pick it up on campus.` +
          liveItemsText,
        actions: [
          { label: '🛍️ Open Market', url: '/market' },
          { label: '📚 Books Section', url: '/market?category=books' },
        ],
      });
    }

    // 4. Lost & Found queries
    if (
      hasAnyWord(q, [
        'lost',
        'found',
        'wallet',
        'purse',
        'key',
        'keys',
        'bottle',
        'bag',
        'backpack',
        'earbuds',
        'airpods',
        'umbrella',
        'watch',
        'spectacles',
        'glasses',
        'calculator',
      ]) ||
      q.includes('id card') ||
      q.includes('kho gaya') ||
      q.includes('kho gya') ||
      q.includes('gum ho gaya') ||
      q.includes('mil gaya') ||
      q.includes('chabi')
    ) {
      const recentLost = await LostItem.find({ status: 'open' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title type location');

      let liveLostText = '';
      if (recentLost && recentLost.length > 0) {
        liveLostText =
          `\n\n🔍 **Recent Reports on Campus:**\n` +
          recentLost
            .map((item) => `• [${item.type.toUpperCase()}] **${item.title}** (${item.location})`)
            .join('\n');
      }

      return res.json({
        answer:
          `Hey ${studentName}, here is the process for Lost & Found items:\n\n` +
          `1. **Lost an item:** Check the **Lost & Found** page or click **Report an Item** with the last seen location.\n` +
          `2. **Found an item:** Post a photo and mention where you handed it in (Security Guard Room / Central Library Desk).` +
          liveLostText,
        actions: [
          { label: '🔍 Browse Lost & Found', url: '/lostfound' },
        ],
      });
    }

    // 5. Clubs & Student Societies queries
    if (
      hasAnyWord(q, [
        'club',
        'clubs',
        'society',
        'societies',
        'cultural',
        'robotics',
        'dance',
        'music',
        'drama',
        'sports',
        'ngo',
        'gdsc',
        'acm',
        'rotaract',
        'ecell',
        'e-cell',
        'audition',
        'auditions',
      ]) ||
      q.includes('coding club') ||
      q.includes('club join') ||
      q.includes('join club')
    ) {
      const activeClubs = await Club.find({})
        .sort({ memberCount: -1 })
        .limit(4)
        .select('name category memberCount');

      let liveClubsText = '';
      if (activeClubs && activeClubs.length > 0) {
        liveClubsText =
          `\n\n🏛️ **Active Clubs:**\n` +
          activeClubs
            .map((c) => `• **${c.name}** (${c.category}) - ${c.memberCount || 0} members`)
            .join('\n');
      }

      return res.json({
        answer:
          `Hey ${studentName}, here is the process to join or start a club:\n\n` +
          `1. Open the **Clubs** page and click on any club card to view its details, activities, and lead.\n` +
          `2. Click **Join Club** to receive updates regarding auditions, meetups, and workshops.\n` +
          `3. To register a new society, click **Register Club** at the top right.` +
          liveClubsText,
        actions: [
          { label: '🏛️ Explore Clubs', url: '/clubs' },
          { label: '💻 Tech Clubs', url: '/clubs?category=tech' },
        ],
      });
    }

    // 6. Campus Facilities: Library, Wi-Fi, Canteen, Medical, Gate Timings
    if (
      hasAnyWord(q, [
        'library',
        'wifi',
        'wi-fi',
        'internet',
        'lan',
        'canteen',
        'cafeteria',
        'mess',
        'hostel',
        'warden',
        'gate',
        'timing',
        'timings',
        'doctor',
        'dispensary',
        'medical',
        'ambulance',
        'security',
        'curfew',
      ]) ||
      q.includes('book issue') ||
      q.includes('reading room') ||
      q.includes('gate pass')
    ) {
      return res.json({
        answer:
          `Hey ${studentName}, here is the process and timing for campus facilities:\n\n` +
          `1. **Central Library:** Open Mon-Sat 8:00 AM – 9:00 PM (extended till 11:00 PM during exam periods). Issue up to 3 books for 14 days with your student ID.\n` +
          `2. **Campus Wi-Fi:** Connect to *Campus-Student* network using your Student Roll Number and portal password.\n` +
          `3. **Hostel In-Time:** Main campus gates close at 10:00 PM. Digital out-pass via warden approval is required for late entry.\n` +
          `4. **Health Center:** Open 24/7 for emergency first-aid and medical consultations.`,
        actions: [
          { label: '🛍️ Check Notes on Market', url: '/market?category=notes' },
        ],
      });
    }

    // 7. Career, Tech, DSA & Placement Preparation
    if (
      hasAnyWord(q, [
        'dsa',
        'placement',
        'placements',
        'internship',
        'internships',
        'leetcode',
        'codeforces',
        'resume',
        'interview',
        'interviews',
        'roadmap',
        'mern',
        'react',
        'backend',
        'frontend',
        'fullstack',
      ])
    ) {
      return res.json({
        answer:
          `Hey ${studentName}, here is the placement and DSA roadmap:\n\n` +
          `1. **DSA Practice:** Solve 150-200 core problems (Arrays, Strings, Trees, Graphs, DP) on LeetCode or Striver's A2Z sheet.\n` +
          `2. **Projects:** Build and deploy 1-2 solid Full Stack projects (MERN or Next.js) with live URLs.\n` +
          `3. **Hackathons:** Participate in 2-3 hackathons on Campus Bond to build real teamwork experience for your resume.\n` +
          `4. **Resume:** Keep it clean, 1-page with active GitHub and live deployment links.`,
        actions: [
          { label: '🚀 Find Hackathon Teammates', url: '/?category=hackathon' },
          { label: '🏛️ Join Tech Clubs', url: '/clubs?category=tech' },
        ],
      });
    }

    // 8. Greetings & General Help
    if (
      hasAnyWord(q, ['hi', 'hello', 'hey', 'namaste', 'hola', 'sup', 'help']) ||
      q.includes('kaise ho') ||
      q.includes('who are you') ||
      q.includes('kya kar sakte ho')
    ) {
      return res.json({
        answer:
          `Hey ${studentName}, I am your Campus Assistant!\n\n` +
          `Ask me anything about these direct processes:\n` +
          `1. **Hackathons:** How to create or join a team.\n` +
          `2. **Marketplace:** How to buy or sell second-hand books and notes.\n` +
          `3. **Lost & Found:** How to report lost belongings or check found items.\n` +
          `4. **Clubs:** How to join societies or contact club leads.\n` +
          `5. **Academics:** 75% attendance rule, Wi-Fi credentials, and library timings.`,
        actions: [
          { label: '🚀 Find Hackathon Teams', url: '/?category=hackathon' },
          { label: '🛍️ Open Market', url: '/market' },
          { label: '🔍 Lost & Found', url: '/lostfound' },
          { label: '🏛️ Explore Clubs', url: '/clubs' },
        ],
      });
    }

    // 9. Conversational Smart Fallback for any other college query
    return res.json({
      answer:
        `Hey ${studentName}, here is the quickest way to resolve "${query.trim()}":\n\n` +
        `1. For campus peer advice, create a post on the **Campus Feed**.\n` +
        `2. For study material or lab equipment, browse the **Marketplace**.\n` +
        `3. You can also ask me specific questions like: *"How to find hackathon team?"*, *"How to sell book in market?"*, or *"75% attendance rule"*.`,
      actions: [
        { label: '🏠 Campus Feed', url: '/' },
        { label: '🛍️ Market', url: '/market' },
        { label: '🏛️ Clubs', url: '/clubs' },
      ],
    });
  } catch (error) {
    console.error('Error in assistantController:', error);
    return res.status(500).json({
      message: 'Failed to process assistant query',
      error: error.message,
    });
  }
};
