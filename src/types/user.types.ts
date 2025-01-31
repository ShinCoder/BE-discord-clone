export class AccountSettings {
  pinnedDms: Array<string>;

  constructor(data: any) {
    if (
      typeof data?.pinnedDms?.type === 'object' &&
      Array.isArray(data.pinnedDms)
    ) {
      this.pinnedDms = data.pinnedDms;
    } else {
      this.pinnedDms = [];
    }
  }
}
