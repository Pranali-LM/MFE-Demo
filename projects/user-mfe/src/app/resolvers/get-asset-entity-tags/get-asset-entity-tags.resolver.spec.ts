import { TestBed } from '@angular/core/testing';

import { GetAssetEntityTagsResolver } from './get-asset-entity-tags.resolver';

describe('GetAssetEntityTagsResolver', () => {
  let resolver: GetAssetEntityTagsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(GetAssetEntityTagsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
