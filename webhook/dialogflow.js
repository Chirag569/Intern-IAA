module.exports = async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;

  // Handle greeting intent from Dialogflow
  if (intent === 'greeting') {
    return res.json({
      fulfillmentText:
        `👋 Welcome to the Indian Aviation Academy (IAA) Official Chatbot!\n\nWe are delighted to assist you with all your training and professional development needs in the aviation sector.\n\nYou can ask me about our wide range of courses, schedules, fees, coordinators, hostel facilities, and much more.\n\nType the name of any course, or simply ask a question like:\n- What is the fee for [Course Name]?\n- Who is the coordinator for [Course Name]?\n- When does [Course Name] start?\n\nOur team is committed to providing you with accurate and timely information. If you need further assistance, just let me know!\n\nHow can I help you today?`
    });
  }

  // Handle list_courses intent: ask user to select a category
  if (intent === 'list_courses') {
    const categories = [
      'AOS', 'HR', 'Operations', 'General', 'Engineering', 'Finance', 'ICAO', 'CTP', 'STP', 'Others', 'ANS', 'Workshop'
    ];
    return res.json({
      fulfillmentText:
        `Please select a course category from the following options:\n\n` +
        categories.map((cat, i) => `${i + 1}. ${cat}`).join('\n') +
        `\n\nType or select a category to see all courses under it.`
    });
  }

  // Handle courses_by_category intent: list all courses under the selected category
  if (intent === 'courses_by_category') {
    let category = parameters['category'];
    if (Array.isArray(category)) category = category[0];
    if (typeof category !== 'string') category = '';
    category = category.trim().toLowerCase();

    const courses = require('../data/courses.json');
    // Normalize category in data for comparison
    const matchingCourses = courses.filter(c => {
      let cat = (c['श्रेणी Category'] || '').trim().toLowerCase();
      return cat === category;
    });
    if (matchingCourses.length === 0) {
      return res.json({
        fulfillmentText: `Sorry, there are no courses found under the category "${parameters['category']}".`
      });
    }
    const courseList = matchingCourses.map(c => `• ${c['प्रशिक्षण कार्यक्रम Programme']}`).join('\n');
    return res.json({
      fulfillmentText:
        `Here are the courses under the category "${parameters['category']}":\n\n${courseList}`
    });
  }

  // Robustly extract courseName as a string
  let courseName = parameters['course_name'];
  if (Array.isArray(courseName)) {
    courseName = courseName[0];
  }
  if (typeof courseName !== 'string') {
    courseName = '';
  }

  const courses = require('../data/courses.json'); // or fetch from DB
  const course = courses.find(c =>
    c['प्रशिक्षण कार्यक्रम Programme']?.toLowerCase().includes(courseName.toLowerCase())
  );

  let response = "Please Check your message i am not getting it";
  if (course) {
    switch (intent) {
      case 'course_info':
        response = `📘 *${course['प्रशिक्षण कार्यक्रम Programme']}*\n🧑‍🎓 Level: ${course['प्रतिभागियो का स्तर Level of Participants']}\n📅 Dates: ${course['आरंभ तिथी /Start date']} to ${course['समाप्त तिथी /End Date']}`;
        break;
      case 'course_fees':
        response = `💰 Fee per day: ₹${course[' Course Fees (Per Day per participant) ']} \nAfter group discount: ₹${course['Course Fees Per Day Per Participant post 20 % group discount (rounded to nearest 50)']}`;
        break;
      case 'batch_dates':
        response = `📅 This course runs from ${course['आरंभ तिथी /Start date']} to ${course['समाप्त तिथी /End Date']} for ${course['दिवस संख्या Number of Days']} days.`;
        break;
      case 'hostel_info':
        response = `🏨 Hostel Charges: ₹${course['Hostel Charges'] || 'Not available'}`;
        break;
      case 'contact_info':
        response = `👨‍🏫 Course Coordinator(s): ${course['पाठ्यक्रम समन्वयक Course Coordinator']}`;
        break;
      case 'course_category':
        response = "Feature in progress. Soon you'll be able to filter by category.";
        break;
    }
  }

  res.json({ fulfillmentText: response });
}; 