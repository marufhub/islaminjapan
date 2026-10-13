import * as migration_20261013_111941_initial from './20261013_111941_initial';
import * as migration_20261013_120717_media_owner from './20261013_120717_media_owner';

export const migrations = [
  {
    up: migration_20261013_111941_initial.up,
    down: migration_20261013_111941_initial.down,
    name: '20261013_111941_initial',
  },
  {
    up: migration_20261013_120717_media_owner.up,
    down: migration_20261013_120717_media_owner.down,
    name: '20261013_120717_media_owner'
  },
];
