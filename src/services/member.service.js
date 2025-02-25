const { jwt } = require("../config/config");
const { Member, SubTask, Task } = require("../models");
const ApiError = require("../utils/ApiError");
const jwtToken = require('jsonwebtoken');

const createMember = async (data) => {
    try {
        // 1️⃣ Check if the member already exists
        const memberExist = await Member.findOne({ email: data.email });
        if (memberExist) {
            throw new ApiError(400, "This email already exists");
        }

        // 2️⃣ Validate required fields
        if (!data.memberName || !data.email || !data.location || !data.password || !data.role) {
            throw new ApiError(400, "All fields are required");
        }

        // 3️⃣ Validate password length & Hash Password
        if (data.password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }


        // 4️⃣ Fetch & Validate Tasks
        const dailyTaskIds = Array.isArray(data.myDailyTasks) ? data.myDailyTasks : [];
        const weeklyTaskIds = Array.isArray(data.myWeeklyTasks) ? data.myWeeklyTasks : [];
        const dailyTasks = await SubTask.find({ _id: { $in: dailyTaskIds } });
        const weeklyTasks = await SubTask.find({ _id: { $in: weeklyTaskIds } });

        // 5️⃣ Update Daily & Weekly Subtasks
        if (dailyTaskIds.length > 0) {
            await SubTask.updateMany(
                { _id: { $in: dailyTaskIds } },
                { $set: { userEmail: data.email, taskType: "Daily", managerId: data.assignedManager } }
            );
        }
        if (weeklyTaskIds.length > 0) {
            await SubTask.updateMany(
                { _id: { $in: weeklyTaskIds } },
                { $set: { userEmail: data.email, taskType: "Weekly", managerId: data.assignedManager } }
            );
        }

        // 6️⃣ Update `totalAssignedCustomer` in Task
        if (data.mainTaskId) {
            const task = await Task.findById(data.mainTaskId);
            if (task) {
                task.totalAssignedCustomer = (task.totalAssignedCustomer || 0) + 1;
                await task.save();
            }
        }

        // 7️⃣ Get Assigned Manager Name (if exists)
        let assignedManagerName = "";
        if (data.assignedManager) {
            const manager = await Member.findById(data.assignedManager);
            if (manager) {
                assignedManagerName = manager.memberName;
            }
        }

        // 8️⃣ Create the new Member
        const newMemberData = {
            memberName: data.memberName,
            location: data.location,
            email: data.email,
            password: data.password, // Store hashed password
            role: data.role,
            assignedManager: data.assignedManager,
            dailyTitle: data.dailyTitle,
            dailyDescription: data.dailyDescription,
            weeklyTitle: data.weeklyTitle,
            weeklyDescription: data.weeklyDescription,
            myDailyTasks: dailyTasks.map(task => task._id),
            myWeeklyTasks: weeklyTasks.map(task => task._id),
            mainTaskId: data.mainTaskId,
            assignedManagerName: assignedManagerName || ""
        };


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
            "_id memberName profileImage location email role password userActivity assignedManagerName myDailyTasks myWeeklyTasks mainTaskId"
        ).populate("assignedManager", "memberName");

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

const getAllCustomer = async () => {
    try {
        const members = await Member.find({ role: "customer" }).populate("assignedManager", "memberName");

        // members.map((member) => {
        //     const res = Member.updateOne({ _id: '67a6bcc48c4081a380b6ac0d' }, { $set: { assignedManagerName: member.assignedManagerName } });
        //     console.log(res);
        // })

        return {
            members,
            totalCustomer: members.length
        };
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

// Update a member by ID
const updateMember = async (id, data) => {
    try {
        // 1️⃣ Check if the member exists by ID
        const member = await Member.findById(id);
        if (!member) {
            throw new ApiError(404, "Member not found");
        }

        // 2️⃣ Validate required fields
        if (!data.memberName || !data.location || !data.role) {
            throw new ApiError(400, "All fields are required");
        }

        // 3️⃣ Validate password length & Hash Password (only if password is being updated)
        if (data.password && data.password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }

        // 4️⃣ Fetch & Validate Tasks
        const dailyTaskIds = Array.isArray(data.myDailyTasks) ? data.myDailyTasks : [];
        const weeklyTaskIds = Array.isArray(data.myWeeklyTasks) ? data.myWeeklyTasks : [];
        const dailyTasks = await SubTask.find({ _id: { $in: dailyTaskIds } });
        const weeklyTasks = await SubTask.find({ _id: { $in: weeklyTaskIds } });

        // 5️⃣ Update Daily & Weekly Subtasks (If Tasks are passed in the update data)
        if (dailyTaskIds.length > 0) {
            await SubTask.updateMany(
                { _id: { $in: dailyTaskIds } },
                { $set: { userEmail: data.email, taskType: "Daily", managerId: data.assignedManager } }
            );
        }

        if (weeklyTaskIds.length > 0) {
            await SubTask.updateMany(
                { _id: { $in: weeklyTaskIds } },
                { $set: { userEmail: data.email, taskType: "Weekly", managerId: data.assignedManager } }
            );
        }

        // 6️⃣ Update `totalAssignedCustomer` in Task if the `mainTaskId` is provided
        if (data.mainTaskId) {
            const task = await Task.findById(data.mainTaskId);
            if (task) {
                task.totalAssignedCustomer = (task.totalAssignedCustomer || 0) + 1;
                await task.save();
            }
        }

        // 7️⃣ Get Assigned Manager Name (if exists)
        let assignedManagerName = "";
        if (data.assignedManager) {
            const manager = await Member.findById(data.assignedManager);
            if (manager) {
                assignedManagerName = manager.memberName;
            }
        }

        // 8️⃣ Prepare the update data
        const newMemberData = {
            memberName: data.memberName || member.memberName,
            location: data.location || member.location,
            email: data.email || member.email,
            password: data.password || member.password, // Store hashed password if provided
            role: data.role || member.role,
            assignedManager: data.assignedManager || member.assignedManager,
            dailyTitle: data.dailyTitle || member.dailyTitle,
            dailyDescription: data.dailyDescription || member.dailyDescription,
            weeklyTitle: data.weeklyTitle || member.weeklyTitle,
            weeklyDescription: data.weeklyDescription || member.weeklyDescription,
            myDailyTasks: dailyTasks.length > 0 ? dailyTasks.map(task => task._id) : member.myDailyTasks,
            myWeeklyTasks: weeklyTasks.length > 0 ? weeklyTasks.map(task => task._id) : member.myWeeklyTasks,
            mainTaskId: data.mainTaskId || member.mainTaskId,
            assignedManagerName: assignedManagerName || member.assignedManagerName
        };

        // 9️⃣ Update the member data
        const updatedMember = await Member.findByIdAndUpdate(id, newMemberData, { new: true, runValidators: true });

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


const getAllManager = async () => {
    try {
        const members = await Member.find({ role: "manager" });
        return members;
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
    updateMembersAsUser,
    getAllManager,
    getAllCustomer
};
