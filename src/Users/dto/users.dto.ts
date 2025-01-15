export class UserDTO {
  readonly username?: string;
  readonly privyId?: string;
  readonly password?: string;
  readonly about?: string;
  readonly email?: string;
  readonly created?: string;
  readonly isFlagged?: number;
  readonly points?: number;
  readonly submissions?: string[];
  readonly comments?: string[];
  readonly upvotedSubmissions?: string[];
  readonly jobs?: string[];
  readonly replies?: string[];
}
