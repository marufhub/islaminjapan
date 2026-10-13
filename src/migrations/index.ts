import * as migration_20261013_111941_initial from './20261013_111941_initial';
import * as migration_20261013_120717_media_owner from './20261013_120717_media_owner';
import * as migration_20261013_124949_search_text_and_contact from './20261013_124949_search_text_and_contact';
import * as migration_20261013_125828_about_page from './20261013_125828_about_page';
import * as migration_20261013_132200_policy_drafts from './20261013_132200_policy_drafts';

export const migrations = [
  {
    up: migration_20261013_111941_initial.up,
    down: migration_20261013_111941_initial.down,
    name: '20261013_111941_initial',
  },
  {
    up: migration_20261013_120717_media_owner.up,
    down: migration_20261013_120717_media_owner.down,
    name: '20261013_120717_media_owner',
  },
  {
    up: migration_20261013_124949_search_text_and_contact.up,
    down: migration_20261013_124949_search_text_and_contact.down,
    name: '20261013_124949_search_text_and_contact',
  },
  {
    up: migration_20261013_125828_about_page.up,
    down: migration_20261013_125828_about_page.down,
    name: '20261013_125828_about_page',
  },
  {
    up: migration_20261013_132200_policy_drafts.up,
    down: migration_20261013_132200_policy_drafts.down,
    name: '20261013_132200_policy_drafts'
  },
];
