const { SubTask, Member } = require("../models");

const getTasksAnalyticsWeeklyAndMonthly = async (email, week = 1) => {
    if (!email) {
        throw new Error("Email is required");
    }

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const weekStartDate = new Date(firstDayOfMonth);
    weekStartDate.setDate((week - 1) * 7 + 1); // Start date of the selected week

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6); // End date of the selected week

    // Step 1: Find the user
    const user = await Member.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    // Step 2: Fetch all tasks (Daily + Weekly) for the user in the selected week
    const tasks = await SubTask.find({
        _id: { $in: [...user.myDailyTasks, ...user.myWeeklyTasks] }, // Combine both arrays
        taskSubmissionDate: { $gte: weekStartDate, $lte: weekEndDate },
    });

    // Step 3: Fetch due tasks (tasks that are NOT completed)
    const dueTasksDaily = await SubTask.find({
        _id: { $in: user.myDailyTasks },
        isCompleted: false,
    });

    const dueTasksWeekly = await SubTask.find({
        _id: { $in: user.myWeeklyTasks },
        isCompleted: false,
    });

    // Step 4: Initialize analytics object
    const analytics = { weekDays: [] };

    // Initialize the week days (Mon, Tue, Wed, etc.)
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStartDate);
        currentDate.setDate(weekStartDate.getDate() + i);
        const taskDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" }); // E.g. Mon, Tue

        analytics.weekDays.push({
            count: 0, // Tasks completed for the day will be counted here
            day: dayName,
            week: `Week ${week}`,
            date: taskDate,
        });
    }

    // Step 5: Update analytics with completed task counts
    // Step 5: Update analytics with completed task counts
    tasks.forEach((task) => {
        const taskDate = task.taskSubmissionDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const index = analytics.weekDays.findIndex(day => day.date === taskDate);

        // Check if the task is completed (isCompleted is true) before incrementing the count
        if (index !== -1 && task.isCompleted) {
            analytics.weekDays[index].count += 1; // Increment task count for the respective day if completed
        }
    });

    // Step 6: Calculate total due tasks (not completed)
    const dueTasksCount = dueTasksDaily.length + dueTasksWeekly.length;


    console.log(analytics, dueTasksCount);

    // Step 7: Return analytics and task statistics
    return {
        analytics,
        totalMyTasks: tasks.length, // Total assigned tasks
        dueTasks: dueTasksCount, // Correct due task count
        thisMonthName: firstDayOfMonth.toLocaleDateString("en-US", { month: "long" }), // Month name
    };
};

module.exports = { getTasksAnalyticsWeeklyAndMonthly };
