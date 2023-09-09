import * as bcrypt from 'bcrypt';
export class HashUtils {
  public static encrypt(unencryptedValue: string): string {
    return bcrypt.hashSync(unencryptedValue, bcrypt.genSaltSync(8));
  }

  public static compare(
    unencryptedValue: string,
    encryptedValue: string,
  ): boolean {
    return bcrypt.compareSync(unencryptedValue, encryptedValue);
  }
}
