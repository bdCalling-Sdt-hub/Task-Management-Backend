const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const { roles } = require("../config/roles");

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },

    image: {
      type: Object,
      required: [true, "Image is must be Required"],
      default: { url: `/uploads/users/user.png`, path: "null" },
    },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true, // used by the toJSON plugin
    },

    role: {
      type: String,
      enum: roles,
      require: true,
    },
    rand: {
      type: Number,
      required: false,
      default: 0,
    },
    phoneNumber: {
      type: Number,
      required: false,
    },
    message: {
      type: String,
      require: true
    },

    // nidNumber: {
    //   type: Number,
    //   required: false,
    // },
    // nidStatus: {
    //   type: String,
    //   enum: ["approved", "cancelled", "pending", "unverified"],
    //   default: "unverified",
    // },
    // dataOfBirth: {
    //   type: String,
    //   required: false,
    // },
    // interest: {
    //   type: Array,
    //   required: false,
    //   default: [],
    // },
    address: {
      type: String,
      required: false,
      default: "",
    },
    oneTimeCode: {
      type: String,
      required: false,
    },
    // referralCode: {
    //   type: String,
    //   required: false,
    // },
    // claimedReferralCode: {
    //   type: String,
    //   required: false,
    //   default:"",
    // },
    // referralClaimed: {
    //   type: Boolean,
    //   default: false,
    // },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    isInterest: {
      type: Boolean,
      default: false,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false,
    }

  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isPhoneNumberTaken = async function (
  phoneNumber,
  excludeUserId
) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
