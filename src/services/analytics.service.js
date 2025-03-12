const { SubTask, Member } = require("../models");

const getTasksAnalyticsWeeklyAndMonthly = async (email, week = 1) => {
    try {
        if (!email) {
            throw new Error("Email is required");
        }

        // Step 1: Find the user by email

        console.log(email);

        const user = await Member.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // 1st day of the month
        const weekStartDate = new Date(firstDayOfMonth);
        weekStartDate.setDate((week - 1) * 7 + 1); // Calculate the start date for the given week

        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6); // Calculate the end date (7-day period)

        // Step 2: Fetch completed weekly tasks for the given week
        const completedWeeklyTasks = await SubTask.find({
            _id: { $in: user.myWeeklyTasks || user.myDailyTasks }, // Fetch tasks assigned to the user
            taskSubmissionDate: { $gte: weekStartDate, $lte: weekEndDate },
            isCompleted: true,
        });

        // Step 3: Fetch total tasks for the user
        const totalWeeklyTasks = user.myWeeklyTasks.length; // Based on myWeeklyTasks field
        const totalDailyTasks = user.myDailyTasks.length;   // Based on myDailyTasks field

        console.log("User's Weekly Tasks:", user.myWeeklyTasks);
        console.log("User's Daily Tasks:", user.myDailyTasks);

        // Step 4: Fetch incomplete weekly tasks (due tasks)
        const dueWeeklyTasks = await SubTask.find({
            _id: { $in: user.myWeeklyTasks }, // Tasks assigned to the user
            isCompleted: false,
        });

        // Step 5: Fetch the list of pending daily tasks for the user
        const completedDailyTasks = await SubTask.find({
            _id: { $in: user.myDailyTasks },
            taskSubmissionDate: { $gte: weekStartDate, $lte: weekEndDate },
            isCompleted: true,
        });

        // Step 6: Initialize analytics object with a static key "thisDay"
        const analytics = {
            weekDays: [] // Store data for the entire week inside an array
        };

        // Step 7: Populate analytics for each day of the week
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStartDate);
            currentDate.setDate(weekStartDate.getDate() + i);
            const taskDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" }).slice(0, 3); // E.g. Mon, Tue, Wed, etc.

            analytics.weekDays.push({
                count: 0, // This value will be incremented based on task completion
                day: dayName,
                week: `Week ${week}`,
                date: taskDate,
            });
        }

        // Step 8: Update analytics object with completed task counts
        completedWeeklyTasks.forEach((task) => {
            const taskDate = task.taskSubmissionDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const index = analytics.weekDays.findIndex(day => day.date === taskDate);
            if (index !== -1) {
                analytics.weekDays[index].count += 1; // Increment task count for completed weekly tasks
            }
        });

        completedDailyTasks.forEach((task) => {
            const taskDate = task.taskSubmissionDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const index = analytics.weekDays.findIndex(day => day.date === taskDate);
            if (index !== -1) {
                analytics.weekDays[index].count += 1; // Increment task count for completed daily tasks
            }
        });

        // Step 9: Return the analytics along with total tasks and due tasks counts
        return {
            analytics,
            totalWeeklyTasks,
            totalDailyTasks,
            dueWeeklyTasks: dueWeeklyTasks.length, // Count of due weekly tasks (not completed within the week)
            dueDailyTasks: dueWeeklyTasks.length,  // Count of due daily tasks (not completed within the week)
            thisMonthName: firstDayOfMonth.toLocaleDateString("en-US", { month: "long" })
        };

    } catch (error) {
        console.error("Error fetching task analytics:", error); // Log any error that occurs during execution
        throw new Error(error.message); // Return an internal server error if an exception occurs
    }
};

module.exports = { getTasksAnalyticsWeeklyAndMonthly };
