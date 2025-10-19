import { clinicaApi } from "@/api/clinicaApi";
import type { Options } from "@/interfaces/Paginated.response";
import type { CreateUserPayload, UserCreation, UserListDto, UserResponse } from "@/interfaces/Users.response";

export const getUsersAction = async (options: Options = {}): Promise<UserResponse> => {
  const { limit, offset, query } = options;
  const { data } = await clinicaApi.get<UserResponse>("/users", {
    params: { limit, offset, query },
  });
  const userListDtoFormat: UserListDto[] = data.userListDto.map((user) => {
    user.createdAt = new Date(user.createdAt).toLocaleDateString();
    user.lastLogin = user.lastLogin
      ? new Date(user.lastLogin).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "medium",
        })
      : "Nunca";
    return user;
  });
  console.log(data);
  return {
    ...data,
    userListDto: userListDtoFormat,
  };
};

// Fucnion para la creacion de un usuario

export const createUserAction = async (payload: CreateUserPayload): Promise<UserCreation> => {
  const { data } = await clinicaApi.post<UserCreation>("/auth/register", payload);
  return {
    ...data,
  };
};
