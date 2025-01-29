const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { Tasks, Service, SubmitTask, User } = require("../models");
const { userService } = require(".");
const { createPayment } = require("./payment.service");
const { addNotification, getALLNotificationAdmin, addCustomNotification } = require("./notification.service");
const pick = require("../utils/pick");

const createTask = async (userId, bodyData) => {
  const user = await userService.getUserById(userId); // Use userService
  const service = await Service.findOne({ _id: bodyData.serviceId });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
  }

  const data = {
    ...bodyData,
    userId: user._id,
    type: service.type,
    count: bodyData.quantity,
  };
  const task = await Tasks.create(data);

  if (task) {
    const payment = await createPayment({
      // Use createPayment directly
      userId,
      tasksId: task._id,
      price: bodyData.price * bodyData.quantity,
      transactionId: bodyData.transactionId,
    });
    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment is not created");
    }
  }
  return task;
};

const queryTasks = async (filter, customOptions, type, userId) => {
  const defaultOptions = {
    sortBy: "createdAt:desc",
    limit: 10,
    page: 1,
    populate: "serviceId,userId fullName image",
  };

  const options = { ...defaultOptions, ...customOptions };

  const result = await Tasks.paginate(filter, options);
  return result;
};

const getTaskById = async (id) => {
  const task = await Tasks.findById(id).populate("userId serviceId");
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  return task;
};

const deleteTaskById = async (id) => {
  const task = await Tasks.findByIdAndDelete(id);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  return task;
};

const updateTaskById = async (id, bodyData, image) => {
  const task = await getTasksById(id);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  if (image) {
    task.image = image;
  }

  Object.assign(task, bodyData);
  await task.save();
  return task;
};

const getAdminTasks = async (userId, type, page, limit) => {
  const pageNumber = parseInt(page) || 1;
  const limitPerPage = parseInt(limit) || 10; // Default limit to 10 if not provided
  const skip = (pageNumber - 1) * limitPerPage;

  // Get total count of documents without pagination
  const totalCount = await Tasks.countDocuments({ type });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limitPerPage);

  // Use aggregation framework to include pagination
  const tasks = await Tasks.aggregate([
    { $match: { type } },
    { $skip: skip },
    { $limit: limitPerPage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "services",
        localField: "serviceId",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: "$service" },
  ]);

  return {
    tasks,
    page: pageNumber,
    limit: limitPerPage,
    totalPages,
    totalResults: totalCount,
  };
};

const taskHome = async (userId, type, page = 1, limit = 10) => {
  const mySubmitTask = await SubmitTask.find({ userId });
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let query = {
    quantity: { $gt: 0 },
    status: "pending",
    _id: { $nin: mySubmitTask.map((task) => task.taskId) },
  };

  // Get the current date without the time component
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If type is "today", add additional condition to filter by today's date
  if (type === "today") {
    query.createdAt = { $gte: today };
  }
  // If type is "others", add additional condition to filter by other than today's date
  else if (type === "others") {
    query.createdAt = { $lt: today };
  }

  // Find the total count of tasks
  const totalCount = await Tasks.countDocuments(query);

  // Calculate the number of pages
  const totalPages = Math.ceil(totalCount / limit);

  // Calculate the number of documents to skip
  const skip = (page - 1) * limit;

  // Find tasks based on the query, with pagination
  const tasks = await Tasks.find(query)
    .populate("userId")
    .populate("serviceId")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    tasks,
    page,
    limit,
    totalPages,
    totalResults: totalCount,
  };
};

const taskRegister = async (userId, body) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (!user.nidStatus === "approved") {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Please submitted Nid for approval"
    );
  }
  const data = {
    ...body,
    userId: user._id,
  };
  const task = await SubmitTask.create(data);
  return task;
};

