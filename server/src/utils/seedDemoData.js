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
        title: 'Apple MacBook Air M1 (8GB RAM, 256GB SSD) - Space Grey',
        description:
          'Excellent laptop for coding, web dev, and campus lectures. Battery health 91%, cycle count 180. Original 30W charger & box included.',
        price: 46500,
        category: 'electronics',
        condition: 'like-new',
        contact: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Lenovo ThinkPad E14 Laptop (AMD Ryzen 5, 16GB RAM, 512GB SSD)',
        description:
          'Rugged student laptop with trackpoint, backlit keyboard, FHD display. Clean Ubuntu/Windows dual boot setup for CSE labs.',
        price: 32000,
        category: 'electronics',
        condition: 'good',
        contact: '+91 91234 56789',
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: testUser._id,
      },
      {
        title: 'iPhone 13 (128GB, Midnight Black) - 5G Phone',
        description:
          'Purchased 1.5 years ago, 88% battery health. Scratchless back with Spigen case, tempered glass applied. Bill, box & cable included.',
        price: 31500,
        category: 'electronics',
        condition: 'like-new',
        contact: '+91 99887 76655',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'OnePlus Nord CE 3 5G Phone (8GB RAM, 128GB Storage)',
        description:
          'Aqua Surge color, 120Hz AMOLED screen, Snapdragon 782G processor. Comes with 80W SuperVOOC fast charger and original box.',
        price: 14800,
        category: 'electronics',
        condition: 'good',
        contact: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Sony WH-1000XM4 Wireless Noise Cancelling Headset',
        description:
          'Over-ear premium headphones with 30hr battery life and industry-best ANC. Great for hostel study & library focus. With hard carry case.',
        price: 13500,
        category: 'electronics',
        condition: 'like-new',
        contact: '+91 91234 56789',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'boAt Rockerz 550 Over-Ear Wireless Headset',
        description:
          'Black color with comfortable padded earcups, 50mm dynamic drivers, deep bass, 20hr battery life. AUX cable & Type-C cord included.',
        price: 1100,
        category: 'electronics',
        condition: 'good',
        contact: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: testUser._id,
      },
      {
        title: 'Apple AirPods Pro with MagSafe Wireless Charging Case',
        description:
          'Active noise cancellation and transparency mode. Clean sound, all silicone ear tips (S/M/L) included with protective silicon sleeve.',
        price: 8500,
        category: 'electronics',
        condition: 'good',
        contact: '+91 99887 76655',
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
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
        image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'Ergonomic Aluminum Laptop Stand with 360 Rotating Base',
        description:
          'Heavy-duty foldable aluminum riser for 13-16 inch laptops. Helps improve neck posture during long coding sessions.',
        price: 550,
        category: 'electronics',
        condition: 'like-new',
        contact: '+91 99887 76655',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Higher Engineering Mathematics by B.S. Grewal (44th Edition)',
        description:
          'Prescribed for 1st & 2nd year all branches. Very good condition, no missing pages or tears. Can hand over at central library.',
        price: 380,
        category: 'books',
        condition: 'like-new',
        contact: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Computer Networking: A Top-Down Approach (Kurose & Ross 7th Ed)',
        description:
          'Standard textbook for 5th sem Computer Networks. Minimal pencil underlines. Includes solved reference notes.',
        price: 420,
        category: 'books',
        condition: 'good',
        contact: '+91 99887 76655',
        image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'Database System Concepts (Silberschatz & Korth 6th Edition)',
        description:
          'Must-have book for DBMS and GATE prep. Hardcover edition in pristine condition. Zero markings or torn corners.',
        price: 490,
        category: 'books',
        condition: 'new',
        contact: '+91 91234 56789',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: testUser._id,
      },
      {
        title: 'Handwritten Semester 4 Operating Systems & DBMS Notes',
        description:
          'Comprehensive solved question papers from past 5 years with clean diagrams and algorithms. Spiral bound.',
        price: 150,
        category: 'notes',
        condition: 'new',
        contact: '+91 99887 76655',
        image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'Complete DSA with C++ Handwritten Topic-wise Revision Notes',
        description:
          'Covers Trees, Graphs, DP, Heaps, and Recursion with dry-run traces and LeetCode problem patterns. 180 pages.',
        price: 180,
        category: 'notes',
        condition: 'like-new',
        contact: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Engineering Mini Drafter + Drawing Board Sheet Holder',
        description:
          'Essential for 1st year Engineering Graphics (EG). Steel arm with smooth pivot and zero wobble. Includes protective carry pouch.',
        price: 450,
        category: 'kit',
        condition: 'good',
        contact: 'Hostel Block B, Room 302',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Arduino Uno R3 Starter Kit with 30+ Sensors & Breadboard',
        description:
          'Complete robotics kit: Uno board, jumper wires, servo motor, ultrasonic sensor, LCD display, and USB cable.',
        price: 850,
        category: 'kit',
        condition: 'like-new',
        contact: '+91 91234 56789',
        image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'White Cotton Lab Coat (Size M) + Safety Splash Goggles',
        description:
          'Mandatory for Chemistry & Physics lab sessions. Freshly washed, stainless, double stitched with front utility pockets.',
        price: 220,
        category: 'kit',
        condition: 'good',
        contact: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: testUser._id,
      },
      {
        title: 'Yamaha F310 Acoustic Guitar with Padded Gig Bag & Tuner',
        description:
          '6-string natural gloss acoustic guitar with great resonance. Recently restrung with D\'Addario strings. Free picks included.',
        price: 4800,
        category: 'instruments',
        condition: 'like-new',
        contact: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: testUser._id,
      },
      {
        title: 'Casio CT-S200 Portable Electronic Keyboard (61 Keys)',
        description:
          'Full-size 61 keys with built-in handle, dance music mode, headphone jack for quiet hostel practice. Power adapter included.',
        price: 5500,
        category: 'instruments',
        condition: 'good',
        contact: '+91 91234 56789',
        image: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'Foldable Bed Study Table with Cup Holder & Tablet Slot',
        description:
          'Sturdy wooden bed desk with rounded safety edges. Ideal for hostel late-night studying and laptop work on bed.',
        price: 350,
        category: 'furniture',
        condition: 'good',
        contact: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: demoUser._id,
      },
      {
        title: 'Ergonomic Mid-Back Mesh Study Chair with Lumbar Support',
        description:
          'Pneumatic height adjustment, 360 swivel nylon caster wheels. Perfect for hostel or PG room setup.',
        price: 1600,
        category: 'furniture',
        condition: 'good',
        contact: 'Hostel Block C, Room 114',
        image: 'https://images.unsplash.com/photo-1580481077190-73614591e80d?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: testUser._id,
      },
      {
        title: 'Hero Sprint 26T Mountain Bicycle with Lock & Bell',
        description:
          'Single-speed campus bicycle, brand new puncture-resistant tires, front brake cables recently tuned. Great for campus commute.',
        price: 2400,
        category: 'other',
        condition: 'good',
        contact: '+91 91234 56789',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: devUser._id,
      },
      {
        title: 'Yonex Carbon Graphite Badminton Racket Set with Cover',
        description:
          'Set of 2 lightweight racquets with tight BG-65 strings + 3 Yonex Mavis 350 nylon shuttles. Ideal for campus sports complex.',
        price: 750,
        category: 'other',
        condition: 'good',
        contact: '+91 99887 76655',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        seller: demoUser._id,
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
