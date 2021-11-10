import { Users } from '../users/schemas/users.schema';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '../users/enums/role.enum';

export async function checkIfUserHasPermissionToChangeRestaurant(
  user: Users,
  restaurantId: string,
): Promise<boolean> {
  if (user.role === Role.SUPER_ADMIN) {
    return true;
  }

  if (!(user.restaurantId.toString() === restaurantId.toString())) {
    throw new ForbiddenException();
  }

  return true;
}
