const Follow = require('./../models/Follow.model');


// metodo para conseguir los ids, ya sea de los que seguimos o de los que nos siguen

const followUsersIds = async (identityUserId) => {

    const following = await // es la consulta para saber a quiénes seguimos
        Follow
            .find({ "user": identityUserId })
            .select({ "followed": 1, "_id": 0 })
            .then(follows => {
                return follows
            })

    const followers = await // es la consulta para saber quién nos sigue y sacar solo el campo followed
        Follow
            .find({ "followed": identityUserId })
            .select({ "user": 1, "_id": 0 })
            .then(follows => {
                return follows
            })

    // Procesar el array de identificadores para que nos devuelva un array y no el objeto
    const followingClean = []
    following.forEach(follow => {
        followingClean.push(follow.followed)
    });

    const followersClean = []
    followers.forEach(follow => {
        followersClean.push(follow.user)
    });


    return {
        followingClean, // a los que sigo
        followersClean // los que me siguen
    }
}

// metodo para conseguir si un usuario en concreto le seguimos o nos sigue
const followThisUser = async (identityUserId, profileUserId) => {

    const following = await // es la consulta para saber a quiénes seguimos
        Follow
            .findOne({ "user": identityUserId, followed: profileUserId })
            .then(follows => {
                return follows
            })

    const follower = await // es la consulta para saber quién nos sigue y sacar solo el campo followed
        Follow
            .findOne({ "followed": identityUserId, "user": profileUserId })
            .then(follows => {
                return follows
            })

    return {
        following,
        follower
    }
}

module.exports = {
    followUsersIds,
    followThisUser
}