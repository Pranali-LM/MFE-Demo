export class GetAssetsParams {
  public limit: number;
  public offset: number;
  public sort: string;
  public sortBy: string;
  public activeOnly: boolean;
  public fleetId: string;

  constructor({
    limit,
    offset,
    sort,
    sortBy,
    activeOnly,
    fleetId,
  }: {
    limit: number;
    offset: number;
    sort: string;
    sortBy: string;
    activeOnly: boolean;
    fleetId: string;
  }) {
    this.limit = limit;
    this.offset = offset;
    this.sort = sort;
    this.sortBy = sortBy;
    this.activeOnly = activeOnly;
    this.fleetId = fleetId;
  }
}

export class FleetConfigurationParams {
  constructor(public fleetId?: string) {
    if (!fleetId) {
      delete this.fleetId;
    }
  }
}
export class AssetConfigurationParams {
  constructor(public assetId?: string) {
    this.assetId = assetId;
  }
}

export interface SaveChangesOutput {
  newConfig: { [key: string]: any };
  saveForAllDutyTypes: boolean;
}

export interface SaveChangesCustomEventOutput {
  newConfig: { [key: string]: any };
}
