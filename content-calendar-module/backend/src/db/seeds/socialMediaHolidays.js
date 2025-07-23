const db = require('../../config/database');
const fs = require('fs');
const path = require('path');

async function seedSocialMediaHolidays() {
  try {
    console.log('Seeding social media holidays...');
    
    // Read the social media holidays data
    const dataPath = path.join(__dirname, '../../data/socialMediaHolidays.json');
    const { holidays } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Clear existing social media holidays
    await db('calendar_events').where('type', 'social').del();
    
    // Transform and insert holidays
    const currentYear = new Date().getFullYear();
    const holidaysToInsert = [];
    
    for (const holiday of holidays) {
      const [month, day] = holiday.date.split('-');
      
      // Insert for current year and next year
      for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
        const year = currentYear + yearOffset;
        const date = `${year}-${month}-${day}`;
        
        holidaysToInsert.push({
          name: holiday.name,
          date: date,
          type: 'social',
          description: holiday.description,
          tags: JSON.stringify(holiday.tags),
          is_active: true
        });
      }
    }
    
    // Batch insert
    await db('calendar_events').insert(holidaysToInsert);
    
    console.log(`Successfully seeded ${holidaysToInsert.length} social media holidays!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedSocialMediaHolidays();