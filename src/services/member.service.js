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

        // Fetch all tasks in myDailyTasks and myWeeklyTasks
        const dailyTasks = await Task.find({ _id: { $in: dailyTaskIds } });
        const weeklyTasks = await Task.find({ _id: { $in: weeklyTaskIds } });

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

            assignedManager: data.assignedManager || null,
            dailyTitle: data.dailyTitle || "",
            dailyDescription: data.dailyDescription || "",
            weeklyTitle: data.weeklyTitle || "",
            weeklyDescription: data.weeklyDescription || "",
            myDailyTasks: dailyTasks.length > 0 ? dailyTasks.map(task => task._id) : [],
            myWeeklyTasks: weeklyTasks.length > 0 ? weeklyTasks.map(task => task._id) : [],

            mainTaskId: data.mainTaskId || null,
            assignedManagerName: assignedManagerName || "",

            // Set to null or an empty array if no tasks are provided
            dailyMainTaskId: dailyTaskIds.length > 0 ? dailyTaskIds[0] : null,
            weeklyMainTaskId: weeklyTaskIds.length > 0 ? weeklyTaskIds[0] : null,
        };

        // Create the new member in the database
        const newMember = await Member.create(newMemberData);

        return newMember;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};



const getSingleMember = async (id) => {
    try {
        // Find member by ID and select only the required fields
        const member = await Member.findById(id).select(
            "_id memberName profileImage location email role password userActivity assignedManagerName myDailyTasks myWeeklyTasks mainTaskId weeklyMainTaskId dailyMainTaskId "
        )
            .populate("assignedManager", "memberName")
            .populate('myDailyTasks', 'subTaskName')
            .populate('myWeeklyTasks', 'subTaskName')
            .populate('dailyMainTaskId', 'taskClassName') // Populate dailyMainTaskId
            .populate('weeklyMainTaskId', 'taskClassName'); // Populate weeklyMainTaskId

        console.log(member);

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
        const members = await Member.find({ role: "customer" }).populate("assignedManager", "memberName").populate('myWeeklyTasks').populate('myDailyTasks');

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

        // 2️⃣ Validate password length & Hash Password (only if password is being updated)
        if (data.password && data.password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }

        // 3️⃣ Validate Tasks (Ensure that they are valid arrays)
        const dailyTaskIds = Array.isArray(data.myDailyTasks) ? data.myDailyTasks : [];
        const weeklyTaskIds = Array.isArray(data.myWeeklyTasks) ? data.myWeeklyTasks : [];

        let dailyTasks = [];
        let weeklyTasks = [];

        // 4️⃣ Fetch Daily Tasks only if valid task IDs are provided
        if (dailyTaskIds.length > 0) {
            dailyTasks = await Task.find({ _id: { $in: dailyTaskIds } });
        }

        // 5️⃣ Fetch Weekly Tasks only if valid task IDs are provided
        if (weeklyTaskIds.length > 0) {
            weeklyTasks = await Task.find({ _id: { $in: weeklyTaskIds } });
        }

        // 6️⃣ Update Daily & Weekly Subtasks (If Tasks are passed in the update data)
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

        // 7️⃣ Update `totalAssignedCustomer` in Task if the `mainTaskId` is provided
        if (data.mainTaskId) {
            const task = await Task.findById(data.mainTaskId);
            if (task) {
                task.totalAssignedCustomer = (task.totalAssignedCustomer || 0) + 1;
                await task.save();
            }
        }

        // 8️⃣ Get Assigned Manager Name (if exists)
        let assignedManagerName = "";
        if (data.assignedManager) {
            const manager = await Member.findById(data.assignedManager);
            if (manager) {
                assignedManagerName = manager.memberName;
            }
        }

        // 9️⃣ Prepare the update data
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
            myDailyTasks: dailyTasks.length > 0 ? dailyTasks[0].subTasks?.map(id => id.toString()) : member.myDailyTasks,
            myWeeklyTasks: weeklyTasks.length > 0 ? weeklyTasks[0].subTasks?.map(id => id.toString()) : member.myWeeklyTasks,
            mainTaskId: data.mainTaskId || member.mainTaskId,
            assignedManagerName: assignedManagerName || member.assignedManagerName
        };

        // 🔟 Update the member data
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


        // totalAssignedCustomer

        for (const member of members) {
            const tasks = await Member.find({ assignedManager: member._id });
            member.totalAssignedCustomer = tasks.length;
        }

        console.log(members);

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
