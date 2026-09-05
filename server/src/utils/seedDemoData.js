import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Event from '../models/Event.js';
import MarketItem from '../models/MarketItem.js';
import LostItem from '../models/LostItem.js';
import Club from '../models/Club.js';

export async function seedDemoDataIfEmpty() {
  try {
    await User.updateMany({ email: 'test@campusbond.edu' }, { $set: { name: 'Vikash' } });

    const eventCount = await Event.countDocuments();
    if (eventCount > 0) {
      // Database already has data
      return;
    }

    console.log('🌱 Seeding sample campus data for demo...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Ensure a demo student user exists
    let demoUser = await User.findOne({ email: 'student@campusbond.edu' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Aarav Sharma',
        email: 'student@campusbond.edu',
        passwordHash,
        branch: 'CSE',
        semester: 6,
        isVerified: true,
        campusScore: 120,
      });
    }

    let testUser = await User.findOne({ email: 'test@campusbond.edu' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Vikash',
        email: 'test@campusbond.edu',
        passwordHash,
        branch: 'CSE',
        semester: 4,
        isVerified: true,
        campusScore: 50,
      });
    }

    let devUser = await User.findOne({ email: 'ananya@campusbond.edu' });
    if (!devUser) {
      devUser = await User.create({
        name: 'Ananya Gupta',
        email: 'ananya@campusbond.edu',
        passwordHash,
        branch: 'AI & DS',
        semester: 4,
        isVerified: true,
        campusScore: 85,
      });
    }

    // 2. Seed Team Collaboration / Hackathon Posts
    await Event.create([
      {
        title: 'Smart India Hackathon 2026: Need Frontend & ML Teammates',
        description:
          'Working on an AI-driven energy audit system for institutional campuses. We currently have a backend engineer and hardware lead. Looking for a React/Tailwind frontend developer and an ML student with OpenCV/PyTorch experience.',
        category: 'hackathon',
        skillsNeeded: ['React', 'Tailwind', 'AI/ML', 'PyTorch', 'UI/UX'],
        teamSize: 4,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'open',
        createdBy: demoUser._id,
        applicants: [
          {
            user: devUser._id,
            message: 'Hey Aarav! I have built vision models in PyTorch and would love to collaborate on the energy audit project.',
            status: 'approved',
          },
        ],
        comments: [
          {
            user: devUser._id,
            text: 'Is this project targeting the software or hardware edition?',
          },
        ],
      },
      {
        title: 'Autonomous Drone Navigation & Obstacle Avoidance',
        description:
          'Building an ROS-based autonomous drone for the inter-college robotics symposium. Looking for teammates with experience in embedded C++, PX4 autopilot, or 3D chassis design in Fusion360.',
        category: 'project',
        skillsNeeded: ['ROS', 'C++', 'Fusion360', 'Embedded Systems'],
        teamSize: 3,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'open',
        createdBy: devUser._id,
        applicants: [],
        comments: [],
      },
      {
        title: 'FinTech Hackathon: Cross-Campus Micro-Investment App',
        description:
          'Assembling a 3-person team for the National FinTech Challenge. We need a designer who understands Figma and mobile interaction patterns, plus a Flutter/React Native coder.',
        category: 'competition',
        skillsNeeded: ['Figma', 'Flutter', 'FinTech', 'API Design'],
        teamSize: 3,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'open',
        createdBy: demoUser._id,
        applicants: [],
        comments: [],
      },
      {
        title: 'Campus Short Film & Annual Cultural Showcase',
        description:
          'Shooting a 12-minute campus drama for the State Youth Festival. Need video editors (Premiere Pro / DaVinci), sound recorder, and 2 actors from any semester.',
        category: 'cultural',
        skillsNeeded: ['Video Editing', 'Acting', 'Sound Design', 'Storyboarding'],
        teamSize: 5,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'open',
        createdBy: devUser._id,
        applicants: [],
        comments: [],
      },
    ]);

    // 3. Seed Marketplace Listings
    await MarketItem.create([
      {
        title: 'Higher Engineering Mathematics by B.S. Grewal (44th Edition)',
        description:
          'Prescribed for 1st & 2nd year all branches. Very good condition, no missing pages or tears. Can hand over at central library.',
        price: 380,
        category: 'books',
        condition: 'like-new',
        contact: '+91 98765 43210 (WhatsApp)',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Casio fx-991EX Classwiz Scientific Calculator',
        description:
          'Original Casio scientific calculator with matrix & equation solver. Genuine solar battery cover included. Perfectly functional.',
        price: 650,
        category: 'electronics',
        condition: 'good',
        contact: '+91 91234 56789',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'Engineering Mini Drafter + Drawing Board Sheet Holder',
        description:
          'Essential for 1st year Engineering Graphics (EG). Steel arm with smooth pivot and zero wobble. Includes protective carry pouch.',
        price: 450,
        category: 'kit',
        condition: 'good',
        contact: 'Hostel Block B, Room 302',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Handwritten Semester 4 Operating Systems & DBMS Notes',
        description:
          'Comprehensive solved question papers from past 5 years with clean diagrams and algorithms. Spiral bound.',
        price: 150,
        category: 'notes',
        condition: 'new',
        contact: '+91 99887 76655',
        status: 'available',
        seller: devUser._id,
      },
    ]);

    // 4. Seed Lost & Found Items
    await LostItem.create([
      {
        type: 'lost',
        title: 'Casio fx-991 Calculator in Black Zipper Case',
        description:
          'Lost during 3rd period mid-term exam on Tuesday. Has a small yellow sticker on the back with roll number written in faint ink.',
        category: 'electronics',
        location: 'Central Library, 2nd Floor Quiet Zone',
        contact: '+91 98765 43210',
        status: 'open',
        createdBy: demoUser._id,
      },
      {
        type: 'found',
        title: 'Boat Airdopes 141 Charging Case (Black)',
        description:
          'Found on table #4 near the cafeteria counter around 4 PM. Left with the canteen supervisor or DM me to collect.',
        category: 'accessories',
        location: 'Campus Canteen / Cafeteria',
        contact: 'DM on Campus Bond or ask Canteen Counter',
        status: 'open',
        createdBy: devUser._id,
      },
      {
        type: 'found',
        title: 'Student ID Card — Dept of Mechanical Engg',
        description:
          'Found lying on the grass track near the sports pavilion. Please verify name and roll number to collect.',
        category: 'id-card',
        location: 'Sports Ground Pavilion',
        contact: 'Available at Sports Room Desk',
        status: 'open',
        createdBy: demoUser._id,
      },
    ]);

    // 5. Seed Campus Clubs
    await Club.create([
      {
        name: 'Coding Club & ACM Student Chapter',
        description:
          'Official tech and coding community. Weekly coding jams, open source sprints, Hacktoberfest workshops, and competitive programming practice.',
        category: 'tech',
        createdBy: demoUser._id,
        members: [demoUser._id, devUser._id],
      },
      {
        name: 'Robotics & Automation Society (RAS)',
        description:
          'Hardware and robotics enthusiast group. We build combat bots, micro-drones, IoT sensors, and compete in Robocon.',
        category: 'tech',
        createdBy: devUser._id,
        members: [devUser._id],
      },
      {
        name: 'Cultural & Performing Arts Society',
        description:
          'Dance, theater, music, and literary arts. Organizers of the annual college fest, flash mobs, and street plays (Nukkad Natak).',
        category: 'cultural',
        createdBy: demoUser._id,
        members: [demoUser._id],
      },
      {
        name: 'E-Cell (Entrepreneurship & Innovation Cell)',
        description:
          'Incubator for student startups. Pitch competitions, investor talks, prototype grants, and networking sessions.',
        category: 'social',
        createdBy: devUser._id,
        members: [devUser._id],
      },
      {
        name: 'Sports & Athletics Council',
        description:
          'Inter-college tournaments, cricket leagues, badminton championships, football friendlies, and annual athletic meets.',
        category: 'sports',
        createdBy: demoUser._id,
        members: [demoUser._id, devUser._id],
      },
      {
        name: 'AI & Astronomy Research Society',
        description:
          'Student researchers exploring machine learning papers, astronomical observations, telescope nights, and academic publications.',
        category: 'academic',
        createdBy: devUser._id,
        members: [demoUser._id, devUser._id],
      },
      {
        name: 'Campus Photography & Media Guild',
        description:
          'Photographers, filmmakers, and digital artists. Official event coverage, photo-walks, and cinematography workshops.',
        category: 'arts',
        createdBy: demoUser._id,
        members: [demoUser._id, devUser._id],
      },
      {
        name: 'Campus Gaming & Esports League',
        description:
          'LAN gaming events, BGMI/Valorant campus scrims, game development showcases, and student tournaments.',
        category: 'other',
        createdBy: demoUser._id,
        members: [demoUser._id],
      },
    ]);

    console.log('✅ Demo campus data seeded successfully!');
  } catch (err) {
    console.error('Error seeding demo data:', err);
  }
}
