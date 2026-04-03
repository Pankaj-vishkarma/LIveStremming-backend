// src/modules/profile/profile.service.js

const Profile = require("./profile.model");
const User = require("../auth/auth.model");

// ==========================
// 📥 GET PROFILE
// ==========================
const getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw { statusCode: 400, message: "User not found" };
    }

    let profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
        profile = await Profile.create({ user_id: userId });
    }

    return {
        id: user._id,
        email: user.email,
        username: user.username || "",
        is_verified: user.is_verified,
        display_photo: profile.display_photo,
        about_me: profile.about_me,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        languages: profile.languages,
    };
};

// ==========================
// ✏️ UPDATE PROFILE
// ==========================
const updateProfile = async (userId, data) => {
    let profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
        profile = await Profile.create({ user_id: userId });
    }

    const user = await User.findById(userId);

    if (!user) {
        throw { statusCode: 400, message: "User not found" };
    }

    // ==========================
    // ✅ HANDLE USER FIELDS
    // ==========================
    if (data.username !== undefined) {
        user.username = data.username.trim();
        await user.save();
    }

    // ==========================
    // ✅ HANDLE PROFILE FIELDS (SAFE UPDATE)
    // ==========================
    const allowedProfileFields = [
        "display_photo",
        "about_me",
        "gender",
        "date_of_birth",
        "languages",
    ];

    allowedProfileFields.forEach((field) => {
        if (data[field] !== undefined) {
            profile[field] = data[field];
        }
    });

    await profile.save();

    // ==========================
    // 📤 FINAL RESPONSE
    // ==========================
    return {
        id: user._id,
        email: user.email,
        username: user.username || "",
        is_verified: user.is_verified,
        display_photo: profile.display_photo,
        about_me: profile.about_me,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        languages: profile.languages,
    };
};

module.exports = {
    getProfile,
    updateProfile,
};