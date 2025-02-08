const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { memberService, tokenService } = require("../services");
const jwtToken = require('jsonwebtoken');
const { jwt } = require("../config/config");

// Create a new member
const createMember = catchAsync(async (req, res) => {
    const newMember = await memberService.createMember(req.body);

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

    const id = req.user.id;
    // const userId = req.params.id;
    // console.log("request User ==>", req.user);
    // const headers = req.headers;
    // const authHeader = headers?.authorization; // Get Authorization header

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //     return res.status(401).json({ message: "Unauthorized: No token provided" });
    // }

    // const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    // console.log("Token:", token); // Log only the token
    // console.log(token);


    // console.log( token);

    const member = await memberService.getSingleMember(id);
    res.status(httpStatus.OK).json(
        response({
            message: "Member retrieved successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: member,
        })
    );
});

const getSingleMemberAsAdmin = catchAsync(async (req, res) => {
    const id = req.params.id;
    const member = await memberService.getSingleMember(id);
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
        const member = await memberService.login(email, password);

        // const token = await tokenService.generateAuthTokens(member);
        const token = jwtToken.sign({ id: member.id, email: member.email, type: "access", role: member.role }, jwt.secret, { expiresIn: '30d' });

        // Send response
        return res.status(httpStatus.OK).json(
            response({
                message: "Member logged in successfully",
                status: "OK",
                statusCode: httpStatus.OK,
                data: {
                    member,
                    token
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
    const getIdInToken = req.user.id;
    const updatedMember = await memberService.updateMembersAsUser(getIdInToken, req.body, req.file);

    res.status(httpStatus.OK).json(
        response({
            message: "Member updated successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: updatedMember, // Return updated member data
        })
    );
});

const getAllManager = catchAsync(async (req, res) => {
    const members = await memberService.getAllManager();
    res.status(httpStatus.OK).json(
        response({
            message: "Members retrieved successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: members,
        })
    );
});


module.exports = {
    createMember,
    getSingleMember,
    getAllMembers,
    updateMember,
    login,
    getSingleMemberAsAdmin,
    updateMembersAsUser,
    getAllManager
};