const taskSubmit = async (userId, submitTaskId, image) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const submitTask = await SubmitTask.findById({ _id: submitTaskId });
  if (!submitTask) {
    throw new ApiError(httpStatus.NOT_FOUND, "Submit Task not found");
  }
  if (submitTask.status !== "pending") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Already submitted");
  }
  Object.assign(submitTask, {
    image,
    status: "submitted",
  });
  await submitTask.save();
  return submitTask;
};

const getEmployeeTasks = async (userId, status, page, limit) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const pageNumber = parseInt(page) || 1;
  const limitPerPage = parseInt(limit) || 10; // Default limit to 10 if not provided
  const skip = (pageNumber - 1) * limitPerPage;
  const totalCount = await SubmitTask.countDocuments({ status, userId });
  const totalPages = Math.ceil(totalCount / limitPerPage);
  const tasks = await SubmitTask.find({ status, userId })
    .populate("userId")
    .populate("taskId")
    .skip(skip)
    .limit(limitPerPage)
    .sort({ createdAt: -1 });
  return {
    tasks,
    page: pageNumber,
    limit: limitPerPage,
    totalPages,
    totalResults: totalCount,
  };
};

const getSubmittedTasks = async (status, page, limit) => {
  const pageNumber = parseInt(page) || 1;
  const limitPerPage = parseInt(limit) || 10; // Default limit to 10 if not provided
  const skip = (pageNumber - 1) * limitPerPage;
  const totalCount = await SubmitTask.countDocuments({ status });
  const totalPages = Math.ceil(totalCount / limitPerPage);
  const tasks = await SubmitTask.find({ status })
    .populate("userId")
    .populate("taskId")
    .skip(skip)
    .limit(limitPerPage)
    .sort({ createdAt: -1 });
  return {
    tasks,
    page: pageNumber,
    limit: limitPerPage,
    totalPages,
    totalResults: totalCount,
  };
};

const submitTaskUpdate = async (taskId, status) => {
  const submitTask = await SubmitTask.findById({ _id: taskId });
  const user = await User.findById({ _id: submitTask.userId });
  const task = await Tasks.findById({ _id: submitTask.taskId });
  if (!submitTask) {
    throw new ApiError(httpStatus.NOT_FOUND, "Submit Task not found");
  }
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (task.quantity === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task is already completed");
  }

  if (status === "accepted") {
    if (task.quantity > 1) {
      const newNotificationEmployee = {
        receiverId: submitTask.userId,
        role: "employee",
        message: `Your task ${task.name} has been accepted.`,
      };

     await addCustomNotification("employee-notification",submitTask.userId,newNotificationEmployee);

      Object.assign(task, {
        quantity: task.quantity - 1,
      });
    } else {
      const newNotificationEmployee = {
        receiverId: submitTask.userId,
        role: "employee",
        message: `Your task ${submitTask.name} has been accepted.`,
      };
      const newNotificationClient = {
        receiverId: task.userId,
        role: "client",
        message: `Your task ${task.name} has been Completed.`,
      };

      await addCustomNotification("employee-notification",submitTask.userId,newNotificationEmployee);
      await addCustomNotification("client-notification",task.userId,newNotificationClient);

      Object.assign(task, {
        status: "completed",
        quantity: task.quantity - 1,
      });
    }
    Object.assign(user, {
      rand: user.rand + submitTask.price,
    });
    await task.save();
    await user.save();
  }

  submitTask.status = status;
  await submitTask.save();
  return submitTask;
};

const getRegisterSingleTask = async (taskId) => {
  const submitTask = await SubmitTask.findById({ _id: taskId }).populate(
    "taskId userId"
  );
  if (!submitTask) {
    throw new ApiError(httpStatus.NOT_FOUND, "Submit Task not found");
  }
  return submitTask;
};

module.exports = {
  createTask,
  queryTasks,
  getTaskById,
  deleteTaskById,
  updateTaskById,
  getAdminTasks,
  taskHome,
  taskRegister,
  taskSubmit,
  getEmployeeTasks,
  getSubmittedTasks,
  submitTaskUpdate,
  getRegisterSingleTask,
};
