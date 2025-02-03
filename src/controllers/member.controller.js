const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { memberService } = require("../services");

// Create a new member
const createMember = catchAsync(async (req, res) => {
    const  newMember = await memberService.createMember(req.body);

    res.status(httpStatus.CREATED).json(
        response({
            message: "Member created successfully",
            status: "OK",
            statusCode: httpStatus.CREATED,
            data: newMember
            ,
        })
    );
});

// Get a single member by ID
const getSingleMember = catchAsync(async (req, res) => {
    const member = await memberService.getSingleMember(req.params.id);
    res.status(httpStatus.OK).json(
        response({
            message: "Member retrieved successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: member,
        })
    );
});

// Get all members
const getAllMembers = catchAsync(async (req, res) => {
    const members = await memberService.getAllMembers();
    res.status(httpStatus.OK).json(
        response({
            message: "Members retrieved successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: members,
        })
    );
});

// Update a member by ID
const updateMember = catchAsync(async (req, res) => {
    const updatedMember = await memberService.updateMember(req.params.id, req.body);

    res.status(httpStatus.OK).json(
        response({
            message: "Member updated successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: updatedMember,
        })
    );
});

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Call login service
        const { token, member } = await memberService.login({ email, password });

        // Send response
        return res.status(httpStatus.OK).json(
            response({
                message: "Member logged in successfully",
                status: "OK",
                statusCode: httpStatus.OK,
                data: {
                    token,
                    member: {
                        id: member._id,
                        email: member.email,
                        memberName: member.memberName, // Adjust based on your model
                        role: member.role, // Adjust based on your model
                    }
                }
            })
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Internal Server Error',
            status: 'Error',
            statusCode: error.statusCode || 500,
        });
    }
};



const updateMembersAsUser = catchAsync(async (req, res) => {
    const updatedMember = await memberService.updateMembersAsUser(req.params.id, req.body, req.file);

    res.status(httpStatus.OK).json(
        response({
            message: "Member updated successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: {}, // Return updated member data
        })
    );
});


module.exports = {
    createMember,
    getSingleMember,
    getAllMembers,
    updateMember,
    login,
    updateMembersAsUser
};
