const { SubTask } = require("../models");

const getTasksAnalyticsWeeklyAndMonthly = async (email, week = 1) => {
    if (!email) {
        throw new Error("Email is required");
    }

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // 1st day of the month
    const weekStartDate = new Date(firstDayOfMonth);
    weekStartDate.setDate((week - 1) * 7 + 1); // Calculate the start date for the given week

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6); // Calculate the end date (7-day period)

    // Fetch tasks from MongoDB for the given week and completed tasks
    const tasks = await SubTask.find({
        userEmail: email,
        taskSubmissionDate: { $gte: weekStartDate, $lte: weekEndDate },
        isCompleted: true,
    });

    // Fetch all tasks for the user to calculate total tasks
    const MyTasks = await SubTask.find({ userEmail: email });
    const totalMyTasks = MyTasks.length;
    console.log(MyTasks);

    // Fetch due tasks (tasks that are not completed within the given week range)
    const dueTasks = await SubTask.find({
        userEmail: email,
        isCompleted: false,
    });

    // Initialize analytics object with a static key "thisDay"
    const analytics = {
        weekDays: [] // Store data for the entire week inside an array
    };

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStartDate);
        currentDate.setDate(weekStartDate.getDate() + i);
        const taskDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" }).slice(0, 3); // E.g. Mon, Tue, Wed, etc.

        analytics.weekDays.push({
            count: 0, // this value will be incremented based on task completion
            day: dayName,
            week: `Week ${week}`,
            date: taskDate,
        });
    }

    // Populate the analytics object with actual completed task counts
    tasks.forEach((task) => {
        const taskDate = task.taskSubmissionDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const index = analytics.weekDays.findIndex(day => day.date === taskDate);
        if (index !== -1) {
            analytics.weekDays[index].count += 1; // Increment task count for completed tasks
        }
    });

    // Return the analytics along with total and due tasks counts
    return {
        analytics,
        totalMyTasks,
        dueTasks: dueTasks.length, // Count of due tasks (not completed within the week)
        thisMonthName: firstDayOfMonth.toLocaleDateString("en-US", { month: "long" })
    };
};

module.exports = { getTasksAnalyticsWeeklyAndMonthly };
