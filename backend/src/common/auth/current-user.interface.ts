import { UserRole } from '../enums/user-role.enum';

export interface CurrentUser {
  id: string;
  institutionId: string;
  role: UserRole;
}
