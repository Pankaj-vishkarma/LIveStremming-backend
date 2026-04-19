const Profile = require("./profile.model");
const User = require("../auth/auth.model");

// ==========================
// GET PROFILE
// ==========================
const getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 400;
        throw err;
    }

    let profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
        profile = await Profile.create({ user_id: userId });
    }

    return {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username || "",
        is_verified: user.is_verified,
        display_photo: profile.display_photo,
        display_photo_public_id: profile.display_photo_public_id,
        about_me: profile.about_me,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        languages: profile.languages,
    };
};

// ==========================
// UPDATE PROFILE
// ==========================
const updateProfile = async (userId, data) => {
    console.log("userId:", userId);
    console.log("incoming data:", data);

    let profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
        profile = await Profile.create({ user_id: userId });
    }

    const user = await User.findById(userId);

    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 400;
        throw err;
    }

    // ==========================
    // USERNAME UPDATE (IMPROVED)
    // ==========================
    if (data.username !== undefined) {
        const username = data.username.trim();

        if (username !== user.username) {
            const usernameRegex = /^[a-zA-Z0-9_-]+$/;

            if (!usernameRegex.test(username)) {
                const err = new Error(
                    "Username can only contain letters, numbers, _ and -"
                );
                err.statusCode = 400;
                throw err;
            }

            const existingUser = await User.findOne({ username }).select("_id");

            if (
                existingUser &&
                existingUser._id.toString() !== user._id.toString()
            ) {
                const err = new Error("Username already taken");
                err.statusCode = 400;
                throw err;
            }

            user.username = username;
            await user.save();
        }
    }

    // ==========================
    // PROFILE FIELDS UPDATE
    // ==========================
    const allowedProfileFields = [
        "display_photo",
        "display_photo_public_id",
        "about_me",
        "gender",
        "date_of_birth",
        "languages",
    ];

    allowedProfileFields.forEach((field) => {
        if (data[field] !== undefined) {
            if (field === "date_of_birth") {
                profile[field] = new Date(data[field]);
            } else if (typeof data[field] === "string") {
                profile[field] = data[field].trim();
            } else {
                profile[field] = data[field];
            }
        }
    });

    await profile.save();

    return {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username || "",
        is_verified: user.is_verified,
        display_photo: profile.display_photo,
        display_photo_public_id: profile.display_photo_public_id,
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