import { Service } from "typedi";
import db from "../database/db";
import { User } from "../database/models/user";

@Service()
export default class UserRepository {

    /**
   * @description Function attempts to fetch user by the username.
   * Returns either the matching user or null if one is not found.
   * @param {string} username
   * @returns {Promise<User | null>}
   */
    public async getByUsername(username: string): Promise<User | null> {
        return await db.User.findOne({
            where: {
                username: username
            }
        });
    }

    /**
   * @description Creates a user and returns it.
   * @param {User} user User MAP object which is to be stored
   * @returns {Promise<User>} Promise containing the stored user.
   */
    public async create(user: User): Promise<User> {
        return await user.save();
    }

    /**
   * @description Updates the user and returns it.
   * @param {User} user User MAP object which is to be updated
   * @returns {Promise<User>} Promise containing the updated user.
   */
    public async update(user: User): Promise<User> {
        return await user.save();
    }
}
