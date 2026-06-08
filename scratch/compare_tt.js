const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function analyze() {
  const timetables = await prisma.timetable.findMany({
    include: {
      slots: true,
      branch: true,
      department: true
    }
  });

  const courses = await prisma.course.findMany();
  
  console.log(`Found ${timetables.length} timetables in DB.`);
  
  let totalSlotsDB = 0;
  for (const tt of timetables) {
    totalSlotsDB += tt.slots.length;
    console.log(`- ${tt.branch.name} Semester ${tt.semesterName}: ${tt.slots.length} slots`);
  }
  console.log(`Total slots in DB: ${totalSlotsDB}`);
  
  // Read tt_md
  const mdDir = path.join(__dirname, '..', 'tt_md');
  const files = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
  
  let totalMdSlots = 0;
  let mdCourses = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(mdDir, file), 'utf-8');
    // Count non-empty table cells in the slots section
    // This is a rough estimation script just to see what we have
    const tableMatches = content.match(/<td.*?>(.*?)<\/td>/g);
    if (tableMatches) {
      // rough count
    }
  }

  // To be more precise, let's just dump a sample from DB to see how AI parsed it vs the Markdown.
  const sample = timetables[0];
  if (sample) {
    console.log(`\nSample DB Timetable: ${sample.branch.name} ${sample.semesterName}`);
    const sampleSlots = sample.slots.slice(0, 5);
    console.log(sampleSlots);
    
    // Check courses shortNames
    const branchCourses = courses.filter(c => c.branchId === sample.branchId && c.semester === sample.semesterName);
    console.log(`\nCourses parsed for this branch:`);
    branchCourses.forEach(c => {
      console.log(`${c.code} | ${c.name} | Short: ${c.shortName} | Credits: ${c.credits} | Room/Type: ${c.type}`);
    });
  }
  
  console.log('\nRooms in DB:');
  const rooms = await prisma.room.findMany();
  console.log(`Total rooms extracted: ${rooms.length}`);
  rooms.slice(0, 10).forEach(r => console.log(`${r.number} (${r.type})`));
}

analyze()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
