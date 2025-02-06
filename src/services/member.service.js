const { jwt } = require("../config/config");
const { Member, SubTask, Task } = require("../models");
const ApiError = require("../utils/ApiError");
const jwtToken = require('jsonwebtoken');

const createMember = async (data) => {
    try {
        // Check if the member already exists
        const memberExist = await Member.findOne({ email: data.email });
        if (memberExist) {
            throw new ApiError(400, "This email already exists");
        }

        // Validate password length
        if (data.password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }

        // Validate required fields
        if (!data.memberName || !data.email || !data.location || !data.password || !data.role) {
            throw new ApiError(400, "All fields are required");
        }

        // Find and validate myDailyTasks
        const dailyTasks = await SubTask.find({ _id: { $in: data.myDailyTasks } });
        // if (data.myDailyTasks.length > 0 && dailyTasks.length === 0) {
        //     throw new ApiError(404, "No matching daily tasks found");
        // }

        // Find and validate myWeeklyTasks
        const weeklyTasks = await SubTask.find({ _id: { $in: data.myWeeklyTasks } });
        // if (data.myWeeklyTasks.length > 0 && weeklyTasks.length === 0) {
        //     throw new ApiError(404, "No matching weekly tasks found");
        // }

        // ✅ Update Daily Subtasks
        await SubTask.updateMany(
            { _id: { $in: data.myDailyTasks } },
            { $set: { userEmail: data.email, taskType: "Daily", managerId: data.assignedManager } }
        );

        // ✅ Update Weekly Subtasks
        await SubTask.updateMany(
            { _id: { $in: data.myWeeklyTasks } },
            { $set: { userEmail: data.email, taskType: "Weekly", managerId: data.assignedManager } }
        );

        // ✅ Fetch only updated Daily Subtasks
        const updatedDailyTasks = await SubTask.find({ _id: { $in: data.myDailyTasks } });

        // ✅ Fetch only updated Weekly Subtasks
        const updatedWeeklyTasks = await SubTask.find({ _id: { $in: data.myWeeklyTasks } });
        console.log("mainTaskId", data.mainTaskId);
        const assigneCustomerTasksLength = await Task.findById({ _id: data.mainTaskId })

        assigneCustomerTasksLength.totalAssignedCustomer = assigneCustomerTasksLength.totalAssignedCustomer + 1;

        await assigneCustomerTasksLength.save();



        // ✅ Create the new member object
        const newMemberData = {
            memberName: data.memberName,
            location: data.location,
            email: data.email,
            password: data.password,
            role: data.role,
            assignedManager: data.assignedManager,
            dailyTitle: data.dailyTitle,
            dailyDescription: data.dailyDescription,
            weeklyTitle: data.weeklyTitle,
            weeklyDescription: data.weeklyDescription,
            myDailyTasks: updatedDailyTasks,
            myWeeklyTasks: updatedWeeklyTasks,
            mainTaskId: data.mainTaskId
        };

        // ✅ Save new member to database
        const newMember = await Member.create(newMemberData);

        return newMember;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

// Get a single member by ID
const getSingleMember = async (id) => {
    try {
        // Find member by ID and select only the required fields
        const member = await Member.findById(id).select(
            "_id memberName profileImage location isVisible email role assignedManager"
        );

        if (!member) {
            throw new ApiError(404, "Member not found");
        }
        return member;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


// Get all members
const getAllMembers = async () => {
    try {
        // Fetch members while excluding `myDailyTasks` and `myWeeklyTasks`
        const members = await Member.find({}, { myDailyTasks: 0, myWeeklyTasks: 0 });
        return members;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

// Update a member by ID
const updateMember = async (id, updateData) => {
    try {
        if (!updateData) {
            throw new ApiError(400, "Update data is required");
        }

        if (updateData.password && !updateData.password.length >= 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }

        const updatedMember = await Member.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedMember) {
            throw new ApiError(404, "Member not found");
        }
        return updatedMember;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


const login = async (email, password) => {


    // Check if the member exists
    const member = await Member.findOne({ email });
    if (!member) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (member.password !== password) {
        throw new ApiError(401, "Invalid email or password");
    }

    // const token = jwtToken.sign(
    //     { userId: member._id, email: member.email, type: "access" },
    //     jwt.secret, // Ensure you have a secret key in your .env file
    //     { expiresIn: '30d' } // Token expiration time (can adjust as needed),
    // );

    return member;
};



const updateMembersAsUser = async (id, updateData, file) => {

    try {
        if (!updateData || Object.keys(updateData).length === 0) {
            throw new ApiError(400, "Update data is required");
        }
        // Handle password validation
        if (updateData.password && updateData.password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }

        // Handle file upload (if any)
        if (file) {
            updateData.profileImage = "uploads/members/" + file.filename; // Save the uploaded image path
        }
        // Update the member
        const updatedMember = await Member.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
        if (!updatedMember) {
            throw new ApiError(404, "Member not found");
        }

        return updatedMember;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


module.exports = {
    createMember,
    getSingleMember,
    getAllMembers,
    updateMember,
    login,
    updateMembersAsUser
};
